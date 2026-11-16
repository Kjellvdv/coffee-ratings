import { Router, type Request, type Response } from "express";
import bcrypt from "bcrypt";
import rateLimit from "express-rate-limit";
import { ZodError } from "zod";
import { registerUserSchema, type SafeUser, type User } from "@shared/schema";
import type { IStorage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { t, validationMessage } from "../i18n";

const BCRYPT_ROUNDS = 10;

function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    displayName: user.displayName,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    deletedAt: user.deletedAt,
  };
}

// Failed logins per IP. Successful ones don't count, so a user who typos once isn't locked out.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`⚠️ [auth.login] rate limit hit from ${req.ip}`);
    res.status(429).json({ success: false, error: t(req, "tooManyAttempts") });
  },
});

const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn(`⚠️ [auth.register] rate limit hit from ${req.ip}`);
    res.status(429).json({ success: false, error: t(req, "tooManyAttempts") });
  },
});

export function createAuthRouter(storage: IStorage) {
  const router = Router();

  // Compared against when the user doesn't exist, so a wrong username takes as
  // long as a wrong password and response times don't reveal which accounts exist
  const dummyHash = bcrypt.hashSync("timing-equalizer-not-a-password", BCRYPT_ROUNDS);

  function logIn(req: Request, res: Response, user: User, status: number, route: string) {
    // passport 0.7 regenerates the session id here, which blocks session fixation
    req.login(user, (err) => {
      if (err) {
        console.error(`❌ [${route}] req.login failed for user ${user.id}:`, err);
        return res.status(500).json({ success: false, error: t(req, "loginFailed") });
      }
      console.log(`✅ [${route}] user ${user.id} signed in`);
      res.status(status).json({ success: true, data: toSafeUser(user) });
    });
  }

  /**
   * POST /api/auth/register
   * Register a new user
   */
  router.post("/register", registerLimiter, async (req: Request, res: Response) => {
    try {
      const { username, email, displayName, password } = registerUserSchema.parse(req.body);

      if (await storage.getUserByUsername(username)) {
        return res.status(409).json({ success: false, error: t(req, "usernameTaken") });
      }

      if (await storage.getUserByEmail(email)) {
        return res.status(409).json({ success: false, error: t(req, "emailTaken") });
      }

      const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
      const user = await storage.createUser({ username, email, displayName, passwordHash });
      console.log(`📝 [auth.register] created user ${user.id}`);

      logIn(req, res, user, 201, "auth.register");
    } catch (error) {
      if (error instanceof ZodError) {
        console.warn(
          "⚠️ [auth.register] validation failed on",
          error.issues.map((i) => i.path.join(".")).join(", ")
        );
        return res.status(400).json({
          success: false,
          error: validationMessage(req, error),
          details: error.issues,
        });
      }

      console.error("❌ [auth.register]", error);
      res.status(500).json({ success: false, error: t(req, "internalError") });
    }
  });

  /**
   * POST /api/auth/login
   * Login with username/email and password
   */
  router.post("/login", loginLimiter, async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body ?? {};

      if (typeof username !== "string" || typeof password !== "string" || !username || !password) {
        return res.status(400).json({ success: false, error: t(req, "credentialsRequired") });
      }

      const user =
        (await storage.getUserByUsername(username)) ?? (await storage.getUserByEmail(username));

      const validPassword = await bcrypt.compare(password, user?.passwordHash ?? dummyHash);

      if (!user || !validPassword) {
        console.warn("🔑 [auth.login] failed sign-in attempt");
        return res.status(401).json({ success: false, error: t(req, "invalidCredentials") });
      }

      logIn(req, res, user, 200, "auth.login");
    } catch (error) {
      console.error("❌ [auth.login]", error);
      res.status(500).json({ success: false, error: t(req, "internalError") });
    }
  });

  /**
   * POST /api/auth/logout
   * Logout current user
   */
  router.post("/logout", (req: Request, res: Response) => {
    const userId = req.user?.id;
    req.logout((err) => {
      if (err) {
        console.error("❌ [auth.logout]", err);
        return res.status(500).json({ success: false, error: t(req, "logoutFailed") });
      }
      console.log(`🔑 [auth.logout] user ${userId ?? "unknown"} signed out`);
      res.json({ success: true });
    });
  });

  /**
   * GET /api/auth/me
   * Get current user
   */
  router.get("/me", requireAuth, (req: Request, res: Response) => {
    const user = req.user!;
    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        displayName: user.displayName,
      },
    });
  });

  return router;
}
