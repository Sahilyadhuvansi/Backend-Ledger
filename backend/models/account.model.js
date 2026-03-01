const mongoose = require("mongoose");
const Ledger = require("./ledger.model");

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required"],
      index: true,
    },
    status: {
      type: String,
      enum: {
        values: ["active", "inactive", "frozen"],
        message: "Status must be active, inactive or frozen",
      },
      default: "active",
    },
    balance: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
    currency: {
      type: String,
      required: true,
      default: "INR",
      uppercase: true,
    },
  },
  { timestamps: true },
);

// Optional: restrict unique active account per user?
// accountSchema.index({ user: 1, status: 1 }, { unique: true });

accountSchema.methods.calculateCurrentBalance = async function () {
  const result = await Ledger.aggregate([
    {
      $match: {
        account: this._id,
      },
    },
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
    {
      $project: {
        balance: { $subtract: ["$totalCredit", "$totalDebit"] },
      },
    },
  ]);

  return result[0]?.balance || 0;
};

const Account = mongoose.model("Account", accountSchema);

module.exports = Account;
