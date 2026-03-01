const User = require("../models/user.model");
const tokenBlacklistModel = require("../models/blacklist.model");
const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");

const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new ApiError(401, "Unauthorized: No token provided");
  }

  const isBlacklisted = await tokenBlacklistModel.findOne({ token });
  if (isBlacklisted) {
    throw new ApiError(401, "Unauthorized: Token is blacklisted");
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      throw new ApiError(401, "Unauthorized: User not found");
    }

    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Unauthorized: Invalid or expired token");
  }
});

const restrictToSystemUser = asyncHandler(async (req, res, next) => {
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
