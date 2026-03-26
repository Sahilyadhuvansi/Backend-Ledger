// ─── Commit: Controller Module Imports ───
// What this does: Loads AI services (Financial Advisor, AI Chat) and standard error/response utilities.
const asyncHandler = require("../../common/utils/asyncHandler");
const ApiResponse = require("../../common/utils/ApiResponse");
const ApiError = require("../../common/utils/ApiError");
const financialAdvisor = require("../../common/services/financial-advisor.service");
const aiService = require("../../common/services/ai.service");

// ─── Commit: NLP Keyword Detection (Heuristics) ───
// What this does: Scans a user's chat message for money-related words.
// Why it exists: If the user says "Hello!", we use a regular LLM. If they say "How much did I spend?", we use the specialized Finance Agent.
// Interview insight: This is a simple form of "Intent Classification".
const _detectFinancialQuery = (message) => {
  const financialKeywords = [
    "spend", "spent", "balance", "transaction", "money", 
    "paid", "received", "transfer", "account", "how much", 
    "total", "last month", "this week", "groceries", "bills",
  ];

  const lowerMessage = message.toLowerCase();
  return financialKeywords.some((keyword) => lowerMessage.includes(keyword));
};

/**
 * AI Chatbot Controller
 * Conversational banking assistant
 */

// ─── Commit: Core Chat Intelligence ───
// What this does: Powers the "Neural Wealth Advisor" conversation.
// How it works: 1. Manages chat history (Short-term memory). 2. Detects intent. 3. Calls the right AI model. 4. Saves response to session.
// Beginner note: We store history in 'req.session' or 'req.body' so the AI remembers what you just said!
exports.chat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const userId = req.user._id;

  if (!message || message.trim().length === 0) {
    throw new ApiError(400, "Message is required");
  }

  // Step 1: short-term memory retrieval
  const conversationHistory = req.session?.chatHistory || [];

  // Step 2: System Persona (Setting the AI's "Job Title")
  const systemPrompt = `You are a helpful banking assistant for an Indian app. You are concise, accurate, and speak with wisdom. All amounts are in ₹ INR.`;

  conversationHistory.push({ role: "user", content: message });

  // Step 3: Routing Logic (Intent Matching)
  const isFinancialQuery = _detectFinancialQuery(message);

  let response;
  if (isFinancialQuery) {
    // Specialized agent with data access
    response = await financialAdvisor.queryFinances(userId, message);
    conversationHistory.push({ role: "assistant", content: response.answer });
  } else {
    // General small talk
    const aiResponse = await aiService.chat(conversationHistory, {
      systemPrompt,
      temperature: 0.7,
      maxTokens: 500,
    });

    response = {
      answer: aiResponse.content,
      isGeneral: true,
    };

    conversationHistory.push({ role: "assistant", content: aiResponse.content });
  }

  // Step 4: Context Window Management
  // Why slice(-10)? LLMs have a limit on how much they can remember. We keep the most recent 10 messages.
  req.session.chatHistory = conversationHistory.slice(-10);

  res.status(200).json(new ApiResponse(200, response, "Message processed successfully"));
});

// ─── Commit: Financial Analysis Endpoints ───
// These functions bridge the API to the deep-dive logic in 'financial-advisor.service.js'.

exports.analyzeSpending = asyncHandler(async (req, res) => {
  const { period = 30, category = null } = req.body;
  const analysis = await financialAdvisor.analyzeSpending(req.user._id, { period, category });
  res.status(200).json(new ApiResponse(200, analysis, "Spending analysis completed"));
});

exports.predictSpending = asyncHandler(async (req, res) => {
  const { forecastDays = 30, category = null } = req.body;
  const prediction = await financialAdvisor.predictSpending(req.user._id, { forecastDays, category });
  res.status(200).json(new ApiResponse(200, prediction, "Spending prediction generated"));
});

exports.recommendBudget = asyncHandler(async (req, res) => {
  const budget = await financialAdvisor.recommendBudget(req.user._id);
  res.status(200).json(new ApiResponse(200, budget, "Budget recommendations generated"));
});

// ─── Commit: Dashboard Insight Aggregator ───
// What this does: Fetches multiple AI features at once (Parallel) for the dashboard.
// Interview insight: Uses 'Promise.all' to minimize "TTFB" (Time To First Byte).
exports.getInsights = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const [spending, predictions] = await Promise.all([
    financialAdvisor.analyzeSpending(userId, { period: 30 }),
    financialAdvisor.predictSpending(userId, { forecastDays: 7 }),
  ]);

  const insights = {
    spending: spending.analysis,
    predictions: predictions.prediction,
    quickTips: spending.analysis.recommendations?.slice(0, 3) || [],
    healthScore: spending.analysis.healthScore || 0,
    generatedAt: new Date(),
  };

  res.status(200).json(new ApiResponse(200, insights, "Insights retrieved successfully"));
});

/**
 * Cleanup: Clear chat history
 */
exports.clearConversation = asyncHandler(async (req, res) => {
  req.session.chatHistory = [];
  res.status(200).json(new ApiResponse(200, null, "Conversation history cleared"));
});

/**
 * Monitoring: Get AI usage statistics
 */
exports.getStats = asyncHandler(async (req, res) => {
  const stats = aiService.getStats();
  res.status(200).json(new ApiResponse(200, stats, "AI usage statistics retrieved"));
});
