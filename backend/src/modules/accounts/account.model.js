// ─── Commit: Database Connectivity Layer ───
// What this does: Loads Mongoose (MongoDB helper) and the Ledger model (Transaction records).
// Why it exists: Your Account doesn't just hold a number; it is a live reflection of all its Ledger entries.
const mongoose = require("mongoose");
const Ledger = require("./ledger.model");

// ─── Commit: Bank Account Schema Structure ───
// What this does: Blueprint for a user's wallet/account.
// How it works: Stores User ID, Balance, Currency, and Current State (Active/Frozen).
const accountSchema = new mongoose.Schema(
  {
    // ─── Commit: Ownership reference (Foreign Key) ───
    // What this does: Links this specific account to a 'User' in your database.
    // Beginner note: 'index: true' makes it extremely fast to find all accounts belonging to a user.
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },

    // ─── Commit: Lifecycle Status ───
    // What this does: Tracks if the account is usable.
    // Real-world analogy: 'frozen' is like when a bank stops your card due to suspicious activity.
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "frozen"],
        message: "Status must be active, inactive or frozen",
      },
      default: "active",
    },

    // ─── Commit: Balance & Currency ───
    // Why it exists: To know exactly how much wealth exists in this specific "container".
    // Interview insight: Use 'min: 0' to enforce business logic (Overdraft protection) at the database layer.
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
    currency: {
      type: String,
      required: true,
      default: "INR", // Primary currency for this Indian AI Suite
      uppercase: true,
    },
  },
  { timestamps: true },
);

// Optional logic: Could prevent a user from having two identical active accounts
// accountSchema.index({ user: 1, status: 1 }, { unique: true });

// ─── Commit: Aggregation Pipeline (Deep Balance Check) ───
// What this does: Calculates the user's TRUE balance by summing every Credit/Debit in the ledger.
// Why it exists: Sometimes the 'balance' field in the database might become out of sync. This is the "Truth Source".
// How it works: 1. Filter by Account ID. 2. Group all entries. 3. Sum Credits, Sum Debits. 4. Subtract.
// Interview insight: This process uses 'Aggregation Pipelines' which are much faster than calculating in Javascript.
accountSchema.methods.calculateCurrentBalance = async function () {
  const result = await Ledger.aggregate([
    // Step 1: Find all entries for THIS account ID
    {
      $match: {
        account: this._id,
      },
    },
    // Step 2: Separate and sum credits vs debits
    {
      $group: {
        _id: null,
        totalDebit: {
          $sum: {
            $cond: [{ $eq: ["$type", "debit"] }, "$amount", 0],
          },
        },
        totalCredit: {
          $sum: {
            $cond: [{ $eq: ["$type", "credit"] }, "$amount", 0],
          },
        },
      },
    },
    // Step 3: Final math calculation
    {
      $project: {
        balance: { $subtract: ["$totalCredit", "$totalDebit"] },
      },
    },
  ]);

  return result[0]?.balance || 0;
};

// ─── Commit: Model Compilation ───
const Account = mongoose.model("Account", accountSchema);

module.exports = Account;
