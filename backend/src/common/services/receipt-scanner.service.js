// ─── Commit: OCR & Computer Vision Imports ───
// What this does: Loads Google Vision (Cloud-based OCR) and Tesseract.js (Local-based OCR).
// Why it exists: To transform a photo of a receipt into actual text that a computer can read.
// Beginner note: OCR stands for "Optical Character Recognition".
const vision = require("@google-cloud/vision");
const Tesseract = require("tesseract.js");
const aiService = require("./ai.service");
const aiConfig = require("../config/ai.config");

/**
 * Receipt Scanning & OCR Service
 * Extract transaction data from receipt images
 */
class ReceiptScannerService {
  // ─── Commit: OCR Engine Initialization ───
  // What this does: Sets up the connection to Google Vision and prepares a local Tesseract worker.
  // Interview insight: Why have both? To provide a "Fallback" mechanism. If Google Vision is too expensive or unavailable, Tesseract runs locally on your server.
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
  // ─── Commit: Lazy Loading Pattern ───
  // What this does: Only starts the Tesseract engine when someone actually uploads an image.
  // Why it exists: Tesseract uses a lot of memory. We don't want to waste resources if nobody is scanning receipts.
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
  // ─── Commit: Multi-Stage Workflow (Scan -> Extract -> Parse) ───
  // How it works: 1. Get raw text from pixels. 2. Send text to the LLM (AI). 3. Return clean JSON.
  // Pattern used: "Pipeline pattern".
  async scanReceipt(imageBuffer, options = {}) {
    const { useGoogleVision = true } = options;

    try {
      // Step 1: Extract text from image (Turning pixels into words)
      let extractedText;
      if (useGoogleVision && this.visionClient) {
        extractedText = await this._extractTextGoogleVision(imageBuffer);
      } else {
        extractedText = await this._extractTextTesseract(imageBuffer);
      }

      // Step 2: Parse receipt data using AI (Turning words into Business Logic)
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
  // ─── Commit: AI Receipt Intel Extraction (Prompt Engineering) ───
  // What this does: Asks the AI to find specific fields (Total, Tax, Merchant) in a messy pile of raw text.
  // Interview insight: We use Indian context (₹ INR) to ensure the AI understands tax formats like GST.
  async _parseReceiptWithAI(text) {
    const prompt = `Extract transaction information from this receipt (Indian context):

${text}

Extract and return as valid JSON (use ₹ for currency mentions if needed, but amounts as numbers):
{
  "merchantName": "Store Name",
  "totalAmount": 123.45,
  "currency": "INR",
  "date": "2026-03-25",
  "items": [
    {"name": "item", "price": 10.00, "quantity": 2}
  ],
  "category": "groceries/dining/shopping/etc",
  "paymentMethod": "cash/card/upi/unknown",
  "taxAmount": 5.00,
  "confidence": "high/medium/low"
}

If any field is unclear or missing, use null. Be extremely accurate with amounts.`;

    const response = await aiService.chat(
      [{ role: "user", content: prompt }],
      {
        temperature: 0.1, // High accuracy, no creative guessing
        maxTokens: 1500,
        systemPrompt:
          "You are a professional receipt parsing AI specializing in Indian retail. Extract data accurately. Always return valid JSON.",
      }
    );

    // ─── Commit: Robust JSON Processing ───
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
  // ─── Commit: Batch Processing (Iteration) ───
  // Beginner note: We loop through each buffer and scan them one-by-one to avoid overloading the AI.
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
  // ─── Commit: Image Quality Pre-check (Validation) ───
  // What this does: Checks if the photo is too dark or too bright BEFORE trying to read it.
  // Why it exists: To provide immediate feedback to the user ("Try turning on your flash").
  async validateImage(imageBuffer) {
    if (!this.visionClient) {
      return { valid: true, warnings: ["Google Vision not configured"] };
    }

    try {
      const [result] = await this.visionClient.imageProperties(imageBuffer);
      const properties = result.imagePropertiesAnnotation;

      const warnings = [];

      // Check image quality indicators (Brightness analysis)
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
  // ─── Commit: Memory Management ───
  // What this does: Shuts down the Tesseract worker when finished.
  // Why it exists: To prevent "Memory Leaks" on your server.
  async cleanup() {
    if (this.tesseractWorker) {
      await this.tesseractWorker.terminate();
      this.tesseractWorker = null;
    }
  }
}

// ─── Commit: Singleton Export ───
module.exports = new ReceiptScannerService();
