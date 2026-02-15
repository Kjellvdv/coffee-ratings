import { Router, Request, Response } from "express";
import { insertCoffeeSchema, updateCoffeeSchema } from "@shared/schema";
import type { IStorage } from "../storage";
import { requireAuth } from "../middleware/auth";

export function createCoffeesRouter(storage: IStorage) {
  const router = Router();

  // All routes require authentication
  router.use(requireAuth);

  /**
   * GET /api/coffees
   * Get user's coffees with optional filters
   */
  router.get("/", async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const { search, roastLevel, minRating, maxRating, sortBy, sortOrder } =
        req.query;

      const coffees = await storage.getCoffees(userId, {
        search: search as string,
        roastLevel: roastLevel as string,
        minRating: minRating ? parseInt(minRating as string) : undefined,
        maxRating: maxRating ? parseInt(maxRating as string) : undefined,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
      });

      res.json({ success: true, data: coffees });
    } catch (error) {
      console.error("Error getting coffees:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener cafés",
      });
    }
  });

  /**
   * GET /api/coffees/:id
   * Get single coffee (owner only or public)
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

      // Check if user has access (owner or public)
      if (coffee.userId !== userId && coffee.isPrivate) {
        return res.status(403).json({
          success: false,
          error: "No autorizado",
        });
      }

      res.json({ success: true, data: coffee });
    } catch (error) {
      console.error("Error getting coffee:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener café",
      });
    }
  });

  /**
   * POST /api/coffees
   * Create new coffee
   */
  router.post("/", async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;

      // Validate request body
      const validatedData = insertCoffeeSchema.parse(req.body);

      // Create coffee
      const coffee = await storage.createCoffee({
        ...validatedData,
        userId,
      });

      res.status(201).json({ success: true, data: coffee });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          error: "Datos de validación inválidos",
          details: error.errors,
        });
      }

      console.error("Error creating coffee:", error);
      res.status(500).json({
        success: false,
        error: "Error al crear café",
      });
    }
  });

  /**
   * PUT /api/coffees/:id
   * Update coffee (owner only)
   */
  router.put("/:id", async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const coffeeId = parseInt(req.params.id);

      if (isNaN(coffeeId)) {
        return res.status(400).json({
          success: false,
          error: "ID de café inválido",
        });
      }

      // Check ownership
      const existingCoffee = await storage.getCoffee(coffeeId, userId);
      if (!existingCoffee || existingCoffee.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: "No autorizado",
        });
      }

      // Validate request body
      const validatedData = updateCoffeeSchema.parse(req.body);

      // Update coffee
      const coffee = await storage.updateCoffee(coffeeId, userId, validatedData);

      if (!coffee) {
        return res.status(404).json({
          success: false,
          error: "Café no encontrado",
        });
      }

      res.json({ success: true, data: coffee });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          error: "Datos de validación inválidos",
          details: error.errors,
        });
      }

      console.error("Error updating coffee:", error);
      res.status(500).json({
        success: false,
        error: "Error al actualizar café",
      });
    }
  });

  /**
   * DELETE /api/coffees/:id
   * Soft delete coffee (owner only)
   */
  router.delete("/:id", async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const coffeeId = parseInt(req.params.id);

      if (isNaN(coffeeId)) {
        return res.status(400).json({
          success: false,
          error: "ID de café inválido",
        });
      }

      // Check ownership
      const existingCoffee = await storage.getCoffee(coffeeId, userId);
      if (!existingCoffee || existingCoffee.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: "No autorizado",
        });
      }

      // Delete coffee (soft delete)
      const deleted = await storage.deleteCoffee(coffeeId, userId);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: "Café no encontrado",
        });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Error deleting coffee:", error);
      res.status(500).json({
        success: false,
        error: "Error al eliminar café",
      });
    }
  });

  return router;
}
