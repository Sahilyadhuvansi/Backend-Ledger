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
const resolveRecipientAccount = async (toAccount, session) => {
  if (mongoose.Types.ObjectId.isValid(toAccount)) {
    const account = await Account.findById(toAccount).session(session);
    if (!account) throw new ApiError(404, "Recipient account not found.");
    return account;
  }

  // Treat as username
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
const createTransaction = asyncHandler(async (req, res) => {
  let { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  // ── Validate input ──
  amount = Number(amount);
  if (!fromAccount || !toAccount || !idempotencyKey) {
    throw new ApiError(400, "fromAccount, toAccount, and idempotencyKey are required.");
  }
  if (isNaN(amount) || amount <= 0) {
    throw new ApiError(400, "Amount must be a positive number.");
  }
  if (!mongoose.Types.ObjectId.isValid(fromAccount)) {
    throw new ApiError(400, "Invalid source account ID format.");
  }

  // ── Idempotency check (outside session for performance) ──
  const existing = await Transaction.findOne({ idempotencyKey });
  if (existing) {
    return res
      .status(200)
      .json(new ApiResponse(200, existing, "Duplicate request — transaction already processed."));
  }

  // ── Start ACID session ──
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Resolve recipient before locking accounts
    const toAccountDoc = await resolveRecipientAccount(toAccount, session);

    const fromAccountDoc = await Account.findById(fromAccount)
      .session(session)
      .populate("user", "email username name");

    if (!fromAccountDoc) throw new ApiError(404, "Source account not found.");

    // Prevent self-transfer
    if (fromAccountDoc._id.equals(toAccountDoc._id)) {
      throw new ApiError(400, "Cannot transfer to the same account.");
    }

    // Authorization: ensure the sender owns the fromAccount
    if (!fromAccountDoc.user._id.equals(req.user._id)) {
      throw new ApiError(403, "You do not own the source account.");
    }

    // Account status checks
    if (fromAccountDoc.status !== "active") {
      throw new ApiError(400, "Your account is not active.");
    }
    if (toAccountDoc.status !== "active") {
      throw new ApiError(400, "Recipient account is not active.");
    }

    // Balance check
    if (fromAccountDoc.balance < amount) {
      throw new ApiError(400, "Insufficient balance.");
    }

    // ── Populate toAccount user for notifications ──
    await toAccountDoc.populate("user", "email username name");

    // ── Create transaction record ──
    const [transaction] = await Transaction.create(
      [{ fromAccount, toAccount: toAccountDoc._id, amount, idempotencyKey, status: "pending" }],
      { session }
    );

    // ── Update balances ──
    fromAccountDoc.balance -= amount;
    toAccountDoc.balance += amount;
    await fromAccountDoc.save({ session });
    await toAccountDoc.save({ session });

    // ── Write immutable ledger entries ──
    await Ledger.create(
      [
        { account: fromAccountDoc._id, amount, transaction: transaction._id, type: "debit" },
        { account: toAccountDoc._id, amount, transaction: transaction._id, type: "credit" },
      ],
      { session }
    );

    // ── Complete transaction ──
    transaction.status = "completed";
    await transaction.save({ session });

    await session.commitTransaction();

    // ── Post-commit side effects (non-blocking) ──
    const fromUser = fromAccountDoc.user;
    const toUser = toAccountDoc.user;

    if (req.io) {
      req.io.to(String(toUser._id)).emit("new_transaction", {
        message: `You received ₹${amount} from ${fromUser.username || fromUser.name}`,
        amount,
        currency: toAccountDoc.currency,
        type: "credit",
      });
      req.io.to(String(fromUser._id)).emit("transaction_sent", {
        message: `Successfully sent ₹${amount} to ${toUser.username || toUser.name}`,
        amount,
        currency: fromAccountDoc.currency,
        type: "debit",
      });
    }

    if (fromUser?.email && toUser?.email) {
      sendTransactionConfirmationEmail(fromUser.email, toUser.email, amount).catch((e) =>
        console.error("Transaction email failed:", e.message)
      );
    }

    return res
      .status(201)
      .json(new ApiResponse(201, transaction, "Transaction completed successfully."));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// ─── Create Initial Funds (System Only) ──────────────────────────────────────
const createInitialFundsTransaction = asyncHandler(async (req, res) => {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !amount || !idempotencyKey) {
    throw new ApiError(400, "toAccount, amount, and idempotencyKey are required.");
  }

  const toUserAccount = await Account.findOne({ user: toAccount });
  if (!toUserAccount) throw new ApiError(404, "Recipient account not found.");

  const systemAccount = await Account.findOne({ user: req.user._id });
  if (!systemAccount) throw new ApiError(404, "System account not found.");

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [transaction] = await Transaction.create(
      [{ fromAccount: systemAccount._id, toAccount: toUserAccount._id, amount, idempotencyKey, status: "pending" }],
      { session }
    );

    await Ledger.create(
      [
        { account: systemAccount._id, amount, transaction: transaction._id, type: "debit" },
        { account: toUserAccount._id, amount, transaction: transaction._id, type: "credit" },
      ],
      { session }
    );

    systemAccount.balance -= amount;
    toUserAccount.balance += amount;
    await systemAccount.save({ session });
    await toUserAccount.save({ session });

    transaction.status = "completed";
    await transaction.save({ session });

    await session.commitTransaction();

    return res
      .status(201)
      .json(new ApiResponse(201, transaction, "Initial funds transaction completed."));
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

// ─── Transaction History ─────────────────────────────────────────────────────
const getTransactionHistory = asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 10, 100); // cap at 100
  const page = Math.max(Number(req.query.page) || 1, 1);
  const skip = (page - 1) * limit;

  const userAccounts = await Account.find({ user: req.user._id }).select("_id");
  const accountIds = userAccounts.map((a) => a._id);

  const query = {
    $or: [{ fromAccount: { $in: accountIds } }, { toAccount: { $in: accountIds } }],
  };

  const [transactions, total] = await Promise.all([
    Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("fromAccount", "currency")
      .populate("toAccount", "currency")
      .lean(),
    Transaction.countDocuments(query),
  ]);

  // Tag each transaction as debit or credit from the user's perspective
  const enriched = transactions.map((tx) => {
    const isDebit = accountIds.some((id) => id.equals(tx.fromAccount?._id));
    return { ...tx, type: isDebit ? "debit" : "credit" };
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { transactions: enriched, total, page, limit, totalPages: Math.ceil(total / limit) },
      "Transaction history fetched."
    )
  );
});

module.exports = { createTransaction, createInitialFundsTransaction, getTransactionHistory };
