import { Router, type Request, type Response } from "express";
import type { IStorage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { t } from "../i18n";

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
      const stats = await storage.getUserStats(req.user!.id);
      res.json({ success: true, data: stats });
    } catch (error) {
      console.error("❌ [stats.get]", error);
      res.status(500).json({ success: false, error: t(req, "loadStatsFailed") });
    }
  });

  return router;
}
