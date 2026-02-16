import { Router, Request, Response } from "express";
import bcrypt from "bcrypt";
import { registerUserSchema, type SafeUser } from "@shared/schema";
import type { IStorage } from "../storage";
import { requireAuth } from "../middleware/auth";

export function createAuthRouter(storage: IStorage) {
  const router = Router();

  /**
   * POST /api/auth/register
   * Register a new user
   */
  router.post("/register", async (req: Request, res: Response) => {
    try {
      console.log("📝 Register request body:", req.body);
      console.log("📝 Content-Type:", req.headers['content-type']);

      // Validate request body (includes password validation)
      const validatedData = registerUserSchema.parse(req.body);
      const { username, email, displayName, password } = validatedData;

      // Check if username already exists
      const existingUsername = await storage.getUserByUsername(username);
      if (existingUsername) {
        return res.status(400).json({
          success: false,
          error: "El nombre de usuario ya está en uso",
        });
      }

      // Check if email already exists
      const existingEmail = await storage.getUserByEmail(email);
      if (existingEmail) {
        return res.status(400).json({
          success: false,
          error: "El correo electrónico ya está en uso",
        });
      }

      // Hash password
      const passwordHash = await bcrypt.hash(password, 10);

      // Create user
      const user = await storage.createUser({
        username,
        email,
        displayName,
        passwordHash,
      });

      // Auto-login after registration
      req.login(user, (err) => {
        if (err) {
          console.error("❌ Error logging in after registration:", err);
          return res.status(500).json({
            success: false,
            error: "Error al iniciar sesión",
          });
        }

        // Force session to be recognized as modified
        req.session.touch();

        console.log("✅ User logged in successfully, session ID:", req.sessionID);
        console.log("🍪 Session:", req.session);

        // Return user without password hash
        const safeUser: SafeUser = {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          deletedAt: user.deletedAt,
        };

        res.status(201).json({
          success: true,
          data: safeUser,
        });
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          error: "Datos de validación inválidos",
          details: error.errors,
        });
      }

      console.error("Error creating user:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
    }
  });

  /**
   * POST /api/auth/login
   * Login with username/email and password
   */
  router.post("/login", async (req: Request, res: Response) => {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          error: "Usuario y contraseña son requeridos",
        });
      }

      // Find user by username or email
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username);
      }

      if (!user) {
        return res.status(401).json({
          success: false,
          error: "Usuario o contraseña incorrectos",
        });
      }

      // Check password
      const validPassword = await bcrypt.compare(password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({
          success: false,
          error: "Usuario o contraseña incorrectos",
        });
      }

      // Login user
      req.login(user, (err) => {
        if (err) {
          console.error("❌ Error logging in:", err);
          return res.status(500).json({
            success: false,
            error: "Error al iniciar sesión",
          });
        }

        // Force session to be recognized as modified
        req.session.touch();

        console.log("✅ User logged in successfully, session ID:", req.sessionID);
        console.log("🍪 Session:", req.session);

        // Return user without password hash
        const safeUser: SafeUser = {
          id: user.id,
          username: user.username,
          email: user.email,
          displayName: user.displayName,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          deletedAt: user.deletedAt,
        };

        res.json({
          success: true,
          data: safeUser,
        });
      });
    } catch (error) {
      console.error("Error logging in:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
    }
  });

  /**
   * POST /api/auth/logout
   * Logout current user
   */
  router.post("/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        console.error("Error logging out:", err);
        return res.status(500).json({
          success: false,
          error: "Error al cerrar sesión",
        });
      }

      res.json({
        success: true,
        message: "Sesión cerrada exitosamente",
      });
    });
  });

  /**
   * GET /api/auth/me
   * Get current user
   */
  router.get("/me", requireAuth, (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "No autenticado",
      });
    }

    const safeUser: SafeUser = {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      displayName: req.user.displayName,
      createdAt: new Date(), // Will be populated from session
      updatedAt: new Date(),
      deletedAt: null,
    };

    res.json({
      success: true,
      data: safeUser,
    });
  });

  return router;
}
