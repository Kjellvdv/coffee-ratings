import express from "express";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import cors from "cors";
import bcrypt from "bcrypt";
import connectPgSimple from "connect-pg-simple";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";
import { initStorage, getStorage } from "./storage";
import { createAuthRouter } from "./routes/auth";
import { createCoffeesRouter } from "./routes/coffees";
import { createFlavorProfilesRouter } from "./routes/flavor-profiles";
import { createFeedRouter } from "./routes/feed";
import { createStatsRouter } from "./routes/stats";
import type { User } from "@shared/schema";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Pool } = pg;

// Initialize Express app
const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

// Basic health check BEFORE any middleware
app.get('/ping', (req, res) => {
  res.send('pong');
});

// Request logging middleware (BEFORE other middleware)
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);

  // Set a timeout for all requests
  req.setTimeout(30000); // 30 seconds
  res.setTimeout(30000);

  next();
});

// Database connection
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL environment variable is not set");
  process.exit(1);
}

console.log("🔌 Initializing database connection...");

// Initialize storage
const storage = initStorage(DATABASE_URL);

// Session store with error handling
const PgSession = connectPgSimple(session);
const sessionStore = new PgSession({
  pool: new Pool({ connectionString: DATABASE_URL }),
  tableName: "session",
  createTableIfMissing: true,
});

// Listen for session store errors
sessionStore.on('error', (err: Error) => {
  console.error('❌ Session store error:', err);
});

console.log("✅ Database initialization complete");

// Middleware
app.use(
  cors({
    origin: process.env.NODE_ENV === "production"
      ? process.env.CLIENT_URL
      : "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Session configuration
app.use(
  session({
    store: sessionStore,
    secret: process.env.SESSION_SECRET || "your-secret-key-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    },
  })
);

// Passport configuration
app.use(passport.initialize());
app.use(passport.session());

// Passport LocalStrategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      // Find user by username or email
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username);
      }

      if (!user) {
        return done(null, false, { message: "Usuario no encontrado" });
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        return done(null, false, { message: "Contraseña incorrecta" });
      }

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

// Serialize user for session
passport.serializeUser((user: Express.User, done) => {
  done(null, user.id);
});

// Deserialize user from session
passport.deserializeUser(async (id: number, done) => {
  try {
    const user = await storage.getUserById(id);
    if (!user) {
      return done(null, false);
    }

    // Return user without password hash
    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      displayName: user.displayName,
    };

    done(null, safeUser);
  } catch (err) {
    done(err);
  }
});

// Routes
app.use("/api/auth", createAuthRouter(storage));
app.use("/api/coffees", createCoffeesRouter(storage));
app.use("/api/coffees", createFlavorProfilesRouter(storage));
app.use("/api/feed", createFeedRouter(storage));
app.use("/api/stats", createStatsRouter(storage));

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Server is running" });
});

// Serve static files in production
if (process.env.NODE_ENV === "production") {
  const clientDistPath = path.join(__dirname, "../dist/client");

  console.log("📁 Serving static files from:", clientDistPath);

  // Serve static assets with error handling
  app.use(express.static(clientDistPath, {
    fallthrough: true,
    redirect: false
  }));

  // Handle React Router - serve index.html for all non-API routes
  app.get("*", (req, res, next) => {
    const indexPath = path.join(clientDistPath, "index.html");
    console.log("📄 Serving index.html for:", req.path);
    res.sendFile(indexPath, (err) => {
      if (err) {
        console.error("❌ Error serving index.html:", err);
        next(err);
      }
    });
  });
}

// Error handling middleware
app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("❌ Error handler caught:", err);

    // Ensure we haven't already sent a response
    if (res.headersSent) {
      console.log("⚠️ Headers already sent, passing to next error handler");
      return next(err);
    }

    const message =
      process.env.NODE_ENV === "production"
        ? "Error interno del servidor"
        : err.message;

    res.status(500).json({ success: false, error: message });
  }
);

 // Start server                                                                                          
 app.listen(PORT, '0.0.0.0', () => {                                                                      
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || "development"}`);                               
}); 

