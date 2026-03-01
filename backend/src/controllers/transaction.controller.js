const Transaction = require("../models/transaction.model");
const Ledger = require("../models/ledger.model");
const Account = require("../models/account.model");
const {
  sendTransactionConfirmationEmail,
} = require("../services/email.service");
const mongoose = require("mongoose");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const createTransaction = asyncHandler(async (req, res) => {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    throw new ApiError(400, "Missing required fields");
  }

  if (fromAccount === toAccount) {
    throw new ApiError(400, "Cannot transfer to the same account");
  }

  // 1. Check for existing transaction (idempotency)
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

  // 2. Start ACID Session
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Find accounts within session & POPULATE user to get email
    const fromAccountDoc = await Account.findById(fromAccount)
      .session(session)
      .populate("user");
    const toAccountDoc = await Account.findById(toAccount)
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
      toAccount,
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
    await Ledger.create(
      [
        {
          account: fromAccount,
          amount,
          transaction: transaction._id,
          type: "debit",
        },
        {
          account: toAccount,
          amount,
          transaction: transaction._id,
          type: "credit",
        },
      ],
      { session },
    );

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
    const transaction = (
      await Transaction.create(
        [
          {
            fromAccount: systemAccount._id,
            toAccount: toUserAccount._id,
            amount,
            idempotencyKey,
            status: "pending",
          },
        ],
        { session },
      )
    )[0];

    // 2. Create Ledger Entries
    await Ledger.create(
      [
        {
          account: systemAccount._id,
          amount,
          transaction: transaction._id,
          type: "debit",
        },
        {
          account: toUserAccount._id,
          amount,
          transaction: transaction._id,
          type: "credit",
        },
      ],
      { session },
    );

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
