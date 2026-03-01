require("dotenv").config();
const app = require("./app");
const connectToDB = require("./config/db");

// Database connection
connectToDB();

// Start server for local development
if (process.env.NODE_ENV !== "production" || !process.env.VERCEL) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server is running locally on http://localhost:${PORT}`);
  });
}

module.exports = app;
