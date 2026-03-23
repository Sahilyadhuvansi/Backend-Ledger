require("dotenv").config();
const dns = require('node:dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

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

const authRoutes = require("./modules/auth/auth.routes");
const accountRoutes = require("./modules/accounts/account.routes");
const transactionRoutes = require("./modules/transactions/transaction.routes");

// ─── Validate Required Env Vars ──────────────────────────────────────────────
const REQUIRED_ENV = ["JWT_SECRET", "MONGO_URI"];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

// ─── CORS Origin Logic ───────────────────────────────────────────────────────
const allowedOrigins = [
  ...(process.env.CORS_ORIGIN || "").split(",").map((o) => o.trim()).filter(Boolean),
];
if (process.env.FRONTEND_URL) allowedOrigins.push(process.env.FRONTEND_URL);

const isOriginAllowed = (origin) => {
  if (!origin) return true;
  if (allowedOrigins.includes("*") || allowedOrigins.includes(origin)) return true;
  if (process.env.NODE_ENV !== "production") {
    return (
      origin.startsWith("http://localhost") ||
      /http:\/\/(192\.168|10|172)\./.test(origin)
    );
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

// ─── Database ─────────────────────────────────────────────────────────────────
let dbError = null;
let dbConnectPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;
  if (dbConnectPromise) return dbConnectPromise;

  dbConnectPromise = mongoose
    .connect(process.env.MONGO_URI, {
      autoIndex: process.env.NODE_ENV !== "production",
      serverSelectionTimeoutMS: 8000,
    })
    .then(() => {
      console.log("✅ MongoDB connected");
    })
    .catch((err) => {
      dbConnectPromise = null;
      dbError = err.message;
      console.error("❌ MongoDB connection failed:", err.message);
      if (process.env.NODE_ENV !== "production") process.exit(1);
    });

  return dbConnectPromise;
};

// ─── App Setup ────────────────────────────────────────────────────────────────
const app = express();
const server = http.createServer(app);

app.set("trust proxy", 1);

// ─── Socket.io ────────────────────────────────────────────────────────────────
const io = new Server(server, { cors: corsOptions });

io.on("connection", (socket) => {
  socket.on("register_user", (userId) => {
    if (userId) {
      socket.join(String(userId));
      console.log(`Socket joined room: ${userId}`);
    }
  });
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

app.use((req, _res, next) => {
  req.io = io;
  next();
});

// ─── Global Middleware ────────────────────────────────────────────────────────
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  helmet({
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
  })
);
app.use(cors(corsOptions));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many auth attempts, please try again later." },
});

// ─── Routes ───────────────────────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.status(200).json({
    message: "Backend Ledger API is running",
    environment: process.env.NODE_ENV,
    version: "1.0.0",
  });
});

app.get("/health", (_req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  return res.status(dbConnected ? 200 : 503).json({
    status: dbConnected ? "healthy" : "unhealthy",
    database: dbConnected ? "connected" : "disconnected",
    ...(dbError && { dbError }),
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/accounts", apiLimiter, accountRoutes);
app.use("/api/transactions", apiLimiter, transactionRoutes);

// ─── 404 Handler ─────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// ─── Global Error Handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  const statusCode = err.statusCode || 500;
  const isProd = process.env.NODE_ENV === "production";
  console.error(`❌ [${statusCode}] ${err.message}`);
  if (!isProd) console.error(err.stack);
  res.status(statusCode).json({
    message: isProd && statusCode === 500 ? "Internal Server Error" : err.message,
    ...(err.errors?.length > 0 && { errors: err.errors }),
  });
});

// ─── Start ────────────────────────────────────────────────────────────────────
const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();

module.exports = app;
