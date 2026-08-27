import "dotenv/config";

import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import morgan from "morgan";

import { getCurrentUser } from "./gateway/controllers/user.controller.js";
import { isAuth } from "./gateway/middleware/isAuth.js";
import authRouter from "./services/auth/routes/auth.route.js";
import billingRouter from "./services/billing/routes/billing.route.js";
import interviewRouter from "./services/interview/routes/interview.route.js";
import resumeRouter from "./services/resume/routes/resume.route.js";
import roadmapRouter from "./services/roadmap/routes/roadmap.route.js";

const app = express();
const PORT = process.env.PORT || 8000;

const defaultOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

const normalizeOrigin = (origin) => {
  if (!origin) return "";

  try {
    const parsed = new URL(origin.trim());
    return parsed.origin;
  } catch {
    return origin.trim().replace(/\/+$/, "");
  }
};

const configuredOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.CORS_ORIGINS || "").split(","),
]
  .map(normalizeOrigin)
  .filter(Boolean);

const allowedOrigins = new Set([...defaultOrigins, ...configuredOrigins]);

app.use(
  cors({
    origin(origin, callback) {
      const normalizedOrigin = normalizeOrigin(origin);

      if (!origin || allowedOrigins.has(normalizedOrigin)) {
        return callback(null, true);
      }

      const error = new Error(`CORS blocked origin: ${origin}`);
      error.status = 403;
      return callback(error);
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

const requireAuthHeaders = (req, _res, next) => {
  req.headers["x-user-id"] = req.user?.userId;
  req.headers["x-session-id"] = req.cookies?.session;
  next();
};

app.get("/", (_req, res) => {
  res.json({
    success: true,
    service: "HireGen-AI Backend",
    mode: "single-service",
  });
});

app.get("/health", (_req, res) => {
  res.json({
    success: true,
    status: "ok",
    mongo:
      mongoose.connection.readyState === 1
        ? "connected"
        : "not-connected",
  });
});

app.use("/api/auth", authRouter);
app.get("/api/me", isAuth, getCurrentUser);
app.use("/api/resume", isAuth, requireAuthHeaders, resumeRouter);
app.use("/api/interview", isAuth, requireAuthHeaders, interviewRouter);
app.use("/api/roadmap", isAuth, requireAuthHeaders, roadmapRouter);
app.use("/api/billing", isAuth, requireAuthHeaders, billingRouter);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const startServer = async () => {
  if (!process.env.MONGODB_URL) {
    throw new Error("MONGODB_URL is required to start the backend");
  }

  await mongoose.connect(process.env.MONGODB_URL);
  console.log("MongoDB connected");

  app.listen(PORT, () => {
    console.log(`HireGen-AI backend started on ${PORT}`);
  });
};

startServer().catch((error) => {
  console.error("Failed to start backend:", error);
  process.exit(1);
});
