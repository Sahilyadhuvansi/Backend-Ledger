const User = require("../models/user.model");
const tokenBlacklistModel = require("../models/blacklist.model");
const jwt = require("jsonwebtoken");
const { sendRegistrationEmail } = require("../services/email.service");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");

const register = asyncHandler(async (req, res) => {
  const { email, password, name, username } = req.body;

  if (!email || !password || !name || !username) {
    throw new ApiError(400, "All fields are required");
  }

  const isExists = await User.findOne({ $or: [{ email }, { username }] });
  if (isExists) {
    if (isExists.email === email) {
      throw new ApiError(409, "User already exists with this email");
    } else {
      throw new ApiError(409, "Username is already taken");
    }
  }

  const user = await User.create({ email, password, name, username });

  // Free 500 Rupees Registration Bonus for the first 10 users only!
  const totalUsers = await User.countDocuments();
  const getsBonus = totalUsers <= 10;

  const Account = require("../models/account.model");
  const Ledger = require("../models/ledger.model");

  const userAccount = await Account.create({
    user: user._id,
    currency: "INR",
    balance: getsBonus ? 500 : 0,
  });

  if (getsBonus) {
    // Create an unlinked ledger entry for the initial deposit
    await Ledger.create({
      account: userAccount._id,
      amount: 500,
      transaction: userAccount._id, // Using account ID as fake system transaction ID
      type: "credit",
    });
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie("token", token, cookieOptions);

  sendRegistrationEmail(user.email, user.name).catch((err) =>
    console.error("Email sending failed:", err.message),
  );

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        {
          user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            username: user.username,
          },
          token,
        },
        `User registered successfully${getsBonus ? ". Added 500 INR Initial Bonus!" : ""}`,
      ),
    );
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    throw new ApiError(404, "Invalid credentials");
  }

  const isValidPassword = await user.comparePassword(password);
  if (!isValidPassword) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  };

  res.cookie("token", token, cookieOptions);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {
          user: {
            _id: user._id,
            email: user.email,
            name: user.name,
            username: user.username,
          },
          token,
        },
        "Login successful",
      ),
    );
});

const logout = asyncHandler(async (req, res) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (token) {
    await tokenBlacklistModel.create({ token });
  }

  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Logged out successfully"));
});

module.exports = {
  register,
  login,
  logout,
};
