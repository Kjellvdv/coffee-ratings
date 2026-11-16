import express from "express";
import session from "express-session";
import passport from "passport";
import cors from "cors";
import helmet from "helmet";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { initStorage } from "./storage";
import { createAuthRouter } from "./routes/auth";
import { createCoffeesRouter } from "./routes/coffees";
import { createFlavorProfilesRouter } from "./routes/flavor-profiles";
import { createFeedRouter } from "./routes/feed";
import { createStatsRouter } from "./routes/stats";
import { t } from "./i18n";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === "production";
const PORT = parseInt(process.env.PORT || "3000", 10);
const DEV_CLIENT_ORIGIN = "http://localhost:5173";

// ============= ENVIRONMENT =============

const DATABASE_URL = process.env.DATABASE_URL;
const SESSION_SECRET = process.env.SESSION_SECRET;
const CLIENT_URL = process.env.CLIENT_URL;

console.log("🚀 Starting coffee-rater", {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  DATABASE_URL: DATABASE_URL ? "Set" : "Missing",
  SESSION_SECRET: SESSION_SECRET ? "Set" : "Missing",
  CLIENT_URL: CLIENT_URL ? "Set" : "Missing",
});

if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set. Refusing to start.");
  process.exit(1);
}

// No fallback secret: a known default would let anyone forge a session cookie
if (!SESSION_SECRET) {
  console.error("❌ SESSION_SECRET is not set. Refusing to start.");
  process.exit(1);
}
if (isProduction && SESSION_SECRET.length < 32) {
  console.error("❌ SESSION_SECRET must be at least 32 characters in production. Refusing to start.");
  process.exit(1);
}

// ============= APP =============

const app = express();

// Railway terminates TLS in front of us: trust one proxy hop so req.ip,
// req.protocol and secure cookies reflect the real client
app.set("trust proxy", 1);

// Basic health check BEFORE any middleware
app.get("/ping", (_req, res) => {
  res.send("pong");
});

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  req.setTimeout(30000);
  res.setTimeout(30000);
  // Read the path now: routers trim req.path while they handle the request
  const requestPath = req.originalUrl.split("?")[0];
  res.on("finish", () => {
    const duration = Date.now() - start;
    const line = `📨 ${req.method} ${requestPath} ${res.statusCode} ${duration}ms`;
    if (duration > 1000) console.warn(`⚠️ Slow operation: ${line}`);
    else console.log(line);
  });
  next();
});

// Security headers. Images are stored as base64 data URLs, hence data: in img-src.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        "img-src": ["'self'", "data:", "blob:"],
        "upgrade-insecure-requests": isProduction ? [] : null,
      },
    },
  })
);

// ============= DATABASE =============

console.log("🔌 Initializing database connection...");
const testPool = new Pool({ connectionString: DATABASE_URL });
try {
  const client = await testPool.connect();
  console.log("✅ Database connection successful");
  client.release();
} catch (err) {
  console.error("❌ Database connection failed:", err);
  process.exit(1);
} finally {
  await testPool.end();
}

const storage = initStorage(DATABASE_URL);

const PgSession = connectPgSimple(session);
const sessionStore = new PgSession({
  pool: new Pool({ connectionString: DATABASE_URL }),
  tableName: "session",
  createTableIfMissing: true,
});

sessionStore.on("error", (err: Error) => {
  console.error("❌ Session store error:", err);
});

console.log("✅ Database initialization complete");

// ============= CORS AND CSRF =============

// The built client is served from this same server in production, so CORS
// only matters for the Vite dev server
const allowedOrigins = new Set(
  [CLIENT_URL, isProduction ? undefined : DEV_CLIENT_ORIGIN].filter(
    (origin): origin is string => Boolean(origin)
  )
);
console.log("🌐 Allowed origins:", [...allowedOrigins]);

app.use(
  cors({
    origin: (origin, callback) => callback(null, !origin || allowedOrigins.has(origin)),
    credentials: true,
  })
);

