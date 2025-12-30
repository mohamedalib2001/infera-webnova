import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { initializeTerminalService, initializeRuntimeService, terminalWebSocketServer, runtimeWebSocketServer } from "./terminal-service";
import { initializeAIWebSocket, aiWebSocketServer } from "./ai-websocket";
import { initializeIntegrationWebSocket, integrationWebSocketServer, authenticateWebSocket } from "./integration-websocket";
import { setupAuth } from "./replitAuth";
import { initStripeSystem } from "./stripeClient";
import { WebhookHandlers } from "./webhookHandlers";
import { paymentRoutes } from "./payment-routes";
import deployRoutes from "./deploy-routes";
import hetznerCloudRoutes from "./hetzner-cloud-routes";
// Start INFERA Agent on separate port (5001) - truly independent
import("./infera-agent/index").catch(err => {
  console.error("[INFERA Agent] Failed to start standalone agent:", err.message);
});

const app = express();
const httpServer = createServer(app);

// Initialize all WebSocket services (without their own upgrade handlers)
initializeTerminalService(httpServer);
initializeRuntimeService(httpServer);
initializeAIWebSocket(httpServer);
initializeIntegrationWebSocket(httpServer);

// Centralized WebSocket upgrade handler to avoid conflicts
httpServer.on("upgrade", async (request, socket, head) => {
  const pathname = new URL(request.url || "", `http://${request.headers.host}`).pathname;
  
  if (pathname === "/ws/ai" && aiWebSocketServer) {
    // Authenticate WebSocket connection using session cookies
    const auth = await authenticateWebSocket(request);
    // Attach auth info to request for use in connection handler
    (request as any).authUser = auth; // null if not authenticated, {userId, isOwner} if authenticated
    aiWebSocketServer.handleUpgrade(request, socket, head, (ws) => {
      aiWebSocketServer!.emit("connection", ws, request);
    });
  } else if (pathname === "/ws/terminal" && terminalWebSocketServer) {
    terminalWebSocketServer.handleUpgrade(request, socket, head, (ws) => {
      terminalWebSocketServer!.emit("connection", ws, request);
    });
  } else if (pathname === "/ws/runtime" && runtimeWebSocketServer) {
    runtimeWebSocketServer.handleUpgrade(request, socket, head, (ws) => {
      runtimeWebSocketServer!.emit("connection", ws, request);
    });
  } else if (pathname === "/ws/integrations" && integrationWebSocketServer) {
    const auth = await authenticateWebSocket(request);
    if (!auth || !auth.isOwner) {
      socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
      socket.destroy();
      return;
    }
    (request as any).authUser = auth;
    integrationWebSocketServer.handleUpgrade(request, socket, head, (ws) => {
      integrationWebSocketServer!.emit("connection", ws, request);
    });
  }
  // Note: Vite HMR uses /vite-hmr and handles its own upgrades
});

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).json({ error: 'Missing stripe-signature' });
    }
    try {
      const sig = Array.isArray(signature) ? signature[0] : signature;
      if (!Buffer.isBuffer(req.body)) {
        console.error('[Stripe Webhook] req.body is not a Buffer');
        return res.status(500).json({ error: 'Webhook processing error' });
      }
      await WebhookHandlers.processWebhook(req.body as Buffer, sig);
      res.status(200).json({ received: true });
    } catch (error: any) {
      console.error('[Stripe Webhook] Error:', error.message);
      res.status(400).json({ error: 'Webhook processing error' });
    }
  }
);

app.use(
  express.json({
    limit: '50mb',
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false, limit: '50mb' }));

app.use('/api/payments', paymentRoutes);
app.use('/api/deploy', deployRoutes);
app.use('/api/hetzner-cloud', hetznerCloudRoutes);
app.use('/api/hetzner', hetznerCloudRoutes);

// Note: INFERA Agent now runs as truly standalone server on port 5001
// It is NOT mounted here - it operates completely independently
console.log('[INFERA Agent] Running as standalone server on port 5001');

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Run Stripe initialization in background (non-blocking)
  initStripeSystem().catch(err => {
    console.warn('[Stripe] Initialization skipped:', err.message);
  });
  
  await setupAuth(app);
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5000", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
      reusePort: true,
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
