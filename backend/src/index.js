require("dotenv").config();
const dns = require('node:dns');

// Configure Google DNS to prevent resolution issues with MongoDB Atlas or other external services
dns.setServers(['8.8.8.8', '8.8.4.4']);

// ─── Module Imports ───────────────────────────────────────────────────────────
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const compression = require("compression");
const morgan = require("morgan");
const mongoose = require("mongoose");
const session = require("express-session");
const { MongoStore } = require("connect-mongo");

// ─── Configuration & Utilities ────────────────────────────────────────────────
const connectDB = require("./config/db");
const validateEnv = require("./config/validateEnv");

// ─── Feature Routes (MVC Pattern) ─────────────────────────────────────────────
const authRoutes = require("./modules/auth/auth.routes");
const accountRoutes = require("./modules/accounts/account.routes");
const transactionRoutes = require("./modules/transactions/transaction.routes");
const aiRoutes = require("./modules/ai/ai.routes");

// 🛰️ Phase 1: Fail-fast Validation
validateEnv();

// 🚀 Phase 2: Orchestration & Middleware Setup
const app = express();
const server = http.createServer(app);
app.set("trust proxy", 1);

// ─── Cross-Origin Resource Sharing (CORS) Configuration ───────────────────────
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5001",
  "http://localhost:5000",
  "https://mini-bank-beta.vercel.app",
  ...(process.env.CORS_ORIGIN || "").split(",").map((o) => o.trim()).filter(Boolean),
];
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) return true;
  if (process.env.NODE_ENV !== "production") {
    return origin.startsWith("http://localhost") || /http:\/\/(192\.168|10|172)\./.test(origin);
  }
  return false;
};

const corsOptions = {
  origin: (origin, callback) => {
    if (isOriginAllowed(origin)) return callback(null, true);
    return callback(new Error(`CORS: origin '${origin}' not allowed`));
  },
  credentials: true,
};

// ─── Real-Time Communication (Socket.io) ──────────────────────────────────────
const io = new Server(server, { cors: corsOptions });

io.on("connection", (socket) => {
  socket.on("register_user", (userId) => {
    if (userId) {
      socket.join(String(userId));
      console.log(`📡 Socket joined room: ${userId}`);
    }
  });
  socket.on("disconnect", () => console.log("🔌 Socket disconnected"));
});

// Inject IO into request for controllers
app.use((req, _res, next) => {
  req.io = io;
  next();
});

// ─── Security and Traffic Pipeline ────────────────────────────────────────────
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "https:", "'unsafe-inline'"],
      fontSrc: ["'self'", "https:"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https:", "http://localhost:*", "ws://localhost:*"],
      objectSrc: ["'none'"],
    },
  },
}));
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── State Persistence (Sessions) ─────────────────────────────────────────────
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: "sessions",
    ttl: 24 * 60 * 60,
  }),
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  },
}));

// ─── Defensive Programming (Rate Limiting) ────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { message: "Too many requests, please try again later." },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { message: "Too many auth attempts, please try again later." },
});

// ─── API Routes ──────────────────────────────────────────────────────────────
app.get("/", (_req, res) => res.json({ message: "Asset Ledger API v1.0", status: "Active" }));
app.get("/health", (_req, res) => res.json({ status: mongoose.connection.readyState === 1 ? "healthy" : "reconnecting" }));

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/accounts", apiLimiter, accountRoutes);
app.use("/api/transactions", apiLimiter, transactionRoutes);
app.use("/api/ai", apiLimiter, aiRoutes);

// ─── Centralized Error Handling ───────────────────────────────────────────────
app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  console.error(`❌ [Error] ${err.message}`);
  res.status(statusCode).json({
    message: process.env.NODE_ENV === "production" && statusCode === 500 ? "Internal Server Error" : err.message,
    ...(err.errors?.length > 0 && { errors: err.errors }),
  });
});

// 🔌 Phase 3: Launch
const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => console.log(`🚀 Gateway established on port ${PORT}`));
};

startServer();

module.exports = app;
