import { Router, Request, Response } from "express";
import type { IStorage } from "../storage";
import { requireAuth } from "../middleware/auth";

export function createFeedRouter(storage: IStorage) {
  const router = Router();

  // All routes require authentication
  router.use(requireAuth);

  /**
   * GET /api/feed
   * Get public coffees from all users (social feed)
   */
  router.get("/", async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const limit = parseInt((req.query.limit as string) || "20");
      const offset = parseInt((req.query.offset as string) || "0");

      // Validate pagination params
      if (limit < 1 || limit > 100) {
        return res.status(400).json({
          success: false,
          error: "El límite debe estar entre 1 y 100",
        });
      }

      if (offset < 0) {
        return res.status(400).json({
          success: false,
          error: "El offset no puede ser negativo",
        });
      }

      const coffees = await storage.getFeedCoffees(userId, limit, offset);

      res.json({
        success: true,
        data: coffees,
        pagination: {
          limit,
          offset,
          hasMore: coffees.length === limit,
        },
      });
    } catch (error) {
      console.error("Error getting feed:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener el feed",
      });
    }
  });

  /**
   * GET /api/feed/:id
   * Get single public coffee from feed
   */
  router.get("/:id", async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const coffeeId = parseInt(req.params.id);

      if (isNaN(coffeeId)) {
        return res.status(400).json({
          success: false,
          error: "ID de café inválido",
        });
      }

      const coffee = await storage.getCoffee(coffeeId, userId);

      if (!coffee) {
        return res.status(404).json({
          success: false,
          error: "Café no encontrado",
        });
      }

      // Only return if public or owned by current user
      if (coffee.isPrivate && coffee.userId !== userId) {
        return res.status(404).json({
          success: false,
          error: "Café no encontrado",
        });
      }

      res.json({ success: true, data: coffee });
    } catch (error) {
      console.error("Error getting feed coffee:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener café",
      });
    }
  });

  /**
   * GET /api/feed/users/:userId/coffees
   * Get public coffees from a specific user
   */
  router.get("/users/:userId/coffees", async (req: Request, res: Response) => {
    try {
      const targetUserId = parseInt(req.params.userId);

      if (isNaN(targetUserId)) {
        return res.status(400).json({
          success: false,
          error: "ID de usuario inválido",
        });
      }

      // Get public coffees from target user
      const coffees = await storage.getCoffees(targetUserId, {
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      // Filter to only public coffees (unless viewing own profile)
      const currentUserId = req.user!.id;
      const publicCoffees =
        targetUserId === currentUserId
          ? coffees
          : coffees.filter((c) => !c.isPrivate);

      res.json({
        success: true,
        data: publicCoffees,
      });
    } catch (error) {
      console.error("Error getting user coffees:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener cafés del usuario",
      });
    }
  });

  return router;
}
