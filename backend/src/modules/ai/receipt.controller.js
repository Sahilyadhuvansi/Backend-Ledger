// ─── Commit: File Upload Middleware (Multer) ───
// What this does: Loads Multer, the industry-standard tool for handling "Multipart/form-data" (file uploads).
// Why it exists: Express cannot read files by itself. Multer parses the incoming image stream and puts it into 'req.file'.
// Beginner note: 'memoryStorage()' keeps the image in the server's RAM temporarily instead of saving it to a hard drive (which is faster).
const asyncHandler = require("../../common/utils/asyncHandler");
const ApiResponse = require("../../common/utils/ApiResponse");
const ApiError = require("../../common/utils/ApiError");
const receiptScanner = require("../../common/services/receipt-scanner.service");
const Transaction = require("../transactions/transaction.model");
const multer = require("multer");

// ─── Commit: Multer Configuration & Security ───
// What this does: Restricts uploads to 10MB and ONLY allows JPEG/PNG/WebP images.
// Interview insight: Why limit file size? To prevent "Denial of Service" (DoS) attacks where someone sends a 10GB file to crash your server's memory.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, 
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed"), false);
    }
  },
});

/**
 * @route   POST /api/ai/scan-receipt
 * @desc    Scan receipt and extract transaction data
 */
// ─── Commit: Receipt Parsing Logic ───
// How it works: 1. Multer captures the file. 2. Validator checks image quality (brightness). 3. OCR + AI extracts data.
// Pattern used: "Middleware Chain". The 'upload.single' runs BEFORE our logic.
exports.scanReceipt = [
  upload.single("receipt"),
  asyncHandler(async (req, res) => {
    // Stage 1: File Presence Check
    if (!req.file) {
      throw new ApiError(400, "Receipt image is required");
    }

    const userId = req.user._id;

    // Stage 2: Hardware/Vision Validation
    // What this does: Checks if the photo is blurry or dark before wasting AI credits processing it.
    const validation = await receiptScanner.validateImage(req.file.buffer);
    if (!validation.valid && validation.warnings.length > 0) {
      console.warn("Image quality warnings:", validation.warnings);
    }

    // Stage 3: The "Magic" (OCR + LLM Extraction)
    const result = await receiptScanner.scanReceipt(req.file.buffer);

    if (!result.success) {
      throw new ApiError(400, result.error || "Failed to scan receipt");
    }

    // ─── Commit: Expense Auto-Onboarding (Optional) ───
    // What this does: If 'autoCreate' is true, it automatically creates a transaction record from the receipt.
    // Interview insight: This logic assumes a specific schema for Transaction. Always verify your model fields (fromAccount vs senderId).
    let transaction = null;
    if (req.body.autoCreate === "true" && result.parsed.totalAmount) {
      // Logic for creating an expense record based on parsed data
      transaction = await Transaction.create({
        senderId: userId,
        receiverId: userId,
        amount: result.parsed.totalAmount,
        type: "expense",
        category: result.parsed.category || "other",
        description: `${result.parsed.merchantName || "Purchase"} - Auto-imported from receipt`,
        metadata: {
          source: "receipt_scan",
          merchantName: result.parsed.merchantName,
          scannedAt: new Date(),
          items: result.parsed.items || [],
        },
      });
    }

    res.status(200).json(
      new ApiResponse(
        200,
        {
          scanned: result,
          transaction,
          autoCreated: !!transaction,
        },
        "Receipt scanned successfully"
      )
    );
  }),
];

/**
 * @route   POST /api/ai/scan-receipts/batch
 * @desc    Scan multiple receipts in one go
 */
// ─── Commit: Batch Image Processing Flow ───
// How it works: Handles an ARRAY of files ('receipts').
// Beginner note: 'upload.array' allows the user to select 10 photos at once from their gallery.
exports.batchScanReceipts = [
  upload.array("receipts", 10), 
  asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      throw new ApiError(400, "No receipt images provided");
    }

    // Transform the array of files into an array of memory buffers
    const buffers = req.files.map((file) => file.buffer);

    // Concurrent/Sequential scanning
    const results = await receiptScanner.batchScan(buffers);

    const transactions = [];
    if (req.body.autoCreate === "true") {
      for (const result of results.results) {
        if (result.success && result.parsed.totalAmount) {
          const transaction = await Transaction.create({
            senderId: req.user._id,
            receiverId: req.user._id,
            amount: result.parsed.totalAmount,
            type: "expense",
            category: result.parsed.category || "other",
            description: `${result.parsed.merchantName || "Purchase"} - Auto-imported`,
            metadata: {
              source: "receipt_scan",
              merchantName: result.parsed.merchantName,
              scannedAt: new Date(),
            },
          });
          transactions.push(transaction);
        }
      }
    }

    res.status(200).json(
      new ApiResponse(
        200,
        {
          ...results,
          transactions,
          autoCreated: transactions.length,
        },
        `Scanned ${results.successful}/${results.total} receipts successfully`
      )
    );
  }),
];
