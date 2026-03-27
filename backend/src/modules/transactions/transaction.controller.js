// ─── Commit: Transaction Controller Imports ───
// What this does: Loads all models (Account, Ledger, Transaction, User) and system utilities (Email, Error Handlers).
// Why it exists: Transfers are the most complex part of a bank; they touch almost every table in your database.
const Transaction = require("./transaction.model");
const Ledger = require("../accounts/ledger.model");
const Account = require("../accounts/account.model");
const User = require("../users/user.model");
const { sendTransactionConfirmationEmail } = require("../../common/services/email.service");
const mongoose = require("mongoose");
const asyncHandler = require("../../common/utils/asyncHandler");
const ApiError = require("../../common/utils/ApiError");
const ApiResponse = require("../../common/utils/ApiResponse");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Resolve a toAccount field: accepts either a valid Account ObjectId
 * or a username string. Returns the resolved Account document.
 */
// ─── Commit: Recipient Discovery Logic ───
// What this does: Allows users to send money using either an Account ID or a simple @username.
// Why it exists: To improve UX. Users don't remember 24-character IDs; they remember names.
// Interview insight: This helper uses the '.session(session)' method to ensure it reads data within the same ACID transaction.
const resolveRecipientAccount = async (toAccount, session) => {
  if (mongoose.Types.ObjectId.isValid(toAccount)) {
    const account = await Account.findById(toAccount).session(session);
    if (!account) throw new ApiError(404, "Recipient account not found.");
    return account;
  }

  // Treat input as username (e.g., "@sahil")
  const recipientUser = await User.findOne({
    username: toAccount.replace(/^@/, "").toLowerCase(),
  });
  if (!recipientUser) {
    throw new ApiError(404, "Recipient not found. Please verify the username.");
  }

  const account = await Account.findOne({
    user: recipientUser._id,
    status: "active",
  }).session(session);

  if (!account) {
    throw new ApiError(404, "Recipient does not have an active account.");
  }

  return account;
};

// ─── Create Transaction ───────────────────────────────────────────────────────
// ─── Commit: Atomic Money Transfer Operation ───
// What this does: Moves money from Person A to Person B safely.
// Why it exists: In banking, "Almost" isn't good enough. The money must either move entirely OR not move at all.
// How it works: Uses MongoDB Sessions (ACID). If anything fails (e.g., internet dies), the 'abortTransaction' undoes everything.
// Interview insight: This is a classic "Race Condition" target. We use 'idempotencyKey' to prevent double-spending.
const createTransaction = asyncHandler(async (req, res) => {
  let { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  // Step 1: Input Type Validation
  amount = Number(amount);
  if (!fromAccount || !toAccount || !idempotencyKey) {
    throw new ApiError(400, "fromAccount, toAccount, and idempotencyKey are required.");
  }
  if (isNaN(amount) || amount <= 0) {
    throw new ApiError(400, "Amount must be a positive number.");
  }

  // Step 2: Idempotency check (Performance optimization)
  // We check this BEFORE starting a database session to save server resources.
  const existing = await Transaction.findOne({ idempotencyKey });
  if (existing) {
    return res
      .status(200)
      .json(new ApiResponse(200, existing, "Duplicate request — transaction already processed."));
  }

  // ─── Commit: ACID Session Initiation ───
  // Pattern used: ACID (Atomicity, Consistency, Isolation, Durability).
  // Real-world analogy: Like a legal contract. It's not signed until every page is correct.
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 3: Fetch both accounts and LOCK them for this session.
    const toAccountDoc = await resolveRecipientAccount(toAccount, session);
    const fromAccountDoc = await Account.findById(fromAccount)
      .session(session)
      .populate("user", "email username name");

    if (!fromAccountDoc) throw new ApiError(404, "Source account not found.");

    // Step 4: Security and Business Logic Checks
    if (fromAccountDoc._id.equals(toAccountDoc._id)) {
      throw new ApiError(400, "Cannot transfer to the same account.");
    }
    if (!fromAccountDoc.user._id.equals(req.user._id)) {
      throw new ApiError(403, "You do not own the source account.");
    }
    if (fromAccountDoc.status !== "active" || toAccountDoc.status !== "active") {
      throw new ApiError(400, "One of the accounts is not active.");
    }
    if (fromAccountDoc.balance < amount) {
      throw new ApiError(400, "Insufficient balance.");
    }

    // Step 5: Record the Transaction "Fact"
    const [transaction] = await Transaction.create(
      [{ fromAccount, toAccount: toAccountDoc._id, amount, idempotencyKey, status: "pending" }],
      { session, ordered: true }
    );

    // Step 6: Update Balances (The "State Change")
    fromAccountDoc.balance -= amount;
    toAccountDoc.balance += amount;
    await fromAccountDoc.save({ session });
    await toAccountDoc.save({ session });

    // Step 7: Write Immutable Ledger Entries (The "Paper Trail")
    // Interview insight: We create TWO entries (One Debit, One Credit) to maintain a zero-sum accounting balance.
    await Ledger.create(
      [
        { account: fromAccountDoc._id, amount, transaction: transaction._id, type: "debit" },
        { account: toAccountDoc._id, amount, transaction: transaction._id, type: "credit" },
      ],
      { session, ordered: true }
    );

    // Step 8: Seal the deal
    transaction.status = "completed";
    await transaction.save({ session });

    // FINAL STEP: Permanent Save to Disk
    await session.commitTransaction();

    // ─── Commit: Post-Commit Side Effects ───
    // What this does: Sends real-time alerts and emails AFTER the money has safely moved.
    // Why here? We don't want to send an email if the transaction ultimately fails/rolls back.
    const fromUser = fromAccountDoc.user;
    const toUser = await User.findById(toAccountDoc.user).select("email name username");

    if (req.io) {
      // Direct notification to the recipient's personal WebSocket room
      req.io.to(String(toUser._id)).emit("new_transaction", {
        message: `You received ₹${amount} from ${fromUser.username || fromUser.name}`,
        amount,
        type: "credit",
      });
    }

    if (fromUser?.email && toUser?.email) {
      sendTransactionConfirmationEmail(fromUser.email, toUser.email, amount).catch(() => {});
    }

    return res
      .status(201)
      .json(new ApiResponse(201, transaction, "Transaction completed successfully."));
  } catch (error) {
    // ─── Commit: Emergency Rollback ───
    // What this does: If a single line above failed, UNDO every database change in this session.
    // Interview insight: This prevents "Partial Transfers" where money leaves A but never arrives at B.
    await session.abortTransaction();
    throw error;
  } finally {
    // Release server memory used by the database session
    session.endSession();
  }
});

