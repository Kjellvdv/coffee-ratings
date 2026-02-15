import { Request, Response, NextFunction } from "express";

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface User {
      id: number;
      username: string;
      email: string;
      displayName: string;
    }
  }
}

/**
 * Middleware to require authentication
 * Returns 401 if user is not authenticated
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({
      success: false,
      error: "Autenticación requerida",
    });
  }
  next();
}

/**
 * Middleware to require ownership of a resource
 * Must be used after requireAuth
 */
export function requireOwnership(resourceType: "coffee") {
  return async (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: "Autenticación requerida",
      });
    }

    const userId = req.user.id;
    const resourceId = parseInt(req.params.id);

    if (isNaN(resourceId)) {
      return res.status(400).json({
        success: false,
        error: "ID de recurso inválido",
      });
    }

    // Ownership check will be done in the route handler
    // This middleware just validates the resource ID
    // The actual ownership check is in storage layer
    next();
  };
}
