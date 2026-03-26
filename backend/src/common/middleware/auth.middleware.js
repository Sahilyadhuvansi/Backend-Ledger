// ─── Commit: Auth Middleware Module Setup ───
// What this does: Imports the User model, Blacklist checker, and JWT library.
// Why it exists: This file provides the "Lock and Key" for your API. Without this, anyone could steal your money!
// Patterns used: Middleware (functions that sit between the raw Request and the final Controller).
const User = require("../../modules/users/user.model");
const tokenBlacklistModel = require("../../modules/auth/blacklist.model");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

// ─── Commit: Protected Route Guard (Auth Gate) ───
// What this does: Verifies if the incoming traveler (the browser) has a valid "Passport" (JWT token).
// Why it exists: To ensure that only logged-in users can reach sensitive paths like /dashboard.
// How it works: 1. Extract token from Cookies or Headers. 2. Verify token data. 3. Check for blacklisted sessions. 4. Attach User to req.
// Interview insight: Why check 'req.cookies' AND 'req.headers'? Cookies are cleaner for web apps, but Headers are better for testing (Postman) or Mobile Apps.
const protect = asyncHandler(async (req, res, next) => {
  // Step 1: Look for the token in two common locations.
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new ApiError(401, "Unauthorized: No token provided");
  }

  // Step 2: Check if this token was recorded as "Invalid" because the user logged out.
  // Interview insight: This is vital because JWTs cannot be "remoted deleted" from a computer, only forgotten by the server.
  const isBlacklisted = await tokenBlacklistModel.findOne({ token });
  if (isBlacklisted) {
    throw new ApiError(401, "Unauthorized: Token is blacklisted");
  }

  try {
    // Step 3: Decode the token using your secret key.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Step 4: Find the real user in the database.
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new ApiError(401, "Unauthorized: User not found");
    }

    // Step 5: ATTACH the user to the Request. 
    // Beginner note: Now, every function after this middleware can simply use 'req.user'!
    req.user = user;
    
    // Move to the next function in the pipeline
    next();
  } catch (error) {
    throw new ApiError(401, "Unauthorized: Invalid or expired token");
  }
});

// ─── Commit: Role-Based Access Control (RBAC) ───
// What this does: Restricts access to specific users (like Admin or System users).
// Real-world analogy: Like having a "Staff Only" back door in a restaurant.
const restrictToSystemUser = asyncHandler(async (req, _res, next) => {
  if (!req.user || !req.user.systemUser) {
    // If systemUser was not selected in protect middleware, we re-fetch with selection
    const user = await User.findById(req.user._id).select("+systemUser");
    if (!user || !user.systemUser) {
      throw new ApiError(403, "Forbidden: User is not a system user");
    }
    req.user = user;
  }
  next();
});

module.exports = {
  protect,
  restrictToSystemUser,
};
