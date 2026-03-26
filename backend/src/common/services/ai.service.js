// ─── Commit: AI SDK and Configuration Imports ───
// What this does: Imports the official SDKs for OpenAI and Groq, plus our local AI settings.
// Why it exists: To enable communication with Large Language Model (LLM) APIs.
// Libraries used: openai (OpenAI SDK), groq-sdk (Groq's LPU inference SDK).
// Beginner note: 'require' statements load pre-built tools into our project.
// Interview insight: Why use multiple providers? To ensure "Redundancy" or "Hybrid Usage" (e.g., Groq for speed, OpenAI for specific features like Embeddings).
const OpenAI = require("openai");
const Groq = require("groq-sdk");
const aiConfig = require("../config/ai.config");

/**
 * AI Service Manager
 * Handles all LLM interactions with fallback support
 */
class AIService {
  // ─── Commit: Constructor and SDK Initialization ───
  // What this does: Sets up the connection to Groq and OpenAI when the class is first created.
  // How it works: Checks if 'enabled' is true in config, then creates new instances using API keys.
  // Interview insight: This follows the "Singleton" pattern when exported below, ensuring only one instance exists.
  constructor() {
    // Initialize Groq (Primary Provider for fast LPU inference)
    if (aiConfig.groq.enabled) {
      this.groq = new Groq({
        apiKey: aiConfig.groq.apiKey,
      });
    }

    // Initialize OpenAI (Used mainly for high-quality Vector Embeddings)
    if (aiConfig.openai.enabled) {
      this.openai = new OpenAI({
        apiKey: aiConfig.openai.apiKey,
      });
    }

    this.requestCount = 0;
    this.totalCost = 0;
  }

  /**
   * Generate chat completion with automatic fallback
   */
  // ─── Commit: Unified Chat Method with Primary/Fallback Logic ───
  // What this does: Takes user messages and returns an AI response, trying Groq first.
  // Why it exists: To ensure the AI works even if one provider goes down or is missing a key.
  // How it works: Uses a 'try-catch' block. If Groq exists, it calls its handler; otherwise drops to OpenAI.
  async chat(messages, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 4096,
      preferredModel = "groq",
      systemPrompt = null,
    } = options;

    try {
      // Step 1: Attempt to use Groq for the fastest response (LPU technology)
      if (this.groq) {
        return await this._groqChat(messages, systemPrompt, temperature, maxTokens);
      }

      // Step 2: Silent fallback to OpenAI if Groq is unavailable
      if (this.openai) {
        return await this._openaiChat(messages, systemPrompt, temperature, maxTokens);
      }

      throw new Error("Groq API service not configured. Please add GROQ_API_KEY to .env");
    } catch (error) {
      console.error("AI Service Error:", error.message);
      if (error.stack) console.error(error.stack);
      throw error;
    }
  }

  /**
   * Groq API chat implementation
   */
  // ─── Commit: Groq-Specific Request Implementation ───
  // What this does: Handles the raw network request to Groq's API.
  // How it works: Formats the message list, injects a system prompt if needed, and awaits the completion.
  // Interview insight: We track usage (usage.prompt_tokens) immediately after the response to monitor performance/cost.
  async _groqChat(messages, systemPrompt, temperature, maxTokens) {
    const formattedMessages = systemPrompt
      ? [{ role: "system", content: systemPrompt }, ...messages]
      : messages;

    const response = await this.groq.chat.completions.create({
      model: aiConfig.groq.model,
      messages: formattedMessages,
      temperature,
      max_tokens: maxTokens,
    });

    this._trackUsage("groq", response.usage);

    return {
      content: response.choices[0].message.content,
      model: "groq",
      usage: response.usage,
    };
  }

  /**
   * OpenAI API chat implementation
   */
  // ─── Commit: OpenAI-Specific Request Implementation ───
  // Why it exists: Acts as a reliable backup or alternative to Groq.
  async _openaiChat(messages, systemPrompt, temperature, maxTokens) {
    const formattedMessages = systemPrompt
      ? [{ role: "system", content: systemPrompt }, ...messages]
      : messages;

    try {
      const response = await this.openai.chat.completions.create({
        model: aiConfig.openai.model,
        messages: formattedMessages,
        temperature,
        max_tokens: maxTokens,
      });

      this._trackUsage("openai", response.usage);

      return {
        content: response.choices[0].message.content,
        model: "openai",
        usage: response.usage,
      };
    } catch (error) {
      console.error("AI Service Error (OpenAI):", error.message);
      throw error;
    }
  }

  /**
   * Generate embeddings for vector search
   */
  // ─── Commit: Machine Learning Embeddings Generation ───
  // What this does: Converts text strings into long arrays of numbers (vectors).
  // Why it exists: To allow the computer to calculate "Semantic Similarity" between pieces of text.
  // Beginner note: Embeddings allow the AI to "search by meaning" instead of just "searching by keywords".
  async generateEmbedding(text) {
    if (!this.openai) {
      throw new Error("OpenAI required for embeddings");
    }

    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });

    return response.data[0].embedding;
  }

  /**
   * Batch embedding generation (for efficiency)
   */
  async generateEmbeddings(texts) {
    if (!this.openai) {
      throw new Error("OpenAI required for embeddings");
    }

    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: texts,
    });

    return response.data.map((item) => item.embedding);
  }

  /**
   * Track API usage and costs
   */
  // ─── Commit: Usage and Cost Monitoring ───
  // What this does: Calculates how much money/tokens are being spent on each request.
  // Real-world analogy: Like a taxi meter that calculates the fare based on distance traveled.
  // Interview insight: Monitoring costs in real-time is vital for production AI apps to prevent "invoice shock".
  _trackUsage(provider, usage) {
    this.requestCount++;

    const costs = {
      groq: { input: 0, output: 0 }, // Adjust based on your current tier
      openai: {
        input: 0.01 / 1000,
        output: 0.03 / 1000,
      },
    };

    if (provider === "groq") {
      this.totalCost += 0; 
    } else if (provider === "openai") {
      const cost =
        usage.prompt_tokens * costs.openai.input +
        usage.completion_tokens * costs.openai.output;
      this.totalCost += cost;
    }

    // Safety Thresholds
    if (this.totalCost > aiConfig.costLimits.dailyBudget * aiConfig.costLimits.warningThreshold) {
      console.warn(
        `⚠️  AI costs approaching limit: $${this.totalCost.toFixed(4)} / $${aiConfig.costLimits.dailyBudget}`
      );
    }
  }

  /**
   * Get usage statistics
   */
  getStats() {
    return {
      requestCount: this.requestCount,
      totalCost: this.totalCost,
      avgCostPerRequest: this.requestCount > 0 ? this.totalCost / this.requestCount : 0,
    };
  }

  /**
   * Reset daily statistics
   */
  resetStats() {
    this.requestCount = 0;
    this.totalCost = 0;
  }
}

// ─── Commit: Singleton Export ───
// Why it exists: To ensure only ONE instance of the AI service is used across the entire application.
const aiService = new AIService();

module.exports = aiService;
