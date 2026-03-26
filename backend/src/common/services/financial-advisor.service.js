const aiService = require("../services/ai.service");
const Transaction = require("../../modules/transactions/transaction.model");
const Account = require("../../modules/accounts/account.model");

/**
 * AI Financial Advisor
 * Provides intelligent financial insights and recommendations
 */
class FinancialAdvisor {
  /**
   * Analyze spending patterns and provide insights
   */
  async analyzeSpending(userId, options = {}) {
    const { period = 30, category = null } = options;

    // Fetch user's transactions
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - period);

    // Find user's accounts first
    const userAccounts = await Account.find({ user: userId });
    const accountIds = userAccounts.map((acc) => acc._id);

    const query = {
      $or: [{ fromAccount: { $in: accountIds } }, { toAccount: { $in: accountIds } }],
      createdAt: { $gte: startDate },
    };

    if (category) {
      query.category = category;
    }

    const transactions = await Transaction.find(query)
      .sort({ createdAt: -1 })
      .limit(100);

    // Prepare transaction summary
    const summary = await this._summarizeTransactions(transactions, userId);

    // Generate AI insights
    const prompt = `Analyze these financial transactions and provide actionable insights:

Period: Last ${period} days
Total Transactions: ${summary.totalCount}
Total Spent: $${summary.totalSpent.toFixed(2)}
Total Received: $${summary.totalReceived.toFixed(2)}
Average Transaction: $${summary.avgAmount.toFixed(2)}

Category Breakdown:
${Object.entries(summary.byCategory)
  .map(([cat, data]) => `- ${cat}: $${data.total.toFixed(2)} (${data.count} transactions)`)
  .join("\n")}

Top Spending Days: ${summary.topDays.join(", ")}

Provide:
1. Key spending patterns
2. Areas of overspending
3. Savings opportunities
4. Budget recommendations
5. Financial health score (1-10)

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
        temperature: 0.3,
        maxTokens: 2000,
        systemPrompt:
          "You are a financial advisor AI. Provide clear, actionable advice based on transaction data. Always format responses as valid JSON.",
      }
    );

    // Parse AI response
    const analysis = this._parseJSON(response.content);

    return {
      summary,
      analysis,
      period,
      generatedAt: new Date(),
    };
  }

  /**
   * Natural language query interface
   */
  async queryFinances(userId, question) {
    // Find user's accounts first
    const userAccounts = await Account.find({ user: userId });
    const accountIds = userAccounts.map((acc) => acc._id);

    // Fetch recent transaction context
    const transactions = await Transaction.find({
      $or: [{ fromAccount: { $in: accountIds } }, { toAccount: { $in: accountIds } }],
    })
      .sort({ createdAt: -1 })
      .limit(50);

    const account = await Account.findOne({ user: userId });

    // Build context for AI
    const context = `
User Account:
- Current Balance: $${account?.balance || 0}
- Account Type: ${account?.accountType || "standard"}

Recent Transactions (last 50):
${transactions
  .map(
    (t) =>
      `- ${t.createdAt.toLocaleDateString()}: ${t.type} of $${t.amount} ${
        t.description ? `(${t.description})` : ""
      } [Category: ${t.category || "uncategorized"}]`
  )
  .join("\n")}
`;

    const systemPrompt = `You are a helpful financial assistant. Answer questions about the user's finances based on the provided transaction history and account data. Be concise, accurate, and helpful. If you cannot determine the answer from the data, say so clearly.`;

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
  async predictSpending(userId, options = {}) {
    const { forecastDays = 30, category = null } = options;

    // Get historical data (last 90 days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 90);

    // Find user's accounts first
    const userAccounts = await Account.find({ user: userId });
    const accountIds = userAccounts.map((acc) => acc._id);

    const query = {
      fromAccount: { $in: accountIds }, // Only outgoing transactions
      createdAt: { $gte: startDate },
    };

    if (category) {
      query.category = category;
    }

    const transactions = await Transaction.find(query).sort({ createdAt: 1 });

    // Group by day
    const dailySpending = this._groupByDay(transactions);

    // Prepare data for AI
    const dataString = Object.entries(dailySpending)
      .map(([date, amount]) => `${date}: $${amount.toFixed(2)}`)
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
          "You are a financial forecasting AI. Analyze spending patterns and make data-driven predictions. Always return valid JSON.",
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
  async recommendBudget(userId) {
    // Analyze last 3 months of spending
    const analysis = await this.analyzeSpending(userId, { period: 90 });

    const prompt = `Based on this spending analysis, create a realistic monthly budget:

Current Spending:
${Object.entries(analysis.summary.byCategory)
  .map(([cat, data]) => `- ${cat}: $${data.total.toFixed(2)}/month`)
  .join("\n")}

Total Monthly Spending: $${analysis.summary.totalSpent.toFixed(2)}
Income (estimated from deposits): $${analysis.summary.totalReceived.toFixed(2)}

Create a balanced budget with:
1. Recommended allocation per category
2. Savings goal (percentage of income)
3. Emergency fund recommendation
4. Discretionary spending limit

Format as JSON:
{
  "monthlyBudget": {
    "groceries": 500,
    "dining": 300,
    ...
  },
  "savingsGoal": 500,
  "emergencyFund": 3000,
  "discretionary": 400,
  "totalBudget": 2500
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
  async categorizeTransaction(description, amount, merchant = null) {
    const prompt = `Categorize this financial transaction:

Description: ${description}
Amount: $${amount}
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
      confidence: "high", // Could enhance with confidence scoring
    };
  }

  /**
   * Helper: Summarize transactions
   */
  async _summarizeTransactions(transactions, userId) {
    const summary = {
      totalCount: transactions.length,
      totalSpent: 0,
      totalReceived: 0,
      byCategory: {},
      topDays: [],
      avgAmount: 0,
    };

    const daySpending = {};

    // Get user's accounts to identify outgoing vs incoming
    const userAccountIds = new Set();
    const userAccounts = await Account.find({ user: userId });
    userAccounts.forEach(acc => userAccountIds.add(acc._id.toString()));

    transactions.forEach((t) => {
      const isOutgoing = userAccountIds.has(t.fromAccount.toString());
      const amount = t.amount;

      if (isOutgoing) {
        summary.totalSpent += amount;
      } else {
        summary.totalReceived += amount;
      }

      // Category breakdown
      const cat = t.category || "uncategorized";
      if (!summary.byCategory[cat]) {
        summary.byCategory[cat] = { total: 0, count: 0 };
      }
      if (isOutgoing) {
        summary.byCategory[cat].total += amount;
        summary.byCategory[cat].count++;
      }

      // Day tracking
      const day = t.createdAt.toLocaleDateString();
      daySpending[day] = (daySpending[day] || 0) + (isOutgoing ? amount : 0);
    });

    summary.avgAmount =
      summary.totalCount > 0
        ? (summary.totalSpent + summary.totalReceived) / summary.totalCount
        : 0;

    // Top spending days
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
  _parseJSON(text) {
    try {
      // Remove markdown code blocks if present
      const cleaned = text.replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.error("JSON parse error:", e.message);
      return { error: "Failed to parse AI response" };
    }
  }
}

module.exports = new FinancialAdvisor();
