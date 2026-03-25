require("dotenv").config();

/**
 * AI Services Configuration
 * Centralized configuration for all AI/ML services used in the application
 */

module.exports = {
  // ═══════════════════════════════════════════════════════════════
  // LLM Services
  // ═══════════════════════════════════════════════════════════════
  groq: {
    apiKey: process.env.GROQ_API_KEY,
    model: "llama-3.3-70b-versatile",
    maxTokens: 4096,
    temperature: 0.7,
    enabled: !!process.env.GROQ_API_KEY,
  },

  openai: {
    apiKey: process.env.OPENAI_API_KEY,
    model: "gpt-4o",
    maxTokens: 4096,
    temperature: 0.7,
    enabled: !!process.env.OPENAI_API_KEY,
  },

  gemini: {
    apiKey: process.env.GOOGLE_AI_API_KEY,
    model: "gemini-pro",
    enabled: !!process.env.GOOGLE_AI_API_KEY,
  },

  // ═══════════════════════════════════════════════════════════════
  // Vector Database
  // ═══════════════════════════════════════════════════════════════
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT || "gcp-starter",
    indexName: process.env.PINECONE_INDEX || "backend-ledger-ai",
    enabled: !!process.env.PINECONE_API_KEY,
  },

  // ═══════════════════════════════════════════════════════════════
  // Computer Vision
  // ═══════════════════════════════════════════════════════════════
  googleVision: {
    keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    enabled: !!process.env.GOOGLE_CLOUD_KEY_FILE,
  },

  // ═══════════════════════════════════════════════════════════════
  // ML Models Configuration
  // ═══════════════════════════════════════════════════════════════
  models: {
    // Fraud Detection Model
    fraudDetection: {
      enabled: true,
      threshold: 0.75, // Risk score threshold
      features: [
        "amount",
        "timeOfDay",
        "dayOfWeek",
        "merchantCategory",
        "location",
        "velocity",
        "averageAmount",
      ],
    },

    // Transaction Categorization
    categorization: {
      enabled: true,
      confidence: 0.6,
      categories: [
        "groceries",
        "dining",
        "transportation",
        "utilities",
        "entertainment",
        "healthcare",
        "shopping",
        "travel",
        "education",
        "other",
      ],
    },

    // Spending Prediction
    prediction: {
      enabled: true,
      lookbackDays: 90,
      forecastDays: 30,
      confidence: 0.7,
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // Feature Flags
  // ═══════════════════════════════════════════════════════════════
  features: {
    chatbot: true,
    fraudDetection: true,
    smartCategorization: true,
    receiptScanning: true,
    spendingPrediction: true,
    naturalLanguageQuery: true,
    emailIntelligence: true,
    budgetRecommendations: true,
  },

  // ═══════════════════════════════════════════════════════════════
  // Performance & Caching
  // ═══════════════════════════════════════════════════════════════
  cache: {
    ttl: {
      embeddings: 86400, // 24 hours
      predictions: 3600, // 1 hour
      chatHistory: 1800, // 30 minutes
      categoryCache: 43200, // 12 hours
    },
    maxSize: {
      embeddings: 10000,
      predictions: 1000,
      chatHistory: 500,
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // Rate Limiting
  // ═══════════════════════════════════════════════════════════════
  rateLimits: {
    chatbot: {
      windowMs: 60000, // 1 minute
      max: 20, // 20 requests per minute
    },
    imageAnalysis: {
      windowMs: 60000,
      max: 10,
    },
    predictions: {
      windowMs: 60000,
      max: 30,
    },
  },

  // ═══════════════════════════════════════════════════════════════
  // Cost Controls
  // ═══════════════════════════════════════════════════════════════
  costLimits: {
    dailyBudget: parseFloat(process.env.AI_DAILY_BUDGET) || 10.0, // USD
    warningThreshold: 0.8, // 80% of budget
    alertEmail: process.env.ALERT_EMAIL,
  },

  // ═══════════════════════════════════════════════════════════════
  // Logging & Monitoring
  // ═══════════════════════════════════════════════════════════════
  logging: {
    level: process.env.AI_LOG_LEVEL || "info",
    trackMetrics: true,
    trackCosts: true,
    trackLatency: true,
  },
};
