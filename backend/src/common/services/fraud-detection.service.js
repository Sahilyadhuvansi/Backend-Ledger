// ─── Commit: Database and AI Service Imports ───
// What this does: Imports the necessary data models (Transaction, Account) and the AI engine (aiService).
// Why it exists: Fraud detection needs to compare new transactions against the user's history and explain risks using AI.
// Beginner note: 'require' loads local file modules using relative paths (../../).
const Transaction = require("../../modules/transactions/transaction.model");
const Account = require("../../modules/accounts/account.model");
const aiService = require("./ai.service");

/**
 * AI Fraud Detection Service
 * Real-time fraud detection using rule-based analysis and Groq AI
 * (brain.js removed — it requires OpenGL native binaries not available on Render)
 */
class FraudDetectionService {
  // ─── Commit: Service Constructor ───
  // What this does: Initializes the internal state of the fraud engine.
  // Why it exists: To track if the system is currently "active" or "trained" (leftover from the ML version).
  constructor() {
    this.isTrained = false;
    this.lastTrainingDate = null;
  }

  /**
   * Analyze transaction for fraud risk using rule-based scoring + Groq AI
   */
  // ─── Commit: Core Fraud Analysis Workflow ───
  // What this does: Executes a multi-stage check on a transaction to determine if it should be blocked or flagged.
  // How it works: 1. Runs mathematical rules. 2. Interprets the score. 3. Asks AI to explain high-risk cases.
  // Interview insight: This is a "Heuristic-based" approach combined with "Generative AI" for explainability.
  async analyzeTransaction(transactionData, userId) {
    // Step 1: Get mathematical rule-based analysis (Heuristics)
    const ruleScore = await this._ruleBasedAnalysis(transactionData, userId);
    const finalScore = ruleScore;

    // Step 2: Categorize the score into levels (Minimal -> Critical)
    const riskLevel = this._calculateRiskLevel(finalScore);

    // Step 3: If risk is high, ask the AI to write a human-friendly "Reasoning"
    let aiExplanation = null;
    if (riskLevel === "high" || riskLevel === "critical") {
      aiExplanation = await this._getAIExplanation(transactionData, finalScore);
    }

    return {
      riskScore: finalScore,
      riskLevel,
      mlScore: finalScore,
      ruleScore,
      shouldBlock: riskLevel === "critical",
      shouldFlag: riskLevel === "high" || riskLevel === "critical",
      explanation: aiExplanation,
      timestamp: new Date(),
    };
  }

  /**
   * Rule-based fraud analysis
   */
  // ─── Commit: Heuristic Rule Implementation ───
  // What this does: Checks for common fraud signals like "Late Night Spending" or "Sudden Large Amounts".
  // Why it exists: Rules are 100% predictable and run in milliseconds, making them perfect for real-time checks.
  // Pattern used: "Weighted accumulator" (different checks add different weights to the total 0-1 score).
  async _ruleBasedAnalysis(transaction, userId) {
    let score = 0;

    // Check 1: Unusual amount (Are you spending 10x more than usual?)
    const userStats = await this._getUserStats(userId);
    if (transaction.amount > userStats.p95Amount) {
      score += 0.3;
    }

    // Check 2: Velocity check (Are you sending 10 payments in 10 minutes?)
    const recentCount = await this._getRecentTransactionCount(userId, 10);
    if (recentCount > 5) {
      score += 0.4;
    }

    // Check 3: Time-based anomaly (Who sends money at 3 AM?)
    const hour = new Date(transaction.createdAt || new Date()).getHours();
    if (hour >= 2 && hour <= 5) {
      score += 0.2;
    }

    // Check 4: Round number detection (Scammers often use round numbers like 5000, 10000)
    if (transaction.amount % 100 === 0 && transaction.amount > 500) {
      score += 0.15;
    }

    // Check 5: Empty description (Automated scripts often skip typing descriptions)
    if (!transaction.description || transaction.description.trim().length === 0) {
      score += 0.1;
    }

    // Check 6: Exact Duplicate detection within 5 minutes
    const isDuplicate = await this._checkDuplicate(transaction, userId);
    if (isDuplicate) {
      score += 0.5;
    }

    return Math.min(score, 1.0); // Ensure the score never exceeds 100% (1.0)
  }

