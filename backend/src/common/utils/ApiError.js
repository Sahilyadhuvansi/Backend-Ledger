// ─── Commit: Custom Error Standardization ───
// What this does: Creates a professional "Error Blueprint" based on the standard Javascript 'Error' class.
// Why it exists: If you use plain strings for errors, the frontend won't know if it's a "Wait... (400)" error or a "Server Exploded (500)" error.
// Pattern used: "Class Inheritance".
class ApiError extends Error {
  /**
   * @param {number} statusCode - The HTTP status (e.g., 404 for Not Found)
   * @param {string} message - A human-readable reason
   * @param {Array} errors - Detailed specific errors (e.g., "Email is invalid")
   * @param {string} stack - The debugger "Map" showing where the crash happened
   */
  constructor(
    statusCode,
    message = "Something went wrong",
    errors = [],
    stack = "",
  ) {
    // Stage 1: Call the parent 'Error' class with our message
    super(message);

    // Stage 2: Add our custom banking API properties
    // Beginner note: 'this.success = false' tells the frontend instantly that the operation FAILED.
    this.statusCode = statusCode;
    this.data = null;
    this.message = message;
    this.success = false;
    this.errors = errors;

    // Stage 3: Error Traceability
    // Interview insight: 'Error.captureStackTrace' is vital for debugging! It records exactly which file and line number caused the error.
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
