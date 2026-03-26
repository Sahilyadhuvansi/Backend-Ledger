// ─── Commit: Environment Schema Validation ───
// What this does: Loads 'envalid', a toolkit for ensuring your .env file isn't missing anything.
// Why it exists: If you forget to put MONGO_URI in your .env, your server will crash in a way that's hard to debug. This tool crashes explicitly with a clear message: "You forgot MONGO_URI!".
const { cleanEnv, str, port, url } = require("envalid");

// ─── Commit: Bootstrapper Schema ───
// Pattern: "Strict Environment Validation". (Common in production-grade systems like POSIX).
// Interview insight: This follows the "Fail-Fast" principle. It's better to crash immediately on start than to try and run with broken settings.
function validateEnv() {
  cleanEnv(process.env, {
    // ─── Commit: Required Key Definitions ───
    MONGO_URI: url(), // Must be a valid MongoDB connection string
    PORT: port({ default: 3000 }), // Must be a valid number (e.g. 3000, 5001)
    JWT_SECRET: str(), // Must be a string (Used for signing passwords)
    
    // Developer Tip: Add other required keys (like GROQ_API_KEY) here to enforce them!
  });
}

module.exports = validateEnv;
