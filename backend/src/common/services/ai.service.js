const OpenAI = require("openai");
const Groq = require("groq-sdk");
const aiConfig = require("../config/ai.config");

/**
 * AI Service Manager
 * Handles all LLM interactions with fallback support
 */
class AIService {
  constructor() {
    // Initialize Groq (Primary)
    if (aiConfig.groq.enabled) {
      this.groq = new Groq({
        apiKey: aiConfig.groq.apiKey,
      });
    }

    // Initialize OpenAI (Kept for Embeddings)
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
  async chat(messages, options = {}) {
    const {
      temperature = 0.7,
      maxTokens = 4096,
      preferredModel = "groq",
      systemPrompt = null,
    } = options;

    try {
      // Use Groq for everything
      if (this.groq) {
        return await this._groqChat(messages, systemPrompt, temperature, maxTokens);
      }

      // Silent fallback to OpenAI if Groq key is missing but OpenAI is available
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
   * Batch embedding generation
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
  _trackUsage(provider, usage) {
    this.requestCount++;

    // Estimate costs (approximate pricing)
    const costs = {
      groq: {
        input: 0, 
        output: 0,
      },
      openai: {
        input: 0.01 / 1000,
        output: 0.03 / 1000,
      },
    };

    if (provider === "groq") {
      // Groq tracking
      this.totalCost += 0; // Adjust if using paid tier
    } else if (provider === "openai") {
      const cost =
        usage.prompt_tokens * costs.openai.input +
        usage.completion_tokens * costs.openai.output;
      this.totalCost += cost;
    }

    // Check budget limits
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

// Singleton instance
const aiService = new AIService();

module.exports = aiService;
