const express = require("express");
const { protect } = require("../middleware/auth.middleware");
const transactionController = require("../controllers/transaction.controller");

const router = express.Router();

// Apply auth to all transaction routes
router.use(protect);

// Create a new transaction
router.post("/", transactionController.createTransaction);

module.exports = router;
