import { Router, Request, Response } from "express";
import { insertFlavorProfileSchema, updateFlavorProfileSchema } from "@shared/schema";
import type { IStorage } from "../storage";
import { requireAuth } from "../middleware/auth";
import { calculateFlavorProfile } from "../utils/flavorProfile";

export function createFlavorProfilesRouter(storage: IStorage) {
  const router = Router();

  // All routes require authentication
  router.use(requireAuth);

  /**
   * GET /api/coffees/:coffeeId/profile
   * Get flavor profile for a coffee
   */
  router.get("/:coffeeId/profile", async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const coffeeId = parseInt(req.params.coffeeId);

      if (isNaN(coffeeId)) {
        return res.status(400).json({
          success: false,
          error: "ID de café inválido",
        });
      }

      // Check if coffee exists and user has access
      const coffee = await storage.getCoffee(coffeeId, userId);
      if (!coffee) {
        return res.status(404).json({
          success: false,
          error: "Café no encontrado",
        });
      }

      // Check ownership for private coffees
      if (coffee.userId !== userId && coffee.isPrivate) {
        return res.status(403).json({
          success: false,
          error: "No autorizado",
        });
      }

      const profile = await storage.getFlavorProfile(coffeeId);

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: "Perfil de sabor no encontrado",
        });
      }

      res.json({ success: true, data: profile });
    } catch (error) {
      console.error("Error getting flavor profile:", error);
      res.status(500).json({
        success: false,
        error: "Error al obtener perfil de sabor",
      });
    }
  });

  /**
   * POST /api/coffees/:coffeeId/profile
   * Create flavor profile for a coffee
   */
  router.post("/:coffeeId/profile", async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const coffeeId = parseInt(req.params.coffeeId);

      if (isNaN(coffeeId)) {
        return res.status(400).json({
          success: false,
          error: "ID de café inválido",
        });
      }

      // Check if coffee exists and user owns it
      const coffee = await storage.getCoffee(coffeeId, userId);
      if (!coffee || coffee.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: "No autorizado",
        });
      }

      // Check if profile already exists
      const existingProfile = await storage.getFlavorProfile(coffeeId);
      if (existingProfile) {
        return res.status(400).json({
          success: false,
          error: "El perfil de sabor ya existe. Usa PUT para actualizar.",
        });
      }

      // Validate request body
      const validatedData = insertFlavorProfileSchema.parse({
        ...req.body,
        coffeeId,
      });

      // Calculate flavor profile
      const calculatedProfile = calculateFlavorProfile(validatedData);

      // Create profile with calculated profile name
      const profile = await storage.createFlavorProfile({
        ...validatedData,
        calculatedFlavorProfile: calculatedProfile,
      });

      res.status(201).json({ success: true, data: profile });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          error: "Datos de validación inválidos",
          details: error.errors,
        });
      }

      console.error("Error creating flavor profile:", error);
      res.status(500).json({
        success: false,
        error: "Error al crear perfil de sabor",
      });
    }
  });

  /**
   * PUT /api/coffees/:coffeeId/profile
   * Update flavor profile for a coffee
   */
  router.put("/:coffeeId/profile", async (req: Request, res: Response) => {
    try {
      const userId = req.user!.id;
      const coffeeId = parseInt(req.params.coffeeId);

      if (isNaN(coffeeId)) {
        return res.status(400).json({
          success: false,
          error: "ID de café inválido",
        });
      }

      // Check if coffee exists and user owns it
      const coffee = await storage.getCoffee(coffeeId, userId);
      if (!coffee || coffee.userId !== userId) {
        return res.status(403).json({
          success: false,
          error: "No autorizado",
        });
      }

      // Validate request body
      const validatedData = updateFlavorProfileSchema.parse(req.body);

      // Calculate flavor profile if relevant fields are provided
      const calculatedProfile = calculateFlavorProfile(validatedData);

      // Update profile with calculated profile name
      const profile = await storage.updateFlavorProfile(coffeeId, {
        ...validatedData,
        calculatedFlavorProfile: calculatedProfile,
      });

      if (!profile) {
        return res.status(404).json({
          success: false,
          error: "Perfil de sabor no encontrado",
        });
      }

      res.json({ success: true, data: profile });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          error: "Datos de validación inválidos",
          details: error.errors,
        });
      }

      console.error("Error updating flavor profile:", error);
      res.status(500).json({
        success: false,
        error: "Error al actualizar perfil de sabor",
      });
    }
  });

  return router;
}