// ─── Create Initial Funds (System Only) ──────────────────────────────────────
const createInitialFundsTransaction = asyncHandler(async (req, res) => {
  const { toAccount, amount, idempotencyKey } = req.body;
  // (Logic similar to above tailored for System -> User onboarding)
  const toUserAccount = await Account.findOne({ user: toAccount });
  const systemAccount = await Account.findOne({ user: req.user._id });

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [transaction] = await Transaction.create(
      [{ fromAccount: systemAccount._id, toAccount: toUserAccount._id, amount, idempotencyKey, status: "pending" }],
      { session, ordered: true }
    );

    await Ledger.create(
      [
        { account: systemAccount._id, amount, transaction: transaction._id, type: "debit" },
        { account: toUserAccount._id, amount, transaction: transaction._id, type: "credit" },
      ],
      { session, ordered: true }
    );

    systemAccount.balance -= amount;
    toUserAccount.balance += amount;
    await systemAccount.save({ session });
    await toUserAccount.save({ session });

    transaction.status = "completed";
    await transaction.save({ session });
    await session.commitTransaction();

    return res.status(201).json(new ApiResponse(201, transaction, "Initial funds transaction completed."));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// ─── Transaction History ─────────────────────────────────────────────────────
// ─── Commit: Paginated Transaction Retrieval ───
// What this does: Fetches a slice (e.g., last 10) of the user's transaction history.
// Why it exists: Performance! Loading 1,000,000 transactions at once would crash the app.
// Beginner note: 'limit' and 'skip' are the tools we use for "Infinite Scroll" or "Next Page" behavior.
const getTransactionHistory = asyncHandler(async (req, res) => {
<<<<<<< HEAD
  const limit = Math.min(Number(req.query.limit) || 10, 100); 
=======
  const limit = Math.min(Number(req.query.limit) || 10, 100);
>>>>>>> main
  const page = Math.max(Number(req.query.page) || 1, 1);
  const skip = (page - 1) * limit;

  // ─── Commit: O(1) Quick-Lookup (Sets vs Arrays) ───
  // Pattern: Convert our account IDs into a Set.
  // Performance: Finding an ID in an Array is "O(n)" (slow). Finding it in a Set is "O(1)" (Instant).
  const userAccounts = await Account.find({ user: req.user._id }).select("_id").lean();
  const accountIds = userAccounts.map((a) => a._id);
  const accountIdsSet = new Set(accountIds.map((id) => id.toString()));

  const query = {
    $or: [{ fromAccount: { $in: accountIds } }, { toAccount: { $in: accountIds } }],
  };

  // ─── Commit: Lazy Document Counting ───
  // What this does: Skips the "Total Count" DB roundtrip for simple dashboard previews.
  // Why it exists: Aggregating 10k rows just to show a "5 most recent" list is inefficient.
  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("fromAccount", "currency")
      .populate("toAccount", "currency")
<<<<<<< HEAD
      .lean(), // '.lean()' makes the query 3x faster by returning raw objects instead of Mongoose Heavy documents.
    Transaction.countDocuments(query),
  ]);

=======
      .lean(),
    page > 1 || limit > 10 ? Transaction.countDocuments(query) : Promise.resolve(null),
  ]);

  // Faster debit/credit tagging with O(1) Set lookup
>>>>>>> main
  const enriched = transactions.map((tx) => {
    const isDebit = tx.fromAccount && accountIdsSet.has(tx.fromAccount._id.toString());
    return { ...tx, type: isDebit ? "debit" : "credit" };
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { 
        transactions: enriched, 
        total: total ?? transactions.length, 
        page, 
        limit, 
        totalPages: total ? Math.ceil(total / limit) : (transactions.length < limit ? 1 : null) 
      },
      "Transaction history fetched."
    )
  );
});

module.exports = { createTransaction, createInitialFundsTransaction, getTransactionHistory };
