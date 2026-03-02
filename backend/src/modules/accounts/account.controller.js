const Account = require("./account.model");
const asyncHandler = require("../../common/utils/asyncHandler");
const ApiError = require("../../common/utils/ApiError");
const ApiResponse = require("../../common/utils/ApiResponse");

const createAccount = asyncHandler(async (req, res) => {
  const { currency } = req.body;

  const account = await Account.create({
    user: req.user._id,
    currency: currency || "INR",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, account, "Account created successfully"));
});

const getAccounts = asyncHandler(async (req, res) => {
  const accounts = await Account.find({ user: req.user._id });
  return res
    .status(200)
    .json(new ApiResponse(200, accounts, "Accounts fetched successfully"));
});

const Ledger = require("./ledger.model");

const getAccountDetails = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const account = await Account.findOne({ _id: id, user: req.user._id });

  if (!account) {
    throw new ApiError(404, "Account not found");
  }

  const balance = await account.calculateCurrentBalance();

  const recentTransactions = await Ledger.find({ account: id })
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("transaction");

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        ...account.toObject(),
        calculatedBalance: balance,
        recentTransactions,
      },
      "Account details fetched successfully",
    ),
  );
});

module.exports = {
  createAccount,
  getAccounts,
  getAccountDetails,
};
