const vision = require("@google-cloud/vision");
const Tesseract = require("tesseract.js");
const aiService = require("./ai.service");
const aiConfig = require("../config/ai.config");

/**
 * Receipt & Document Processing Service
 * OCR and intelligent document parsing for financial documents
 */
class DocumentProcessingService {
  constructor() {
    // Initialize Google Vision if configured
    if (aiConfig.googleVision.enabled) {
      this.visionClient = new vision.ImageAnnotatorClient({
        keyFilename: aiConfig.googleVision.keyFilename,
      });
    }
  }

  /**
   * Process receipt image and extract transaction data
   */
  async processReceipt(imageBuffer, options = {}) {
    const { userId, useGoogleVision = true } = options;

    try {
      // Step 1: Extract text using OCR
      let extractedText;
      if (useGoogleVision && this.visionClient) {
        extractedText = await this._googleVisionOCR(imageBuffer);
      } else {
        extractedText = await this._tesseractOCR(imageBuffer);
      }

      // Step 2: Parse receipt using AI
      const parsedData = await this._parseReceiptWithAI(extractedText);

      // Step 3: Categorize transaction
      const category = await this._categorizeReceipt(
        parsedData.merchantName,
        parsedData.items
      );

      return {
        success: true,
        data: {
          ...parsedData,
          category,
          rawText: extractedText,
          processedAt: new Date(),
          userId,
        },
      };
    } catch (error) {
      console.error("Receipt processing error:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Process bank statement PDF
   */
  async processBankStatement(pdfBuffer) {
    // This would integrate with pdf-parse
    // For now, returning structure
    return {
      transactions: [],
      accountSummary: {
        openingBalance: 0,
        closingBalance: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
      },
      statementPeriod: {
        start: new Date(),
        end: new Date(),
      },
    };
  }

  /**
   * Process invoice and extract payment details
   */
  async processInvoice(imageOrPdfBuffer, format = "image") {
    try {
      // Extract text
      let text;
      if (format === "image") {
        text = await this._tesseractOCR(imageOrPdfBuffer);
      } else {
        // PDF processing would go here
        text = "";
      }

      // Parse with AI
      const prompt = `Extract invoice details from this text:

${text}

Return a JSON object with:
{
  "invoiceNumber": "string",
  "date": "YYYY-MM-DD",
  "dueDate": "YYYY-MM-DD",
  "vendor": "string",
  "totalAmount": number,
  "currency": "USD",
  "items": [
    {
      "description": "string",
      "quantity": number,
      "unitPrice": number,
      "total": number
    }
  ],
  "taxAmount": number,
  "subtotal": number
}

If any field is not found, use null.`;

      const response = await aiService.chat(
        [{ role: "user", content: prompt }],
        {
          temperature: 0.1,
          maxTokens: 2000,
          systemPrompt:
            "You are an invoice processing AI. Extract structured data accurately. Always return valid JSON.",
        }
      );

      const invoiceData = JSON.parse(
        response.content.replace(/```json\n?|\n?```/g, "")
      );

      return {
        success: true,
        data: invoiceData,
      };
    } catch (error) {
      console.error("Invoice processing error:", error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Google Cloud Vision OCR
   */
  async _googleVisionOCR(imageBuffer) {
    const [result] = await this.visionClient.textDetection(imageBuffer);
    const detections = result.textAnnotations;

    if (!detections || detections.length === 0) {
      throw new Error("No text detected in image");
    }

    return detections[0].description;
  }

  /**
   * Tesseract.js OCR (fallback)
   */
  async _tesseractOCR(imageBuffer) {
    const result = await Tesseract.recognize(imageBuffer, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`OCR Progress: ${(m.progress * 100).toFixed(0)}%`);
        }
      },
    });

    return result.data.text;
  }

  /**
   * Parse receipt text using AI
   */
  async _parseReceiptWithAI(text) {
    const prompt = `Parse this receipt text and extract structured data:

${text}

Extract and return ONLY a valid JSON object with this exact structure:
{
  "merchantName": "string",
  "date": "YYYY-MM-DD or null",
  "time": "HH:MM or null",
  "totalAmount": number,
  "taxAmount": number or null,
  "currency": "USD",
  "items": [
    {
      "name": "string",
      "quantity": number,
      "price": number
    }
  ],
  "paymentMethod": "cash/card/other or null"
}

If any field cannot be determined, use null. Ensure totalAmount is accurate.`;

    const response = await aiService.chat(
      [{ role: "user", content: prompt }],
      {
        temperature: 0.1,
        maxTokens: 2000,
        systemPrompt:
          "You are a receipt parsing AI. Extract data accurately and return ONLY valid JSON, no explanation.",
      }
    );

    // Parse JSON response
    const cleaned = response.content.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  }

  /**
   * Categorize receipt based on merchant and items
   */
  async _categorizeReceipt(merchantName, items = []) {
    const itemsList = items.map((i) => i.name).join(", ");

    const prompt = `Categorize this purchase:

Merchant: ${merchantName || "Unknown"}
Items: ${itemsList || "Not specified"}

Choose ONE category from this list:
groceries, dining, transportation, utilities, entertainment, healthcare, 
shopping, travel, education, other

Return ONLY the category name, nothing else.`;

    const response = await aiService.chat(
      [{ role: "user", content: prompt }],
      {
        temperature: 0.1,
        maxTokens: 50,
        systemPrompt: "You are a transaction categorizer. Return only the category name.",
      }
    );

    return response.content.trim().toLowerCase();
  }

  /**
   * Validate receipt data quality
   */
  validateReceiptData(data) {
    const issues = [];

    if (!data.merchantName) {
      issues.push("Merchant name not detected");
    }

    if (!data.totalAmount || data.totalAmount <= 0) {
      issues.push("Invalid total amount");
    }

    if (!data.date) {
      issues.push("Date not detected");
    }

    if (data.items && data.items.length === 0) {
      issues.push("No line items detected");
    }

    return {
      isValid: issues.length === 0,
      issues,
      confidence: this._calculateConfidence(data, issues),
    };
  }

  /**
   * Calculate confidence score
   */
  _calculateConfidence(data, issues) {
    let score = 100;

    // Deduct points for missing fields
    score -= issues.length * 15;

    // Bonus for having all fields
    if (data.merchantName) score += 5;
    if (data.date) score += 5;
    if (data.totalAmount > 0) score += 10;
    if (data.items && data.items.length > 0) score += 10;

    return Math.max(0, Math.min(100, score));
  }
}

module.exports = new DocumentProcessingService();
