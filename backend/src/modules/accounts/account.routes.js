// ─── Commit: Bank Account Router Initial ───
// What this does: Loads Express and the necessary controllers for Accounts and Transactions.
// Why it exists: To define the URLs for managing money storage (Accounts).
const express = require("express");
const {
  protect,
  restrictToSystemUser,
} = require("../../common/middleware/auth.middleware");
const accountController = require("./account.controller");
const transactionController = require("../transactions/transaction.controller");

const router = express.Router();

// ─── Commit: Global Shared Middleware ───
// What this does: Locks down every URL listed below unless the user is logged in.
router.use(protect);

// ─── Commit: User Account Endpoints ───
// What this does: Defines how to Create, List, and View individual bank accounts.
// Pattern used: REST Routing (/accounts, /accounts/:id).

// Create a new bank account (e.g., Savings, Business)
router.post("/", accountController.createAccount);

// Get a list of ALL accounts owned by the current user
router.get("/", accountController.getAccounts);

// Get deep details for ONE specific account (using the :id ID parameter)
router.get("/:id", accountController.getAccountDetails);

// ─── Commit: System & Administrative Routes ───
// What this does: Definies special endpoints used only by the system (or AI bots).
// Why 'restrictToSystemUser'? To prevent normal users from giving themselves "Initial Funds" (Infinite Money Glitch!).
// Interview insight: This is part of "Privilege Escalation Protection".
router.post(
  "/system/initial-funds",
  restrictToSystemUser,
  transactionController.createInitialFundsTransaction,
);

module.exports = router;
