const express = require("express");
const { register, login, logout } = require("./auth.controller");
const { protect } = require("../../common/middleware/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/logout", protect, logout); // protect ensures only logged-in users can logout

module.exports = router;