// CSRF: cookies are SameSite=Lax, and on top of that every state-changing API
// call from a browser has to come from our own origin. Browsers always send
// Origin on POST/PUT/PATCH/DELETE; non-browser clients have no cookies to abuse.
app.use("/api", (req, res, next) => {
  if (req.method === "GET" || req.method === "HEAD" || req.method === "OPTIONS") return next();

  const origin = req.get("origin");
  if (!origin) return next();

  const ownOrigin = `${req.protocol}://${req.get("host")}`;
  if (origin === ownOrigin || allowedOrigins.has(origin)) return next();

  console.warn(`🌐 Blocked ${req.method} ${req.originalUrl.split("?")[0]} from origin ${origin}`);
  res.status(403).json({ success: false, error: t(req, "forbiddenOrigin") });
});

// JSON only (no urlencoded parser, so a cross-site HTML form can't post a body).
// 15 MB fits the 10 MB image cap after base64 encoding.
app.use(express.json({ limit: "15mb" }));

// ============= STATIC CLIENT =============

const clientDistPath = path.join(__dirname, "../dist/client");

if (isProduction) {
  if (!fs.existsSync(path.join(clientDistPath, "index.html"))) {
    console.error("❌ No built client at", clientDistPath);
  }

  app.use(
    express.static(clientDistPath, {
      fallthrough: true,
      redirect: false,
      setHeaders: (res, filePath) => {
        // Vite fingerprints everything in assets/, so those files never change
        if (filePath.includes(`${path.sep}assets${path.sep}`)) {
          res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
        }
      },
    })
  );
}

// ============= SESSION AND AUTH =============

app.use(
  session({
    store: sessionStore,
    secret: SESSION_SECRET,
    resave: true,
    saveUninitialized: false,
    proxy: true,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// Session presence on API calls: user id only, never cookies or session contents
app.use("/api", (req, _res, next) => {
  console.log(`🍪 ${req.method} ${req.originalUrl.split("?")[0]} user=${req.user?.id ?? "none"}`);
  next();
});

passport.serializeUser((user: Express.User, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUserById(id);
    if (!user) {
      return done(null, false);
    }

    // Never keep the password hash on req.user
    done(null, {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
    });
  } catch (err) {
    done(err);
  }
});

// ============= ROUTES =============

app.use("/api/auth", createAuthRouter(storage));
app.use("/api/coffees", createCoffeesRouter(storage));
app.use("/api/coffees", createFlavorProfilesRouter(storage));
app.use("/api/feed", createFeedRouter(storage));
app.use("/api/stats", createStatsRouter(storage));

app.get("/api/health", (_req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// Unknown API routes get JSON, not the SPA's index.html
app.use("/api", (req, res) => {
  res.status(404).json({ success: false, error: t(req, "apiNotFound") });
});

// React Router: serve index.html for every other GET (production only)
if (isProduction) {
  app.get("*", (_req, res, next) => {
    res.sendFile(path.join(clientDistPath, "index.html"), (err) => {
      if (err) next(err);
    });
  });
}

// ============= ERRORS =============

app.use(
  (
    err: Error & { status?: number; statusCode?: number; type?: string },
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    if (res.headersSent) {
      return next(err);
    }

    // body-parser errors carry their own status (413 too large, 400 bad JSON)
    const status = err.status ?? err.statusCode ?? 500;
    console.error(
      `❌ [${req.method} ${req.originalUrl.split("?")[0]}] ${status}`,
      status >= 500 ? err : err.message
    );

    let message: string;
    if (err.type === "entity.too.large") message = t(req, "payloadTooLarge");
    else if (status < 500) message = t(req, "invalidData");
    else message = isProduction ? t(req, "internalError") : err.message;

    res.status(status).json({ success: false, error: message });
  }
);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT} (${isProduction ? "production" : "development"})`);
});
