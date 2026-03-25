const brain = require("brain.js");
const Transaction = require("../../modules/transactions/transaction.model");
const aiService = require("./ai.service");

/**
 * AI Fraud Detection Service
 * Real-time fraud detection using neural networks and pattern analysis
 */
class FraudDetectionService {
  constructor() {
    // Initialize neural network for fraud detection
    this.network = new brain.NeuralNetwork({
      hiddenLayers: [10, 5],
      activation: "sigmoid",
    });

    this.isTrained = false;
    this.lastTrainingDate = null;
  }

  /**
   * Train the fraud detection model
   */
  async trainModel() {
    console.log("🧠 Training fraud detection model...");

    // Fetch historical transactions
    const transactions = await Transaction.find()
      .sort({ createdAt: -1 })
      .limit(10000);

    if (transactions.length < 100) {
      console.warn("⚠️  Not enough data to train fraud detection model");
      return false;
    }

    // Prepare training data
    const trainingData = transactions.map((t) => {
      const features = this._extractFeatures(t);
      return {
        input: features,
        output: { fraud: t.isFraud ? 1 : 0 }, // Assuming we have flagged fraudulent transactions
      };
    });

    // Train the network
    const stats = this.network.train(trainingData, {
      iterations: 2000,
      errorThresh: 0.005,
      log: true,
      logPeriod: 100,
    });

    this.isTrained = true;
    this.lastTrainingDate = new Date();

    console.log("✅ Fraud detection model trained:", stats);
    return true;
  }

  /**
   * Analyze transaction for fraud risk
   */
  async analyzeTransaction(transactionData, userId) {
    // Extract features
    const features = this._extractFeatures(transactionData);

    // Get neural network prediction (0-1 score)
    let mlScore = 0.5;
    if (this.isTrained) {
      const output = this.network.run(features);
      mlScore = output.fraud;
    }

    // Get rule-based analysis
    const ruleScore = await this._ruleBasedAnalysis(transactionData, userId);

    // Combine scores (60% ML, 40% rules)
    const finalScore = mlScore * 0.6 + ruleScore * 0.4;

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
      mlScore,
      ruleScore,
      shouldBlock: riskLevel === "critical",
      shouldFlag: riskLevel === "high" || riskLevel === "critical",
      explanation: aiExplanation,
      timestamp: new Date(),
    };
  }

  /**
   * Extract features from transaction
   */
  _extractFeatures(transaction) {
    const now = new Date();
    const txDate = transaction.createdAt || now;

    return {
      // Amount features
      amount: this._normalize(transaction.amount, 0, 10000),
      amountLog: Math.log10(transaction.amount + 1) / 4, // Log scale, normalized

      // Time features
      hourOfDay: txDate.getHours() / 24,
      dayOfWeek: txDate.getDay() / 7,
      isWeekend: txDate.getDay() === 0 || txDate.getDay() === 6 ? 1 : 0,
      isNightTime: txDate.getHours() < 6 || txDate.getHours() > 22 ? 1 : 0,

      // Pattern features
      isRoundAmount: transaction.amount % 100 === 0 ? 1 : 0,
      hasDescription: transaction.description ? 1 : 0,
    };
  }

  /**
   * Rule-based fraud analysis
   */
  async _ruleBasedAnalysis(transaction, userId) {
    let score = 0;
    const checks = [];

    // Check 1: Unusual amount (95th percentile)
    const userStats = await this._getUserStats(userId);
    if (transaction.amount > userStats.p95Amount) {
      score += 0.3;
      checks.push("Unusually large amount");
    }

    // Check 2: Velocity check (multiple transactions in short time)
    const recentCount = await this._getRecentTransactionCount(userId, 10); // Last 10 minutes
    if (recentCount > 5) {
      score += 0.4;
      checks.push("High transaction velocity");
    }

    // Check 3: Time-based anomaly (3am transaction)
    const hour = new Date(transaction.createdAt || new Date()).getHours();
    if (hour >= 2 && hour <= 5) {
      score += 0.2;
      checks.push("Unusual time of day");
    }

    // Check 4: Round number (common in fraud)
    if (transaction.amount % 100 === 0 && transaction.amount > 500) {
      score += 0.15;
      checks.push("Suspiciously round amount");
    }

    // Check 5: No description (automated/scripted)
    if (!transaction.description || transaction.description.trim().length === 0) {
      score += 0.1;
      checks.push("Missing transaction description");
    }

    // Check 6: Duplicate detection
    const isDuplicate = await this._checkDuplicate(transaction, userId);
    if (isDuplicate) {
      score += 0.5;
      checks.push("Potential duplicate transaction");
    }

    return Math.min(score, 1.0); // Cap at 1.0
  }

  /**
   * Get AI explanation for fraud detection
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
    const transactions = await Transaction.find({
      $or: [{ senderId: userId }, { receiverId: userId }],
    })
      .sort({ amount: 1 })
      .limit(1000);

    if (transactions.length === 0) {
      return {
        avgAmount: 0,
        p95Amount: 1000,
        maxAmount: 0,
      };
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

    const count = await Transaction.countDocuments({
      senderId: userId,
      createdAt: { $gte: cutoff },
    });

    return count;
  }

  /**
   * Check for duplicate transactions
   */
  async _checkDuplicate(transaction, userId) {
    // Look for similar transaction in last 5 minutes
    const cutoff = new Date();
    cutoff.setMinutes(cutoff.getMinutes() - 5);

    const similar = await Transaction.findOne({
      senderId: userId,
      amount: transaction.amount,
      receiverId: transaction.receiverId,
      createdAt: { $gte: cutoff },
    });

    return !!similar;
  }

  /**
   * Helper: Normalize value to 0-1 range
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

    const flaggedCount = await Transaction.countDocuments({
      isFlagged: true,
      createdAt: { $gte: last24h },
    });

    const totalCount = await Transaction.countDocuments({
      createdAt: { $gte: last24h },
    });

    return {
      isTrained: this.isTrained,
      lastTrainingDate: this.lastTrainingDate,
      last24h: {
        total: totalCount,
        flagged: flaggedCount,
        flagRate: totalCount > 0 ? (flaggedCount / totalCount) * 100 : 0,
      },
    };
  }
}

module.exports = new FraudDetectionService();
