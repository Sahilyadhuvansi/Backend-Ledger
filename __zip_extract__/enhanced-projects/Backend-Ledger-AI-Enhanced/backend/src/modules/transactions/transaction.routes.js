const express = require("express");
const { protect } = require("../../common/middleware/auth.middleware");
const transactionController = require("./transaction.controller");

const router = express.Router();

// Apply auth to all transaction routes
router.use(protect);

// Create a new transaction
router.post("/", transactionController.createTransaction);

// Get transaction history
router.get("/history", transactionController.getTransactionHistory);

module.exports = router;
