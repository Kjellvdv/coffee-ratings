import { Router, type Request, type Response } from "express";
import { z, ZodError } from "zod";
import { insertCoffeeSchema, updateCoffeeSchema, type NewCoffee } from "@shared/schema";
import type { IStorage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { t, validationMessage } from "../i18n";

const rating = z.coerce.number().int().min(0).max(10);

const listQuerySchema = z.object({
  search: z.string().trim().max(100).optional(),
  roastLevel: z.enum(["Claro", "Medio", "Oscuro"]).optional(),
  minRating: rating.optional(),
  maxRating: rating.optional(),
  sortBy: z.enum(["createdAt", "rating", "name", "price"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

function parseId(raw: string): number | null {
  return /^\d+$/.test(raw) ? Number(raw) : null;
}

export function createCoffeesRouter(storage: IStorage) {
  const router = Router();

  // All routes require authentication
  router.use(requireAuth);

  /**
   * GET /api/coffees
   * Get user's coffees with optional filters
   */
  router.get("/", async (req: Request, res: Response) => {
    const query = listQuerySchema.safeParse(req.query);
    if (!query.success) {
      return res.status(400).json({
        success: false,
        error: t(req, "invalidData"),
        details: query.error.issues,
      });
    }

    try {
      const coffees = await storage.getCoffees(req.user!.id, query.data);
      res.json({ success: true, data: coffees });
    } catch (error) {
      console.error("❌ [coffees.list]", error);
      res.status(500).json({ success: false, error: t(req, "loadCoffeesFailed") });
    }
  });

  /**
   * GET /api/coffees/:id
   * Get single coffee (owner only or public)
   */
  router.get("/:id", async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const coffeeId = parseId(req.params.id);
    if (coffeeId === null) {
      return res.status(400).json({ success: false, error: t(req, "invalidCoffeeId") });
    }

    try {
      const coffee = await storage.getCoffee(coffeeId, userId);
      if (!coffee || (coffee.isPrivate && coffee.userId !== userId)) {
        return res.status(404).json({ success: false, error: t(req, "coffeeNotFound") });
      }
      res.json({ success: true, data: coffee });
    } catch (error) {
      console.error(`❌ [coffees.get] coffee ${coffeeId}`, error);
      res.status(500).json({ success: false, error: t(req, "loadCoffeeFailed") });
    }
  });

  /**
   * POST /api/coffees
   * Create new coffee
   */
  router.post("/", async (req: Request, res: Response) => {
    const userId = req.user!.id;
    try {
      const validatedData = insertCoffeeSchema.parse(req.body);
      const coffee = await storage.createCoffee({ ...validatedData, userId });
      console.log(`📝 [coffees.create] coffee ${coffee.id} for user ${userId}`);
      res.status(201).json({ success: true, data: coffee });
    } catch (error) {
      if (error instanceof ZodError) {
        console.warn("⚠️ [coffees.create] validation failed on", fieldList(error));
        return res.status(400).json({
          success: false,
          error: validationMessage(req, error),
          details: error.issues,
        });
      }
      console.error("❌ [coffees.create]", error);
      res.status(500).json({ success: false, error: t(req, "createCoffeeFailed") });
    }
  });

  /**
   * PUT /api/coffees/:id
   * Update coffee (owner only)
   */
  router.put("/:id", async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const coffeeId = parseId(req.params.id);
    if (coffeeId === null) {
      return res.status(400).json({ success: false, error: t(req, "invalidCoffeeId") });
    }

    try {
      const existingCoffee = await storage.getCoffee(coffeeId, userId);
      if (!existingCoffee || existingCoffee.userId !== userId) {
        return res.status(403).json({ success: false, error: t(req, "forbidden") });
      }

      const validatedData = updateCoffeeSchema.parse(req.body);
      const coffee = await storage.updateCoffee(coffeeId, userId, validatedData);
      if (!coffee) {
        return res.status(404).json({ success: false, error: t(req, "coffeeNotFound") });
      }

      console.log(`📝 [coffees.update] coffee ${coffeeId}`);
      res.json({ success: true, data: coffee });
    } catch (error) {
      if (error instanceof ZodError) {
        console.warn(`⚠️ [coffees.update] coffee ${coffeeId} validation failed on`, fieldList(error));
        return res.status(400).json({
          success: false,
          error: validationMessage(req, error),
          details: error.issues,
        });
      }
      console.error(`❌ [coffees.update] coffee ${coffeeId}`, error);
      res.status(500).json({ success: false, error: t(req, "updateCoffeeFailed") });
    }
  });

  /**
   * POST /api/coffees/:id/duplicate
   * Copy a public coffee's general info into the current user's collection
   */
  router.post("/:id/duplicate", async (req: Request, res: Response) => {
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

      const coffee = await storage.createCoffee({
        userId,
        name: source.name,
        roaster: source.roaster,
        origin: source.origin ?? undefined,
        roastLevel: (source.roastLevel ?? undefined) as NewCoffee["roastLevel"],
        processingMethod: (source.processingMethod ?? undefined) as NewCoffee["processingMethod"],
        beansMix: (source.beansMix ?? undefined) as NewCoffee["beansMix"],
        website: source.website ?? undefined,
        color: source.color ?? undefined,
        image: source.image ?? undefined,
        rating: 0,
        isPrivate: false,
      });

      console.log(`📝 [coffees.duplicate] coffee ${coffeeId} copied as ${coffee.id} for user ${userId}`);
      res.status(201).json({ success: true, data: coffee });
    } catch (error) {
      console.error(`❌ [coffees.duplicate] coffee ${coffeeId}`, error);
      res.status(500).json({ success: false, error: t(req, "duplicateCoffeeFailed") });
    }
  });

  /**
   * DELETE /api/coffees/:id
   * Soft delete coffee (owner only)
   */
  router.delete("/:id", async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const coffeeId = parseId(req.params.id);
    if (coffeeId === null) {
      return res.status(400).json({ success: false, error: t(req, "invalidCoffeeId") });
    }

    try {
      const existingCoffee = await storage.getCoffee(coffeeId, userId);
      if (!existingCoffee || existingCoffee.userId !== userId) {
        return res.status(403).json({ success: false, error: t(req, "forbidden") });
      }

      const deleted = await storage.deleteCoffee(coffeeId, userId);
      if (!deleted) {
        return res.status(404).json({ success: false, error: t(req, "coffeeNotFound") });
      }

      console.log(`📝 [coffees.delete] coffee ${coffeeId} soft-deleted`);
      res.status(204).send();
    } catch (error) {
      console.error(`❌ [coffees.delete] coffee ${coffeeId}`, error);
      res.status(500).json({ success: false, error: t(req, "deleteCoffeeFailed") });
    }
  });

  return router;
}

function fieldList(error: ZodError): string {
  return error.issues.map((i) => i.path.join(".")).join(", ");
}
