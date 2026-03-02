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
  { timestamps: true },
);

// Immobilize entries: Once written, they can't be modified or deleted.
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
