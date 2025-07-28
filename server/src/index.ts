import express from "express";
import cors from "cors";
import { connectDB } from "./db";
import HocuspocusServer from "./realtime/hocuspocus";

// Import routes
import notebooksRouter from "./routes/notebooks";
import sectionsRouter from "./routes/sections";
import pagesRouter from "./routes/pages";
import componentsRouter from "./routes/components";

const app = express();
const PORT = process.env.PORT;
const HOCUSPOCUS_PORT = process.env.HOCUSPOCUS_PORT;

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Routes
app.use("/api/notebooks", notebooksRouter);
app.use("/api/sections", sectionsRouter);
app.use("/api/pages", pagesRouter);
app.use("/api/components", componentsRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Error:", err);
    res.status(500).json({
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? err.message
          : "Something went wrong",
    });
  }
);

// 404 handler
app.use("*", (req, res) => {
  res.status(404).json({ error: "Route not found" });
});

async function startServer() {
  try {
    // Connect to database
    await connectDB();

    // Start Express server
    app.listen(PORT, () => {
      console.log(`🚀 Express server running on http://localhost:${PORT}`);
    });

    // Start Hocuspocus server for real-time collaboration
    const hocuspocusServer = new HocuspocusServer(
      parseInt(HOCUSPOCUS_PORT as string)
    );
    hocuspocusServer.start();

    // Graceful shutdown
    process.on("SIGTERM", () => {
      console.log("SIGTERM received, shutting down gracefully");
      hocuspocusServer.stop();
      process.exit(0);
    });

    process.on("SIGINT", () => {
      console.log("SIGINT received, shutting down gracefully");
      hocuspocusServer.stop();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
