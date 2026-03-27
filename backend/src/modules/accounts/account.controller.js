// ─── Commit: Account Controller Logic ───
// What this does: Handles the "Business Rules" for creating and viewing bank accounts.
// Patterns used: MVC (Controller layer).
const Account = require("./account.model");
const Ledger = require("./ledger.model");
const asyncHandler = require("../../common/utils/asyncHandler");
const ApiError = require("../../common/utils/ApiError");
const ApiResponse = require("../../common/utils/ApiResponse");

// ─── Create Account ───────────────────────────────────────────────────────────
// ─── Commit: Digital Wallet Creation ───
// What this does: Opens a new currency-based wallet for the user.
// Why it exists: A single user can have multiple accounts (e.g., INR, USD).
// Interview insight: Why default to 'INR'? Because our AI suite is localized for the Indian market.
const createAccount = asyncHandler(async (req, res) => {
  const { currency = "INR" } = req.body;

  const account = await Account.create({
    user: req.user._id, // Automatic ownership link from 'protect' middleware
    currency: currency.toUpperCase(),
  });

  return res.status(201).json(new ApiResponse(201, account, "Account created successfully."));
});

// ─── Get All Accounts ─────────────────────────────────────────────────────────
// ─── Commit: Portfolio Retrieval (Lean Fetching) ───
// Why '.lean()'? It returns a plain Javascript object instead of a heavy Mongoose document, making the dashboard load faster.
const getAccounts = asyncHandler(async (req, res) => {
  const accounts = await Account.find({ user: req.user._id }).lean();
  return res.status(200).json(new ApiResponse(200, accounts, "Accounts fetched successfully."));
});

// ─── Get Account Details ──────────────────────────────────────────────────────
// ─── Commit: Holistic Account View (Aggregation) ───
// What this does: Shows the balance, history, and "Verified" balance calculation.
// How it works: Uses Promise.all to fetch the balance and history at the exact same time (Parallel processing).
// Beginner note: 'req.params.id' refers to the ID in the URL (e.g., /accounts/507f191e...)
const getAccountDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Security Gate: Ensure the user actually OWNS the account they are trying to peek into.
  const account = await Account.findOne({ _id: id, user: req.user._id });
  if (!account) {
    throw new ApiError(404, "Account not found.");
  }

<<<<<<< HEAD
  // Interview insight: We use 'Promise.all' here. 
  // Why? If we used 'await A; await B;' it would take 200ms. With 'Promise.all', both run at once, taking only 100ms! (Parallelism).
  const [calculatedBalance, recentTransactions] = await Promise.all([
    account.calculateCurrentBalance(), // Complex math in DB
=======
  const verify = req.query.verify === "true";

  const [calculatedBalance, recentTransactions] = await Promise.all([
    verify ? account.calculateCurrentBalance() : Promise.resolve(account.balance), // complex math ONLY if requested
>>>>>>> main
    Ledger.find({ account: id })
      .sort({ createdAt: -1 }) // Newest first
      .limit(10)
      .populate("transaction") // Link back to the transaction record
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
