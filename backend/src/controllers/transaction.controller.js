const Transaction = require("../models/transaction.model");
const Ledger = require("../models/ledger.model");
const Account = require("../models/account.model");
const User = require("../models/user.model");
const {
  sendTransactionConfirmationEmail,
} = require("../services/email.service");
const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createTransaction = asyncHandler(async (req, res) => {
  let { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  amount = Number(amount);

  if (
    !fromAccount ||
    !toAccount ||
    !amount ||
    isNaN(amount) ||
    amount <= 0 ||
    !idempotencyKey
  ) {
    throw new ApiError(400, "Missing or invalid required fields");
  }

  // 1. Check if `toAccount` is an ObjectId or Username
  let recipientAccountId = toAccount;

  if (!mongoose.Types.ObjectId.isValid(toAccount)) {
    // Treat `toAccount` as a username since it's not a valid Account ID
    const recipientUser = await User.findOne({
      username: toAccount.toLowerCase(),
    });
    if (!recipientUser) {
      throw new ApiError(
        404,
        "Recipient not found. Please verify the Username or Ledger ID.",
      );
    }
    const recipientAccount = await Account.findOne({
      user: recipientUser._id,
      status: "active",
    });
    if (!recipientAccount) {
      throw new ApiError(
        404,
        "Recipient does not have an active Ledger account.",
      );
    }
    recipientAccountId = recipientAccount._id;
  }

  if (fromAccount.toString() === recipientAccountId.toString()) {
    throw new ApiError(400, "Cannot transfer to the same account");
  }

  if (!mongoose.Types.ObjectId.isValid(fromAccount)) {
    throw new ApiError(400, "Invalid Source Account ID format.");
  }

  // 2. Check for existing transaction (idempotency)
  const existingTransaction = await Transaction.findOne({ idempotencyKey });
  if (existingTransaction) {
    return res
      .status(409)
      .json(
        new ApiResponse(
          409,
          existingTransaction,
          "Transaction already exists with this idempotency key",
        ),
      );
  }

  // 3. Start ACID Session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find accounts within session & POPULATE user to get email
    const fromAccountDoc = await Account.findById(fromAccount)
      .session(session)
      .populate("user");
    const toAccountDoc = await Account.findById(recipientAccountId)
      .session(session)
      .populate("user");

    if (!fromAccountDoc || !toAccountDoc) {
      throw new ApiError(404, "Invalid account ID(s)");
    }

    if (
      fromAccountDoc.status !== "active" ||
      toAccountDoc.status !== "active"
    ) {
      throw new ApiError(400, "One or more accounts are not active");
    }

    if (fromAccountDoc.balance < amount) {
      throw new ApiError(400, "Insufficient balance");
    }

    // 3. Create Transaction Record
    const transaction = new Transaction({
      fromAccount,
      toAccount: recipientAccountId,
      amount,
      idempotencyKey,
      status: "pending",
    });
    await transaction.save({ session });

    // 4. Update Account Balances
    fromAccountDoc.balance -= amount;
    toAccountDoc.balance += amount;

    await fromAccountDoc.save({ session });
    await toAccountDoc.save({ session });

    // 5. Create Ledger Records (immutable trail)
    const debitEntry = new Ledger({
      account: fromAccount,
      amount,
      transaction: transaction._id,
      type: "debit",
    });

    const creditEntry = new Ledger({
      account: recipientAccountId,
      amount,
      transaction: transaction._id,
      type: "credit",
    });

    await debitEntry.save({ session });
    await creditEntry.save({ session });

    // 6. Complete Transaction
    transaction.status = "completed";
    await transaction.save({ session });

    // Commit all changes
    await session.commitTransaction();

    // 7. Post-transaction tasks (Async, don't block response)
    const fromEmail = fromAccountDoc.user?.email;
    const toEmail = toAccountDoc.user?.email;
    if (fromEmail && toEmail) {
      sendTransactionConfirmationEmail(fromEmail, toEmail, amount).catch((e) =>
        console.error("Email notification failed:", e.message),
      );
    }

    return res
      .status(201)
      .json(
        new ApiResponse(201, transaction, "Transaction completed successfully"),
      );
  } catch (error) {
    // Rollback all changes
    await session.abortTransaction();
    throw error; // Re-throw to be handled by global handler
  } finally {
    session.endSession();
  }
});

const createInitialFundsTransaction = asyncHandler(async (req, res) => {
  const { toAccount, amount, idempotencyKey } = req.body;

  if (!toAccount || !amount || !idempotencyKey) {
    throw new ApiError(400, "Missing required fields");
  }

  // Find the target user's account
  const toUserAccount = await Account.findOne({ user: toAccount });
  if (!toUserAccount) {
    throw new ApiError(404, "Recipient account not found");
  }

  // Find the system user's account (assuming system user is req.user)
  const systemAccount = await Account.findOne({ user: req.user._id });
  if (!systemAccount) {
    throw new ApiError(404, "System account not found");
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Create Transaction Document
    const transaction = new Transaction({
      fromAccount: systemAccount._id,
      toAccount: toUserAccount._id,
      amount,
      idempotencyKey,
      status: "pending",
    });

    await transaction.save({ session });

    // 2. Create Ledger Entries
    const debitEntry = new Ledger({
      account: systemAccount._id,
      amount,
      transaction: transaction._id,
      type: "debit",
    });

    const creditEntry = new Ledger({
      account: toUserAccount._id,
      amount,
      transaction: transaction._id,
      type: "credit",
    });

    await debitEntry.save({ session });
    await creditEntry.save({ session });

    // 3. Update Balance (Optional: if you want to keep running balance in Account model)
    systemAccount.balance -= amount;
    toUserAccount.balance += amount;
    await systemAccount.save({ session });
    await toUserAccount.save({ session });

    // 4. Update Transaction Status
    transaction.status = "completed";
    await transaction.save({ session });

    await session.commitTransaction();

    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          transaction,
          "Initial funds transaction completed successfully",
        ),
      );
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
});

module.exports = {
  createTransaction,
  createInitialFundsTransaction,
};
