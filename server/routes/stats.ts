import { Router, Request, Response } from "express";
import type { IStorage } from "../storage";
import { requireAuth } from "../middleware/auth";

export function createStatsRouter(storage: IStorage) {
  const router = Router();

  // All routes require authentication
  router.use(requireAuth);

  /**
   * GET /api/stats
   * Get user's collection statistics
   */
  router.get("/", async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      const stats = await storage.getUserStats(userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      console.error("Error getting stats:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener estadísticas",
      });
    }
  });

  return router;
}
