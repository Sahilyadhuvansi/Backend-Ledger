const express = require("express");
const router = express.Router();
const aiController = require("./ai.controller");
const receiptController = require("./receipt.controller");
const authMiddleware = require("../../common/middleware/auth.middleware");

// All AI routes require authentication
router.use(authMiddleware);

// ═══════════════════════════════════════════════════════════════
// Chatbot Routes
// ═══════════════════════════════════════════════════════════════

/**
 * @route   POST /api/ai/chat
 * @desc    Chat with AI banking assistant
 * @access  Private
 */
router.post("/chat", aiController.chat);

/**
 * @route   DELETE /api/ai/conversation
 * @desc    Clear chat history
 * @access  Private
 */
router.delete("/conversation", aiController.clearConversation);

// ═══════════════════════════════════════════════════════════════
// Financial Analysis Routes
// ═══════════════════════════════════════════════════════════════

/**
 * @route   POST /api/ai/analyze-spending
 * @desc    Get AI spending analysis
 * @access  Private
 */
router.post("/analyze-spending", aiController.analyzeSpending);

/**
 * @route   POST /api/ai/predict-spending
 * @desc    Predict future spending
 * @access  Private
 */
router.post("/predict-spending", aiController.predictSpending);

/**
 * @route   POST /api/ai/recommend-budget
 * @desc    Get AI budget recommendations
 * @access  Private
 */
router.post("/recommend-budget", aiController.recommendBudget);

/**
 * @route   GET /api/ai/insights
 * @desc    Get personalized financial insights
 * @access  Private
 */
router.get("/insights", aiController.getInsights);

// ═══════════════════════════════════════════════════════════════
// Receipt Scanning Routes
// ═══════════════════════════════════════════════════════════════

/**
 * @route   POST /api/ai/scan-receipt
 * @desc    Scan receipt and extract transaction data
 * @access  Private
 */
router.post("/scan-receipt", receiptController.scanReceipt);

/**
 * @route   POST /api/ai/scan-receipts/batch
 * @desc    Scan multiple receipts
 * @access  Private
 */
router.post("/scan-receipts/batch", receiptController.batchScanReceipts);

// ═══════════════════════════════════════════════════════════════
// Statistics & Monitoring
// ═══════════════════════════════════════════════════════════════

/**
 * @route   GET /api/ai/stats
 * @desc    Get AI usage statistics
 * @access  Private
 */
router.get("/stats", aiController.getStats);

module.exports = router;
