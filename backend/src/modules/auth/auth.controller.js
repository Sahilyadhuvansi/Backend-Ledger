// ─── Commit: Controller Layer Imports ───
// What this does: Imports models (User, Account) and utilities (JWT, Email, Error Handlers).
// Why it exists: Controllers are the "Brains" of a specific feature. This one handles Authentication.
// Patterns used: MVC (Controller), Singleton behavior.
const User = require("../users/user.model");
const tokenBlacklistModel = require("./blacklist.model");
const jwt = require("jsonwebtoken");
const { sendRegistrationEmail } = require("../../common/services/email.service");
const asyncHandler = require("../../common/utils/asyncHandler");
const ApiError = require("../../common/utils/ApiError");
const ApiResponse = require("../../common/utils/ApiResponse");
const Account = require("../accounts/account.model");
const Ledger = require("../accounts/ledger.model");

// ─── Commit: Auth Configuration Helpers ───
// What this does: Sets up standard expiry times and cookie security settings.
// Interview insight: Why 'httpOnly: true'? To prevent "Cross-Site Scripting" (XSS) attacks by hiding the cookie from Javascript.
// Beginner note: '7d' means the user stays logged in for 7 days.
const COOKIE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; 
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: COOKIE_EXPIRY_MS,
});

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

// Security check: Never send the password back to the frontend!
const safeUser = (user) => ({
  _id: user._id,
  email: user.email,
  name: user.name,
  username: user.username,
});

// ─── Register ─────────────────────────────────────────────────────────────────
// ─── Commit: User Registration and Onboarding Flow ───
// What this does: Handles new user signup, validation, and welcome bonuses.
// Flow: 1. Validate Input. 2. check for duplicates. 3. Create User. 4. Create Account. 5. Issue Token.
// Beginner note: 'asyncHandler' lets us skip writing 'try-catch' blocks manually for every function.
const register = asyncHandler(async (req, res) => {
  const { email, password, name, username } = req.body;

  // Step 1: Basic validation (Never trust the client!)
  if (!email || !password || !name || !username) {
    throw new ApiError(400, "All fields are required");
  }
  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  // Step 2: Ensure uniqueness (One email per person)
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    throw new ApiError(
      409,
      existing.email === email ? "Email already in use" : "Username already taken"
    );
  }

  // Step 3: Create the User entry (Password is hashed automatically in user.model.js)
  const user = await User.create({ email, password, name, username });

  // ─── Commit: Gamification (Welcome Bonus Logic) ───
  // What this does: Rewards the first 10 users with ₹500.
  // Interview insight: This logic should ideally be "Transaction-wraped" to prevent race conditions.
  const totalUsers = await User.countDocuments();
  const getsBonus = totalUsers <= 10;
  const bonusAmount = getsBonus ? 500 : 0;

  const userAccount = await Account.create({
    user: user._id,
    currency: "INR",
    balance: bonusAmount,
  });

  if (getsBonus) {
    await Ledger.create({
      account: userAccount._id,
      amount: bonusAmount,
      transaction: userAccount._id, 
      type: "credit",
    });
  }

  // Step 4: Issue a JWT (JSON Web Token) to log them in immediately
  const token = signToken(user._id);
  res.cookie("token", token, getCookieOptions());

  // Fire-and-forget: Send email in the background without making the user wait
  sendRegistrationEmail(user.email, user.name).catch((err) =>
    console.error("Welcome email failed:", err.message)
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      { user: safeUser(user), token },
      `Registered successfully${getsBonus ? " — ₹500 welcome bonus added!" : ""}`
    )
  );
});

// ─── Login ────────────────────────────────────────────────────────────────────
// ─── Commit: Secure Login Implementation ───
// How it works: Compares provided password against hashed version in database using 'bcrypt'.
// Interview insight: Why 'select("+password")'? In user.model, we hide password by default for security. We must explicitly ask for it to check it.
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid credentials"); // Use generic message to prevent hacker probing
  }

  const token = signToken(user._id);
  res.cookie("token", token, getCookieOptions());

  return res.status(200).json(
    new ApiResponse(200, { user: safeUser(user), token }, "Login successful")
  );
});

// ─── Logout ───────────────────────────────────────────────────────────────────
// ─── Commit: Secure Session Termination (Blacklisting) ───
// What this does: Logs out the user and "kills" the current token so it can't be stolen.
// Beginner note: 'clearCookie' removes the key from the browser.
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (token) {
    // Save the token ID to a "Blacklist" database until it naturally expires
    await tokenBlacklistModel.create({ token }).catch(() => {});
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });

  return res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

module.exports = { register, login, logout };
