const Anthropic = require("@anthropic-ai/sdk");
const OpenAI = require("openai");
const aiConfig = require("../config/ai.config");

/**
 * AI Service Manager
 * Handles all LLM interactions with fallback support
 */
class AIService {
  constructor() {
    // Initialize Claude
    if (aiConfig.claude.enabled) {
      this.claude = new Anthropic({
        apiKey: aiConfig.claude.apiKey,
      });
    }

    // Initialize OpenAI
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
      preferredModel = "claude",
      systemPrompt = null,
    } = options;

    try {
      // Try Claude first (preferred for most tasks)
      if (preferredModel === "claude" && this.claude) {
        return await this._claudeChat(messages, systemPrompt, temperature, maxTokens);
      }

      // Fallback to OpenAI
      if (this.openai) {
        return await this._openaiChat(messages, systemPrompt, temperature, maxTokens);
      }

      throw new Error("No AI service available");
    } catch (error) {
      console.error("AI Service Error:", error.message);
      
      // Try fallback if primary failed
      if (preferredModel === "claude" && this.openai) {
        console.log("Falling back to OpenAI...");
        return await this._openaiChat(messages, systemPrompt, temperature, maxTokens);
      }
      
      throw error;
    }
  }

  /**
   * Claude API chat implementation
   */
  async _claudeChat(messages, systemPrompt, temperature, maxTokens) {
    const formattedMessages = messages.map((msg) => ({
      role: msg.role === "system" ? "user" : msg.role,
      content: msg.content,
    }));

    const response = await this.claude.messages.create({
      model: aiConfig.claude.model,
      max_tokens: maxTokens,
      temperature,
      system: systemPrompt || undefined,
      messages: formattedMessages,
    });

    this._trackUsage("claude", response.usage);

    return {
      content: response.content[0].text,
      model: "claude",
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
      claude: {
        input: 0.003 / 1000, // $3 per million input tokens
        output: 0.015 / 1000, // $15 per million output tokens
      },
      openai: {
        input: 0.01 / 1000, // $10 per million tokens
        output: 0.03 / 1000, // $30 per million tokens
      },
    };

    if (provider === "claude") {
      const cost =
        usage.input_tokens * costs.claude.input +
        usage.output_tokens * costs.claude.output;
      this.totalCost += cost;
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
