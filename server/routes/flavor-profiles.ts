import { Router, type Request, type Response } from "express";
import { ZodError } from "zod";
import { insertFlavorProfileSchema, updateFlavorProfileSchema } from "@shared/schema";
import type { IStorage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { calculateFlavorProfile } from "../utils/flavorProfile";
import { t, validationMessage } from "../i18n";

function parseId(raw: string): number | null {
  return /^\d+$/.test(raw) ? Number(raw) : null;
}

export function createFlavorProfilesRouter(storage: IStorage) {
  const router = Router();

  // All routes require authentication
  router.use(requireAuth);

  /**
   * GET /api/coffees/:coffeeId/profile
   * Get flavor profile for a coffee
   */
  router.get("/:coffeeId/profile", async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const coffeeId = parseId(req.params.coffeeId);
    if (coffeeId === null) {
      return res.status(400).json({ success: false, error: t(req, "invalidCoffeeId") });
    }

    try {
      const coffee = await storage.getCoffee(coffeeId, userId);
      if (!coffee || (coffee.isPrivate && coffee.userId !== userId)) {
        return res.status(404).json({ success: false, error: t(req, "coffeeNotFound") });
      }

      const profile = await storage.getFlavorProfile(coffeeId);
      if (!profile) {
        return res.status(404).json({ success: false, error: t(req, "profileNotFound") });
      }

      res.json({ success: true, data: profile });
    } catch (error) {
      console.error(`❌ [profiles.get] coffee ${coffeeId}`, error);
      res.status(500).json({ success: false, error: t(req, "loadProfileFailed") });
    }
  });

  /**
   * POST /api/coffees/:coffeeId/profile
   * Create flavor profile for a coffee
   */
  router.post("/:coffeeId/profile", async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const coffeeId = parseId(req.params.coffeeId);
    if (coffeeId === null) {
      return res.status(400).json({ success: false, error: t(req, "invalidCoffeeId") });
    }

    try {
      const coffee = await storage.getCoffee(coffeeId, userId);
      if (!coffee || coffee.userId !== userId) {
        return res.status(403).json({ success: false, error: t(req, "forbidden") });
      }

      if (await storage.getFlavorProfile(coffeeId)) {
        return res.status(409).json({ success: false, error: t(req, "profileExists") });
      }

      // coffeeId from the URL wins over anything in the body
      const validatedData = insertFlavorProfileSchema.parse({ ...req.body, coffeeId });
      const profile = await storage.createFlavorProfile({
        ...validatedData,
        calculatedFlavorProfile: calculateFlavorProfile(validatedData),
      });

      console.log(`📝 [profiles.create] profile ${profile.id} for coffee ${coffeeId}`);
      res.status(201).json({ success: true, data: profile });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: validationMessage(req, error),
          details: error.issues,
        });
      }
      console.error(`❌ [profiles.create] coffee ${coffeeId}`, error);
      res.status(500).json({ success: false, error: t(req, "createProfileFailed") });
    }
  });

  /**
   * PUT /api/coffees/:coffeeId/profile
   * Update flavor profile for a coffee
   */
  router.put("/:coffeeId/profile", async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const coffeeId = parseId(req.params.coffeeId);
    if (coffeeId === null) {
      return res.status(400).json({ success: false, error: t(req, "invalidCoffeeId") });
    }

    try {
      const coffee = await storage.getCoffee(coffeeId, userId);
      if (!coffee || coffee.userId !== userId) {
        return res.status(403).json({ success: false, error: t(req, "forbidden") });
      }

      const validatedData = updateFlavorProfileSchema.parse(req.body);
      const profile = await storage.updateFlavorProfile(coffeeId, {
        ...validatedData,
        calculatedFlavorProfile: calculateFlavorProfile(validatedData),
      });

      if (!profile) {
        return res.status(404).json({ success: false, error: t(req, "profileNotFound") });
      }

      console.log(`📝 [profiles.update] coffee ${coffeeId}`);
      res.json({ success: true, data: profile });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          success: false,
          error: validationMessage(req, error),
          details: error.issues,
        });
      }
      console.error(`❌ [profiles.update] coffee ${coffeeId}`, error);
      res.status(500).json({ success: false, error: t(req, "updateProfileFailed") });
    }
  });

  return router;
}
