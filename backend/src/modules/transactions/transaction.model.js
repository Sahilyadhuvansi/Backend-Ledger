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
    description: {
      type: String,
      maxlength: [255, "Description cannot exceed 255 characters"],
      trim: true,
    },
    note: {
      type: String,
      maxlength: [1000, "Note cannot exceed 1000 characters"],
      trim: true,
    },
    category: {
      type: String,
      default: "other",
      trim: true,
    },
    isFlagged: {
      type: Boolean,
      default: false,
    },
    isFraud: {
      type: Boolean,
      default: false,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true },
);

// Compound Performance Indexes
transactionSchema.index({ fromAccount: 1, createdAt: -1 });
transactionSchema.index({ toAccount: 1, createdAt: -1 });
transactionSchema.index({ createdAt: -1 });
const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
