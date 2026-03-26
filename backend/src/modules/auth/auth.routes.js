// ─── Commit: Express Router Initialization ───
// What this does: Loads the Express framework and initializes a "Router" specifically for Authentication.
// Why it exists: To keep our code clean! Instead of putting all code in index.js, we divide the app into specialized "Routes" by feature.
const express = require("express");
const { register, login, logout } = require("./auth.controller");
const { protect } = require("../../common/middleware/auth.middleware");

const router = express.Router();

// ─── Commit: Public Authentication Routes ───
// What this does: Defines the URLs for Register and Login.
// Why they are public: Because obviously, users aren't logged in yet when they need to Register/Login!
// Pattern used: "POST requests". (We use POST instead of GET so private data like passwords don't show up in the browser URL bar).
router.post("/register", register);
router.post("/login", login);

// ─── Commit: Protected Sign-Out Route ───
// What this does: Defines the URL to log out.
// Why 'protect'? To prevent malicious hackers from forcing you to logout or "logging out" a user that doesn't even have a session.
router.post("/logout", protect, logout); 

// ─── Commit: Router Export ───
// Why it exists: This makes all the logic above available to the main index.js file.
module.exports = router;