  /**
   * Get Groq AI explanation for fraud detection
   */
  // ─── Commit: Explainable AI (XAI) Prompt ───
  // What this does: Translates raw scores into a human-readable "Why did this fail?" message.
  // Interview insight: This is vital for "Financial Transparency" (users want to know why their card was blocked).
  async _getAIExplanation(transaction, riskScore) {
    const prompt = `A transaction has been flagged as high-risk fraud. Explain why in simple terms (Indian context):

Transaction Details:
- Amount: ₹${transaction.amount}
- Time: ${new Date(transaction.createdAt || new Date()).toLocaleString()}
- Description: ${transaction.description || "None"}
- Risk Score: ${(riskScore * 100).toFixed(1)}%

Provide a brief, clear explanation (2-3 sentences) for why this transaction is suspicious.`;

    try {
      const response = await aiService.chat(
        [{ role: "user", content: prompt }],
        {
          temperature: 0.3,
          maxTokens: 200,
          systemPrompt:
            "You are a fraud detection expert. Explain fraud risks clearly and concisely for an Indian banking app. Use ₹ symbol.",
        }
      );

      return response.content.trim();
    } catch (error) {
      console.error("Failed to get AI explanation:", error.message);
      return "This transaction has been flagged due to unusual patterns.";
    }
  }

  /**
   * Calculate risk level from score
   */
  // ─── Commit: Categorization Threshold Logic ───
  // What this does: Labels a decimal number (0.65) into a word ("high").
  _calculateRiskLevel(score) {
    if (score >= 0.8) return "critical";
    if (score >= 0.6) return "high";
    if (score >= 0.4) return "medium";
    if (score >= 0.2) return "low";
    return "minimal";
  }

  /**
   * Get user transaction statistics
   */
  // ─── Commit: Statistical Baselining (P95 Calculation) ───
  // What this does: Finds your personal "Normal" by looking at your last 1000 transactions.
  // How it works: Calculates the 95th Percentile — an amount only 5% of your past transactions have exceeded.
  // Beginner note: If you always spend ₹100, then ₹1000 is "Abnormal" for you.
  async _getUserStats(userId) {
    const userAccounts = await Account.find({ user: userId });
    const accountIds = userAccounts.map((acc) => acc._id);

    const transactions = await Transaction.find({
      $or: [{ fromAccount: { $in: accountIds } }, { toAccount: { $in: accountIds } }],
    })
      .sort({ amount: 1 })
      .limit(1000);

    if (transactions.length === 0) {
      return { avgAmount: 0, p95Amount: 1000, maxAmount: 0 };
    }

    const amounts = transactions.map((t) => t.amount);
    const p95Index = Math.floor(amounts.length * 0.95);

    return {
      avgAmount: amounts.reduce((a, b) => a + b, 0) / amounts.length,
      p95Amount: amounts[p95Index] || 1000,
      maxAmount: amounts[amounts.length - 1] || 0,
    };
  }

  /**
   * Count recent transactions
   */
  async _getRecentTransactionCount(userId, minutes = 10) {
    const cutoff = new Date();
    cutoff.setMinutes(cutoff.getMinutes() - minutes);

    const userAccounts = await Account.find({ user: userId });
    const accountIds = userAccounts.map((acc) => acc._id);

    return Transaction.countDocuments({
      fromAccount: { $in: accountIds },
      createdAt: { $gte: cutoff },
    });
  }

  /**
   * Check for duplicate transactions
   */
  async _checkDuplicate(transaction, userId) {
    const cutoff = new Date();
    cutoff.setMinutes(cutoff.getMinutes() - 5);

    const userAccounts = await Account.find({ user: userId });
    const accountIds = userAccounts.map((acc) => acc._id);

    const similar = await Transaction.findOne({
      fromAccount: { $in: accountIds },
      amount: transaction.amount,
      toAccount: transaction.toAccount,
      createdAt: { $gte: cutoff },
    });

    return !!similar;
  }

  /**
   * Normalize value to 0-1 range
   */
  _normalize(value, min, max) {
    return Math.max(0, Math.min(1, (value - min) / (max - min)));
  }

  /**
   * Get fraud detection statistics
   */
  // ─── Commit: Admin Dashboard Metrics ───
  // What this does: Summarizes all "Flags" in the last 24 hours to show on the admin screen.
  // Pattern used: 'Promise.all' allows multiple database queries to run at the exact same time (Parallel).
  async getStats() {
    const last24h = new Date();
    last24h.setHours(last24h.getHours() - 24);

    const [flaggedCount, totalCount] = await Promise.all([
      Transaction.countDocuments({ isFlagged: true, createdAt: { $gte: last24h } }),
      Transaction.countDocuments({ createdAt: { $gte: last24h } }),
    ]);

    return {
      isTrained: false,
      lastTrainingDate: null,
      engine: "rule-based + Groq AI",
      last24h: {
        total: totalCount,
        flagged: flaggedCount,
        flagRate: totalCount > 0 ? (flaggedCount / totalCount) * 100 : 0,
      },
    };
  }
}

// ─── Commit: Export Singleton Instance ───
module.exports = new FraudDetectionService();
