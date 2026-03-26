// ─── Commit: Transaction Router Module ───
// What this does: Loads Express and the Transaction logic (Controller).
// Why it exists: To define the URLs for sending money and viewing history.
const express = require("express");
const { protect } = require("../../common/middleware/auth.middleware");
const transactionController = require("./transaction.controller");

const router = express.Router();

// ─── Commit: Global Auth Protection ───
// What this does: Ensures EVERY URL in this file is protected by the login guard.
// Interview insight: Why 'router.use(protect)'? It's better than adding 'protect' to every single line. If you forget to add 'protect' on one secret route, you've created a security hole.
router.use(protect);

// ─── Commit: Core Transaction Endpoints ───
// What this does: Maps a URL like `/api/v1/transactions/` to the `createTransaction` code.
// Beginners note: POST is for CREATING data, GET is for READING data.
router.post("/", transactionController.createTransaction);

// Fetches the last N transactions for the history page
router.get("/history", transactionController.getTransactionHistory);

module.exports = router;
