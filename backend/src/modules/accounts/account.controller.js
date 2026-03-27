const Account = require("./account.model");
const Ledger = require("./ledger.model");
const asyncHandler = require("../../common/utils/asyncHandler");
const ApiError = require("../../common/utils/ApiError");
const ApiResponse = require("../../common/utils/ApiResponse");

// ─── Create Account ───────────────────────────────────────────────────────────
const createAccount = asyncHandler(async (req, res) => {
  const { currency = "INR" } = req.body;

  const account = await Account.create({
    user: req.user._id,
    currency: currency.toUpperCase(),
  });

  return res.status(201).json(new ApiResponse(201, account, "Account created successfully."));
});

// ─── Get All Accounts ─────────────────────────────────────────────────────────
const getAccounts = asyncHandler(async (req, res) => {
  const accounts = await Account.find({ user: req.user._id }).lean();
  return res.status(200).json(new ApiResponse(200, accounts, "Accounts fetched successfully."));
});

// ─── Get Account Details ──────────────────────────────────────────────────────
const getAccountDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const account = await Account.findOne({ _id: id, user: req.user._id });
  if (!account) {
    throw new ApiError(404, "Account not found.");
  }

  const verify = req.query.verify === "true";

  const [calculatedBalance, recentTransactions] = await Promise.all([
    verify ? account.calculateCurrentBalance() : Promise.resolve(account.balance), // complex math ONLY if requested
    Ledger.find({ account: id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("transaction")
      .lean(),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      { ...account.toObject(), balance: account.balance, verifiedBalance: calculatedBalance, recentTransactions },
      "Account details fetched successfully."
    )
  );
});

module.exports = { createAccount, getAccounts, getAccountDetails };
