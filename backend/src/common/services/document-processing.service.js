// ─── Commit: Document Processing & Vision Setup ───
// What this does: Loads Google Vision (Cloud-based AI) and Tesseract.js (On-device OCR).
// Why it exists: To digitize paper documents like receipts, invoices, and bank statements.
// Patterns used: Strategy Pattern (choosing between Google Vision or Tesseract depending on config).
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
    // Stage 1: Initialize Cloud Services
    // Beginner note: 'this.visionClient' is our bridge to Google's powerful image intelligence.
    if (aiConfig.googleVision.enabled) {
      this.visionClient = new vision.ImageAnnotatorClient({
        keyFilename: aiConfig.googleVision.keyFilename,
      });
    }
  }

  /**
   * Process receipt image and extract transaction data
   */
  // ─── Commit: End-to-End Extraction Pipeline ───
  // How it works: 1. Optical Character Recognition (OCR). 2. Semantic Analysis (AI Parsing). 3. Business Logic (Categorization).
  // Interview insight: This logic is "Idempotent" in spirit — every time you process the same image, you should get the same structured data.
  async processReceipt(imageBuffer, options = {}) {
    const { userId, useGoogleVision = true } = options;

    try {
      // Step 1: Optical Character Recognition (Turning an image into a string)
      let extractedText;
      if (useGoogleVision && this.visionClient) {
        extractedText = await this._googleVisionOCR(imageBuffer);
      } else {
        extractedText = await this._tesseractOCR(imageBuffer);
      }

      // Step 2: Semantic Parsing (Using AI to find "Total Amount" vs "Tax")
      const parsedData = await this._parseReceiptWithAI(extractedText);

      // Step 3: Automatic Category Assignment (Labeling the transaction)
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
  // ─── Commit: PDF Data Extraction (Future-proofing) ───
  // What this does: A placeholder for parsing multi-page banking records.
  // Interview insight: Why have a placeholder? To show "Scalability". Our service is designed to expand into physical document management later.
  async processBankStatement(_pdfBuffer) {
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
  // ─── Commit: Specialized Invoice Intelligence ───
  // What this does: Extracts "Due Dates" and "Vendor Names" instead of just "Totals".
  // Note: Different documents need different "AI Prompts" to be parsed correctly.
  async processInvoice(imageOrPdfBuffer, format = "image") {
    try {
      let text;
      if (format === "image") {
        text = await this._tesseractOCR(imageOrPdfBuffer);
      } else {
        text = ""; // Future home for PDF extraction logic
      }

      // Step 4: AI Context for INVOICES (Indian Context)
      const prompt = `Extract invoice details from this text (Indian GST context):

${text}

Return a JSON object with:
{
  "invoiceNumber": "INV-123",
  "date": "2026-03-25",
  "dueDate": "2026-04-25",
  "vendor": "Sahil Tech Solutions",
  "totalAmount": 50000.00,
  "currency": "INR",
  "items": [
    {
      "description": "Software Development",
      "quantity": 1,
      "unitPrice": 50000.00,
      "total": 50000.00
    }
  ],
  "taxAmount": 9000.00,
  "subtotal": 41000.00
}

If any field is not found, use null.`;

      const response = await aiService.chat(
        [{ role: "user", content: prompt }],
        {
          temperature: 0.1, // Near zero randomness for data extraction
          maxTokens: 2000,
          systemPrompt:
            "You are an Indian invoice processing AI. Extract structured data accurately. Use INR for currency.",
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
   * Google Cloud Vision OCR Implementation
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
  // ─── Commit: Local OCR Logic with Progress Tracking ───
  // Why use this? It's free and works even if your server has no internet connection.
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
    const prompt = `Parse this receipt text and extract structured financial data:

${text}

Extract and return ONLY a valid JSON object:
{
  "merchantName": "string",
  "date": "YYYY-MM-DD",
  "totalAmount": number,
  "currency": "INR",
  "items": [],
  "paymentMethod": "UPI/Card/Cash"
}`;

    const response = await aiService.chat(
      [{ role: "user", content: prompt }],
      {
        temperature: 0.1,
        maxTokens: 2000,
        systemPrompt: "You are a professional auditor AI. Extract and return ONLY JSON.",
      }
    );

    const cleaned = response.content.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(cleaned);
  }

  /**
   * Categorize receipt based on merchant and items
   */
  async _categorizeReceipt(merchantName, items = []) {
    const itemsList = items.map((i) => i.name).join(", ");

    const prompt = `Categorize this Indian purchase:
Merchant: ${merchantName}
Items: ${itemsList}

Return ONLY one category: groceries, dining, transportation, utilities, entertainment, healthcare, shopping, travel, education, other.`;

    const response = await aiService.chat([{ role: "user", content: prompt }], { temperature: 0.1 });
    return response.content.trim().toLowerCase();
  }

  /**
   * Validate receipt data quality
   */
  // ─── Commit: Data Sanity Checks ───
  // What this does: Identifies "Incomplete" data before it saves to the DB.
  // Interview insight: This is part of "Defensive Programming".
  validateReceiptData(data) {
    const issues = [];

    if (!data.merchantName) issues.push("Merchant name not detected");
    if (!data.totalAmount || data.totalAmount <= 0) issues.push("Invalid total amount");
    if (!data.date) issues.push("Date not detected");

    return {
      isValid: issues.length === 0,
      issues,
      confidence: this._calculateConfidence(data, issues),
    };
  }

  /**
   * Calculate confidence score (Percentage 0-100)
   */
  _calculateConfidence(data, issues) {
    let score = 100;
    score -= issues.length * 15;
    if (data.merchantName) score += 5;
    if (data.items && data.items.length > 0) score += 10;
    return Math.max(0, Math.min(100, score));
  }
}

// ─── Commit: Modular Export ───
module.exports = new DocumentProcessingService();
