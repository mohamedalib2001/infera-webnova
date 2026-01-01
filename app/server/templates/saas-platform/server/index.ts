import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/auth.routes";
import adminRoutes from "./routes/admin.routes";
import { testConnection } from "./config/database";

const app = express();
const PORT = process.env.PORT || 5000;

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true,
}));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: "too_many_requests",
    messageAr: "محاولات كثيرة جداً. حاول لاحقاً",
    messageEn: "Too many attempts. Try again later",
  },
});

const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: "rate_limit_exceeded",
  },
});

app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);
app.use("/api", apiLimiter);

app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("[Server] Unhandled error:", err);
  res.status(500).json({
    success: false,
    error: "internal_server_error",
    messageAr: "حدث خطأ غير متوقع",
    messageEn: "An unexpected error occurred",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "not_found",
    messageAr: "المسار غير موجود",
    messageEn: "Route not found",
  });
});

async function startServer() {
  const isDbConnected = await testConnection();

  if (!isDbConnected) {
    console.error("[Server] Failed to connect to database. Exiting...");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`[Server] Running on port ${PORT}`);
    console.log(`[Server] Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

startServer().catch(console.error);

export default app;
