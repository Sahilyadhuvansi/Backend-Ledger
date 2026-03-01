const express = require("express");
const {
  protect,
  restrictToSystemUser,
} = require("../middleware/auth.middleware");
const accountController = require("../controllers/account.controller");
const transactionController = require("../controllers/transaction.controller");

const router = express.Router();

// Middleware applied to ALL account routes
router.use(protect);

// Create new account
router.post("/", accountController.createAccount);

// Get all user accounts
router.get("/", accountController.getAccounts);

// Get specific account details
router.get("/:id", accountController.getAccountDetails);

// System user routes
router.post(
  "/system/initial-funds",
  restrictToSystemUser,
  transactionController.createInitialFundsTransaction,
);

module.exports = router;
