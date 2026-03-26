// ─── Commit: Environment Configuration Loader ───
// What this does: Loads environment variables (.env) into memory.
require("dotenv").config();

/**
 * AI Services Configuration
 * Centralized configuration for all AI/ML services used in the application
 */
// ─── Commit: Centralized AI Config Object ───
// Why it exists: To avoid "Hardcoding" secrets like API keys in your logic files. 
// Interview insight: This follows the "12-Factor App" methodology for configuration management.
module.exports = {
  // ─── Commit: LLM Service Settings (Groq, OpenAI, Gemini) ───
  // What this does: Defines which AI models to use and their "strictness" (Temperature). 
  // Beginner note: '!!' is an elegant way to convert a string to a Boolean (True/False).
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

  // ─── Commit: Vector Database & Search (Pinecone) ───
  // What this does: Defines the storage for AI "Long-Term Memory".
  pinecone: {
    apiKey: process.env.PINECONE_API_KEY,
    environment: process.env.PINECONE_ENVIRONMENT || "gcp-starter",
    indexName: process.env.PINECONE_INDEX || "backend-ledger-ai",
    enabled: !!process.env.PINECONE_API_KEY,
  },

  // ─── Commit: Computer Vision (Google Vision) ───
  // What this does: Configures the "Eyes" of the system for receipt scanning.
  googleVision: {
    keyFilename: process.env.GOOGLE_CLOUD_KEY_FILE,
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
    enabled: !!process.env.GOOGLE_CLOUD_KEY_FILE,
  },

  // ─── Commit: Model Thresholds & Parameters ───
  // What this does: Fine-tunes the "Intelligence" logic for specific features.
  models: {
    // How strictly should we flag fraud? (0.75 = 75% risk required)
    fraudDetection: {
      enabled: true,
      threshold: 0.75, 
    },

    // Standard bank categories
    categorization: {
      enabled: true,
      confidence: 0.6,
      categories: [
        "groceries", "dining", "transportation", "utilities", 
        "entertainment", "healthcare", "shopping", "travel", 
        "education", "other",
      ],
    },

    // How many days of data should the AI look at to predict your future?
    prediction: {
      enabled: true,
      lookbackDays: 90,
      forecastDays: 30,
      confidence: 0.7,
    },
  },

  // ─── Commit: Application Feature Flags ───
  // What this does: Allows us to turn features ON/OFF without deleting code.
  // Interview insight: This allows for "Dark Launches" — where code is live but hidden from users.
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

  // ─── Commit: Caching Engine (Redis/In-Memory) ───
  // Why it exists: AI is slow and expensive. Caching stores the answer so we don't ask the same thing twice.
  // Beginner note: TTL means "Time To Live" in seconds. 86400 = 1 Day.
  cache: {
    ttl: {
      embeddings: 86400, 
      predictions: 3600, 
      chatHistory: 1800, 
      categoryCache: 43200, 
    },
    maxSize: {
      embeddings: 10000,
      predictions: 1000,
      chatHistory: 500,
    },
  },

  // ─── Commit: Rate Limiting & Safety ───
  // What this does: Prevents users (or bots) from spamming the AI and costing you money.
  rateLimits: {
    chatbot: {
      windowMs: 60000, // 1 minute
      max: 20, // max 20 questions per minute
    },
    imageAnalysis: {
      windowMs: 60000,
      max: 10,
    },
  },

  // ─── Commit: Economic Safety (Budgeting) ───
  // Why it exists: To stop the server if your total AI bills get too high.
  costLimits: {
    dailyBudget: parseFloat(process.env.AI_DAILY_BUDGET) || 10.0, 
    warningThreshold: 0.8, 
    alertEmail: process.env.ALERT_EMAIL,
  },

  // ─── Commit: Monitoring & Observability ───
  logging: {
    level: process.env.AI_LOG_LEVEL || "info",
    trackMetrics: true,
    trackCosts: true,
    trackLatency: true,
  },
};
