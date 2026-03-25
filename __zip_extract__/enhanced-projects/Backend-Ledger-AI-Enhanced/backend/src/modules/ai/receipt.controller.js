const asyncHandler = require("../../../common/utils/asyncHandler");
const ApiResponse = require("../../../common/utils/ApiResponse");
const ApiError = require("../../../common/utils/ApiError");
const receiptScanner = require("../../../common/services/receipt-scanner.service");
const Transaction = require("../../transactions/transaction.model");
const multer = require("multer");

// Configure multer for receipt uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max
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
 * @access  Private
 */
exports.scanReceipt = [
  upload.single("receipt"),
  asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, "Receipt image is required");
    }

    const userId = req.user._id;

    // Validate image quality
    const validation = await receiptScanner.validateImage(req.file.buffer);
    if (!validation.valid && validation.warnings.length > 0) {
      console.warn("Image quality warnings:", validation.warnings);
    }

    // Scan receipt
    const result = await receiptScanner.scanReceipt(req.file.buffer);

    if (!result.success) {
      throw new ApiError(400, result.error || "Failed to scan receipt");
    }

    // Optionally auto-create transaction
    let transaction = null;
    if (req.body.autoCreate === "true" && result.parsed.totalAmount) {
      transaction = await Transaction.create({
        senderId: userId,
        receiverId: userId, // Self transaction for expense tracking
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
 * @desc    Scan multiple receipts
 * @access  Private
 */
exports.batchScanReceipts = [
  upload.array("receipts", 10), // Max 10 receipts
  asyncHandler(async (req, res) => {
    if (!req.files || req.files.length === 0) {
      throw new ApiError(400, "No receipt images provided");
    }

    const buffers = req.files.map((file) => file.buffer);

    // Batch scan
    const results = await receiptScanner.batchScan(buffers);

    // Optionally auto-create transactions
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
