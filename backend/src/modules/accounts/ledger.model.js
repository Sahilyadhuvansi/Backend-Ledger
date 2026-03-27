const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema(
  {
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
  { timestamps: true }
);

ledgerSchema.index({ account: 1, createdAt: -1 });
ledgerSchema.index({ createdAt: -1 });

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

ledgerSchema.pre("findOneAndUpdate", preventModification);
ledgerSchema.pre("findOneAndReplace", preventModification);
ledgerSchema.pre("updateOne", preventModification);
ledgerSchema.pre("updateMany", preventModification);
ledgerSchema.pre("replaceOne", preventModification);
ledgerSchema.pre("deleteOne", preventModification);
ledgerSchema.pre("deleteMany", preventModification);
ledgerSchema.pre("findOneAndDelete", preventModification);

const Ledger = mongoose.model("Ledger", ledgerSchema);

module.exports = Ledger;
