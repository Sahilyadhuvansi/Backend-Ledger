// ─── Commit: Success Response Blueprint ───
// What this does: Creates a predictable, standard "Envelope" for all successful data sent to the user.
// Why it exists: Consistency! When the frontend (React) receives data, it always knows to look for a '.data' property and a '.success' flag.
// Interview insight: Standardizing your API responses is called a "JSON:API" style. It makes your backend look very professional to other developers.
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP Success code (usually 200 or 201)
   * @param {any} data - The actual data (e.g., the User profile or the Transaction list)
   * @param {string} message - A short success message (e.g., "Logged in successfully")
   */
  constructor(statusCode, data, message = "Success") {
    this.statusCode = statusCode;
    this.data = data;
    this.message = message;
    
    // Automatic success detection
    // Beginner note: If the status code is below 400 (like 200 or 201), it was a success!
    this.success = statusCode < 400;
  }
}

module.exports = ApiResponse;
