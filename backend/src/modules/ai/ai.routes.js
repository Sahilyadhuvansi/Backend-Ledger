// ─── Commit: Express Router Library ───
// What this does: Initializes the core Router mechanism of the Express framework.
const express = require("express");
const router = express.Router();

// ─── Commit: Controller & Logic Imports ───
// What this does: Loads the AI-specific controllers for Chat, Analysis, and Receipt Scanning.
const aiController = require("./ai.controller");
const receiptController = require("./receipt.controller");
const authMiddleware = require("../../common/middleware/auth.middleware");

// ─── Commit: Root Protection Middleware ───
// Why it exists: AI requests are expensive! We must ensure that only authorized (logged in) users can use our Groq/OpenAI tokens.
router.use(authMiddleware.protect);

// ─── Commit: AI Chat & Interaction Routes ───
// What this does: Defines the endpoints for the "Neural Wealth Advisor" chatbot.
// Pattern used: RESTful endpoints (/chat, /conversation).

// Standard chat interface
router.post("/chat", aiController.chat);

// Resets the conversation history window in the database
router.delete("/conversation", aiController.clearConversation);

// ─── Commit: Financial Wisdom Routes ───
// What this does: Endpoints that call our 'financial-advisor.service.js' logic.
// Why 'POST'? Because we often need to send parameters like "Period" or "Categories" in the request body.

// Deep-dive into historical spending
router.post("/analyze-spending", aiController.analyzeSpending);

// Future prediction engine
router.post("/predict-spending", aiController.predictSpending);

// Personalized monthly budget planning
router.post("/recommend-budget", aiController.recommendBudget);

// Quick dashboard "Nudges" and tips
router.get("/insights", aiController.getInsights);

// ─── Commit: Paperwork-to-Pixels Routes ───
// What this does: Routes for uploading receipt images for OCR scanning.
// Beginner note: The client sends a multipart file upload here.

// Single receipt extraction
router.post("/scan-receipt", receiptController.scanReceipt);

// Multi-receipt processing (Batch mode)
router.post("/scan-receipts/batch", receiptController.batchScanReceipts);

// ─── Commit: Monitoring & Observability ───
// What this does: Shows the currently logged-in user their AI usage stats and limits.
router.get("/stats", aiController.getStats);

// ─── Commit: Router Export ───
module.exports = router;
