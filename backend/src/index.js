require("dotenv").config();

const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

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

// Routers
const authRoutes = require("./routes/auth.routes");
const accountRoutes = require("./routes/account.routes");
const transactionRoutes = require("./routes/transaction.routes");

const requiredEnv = ["JWT_SECRET", "MONGO_URI"];
requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    console.error(`❌ Missing required environment variable: ${key}`);
    process.exit(1);
  }
});

let dbError = null;
let cachedPromise = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) return;

  if (cachedPromise) {
    await cachedPromise;
    return;
  }

  try {
    cachedPromise = mongoose.connect(process.env.MONGO_URI, {
      autoIndex: process.env.NODE_ENV !== "production",
    });
    await cachedPromise;
    console.log("✅ MongoDB connected");
  } catch (err) {
    cachedPromise = null;
    dbError = err.message;
    console.error("❌ MongoDB connection failed:", err.message);

    if (process.env.NODE_ENV !== "production") {
      process.exit(1);
    }
  }
};

const app = express();
const server = http.createServer(app);

app.set("trust proxy", 1);

app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "https:"],
        fontSrc: ["'self'", "https:"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https:"],
        objectSrc: ["'none'"],
      },
    },
  }),
);

const allowedOrigins = [
  ...(process.env.CORS_ORIGIN || "")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: (origin, callback) => {
      if (
        !origin ||
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(origin) ||
        (process.env.NODE_ENV !== "production" &&
          origin.startsWith("http://localhost"))
      ) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  },
});

io.on("connection", (socket) => {
  // Listen for user to identify themselves with their ledger user ID
  socket.on("register_user", (userId) => {
    if (userId) {
      socket.join(userId);
      console.log(`Socket client joined room: ${userId}`);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

// Middleware to expose io inside controllers
app.use((req, res, next) => {
  req.io = io;
  next();
});

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(origin) ||
        (process.env.NODE_ENV !== "production" &&
          origin.startsWith("http://localhost"))
      ) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(
  "/api",
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/", (req, res) => {
  res.status(200).json({
    message: "Backend Ledger API is running",
    environment: process.env.NODE_ENV,
  });
});

app.get("/health", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;

  if (dbConnected) {
    return res.status(200).json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(503).json({
    status: "unhealthy",
    database: "disconnected",
    dbError,
    timestamp: new Date().toISOString(),
  });
});

app.use(async (req, res, next) => {
  await connectDB();
  next();
});

app.use("/api/auth", authRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/transactions", transactionRoutes);

app.use((err, _req, res, _next) => {
  console.error("❌ Error:", err.message);

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    message:
      process.env.NODE_ENV === "production" && statusCode === 500
        ? "Internal Server Error"
        : err.message,
  });
});

const startServer = async () => {
  await connectDB();

  const PORT = process.env.PORT || 3000;

  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();

module.exports = app;
