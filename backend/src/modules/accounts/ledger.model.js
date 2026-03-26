// ─── Commit: Mongoose Library Import ───
// What this does: Loads Mongoose to create the fundamental data schema for your accounting book.
const mongoose = require("mongoose");

// ─── Commit: Ledger Schema (The "Audit Trail") ───
// What this does: Defines the lowest-level entry of money management.
// Why it exists: In professional banking, you never just "change" the balance. You add a line to a book that says "Credit +500" or "Debit -200".
// Real-world analogy: This is the "General Ledger" — a book that once written in, cannot be erased.
// Pattern used: "Double-Entry Accounting" basis.
const ledgerSchema = new mongoose.Schema(
  {
    // ─── Commit: Relational Mapping (Refs) ───
    // What this does: Links every entry to an Account and a Transaction record.
    // Beginner note: 'immutable: true' means that once this field is saved, the database will refuse to change it.
    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "Account reference is required"],
      index: true,
      immutable: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0, "Amount cannot be negative"],
      immutable: true,
    },
    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: [true, "Transaction reference is required"],
      index: true,
      immutable: true,
    },

    // ─── Commit: Accounting Direction (Credit/Debit) ───
    // What this does: Determines if this entry "Added" (Credit) or "Removed" (Debit) wealth.
    type: {
      type: String,
      enum: {
        values: ["credit", "debit"],
        message: "Type must be credit or debit",
      },
      required: [true, "Type is required"],
      immutable: true,
    },
  },
  { timestamps: true },
);

// ─── Commit: Immutability Enforcer (Mongoose Hooks) ───
// What this does: Intercepts any attempt to UPDATE or DELETE a ledger entry and stops it with an error.
// Why it exists: Legal and financial compliance. A ledger entry is a "Fact". You don't delete facts; you create a new entry to "reverse" them.
// How it works: Uses Mongoose "Pre-middleware" hooks. If any 'update' or 'delete' command is sent, the 'preventModification' function is triggered.
// Interview insight: This is called an "Append-Only Design". It is vital for High-Integrity bank systems and Blockchain logic.
function preventModification(next) {
  next(
    new Error(
      "Ledger entries are immutable and cannot be modified or deleted.",
    ),
  );
}

// Attach the restriction to every possible dangerous database command
ledgerSchema.pre("findOneAndUpdate", preventModification);
ledgerSchema.pre("findOneAndReplace", preventModification);
ledgerSchema.pre("updateOne", preventModification);
ledgerSchema.pre("updateMany", preventModification);
ledgerSchema.pre("replaceOne", preventModification);
ledgerSchema.pre("deleteOne", preventModification);
ledgerSchema.pre("deleteMany", preventModification);
ledgerSchema.pre("findOneAndDelete", preventModification);

// ─── Commit: Model Compilation ───
const Ledger = mongoose.model("Ledger", ledgerSchema);

module.exports = Ledger;
