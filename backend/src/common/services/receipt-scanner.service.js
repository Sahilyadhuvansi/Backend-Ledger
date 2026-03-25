const vision = require("@google-cloud/vision");
const Tesseract = require("tesseract.js");
const aiService = require("./ai.service");
const aiConfig = require("../config/ai.config");

/**
 * Receipt Scanning & OCR Service
 * Extract transaction data from receipt images
 */
class ReceiptScannerService {
  constructor() {
    // Initialize Google Cloud Vision if available
    if (aiConfig.googleVision.enabled) {
      this.visionClient = new vision.ImageAnnotatorClient({
        keyFilename: aiConfig.googleVision.keyFilename,
      });
    }

    this.tesseractWorker = null;
  }

  /**
   * Initialize Tesseract worker
   */
  async _initTesseract() {
    if (!this.tesseractWorker) {
      this.tesseractWorker = await Tesseract.createWorker();
      await this.tesseractWorker.loadLanguage("eng");
      await this.tesseractWorker.initialize("eng");
    }
  }

  /**
   * Scan receipt and extract transaction data
   */
  async scanReceipt(imageBuffer, options = {}) {
    const { useGoogleVision = true } = options;

    try {
      // Extract text from image
      let extractedText;
      if (useGoogleVision && this.visionClient) {
        extractedText = await this._extractTextGoogleVision(imageBuffer);
      } else {
        extractedText = await this._extractTextTesseract(imageBuffer);
      }

      // Parse receipt data using AI
      const receiptData = await this._parseReceiptWithAI(extractedText);

      return {
        success: true,
        rawText: extractedText,
        parsed: receiptData,
        confidence: receiptData.confidence || "medium",
        method: useGoogleVision && this.visionClient ? "google-vision" : "tesseract",
      };
    } catch (error) {
      console.error("Receipt scanning error:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Extract text using Google Cloud Vision
   */
  async _extractTextGoogleVision(imageBuffer) {
    const [result] = await this.visionClient.textDetection(imageBuffer);
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      throw new Error("No text detected in image");
    }

    // First annotation contains full text
    return detections[0].description;
  }

  /**
   * Extract text using Tesseract.js (fallback)
   */
  async _extractTextTesseract(imageBuffer) {
    await this._initTesseract();

    const {
      data: { text },
    } = await this.tesseractWorker.recognize(imageBuffer);

    if (!text || text.trim().length === 0) {
      throw new Error("No text detected in image");
    }

    return text;
  }

  /**
   * Parse receipt data using AI
   */
  async _parseReceiptWithAI(text) {
    const prompt = `Extract transaction information from this receipt:

${text}

Extract and return as JSON:
{
  "merchantName": "Store Name",
  "totalAmount": 123.45,
  "date": "2026-03-25",
  "items": [
    {"name": "item", "price": 10.00, "quantity": 2}
  ],
  "category": "groceries/dining/shopping/etc",
  "paymentMethod": "cash/card/unknown",
  "taxAmount": 5.00,
  "confidence": "high/medium/low"
}

If any field is unclear or missing, use null. Be accurate with amounts.`;

    const response = await aiService.chat(
      [{ role: "user", content: prompt }],
      {
        temperature: 0.1,
        maxTokens: 1500,
        systemPrompt:
          "You are a receipt parsing AI. Extract transaction data accurately. Always return valid JSON.",
      }
    );

    // Parse AI response
    try {
      const cleaned = response.content.replace(/```json\n?|\n?```/g, "").trim();
      return JSON.parse(cleaned);
    } catch (e) {
      console.error("Failed to parse AI receipt response:", e.message);
      return {
        merchantName: null,
        totalAmount: null,
        date: null,
        items: [],
        category: "other",
        confidence: "low",
      };
    }
  }

  /**
   * Batch process multiple receipts
   */
  async batchScan(imageBuffers) {
    const results = [];

    for (const buffer of imageBuffers) {
      const result = await this.scanReceipt(buffer);
      results.push(result);
    }

    return {
      total: results.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }

  /**
   * Validate receipt image quality
   */
  async validateImage(imageBuffer) {
    if (!this.visionClient) {
      return { valid: true, warnings: ["Google Vision not configured"] };
    }

    try {
      const [result] = await this.visionClient.imageProperties(imageBuffer);
      const properties = result.imagePropertiesAnnotation;

      const warnings = [];

      // Check image quality indicators
      if (properties.dominantColors) {
        const avgBrightness = this._calculateAverageBrightness(
          properties.dominantColors.colors
        );
        if (avgBrightness < 50) {
          warnings.push("Image appears too dark");
        }
        if (avgBrightness > 250) {
          warnings.push("Image appears overexposed");
        }
      }

      return {
        valid: warnings.length === 0,
        warnings,
        properties,
      };
    } catch (error) {
      return {
        valid: true,
        warnings: ["Could not validate image quality"],
      };
    }
  }

  /**
   * Helper: Calculate average brightness
   */
  _calculateAverageBrightness(colors) {
    if (!colors || colors.length === 0) return 128;

    const total = colors.reduce((sum, color) => {
      const rgb = color.color;
      return sum + (rgb.red + rgb.green + rgb.blue) / 3;
    }, 0);

    return total / colors.length;
  }

  /**
   * Cleanup resources
   */
  async cleanup() {
    if (this.tesseractWorker) {
      await this.tesseractWorker.terminate();
      this.tesseractWorker = null;
    }
  }
}

module.exports = new ReceiptScannerService();
