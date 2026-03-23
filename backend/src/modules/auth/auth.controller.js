const User = require("../users/user.model");
const tokenBlacklistModel = require("./blacklist.model");
const jwt = require("jsonwebtoken");
const { sendRegistrationEmail } = require("../../common/services/email.service");
const asyncHandler = require("../../common/utils/asyncHandler");
const ApiError = require("../../common/utils/ApiError");
const ApiResponse = require("../../common/utils/ApiResponse");
const Account = require("../accounts/account.model");
const Ledger = require("../accounts/ledger.model");

// ─── Helpers ──────────────────────────────────────────────────────────────────
const COOKIE_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  maxAge: COOKIE_EXPIRY_MS,
});

const signToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

const safeUser = (user) => ({
  _id: user._id,
  email: user.email,
  name: user.name,
  username: user.username,
});

// ─── Register ─────────────────────────────────────────────────────────────────
const register = asyncHandler(async (req, res) => {
  const { email, password, name, username } = req.body;

  // Input validation
  if (!email || !password || !name || !username) {
    throw new ApiError(400, "All fields are required");
  }
  if (password.length < 6) {
    throw new ApiError(400, "Password must be at least 6 characters");
  }

  // Check for duplicates
  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) {
    throw new ApiError(
      409,
      existing.email === email ? "Email already in use" : "Username already taken"
    );
  }

  // Create user
  const user = await User.create({ email, password, name, username });

  // First-10-users bonus (500 INR)
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
      transaction: userAccount._id, // synthetic system reference
      type: "credit",
    });
  }

  // Issue token
  const token = signToken(user._id);
  res.cookie("token", token, getCookieOptions());

  // Fire-and-forget welcome email
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
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  // Use vague message to prevent user enumeration
  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = signToken(user._id);
  res.cookie("token", token, getCookieOptions());

  return res.status(200).json(
    new ApiResponse(200, { user: safeUser(user), token }, "Login successful")
  );
});

// ─── Logout ───────────────────────────────────────────────────────────────────
const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (token) {
    // Blacklist the token so it can't be reused before expiry
    await tokenBlacklistModel.create({ token }).catch(() => {
      // Ignore duplicate key errors (token already blacklisted)
    });
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });

  return res.status(200).json(new ApiResponse(200, null, "Logged out successfully"));
});

module.exports = { register, login, logout };
