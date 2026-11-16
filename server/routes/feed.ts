import { Router, type Request, type Response } from "express";
import type { IStorage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { t } from "../i18n";

function normalizeName(str: string): string {
  return str
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[''`´]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0))
  );
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function isFuzzyNameMatch(a: string, b: string): boolean {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  if (na === nb) return true;
  // Allow up to 2 edits for short names, or 10% of the longer name's length
  const threshold = Math.max(2, Math.floor(Math.max(na.length, nb.length) * 0.1));
  return levenshtein(na, nb) <= threshold;
}

function parseId(raw: string): number | null {
  return /^\d+$/.test(raw) ? Number(raw) : null;
}

export function createFeedRouter(storage: IStorage) {
  const router = Router();

  // All routes require authentication
  router.use(requireAuth);

  /**
   * GET /api/feed
   * Get public coffees from all users (social feed)
   */
  router.get("/", async (req: Request, res: Response) => {
    const limit = Number(req.query.limit ?? 20);
    const offset = Number(req.query.offset ?? 0);

    if (!Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({ success: false, error: t(req, "invalidLimit") });
    }
    if (!Number.isInteger(offset) || offset < 0) {
      return res.status(400).json({ success: false, error: t(req, "invalidOffset") });
    }

    try {
      const coffees = await storage.getFeedCoffees(req.user!.id, limit, offset);
      res.json({
        success: true,
        data: coffees,
        pagination: { limit, offset, hasMore: coffees.length === limit },
      });
    } catch (error) {
      console.error("❌ [feed.list]", error);
      res.status(500).json({ success: false, error: t(req, "loadFeedFailed") });
    }
  });

  /**
   * GET /api/feed/:id
   * Get single public coffee from feed
   */
  router.get("/:id", async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const coffeeId = parseId(req.params.id);
    if (coffeeId === null) {
      return res.status(400).json({ success: false, error: t(req, "invalidCoffeeId") });
    }

    try {
      const coffee = await storage.getCoffee(coffeeId, userId);
      // Only return if public or owned by current user
      if (!coffee || (coffee.isPrivate && coffee.userId !== userId)) {
        return res.status(404).json({ success: false, error: t(req, "coffeeNotFound") });
      }
      res.json({ success: true, data: coffee });
    } catch (error) {
      console.error(`❌ [feed.get] coffee ${coffeeId}`, error);
      res.status(500).json({ success: false, error: t(req, "loadCoffeeFailed") });
    }
  });

  /**
   * GET /api/feed/:id/my-matches
   * Find current user's coffees that fuzzy-match the given feed coffee by name
   */
  router.get("/:id/my-matches", async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const coffeeId = parseId(req.params.id);
    if (coffeeId === null) {
      return res.status(400).json({ success: false, error: t(req, "invalidCoffeeId") });
    }

    try {
      const source = await storage.getCoffee(coffeeId, userId);
      if (!source || (source.isPrivate && source.userId !== userId)) {
        return res.status(404).json({ success: false, error: t(req, "coffeeNotFound") });
      }

      const userCoffees = await storage.getCoffees(userId);
      const matches = userCoffees.filter((c) => isFuzzyNameMatch(c.name, source.name));
      res.json({ success: true, data: matches });
    } catch (error) {
      console.error(`❌ [feed.matches] coffee ${coffeeId}`, error);
      res.status(500).json({ success: false, error: t(req, "findMatchesFailed") });
    }
  });

  /**
   * GET /api/feed/users/:userId/coffees
   * Get public coffees from a specific user
   */
  router.get("/users/:userId/coffees", async (req: Request, res: Response) => {
    const targetUserId = parseId(req.params.userId);
    if (targetUserId === null) {
      return res.status(400).json({ success: false, error: t(req, "invalidUserId") });
    }

    try {
      const coffees = await storage.getCoffees(targetUserId, {
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      // Only public coffees, unless viewing your own profile
      const publicCoffees =
        targetUserId === req.user!.id ? coffees : coffees.filter((c) => !c.isPrivate);

      res.json({ success: true, data: publicCoffees });
    } catch (error) {
      console.error(`❌ [feed.userCoffees] user ${targetUserId}`, error);
      res.status(500).json({ success: false, error: t(req, "loadUserCoffeesFailed") });
    }
  });

  return router;
}
