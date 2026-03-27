// ─── Commit: Initialize Environment and DNS Settings ───
// What this does: Loads environment variables and ensures network stability for database connections.
// Why it exists: Necessary for reading secret keys (like API tokens) and avoiding resolution errors with MongoDB Atlas.
// How it works: use 'dotenv' to load .env file into memory and set Node's internal DNS servers to Google's public DNS.
// Beginner note: Always call dotenv.config() at the very first line of your entry file!
// Interview insight: Why set DNS servers? Standard DNS can sometimes fail to resolve cloud DB URLs; Google DNS (8.8.8.8) is a standard production safety measure.
require("dotenv").config();
const dns = require('node:dns');

// Configure Google DNS to prevent resolution issues with MongoDB Atlas or other external services
dns.setServers(['8.8.8.8', '8.8.4.4']);

<<<<<<< HEAD
// ─── Commit: Core Library and Route Imports ───
// What this does: Brings in all necessary framework components (Express, Mongoose, Socket.io) and application modules.
// Why it exists: These are the "building blocks" of your backend.
// Libraries used: express (Web framework), mongoose (DB driver), socket.io (Real-time), helmet (Security), cors (Access control).
=======

// ─── Core Library and Route Imports ───────────────────────────────────────────
>>>>>>> main
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

<<<<<<< HEAD
// Feature-specific route modules (MVC Pattern)
=======

// Feature Routes (MVC Pattern) ─────────────────────────────────────────────────
>>>>>>> main
const authRoutes = require("./modules/auth/auth.routes");
const accountRoutes = require("./modules/accounts/account.routes");
const transactionRoutes = require("./modules/transactions/transaction.routes");
const aiRoutes = require("./modules/ai/ai.routes");

<<<<<<< HEAD
// ─── Commit: Environment Validation ───
// What this does: Checks if critical keys exist before starting the engine.
// Why it exists: Preventing "undefined" errors later in the execution life-cycle.
=======

// ─── Environment Validation ───────────────────────────────────────────────────
>>>>>>> main
const REQUIRED_ENV = ["JWT_SECRET", "MONGO_URI"];
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key]);
if (missingEnv.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnv.join(", ")}`);
  process.exit(1);
}

console.log(`📡 Groq API Key present: ${!!process.env.GROQ_API_KEY}`);

<<<<<<< HEAD
// ─── Commit: Cross-Origin Resource Sharing (CORS) Configuration ───
// What this does: Whitelists specific domains (like your Vercel frontend) to access your backend API.
// Why it exists: Browser security blocks requests between different domains (ports) by default.
// How it works: Defines which origins and methods are allowed through HTTP headers.
// Interview insight: Credentials set to 'true' allows the browser to send cookies/auth headers across domains.
=======

// ─── Cross-Origin Resource Sharing (CORS) Configuration ───────────────────────
>>>>>>> main
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5001",
  "http://localhost:5000",
  "https://mini-bank-beta.vercel.app", // Production frontend – always allowed
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

<<<<<<< HEAD
// ─── Commit: Database Connection Management ───
// What this does: Connects your app to the MongoDB cluster.
// Why it exists: Without this, there is no storage for users or transactions.
// How it works: Uses Mongoose driver with a singleton connection pattern (checks readyState).
=======

// ─── Database Connection Management ───────────────────────────────────────────
>>>>>>> main
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

<<<<<<< HEAD
// ─── Commit: Express App and Server Initialization ───
// What this does: Creates the main application instance and HTTP server.
// Beginner note: We use 'http.createServer' so we can wrap it with Socket.io later.
=======

// ─── Express App and Server Initialization ────────────────────────────────────
>>>>>>> main
const app = express();
const server = http.createServer(app);

app.set("trust proxy", 1); // Crucial for apps behind proxies like Vercel/Render

<<<<<<< HEAD
// ─── Commit: Real-Time Communication (Socket.io) ───
// What this does: Enables two-way, low-latency communication (e.g., instant transaction alerts).
// How it works: Maps users to specific "rooms" using their IDs to send targeted notifications.
=======

// ─── Real-Time Communication (Socket.io) ──────────────────────────────────────
>>>>>>> main
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

// Middleware to expose the Socket.io instance to all subsequent API routes via req.io
app.use((req, _res, next) => {
  req.io = io;
  next();
});

<<<<<<< HEAD
// ─── Commit: Security and Traffic Middleware Pipeline ───
// What this does: Implements compression, security headers (Helmet), and logging (Morgan).
// Why it exists: To make the API fast (compression), secure (helmet), and observable (morgan).
=======

// ─── Security and Traffic Middleware Pipeline ─────────────────────────────────
>>>>>>> main
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

<<<<<<< HEAD
// ─── Commit: State Persistence (Session Management) ───
// What this does: Keeps users logged in and stores lightweight state (like AI chat history) in MongoDB.
// Why it exists: Standard HTTP is "stateless" (forgets users after every request); sessions provide "memory".
// Libraries used: express-session, connect-mongo.
// Interview insight: Why use 'connect-mongo'? If you store sessions in server RAM, they are lost on restart. External storage is "stateless" server architecture.
=======

// ─── State Persistence (Session Management) ───────────────────────────────────
>>>>>>> main
app.use(
  session({
    secret: process.env.JWT_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 24 * 60 * 60, // 24 hours in seconds
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production", // HTTPS only in production
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    },
  })
);

<<<<<<< HEAD
// ─── Commit: Defensive Programming (Rate Limiting) ───
// What this does: Prevents abuse and DDoS attacks by limiting how many requests a user can make.
=======

// ─── Defensive Programming (Rate Limiting) ────────────────────────────────────
>>>>>>> main
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


// ─── Commit: Route Definitions ───
// What this does: Maps URI paths to their respective handler functions.
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
app.use("/api/ai", apiLimiter, aiRoutes);

// Catch-all 404 handler for any undefined routes
app.use((_req, res) => {
  res.status(404).json({ message: "Route not found" });
});

<<<<<<< HEAD
// ─── Commit: Centralized Error Handling Middleware ───
// What this does: Catches all errors thrown in the app and returns a uniform JSON response.
// Real-world analogy: This is the "Emergency Emergency Room" of your app.
// Interview insight: Why differentiate prod/dev? To hide stack traces from users in production while helping devs debug in local.
=======

// ─── Centralized Error Handling Middleware ────────────────────────────────────
>>>>>>> main
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

<<<<<<< HEAD
// ─── Commit: Server Launch ───
// What this does: Binds the app to a port and starts receiving traffic.
=======

// ─── Server Launch ────────────────────────────────────────────────────────────
>>>>>>> main
const startServer = async () => {
  await connectDB();
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();

module.exports = app;
