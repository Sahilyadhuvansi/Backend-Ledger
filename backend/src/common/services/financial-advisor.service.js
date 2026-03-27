// ─── Commit: Core Module and Model Imports ───
// What this does: Loads the AI central service and the database models for Transactions and Accounts.
// Why it exists: This service combines raw data (from MongoDB) with the "intelligence" of the AI (via Groq).
// Beginner note: '..' moves up one folder level, allowing us to access different parts of the project.
const aiService = require("../services/ai.service");
const Transaction = require("../../modules/transactions/transaction.model");
const Account = require("../../modules/accounts/account.model");

/**
 * AI Financial Advisor
 * Provides intelligent financial insights and recommendations
 */
class FinancialAdvisor {
  constructor() {
    this._cache = new Map();
    this._CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Analyze spending patterns and provide insights
   */
<<<<<<< HEAD
  // ─── Commit: Spending Analysis Logic ───
  // What this does: Gathers transactions from the database for a specific period (e.g., 30 days) and asks the AI to find patterns.
  // How it works: 1. Calculates start date. 2. Queries MongoDB for matching transactions. 3. Formats summary. 4. Sends formatted prompt to AI.
  // Interview insight: Why query by account IDs? Because a single user might have multiple accounts (Savings, Checking), and we want a "Holistic View".
=======
  // Spending Analysis Logic ───────────────────────────────────────────────────
>>>>>>> main
  async analyzeSpending(userId, options = {}) {
    const { period = 30, category = null } = options;
    const cacheKey = `${userId}_${period}_${category || "all"}`;

    // Check cache
    const cached = this._cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this._CACHE_TTL) {
      console.log(`Serving cached analysis for ${cacheKey}`);
      return cached.data;
    }

    // Fetch user's transactions based on date range
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // Identify all accounts owned by this user
<<<<<<< HEAD
    const userAccounts = await Account.find({ user: userId });
=======
    const userAccounts = await Account.find({ user: userId }).select("_id").lean();
>>>>>>> main
    const accountIds = userAccounts.map((acc) => acc._id);
    const accountIdsSet = new Set(accountIds.map(id => id.toString()));

    // Mongoose query using $or to find transactions where user is either sender or receiver
    const query = {
      $or: [{ fromAccount: { $in: accountIds } }, { toAccount: { $in: accountIds } }],
      createdAt: { $gte: startDate },
    };

    if (category) {
      query.category = category;
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    // Prepare transaction summary (math-heavy part)
<<<<<<< HEAD
    const summary = await this._summarizeTransactions(transactions, userId);
=======
    const summary = await this._summarizeTransactions(transactions, userId, accountIdsSet);
>>>>>>> main

    // ─── Commit: AI Prompt Engineering for Analysis ───
    // What this does: Carefully crafts a text prompt that tells the AI exactly how to analyze the data.
    // Why it exists: Large Language Models (LLMs) need context (Currency, Period, Totals) to give meaningful advice.
    // Beginner note: Template literals (using `) allow us to inject variables directly into strings.
    const prompt = `Analyze these financial transactions and provide actionable insights:

Currency: Indian Rupees (₹ INR)
Period: Last ${period} days
Total Transactions: ${summary.totalCount}
Total Spent: ₹${summary.totalSpent.toFixed(2)}
Total Received: ₹${summary.totalReceived.toFixed(2)}
Average Transaction: ₹${summary.avgAmount.toFixed(2)}

Category Breakdown:
${Object.entries(summary.byCategory)
  .map(([cat, data]) => `- ${cat}: ₹${data.total.toFixed(2)} (${data.count} transactions)`)
  .join("\n")}

Top Spending Days: ${summary.topDays.join(", ")}

Provide:
1. Key spending patterns
2. Areas of overspending
3. Savings opportunities
4. Budget recommendations
5. Financial health score (1-10)

IMPORTANT: All amounts are in Indian Rupees (₹ INR). Use ₹ symbol in your response.

Format as JSON:
{
  "insights": ["insight1", "insight2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "healthScore": 8,
  "riskAreas": ["area1", ...],
  "savingsOpportunities": ["opp1", ...]
}`;

    const response = await aiService.chat(
      [{ role: "user", content: prompt }],
      {
        temperature: 0.3, // Lower temperature means more "serious" and predictable output
        maxTokens: 2000,
        systemPrompt:
          "You are a financial advisor AI for an Indian banking app. All amounts are in Indian Rupees (₹ INR). Provide clear, actionable advice based on transaction data. Always use ₹ symbol for amounts. Always format responses as valid JSON.",
      }
    );

    // Parse the AI's text response back into a standard Javascript object
    const analysis = this._parseJSON(response.content);

    const result = {
      summary,
      analysis,
      period,
      generatedAt: new Date(),
    };

    // Cache the result
    this._cache.set(cacheKey, { timestamp: Date.now(), data: result });

    return result;
  }

  /**
   * Natural language query interface
   */
  // ─── Commit: NLP Financial Query Interface ───
  // What this does: Allows users to ask questions like "How much did I spend on Chai last week?"
  // Why it exists: Provides a "Chat-with-your-data" experience.
  // How it works: Feeds the last 50 transactions + balance into the AI window as "Context".
  async queryFinances(userId, question) {
    const userAccounts = await Account.find({ user: userId });
    const accountIds = userAccounts.map((acc) => acc._id);

    const transactions = await Transaction.find({
      $or: [{ fromAccount: { $in: accountIds } }, { toAccount: { $in: accountIds } }],
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const account = await Account.findOne({ user: userId });

    const context = `
User Account (Currency: Indian Rupees ₹ INR):
- Current Balance: ₹${account?.balance || 0}
- Account Type: ${account?.accountType || "standard"}

Recent Transactions (last 50):
${transactions
  .map(
    (t) =>
      `- ${t.createdAt.toLocaleDateString()}: ${t.type} of ₹${t.amount} ${
        t.description ? `(${t.description})` : ""
      } [Category: ${t.category || "uncategorized"}]`
  )
  .join("\n")}
`;

    const systemPrompt = `You are a helpful financial assistant for an Indian banking app. All amounts are in Indian Rupees (₹ INR). Answer questions about the user's finances based on the provided transaction history and account data. Always use ₹ symbol when mentioning amounts. Be concise, accurate, and helpful. If you cannot determine the answer from the data, say so clearly.`;

    const userPrompt = `${context}\n\nUser Question: ${question}\n\nProvide a clear, direct answer based on the transaction data.`;

    const response = await aiService.chat(
      [{ role: "user", content: userPrompt }],
      {
        systemPrompt,
        temperature: 0.2,
        maxTokens: 500,
      }
    );

    return {
      question,
      answer: response.content,
      timestamp: new Date(),
    };
  }

  /**
   * Predict future spending
   */
  // ─── Commit: Financial Forecasting Logic ───
  // What this does: Uses historical data to guess what spending will look like in the next 30 days.
  // Why it exists: Helping users prepare for future expenses and avoid debt.
  // Interview insight: This is a form of "Regression Analysis" or "Time Series Prediction" using an LLM instead of a traditional statistical model.
  async predictSpending(userId, options = {}) {
    const { forecastDays = 30, category = null } = options;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

<<<<<<< HEAD
    const userAccounts = await Account.find({ user: userId });
=======
    const userAccounts = await Account.find({ user: userId }).select("_id").lean();
>>>>>>> main
    const accountIds = userAccounts.map((acc) => acc._id);

    const query = {
      fromAccount: { $in: accountIds }, 
      createdAt: { $gte: startDate },
    };

    if (category) {
      query.category = category;
    }

    const transactions = await Transaction.find(query)
      .select("amount createdAt category")
      .sort({ createdAt: 1 })
      .lean();

    const dailySpending = this._groupByDay(transactions);

    const dataString = Object.entries(dailySpending)
      .map(([date, amount]) => `${date}: ₹${amount.toFixed(2)}`)
      .join("\n");

    const prompt = `Based on this spending history, predict spending for the next ${forecastDays} days:

Historical Daily Spending (last 90 days):
${dataString}

Analyze patterns (weekday vs weekend, monthly cycles, trends) and provide:
1. Predicted daily spending for next ${forecastDays} days
2. Total predicted spending
3. Confidence level (low/medium/high)
4. Key factors affecting prediction

Format as JSON:
{
  "totalPredicted": 1234.56,
  "dailyAverage": 41.15,
  "confidence": "high",
  "factors": ["factor1", "factor2"],
  "trend": "increasing/stable/decreasing"
}`;

    const response = await aiService.chat(
      [{ role: "user", content: prompt }],
      {
        temperature: 0.2,
        maxTokens: 1500,
        systemPrompt:
          "You are a financial forecasting AI for an Indian banking app. All amounts are in Indian Rupees (₹ INR). Analyze spending patterns and make data-driven predictions. Always use ₹ for amounts. Always return valid JSON.",
      }
    );

    const prediction = this._parseJSON(response.content);

    return {
      prediction,
      historicalData: dailySpending,
      forecastPeriod: forecastDays,
      generatedAt: new Date(),
    };
  }

  /**
   * Generate budget recommendations
   */
  // ─── Commit: Category-wise Budget Recommendation ───
  // What this does: Suggests specific limits for Groceries, Dining, etc., based on past 3 months.
  // Real-world analogy: Like having a personal accountant create a personalized monthly plan for you.
  async recommendBudget(userId) {
    const analysis = await this.analyzeSpending(userId, { period: 90 });

    const prompt = `Based on this spending analysis, create a realistic monthly budget (all amounts in Indian Rupees ₹ INR):

Current Spending:
${Object.entries(analysis.summary.byCategory)
  .map(([cat, data]) => `- ${cat}: ₹${data.total.toFixed(2)}/month`)
  .join("\n")}

Total Monthly Spending: ₹${analysis.summary.totalSpent.toFixed(2)}
Income (estimated from deposits): ₹${analysis.summary.totalReceived.toFixed(2)}

Create a balanced budget for an Indian user with:
1. Recommended allocation per category (in ₹)
2. Savings goal (percentage of income)
3. Emergency fund recommendation (in ₹)
4. Discretionary spending limit (in ₹)

Format as JSON:
{
  "monthlyBudget": {
    "groceries": 5000,
    "dining": 3000,
    ...
  },
  "savingsGoal": 5000,
  "emergencyFund": 30000,
  "discretionary": 4000,
  "totalBudget": 25000
}`;

    const response = await aiService.chat(
      [{ role: "user", content: prompt }],
      {
        temperature: 0.3,
        maxTokens: 1500,
      }
    );

    const budget = this._parseJSON(response.content);

    return {
      recommendedBudget: budget,
      basedOnAnalysis: analysis.summary,
      generatedAt: new Date(),
    };
  }

  /**
   * Categorize transaction using AI
   */
  // ─── Commit: AI Transaction Categorizer ───
  // What this does: Takes a raw transaction description (e.g., "ZOMATO 234123") and labels it as "dining".
  // Why it exists: Manual entry is boring; AI makes the dashboard clean and organized automatically.
  async categorizeTransaction(description, amount, merchant = null) {
    const prompt = `Categorize this financial transaction (Indian banking context):

Description: ${description}
Amount: ₹${amount}
${merchant ? `Merchant: ${merchant}` : ""}

Choose the MOST appropriate category from:
groceries, dining, transportation, utilities, entertainment, healthcare, 
shopping, travel, education, income, transfer, other

Return ONLY the category name, nothing else.`;

    const response = await aiService.chat(
      [{ role: "user", content: prompt }],
      {
        temperature: 0.1,
        maxTokens: 50,
        systemPrompt:
          "You are a transaction categorization AI. Return only the category name.",
      }
    );

    const category = response.content.trim().toLowerCase();

    return {
      category,
      confidence: "high", 
    };
  }

  /**
   * Helper: Summarize transactions
   */
<<<<<<< HEAD
  // ─── Commit: Data Pre-processing / Aggregation ───
  // What this does: Iterates through transaction arrays to calculate totals, category counts, and daily peaks.
  // How it works: Uses a Set to track user IDs and performs basic arithmetic.
  // Interview insight: This logic is "O(n)" complexity because we only loop through the list once.
  async _summarizeTransactions(transactions, userId) {
=======
  // Data Pre-processing / Aggregation ─────────────────────────────────────────
  async _summarizeTransactions(transactions, userId, userAccountIds) {
>>>>>>> main
    const summary = {
      totalCount: transactions.length,
      totalSpent: 0,
      totalReceived: 0,
      byCategory: {},
      topDays: [],
      avgAmount: 0,
    };

    const daySpending = {};

<<<<<<< HEAD
    const userAccountIds = new Set();
    const userAccounts = await Account.find({ user: userId });
    userAccounts.forEach(acc => userAccountIds.add(acc._id.toString()));
=======
>>>>>>> main

    transactions.forEach((t) => {
      const isOutgoing = userAccountIds.has(t.fromAccount.toString());
      const amount = t.amount;

      if (isOutgoing) {
        summary.totalSpent += amount;
      } else {
        summary.totalReceived += amount;
      }

      const cat = t.category || "uncategorized";
      if (!summary.byCategory[cat]) {
        summary.byCategory[cat] = { total: 0, count: 0 };
      }
      if (isOutgoing) {
        summary.byCategory[cat].total += amount;
        summary.byCategory[cat].count++;
      }

      const day = t.createdAt.toLocaleDateString();
      daySpending[day] = (daySpending[day] || 0) + (isOutgoing ? amount : 0);
    });

    summary.avgAmount =
      summary.totalCount > 0
        ? (summary.totalSpent + summary.totalReceived) / summary.totalCount
        : 0;

    summary.topDays = Object.entries(daySpending)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([day]) => day);

    return summary;
  }

  /**
   * Helper: Group transactions by day
   */
  _groupByDay(transactions) {
    const daily = {};
    transactions.forEach((t) => {
      const day = t.createdAt.toISOString().split("T")[0];
      daily[day] = (daily[day] || 0) + t.amount;
    });
    return daily;
  }

  /**
   * Helper: Parse JSON safely
   */
  // ─── Commit: Robust JSON Processing ───
  // What this does: Cleans up AI output (removing markdown blocks) so it can be parsed without crashing the server.
  // Why it exists: AI provides "Markdown" often (e.g., ```json ... ```), which JSON.parse cannot read directly.
  _parseJSON(text) {
    try {
      const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.error("JSON parse error:", e.message);
      return { error: "Failed to parse AI response" };
    }
  }
}

// ─── Commit: Service Modularization ───
// Why it exists: Exporting a "New Instance" allows other files to use this service without re-initializing it.
module.exports = new FinancialAdvisor();
