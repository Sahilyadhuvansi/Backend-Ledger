const asyncHandler = require("../../common/utils/asyncHandler");
const ApiResponse = require("../../common/utils/ApiResponse");
const ApiError = require("../../common/utils/ApiError");
const financialAdvisor = require("../../common/services/financial-advisor.service");
const aiService = require("../../common/services/ai.service");

/**
 * AI Chatbot Controller
 * Conversational banking assistant
 */

/**
 * @route   POST /api/ai/chat
 * @desc    Send message to AI banking assistant
 * @access  Private
 */
exports.chat = asyncHandler(async (req, res) => {
  const { message } = req.body;
  const userId = req.user._id;

  if (!message || message.trim().length === 0) {
    throw new ApiError(400, "Message is required");
  }

  // Build conversation context
  const conversationHistory = req.session?.chatHistory || [];

  // System prompt for banking assistant
  const systemPrompt = `You are a helpful, friendly banking assistant AI. You help users with:
- Checking account balances and transaction history
- Answering questions about their spending
- Providing financial advice and insights
- Explaining banking features and policies

Be concise, accurate, and helpful. If you need specific account data to answer, 
acknowledge that and offer to look it up. Never make up account information.

Keep responses under 200 words unless more detail is specifically requested.`;

  // Add user message to history
  conversationHistory.push({ role: "user", content: message });

  // Determine if this is a financial query
  const isFinancialQuery = await this._detectFinancialQuery(message);

  let response;
  if (isFinancialQuery) {
    // Use financial advisor for specific queries
    response = await financialAdvisor.queryFinances(userId, message);
    conversationHistory.push({ role: "assistant", content: response.answer });
  } else {
    // General conversation
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

  // Store conversation history (limit to last 10 messages)
  req.session.chatHistory = conversationHistory.slice(-10);

  res
    .status(200)
    .json(
      new ApiResponse(200, response, "Message processed successfully")
    );
});

/**
 * @route   POST /api/ai/analyze-spending
 * @desc    Get AI spending analysis
 * @access  Private
 */
exports.analyzeSpending = asyncHandler(async (req, res) => {
  const { period = 30, category = null } = req.body;
  const userId = req.user._id;

  const analysis = await financialAdvisor.analyzeSpending(userId, {
    period,
    category,
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, analysis, "Spending analysis completed")
    );
});

/**
 * @route   POST /api/ai/predict-spending
 * @desc    Predict future spending
 * @access  Private
 */
exports.predictSpending = asyncHandler(async (req, res) => {
  const { forecastDays = 30, category = null } = req.body;
  const userId = req.user._id;

  const prediction = await financialAdvisor.predictSpending(userId, {
    forecastDays,
    category,
  });

  res
    .status(200)
    .json(
      new ApiResponse(200, prediction, "Spending prediction generated")
    );
});

/**
 * @route   POST /api/ai/recommend-budget
 * @desc    Get AI budget recommendations
 * @access  Private
 */
exports.recommendBudget = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const budget = await financialAdvisor.recommendBudget(userId);

  res
    .status(200)
    .json(
      new ApiResponse(200, budget, "Budget recommendations generated")
    );
});

/**
 * @route   GET /api/ai/insights
 * @desc    Get personalized financial insights
 * @access  Private
 */
exports.getInsights = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get comprehensive analysis
  const [spending, predictions] = await Promise.all([
    financialAdvisor.analyzeSpending(userId, { period: 30 }),
    financialAdvisor.predictSpending(userId, { forecastDays: 7 }),
  ]);

  // Generate quick insights
  const insights = {
    spending: spending.analysis,
    predictions: predictions.prediction,
    quickTips: spending.analysis.recommendations?.slice(0, 3) || [],
    healthScore: spending.analysis.healthScore || 0,
    generatedAt: new Date(),
  };

  res
    .status(200)
    .json(
      new ApiResponse(200, insights, "Insights retrieved successfully")
    );
});

/**
 * @route   DELETE /api/ai/conversation
 * @desc    Clear chat history
 * @access  Private
 */
exports.clearConversation = asyncHandler(async (req, res) => {
  req.session.chatHistory = [];

  res
    .status(200)
    .json(
      new ApiResponse(200, null, "Conversation history cleared")
    );
});

/**
 * @route   GET /api/ai/stats
 * @desc    Get AI usage statistics
 * @access  Private
 */
exports.getStats = asyncHandler(async (req, res) => {
  const stats = aiService.getStats();

  res
    .status(200)
    .json(
      new ApiResponse(200, stats, "AI usage statistics retrieved")
    );
});

/**
 * Helper: Detect if message is a financial query
 */
exports._detectFinancialQuery = async (message) => {
  const financialKeywords = [
    "spend",
    "spent",
    "balance",
    "transaction",
    "money",
    "paid",
    "received",
    "transfer",
    "account",
    "how much",
    "total",
    "last month",
    "this week",
    "groceries",
    "bills",
  ];

  const lowerMessage = message.toLowerCase();
  return financialKeywords.some((keyword) => lowerMessage.includes(keyword));
};
