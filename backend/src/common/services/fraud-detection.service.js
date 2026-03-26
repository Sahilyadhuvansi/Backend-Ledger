const Transaction = require("../../modules/transactions/transaction.model");
const Account = require("../../modules/accounts/account.model");
const aiService = require("./ai.service");

/**
 * AI Fraud Detection Service
 * Real-time fraud detection using rule-based analysis and Groq AI
 * (brain.js removed — it requires OpenGL native binaries not available on Render)
 */
class FraudDetectionService {
  constructor() {
    this.isTrained = false;
    this.lastTrainingDate = null;
  }

  /**
   * Analyze transaction for fraud risk using rule-based scoring + Groq AI
   */
  async analyzeTransaction(transactionData, userId) {
    // Get rule-based analysis
    const ruleScore = await this._ruleBasedAnalysis(transactionData, userId);
    const finalScore = ruleScore;

    // Determine risk level
    const riskLevel = this._calculateRiskLevel(finalScore);

    // Get AI explanation if high risk
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
  async _ruleBasedAnalysis(transaction, userId) {
    let score = 0;

    // Check 1: Unusual amount (95th percentile)
    const userStats = await this._getUserStats(userId);
    if (transaction.amount > userStats.p95Amount) {
      score += 0.3;
    }

    // Check 2: Velocity check (multiple transactions in short time)
    const recentCount = await this._getRecentTransactionCount(userId, 10);
    if (recentCount > 5) {
      score += 0.4;
    }

    // Check 3: Time-based anomaly (3am transaction)
    const hour = new Date(transaction.createdAt || new Date()).getHours();
    if (hour >= 2 && hour <= 5) {
      score += 0.2;
    }

    // Check 4: Round number (common in fraud)
    if (transaction.amount % 100 === 0 && transaction.amount > 500) {
      score += 0.15;
    }

    // Check 5: No description (automated/scripted)
    if (!transaction.description || transaction.description.trim().length === 0) {
      score += 0.1;
    }

    // Check 6: Duplicate detection
    const isDuplicate = await this._checkDuplicate(transaction, userId);
    if (isDuplicate) {
      score += 0.5;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Get Groq AI explanation for fraud detection
   */
  async _getAIExplanation(transaction, riskScore) {
    const prompt = `A transaction has been flagged as high-risk fraud. Explain why in simple terms:

Transaction Details:
- Amount: $${transaction.amount}
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
            "You are a fraud detection expert. Explain fraud risks clearly and concisely.",
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

module.exports = new FraudDetectionService();
