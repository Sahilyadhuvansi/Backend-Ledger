const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "From account reference is required"],
      index: true,
    },
    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: [true, "To account reference is required"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["pending", "completed", "failed", "cancelled"], // Unified statuses
        message: "Status must be pending, completed, failed or cancelled",
      },
      default: "pending",
    },
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },
    idempotencyKey: {
      type: String,
      required: [true, "Idempotency key is required"],
      unique: true,
      index: true,
    },
  },
  { timestamps: true },
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
