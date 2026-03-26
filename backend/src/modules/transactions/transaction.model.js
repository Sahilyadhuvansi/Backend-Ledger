// ─── Commit: Mongoose Library Import ───
// What this does: Loads Mongoose, the industry-standard driver for connecting Node.js to MongoDB.
// Why it exists: MongoDB is a "NoSQL" database, which means it doesn't enforce structure by itself. Mongoose adds a "Schema" to keep your data organized and valid.
const mongoose = require("mongoose");

// ─── Commit: Transaction Schema Definition ───
// What this does: Defines the blueprint for every transaction (Transfer, Payment, etc.) in your system.
// Why it exists: To ensure that every transaction recorded in the database has the required fields (Amount, Accounts, Status).
// Pattern used: "Schema-based Modeling".
const transactionSchema = new mongoose.Schema(
  {
    // ─── Commit: Relational Identification (Refs) ───
    // What this does: Points to the 'Account' model using unique IDs.
    // Interview insight: Why 'ref'? This allows us to use 'populate()' to fetch the actual Account names later in one query.
    // Beginner note: 'index: true' makes searching for transactions by account 100x faster by creating a sorted map in DB.
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

    // ─── Commit: Status and State Management ───
    // What this does: Tracks if the money move is pending, done, or failed.
    // Why it exists: Critical for "Atomic Transactions" — you don't want to lose money if a server crashes mid-transfer.
    // Beginner note: 'enum' restricts the value to only the words in the list.
    status: {
      type: String,
      enum: {
        values: ["pending", "completed", "failed", "cancelled"], 
        message: "Status must be pending, completed, failed or cancelled",
      },
      default: "pending",
    },

    // ─── Commit: Financial Fields (Amount & Accuracy) ───
    // What this does: Stores the actual money value.
    // Beginner note: 'min: 0' prevents users from "transferring" negative amounts to steal money.
    amount: {
      type: Number,
      required: true,
      min: [0, "Amount cannot be negative"],
    },

    // ─── Commit: Idempotency (The "Safety Key") ───
    // What this does: Ensures a user doesn't accidentally send the same payment twice if they click the button 10 times.
    // Interview insight: What is an Idempotency Key? It is a unique string that prevents the server from processing the same command twice.
    idempotencyKey: {
      type: String,
      required: [true, "Idempotency key is required"],
      unique: true,
      index: true,
    },

    // ─── Commit: Metadata and Description ───
    // What this does: Holds text notes and extra info for the user.
    // Beginner note: 'trim: true' automatically removes extra spaces (e.g., " Coffee  " -> "Coffee").
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

    // ─── Commit: Security Flags ───
    // What this does: Integration points for our Fraud Detection Service.
    isFlagged: {
      type: Boolean,
      default: false,
    },
    isFraud: {
      type: Boolean,
      default: false,
    },

    // Flexible field for future plugins or AI context
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  // ─── Commit: Automatic Timestamps ───
  // What this does: MongoDB automatically adds 'createdAt' and 'updatedAt' for you.
  { timestamps: true },
);

// ─── Commit: Model Compilation ───
// What this does: Turns the blueprint (Schema) into a working tool (Model).
// Beginner note: Think of Schema as a Recipe, and Model as the actual Dish you interact with.
const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
