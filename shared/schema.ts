import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  real,
  boolean,
  jsonb,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// ============= USERS TABLE =============
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

// ============= COFFEES TABLE =============
export const coffees = pgTable("coffees", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),

  // Basic info
  name: text("name").notNull(),
  roaster: text("roaster").notNull(),
  origin: text("origin"),
  roastLevel: text("roast_level"), // Claro, Medio, Oscuro
  processingMethod: text("processing_method"), // Lavado, Natural, Honey
  price: real("price"),

  // Visual
  color: text("color"),
  image: text("image"),

  // Freeform notes
  description: text("description"),

  // Simple 0-10 rating (overall satisfaction)
  rating: integer("rating").default(0).notNull(),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),

  // Privacy
  isPrivate: boolean("is_private").default(false).notNull(),
});

// ============= FLAVOR PROFILES TABLE =============
export const flavorProfiles = pgTable("flavor_profiles", {
  id: serial("id").primaryKey(),
  coffeeId: integer("coffee_id")
    .notNull()
    .references(() => coffees.id)
    .unique(),

  // Intensity questions (1-5 scale)
  strengthIntensity: integer("strength_intensity"),
  aromaIntensity: integer("aroma_intensity"),

  // Taste profile questions (1-5 scale)
  sweetnessLevel: integer("sweetness_level"),
  acidityLevel: integer("acidity_level"),
  bitternessLevel: integer("bitterness_level"),

  // Body/Mouthfeel (1-5 scale)
  bodyWeight: integer("body_weight"),

  // Aftertaste (1-5 scale)
  aftertasteLength: integer("aftertaste_length"),
  aftertastePleasant: integer("aftertaste_pleasant"),

  // Flavor notes (multi-select stored as JSONB array)
  flavorNotes: jsonb("flavor_notes").$type<string[]>(),

  // Calculated profile (in Spanish)
  calculatedFlavorProfile: text("calculated_flavor_profile"),

  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============= RELATIONS =============
export const usersRelations = relations(users, ({ many }) => ({
  coffees: many(coffees),
}));

export const coffeesRelations = relations(coffees, ({ one }) => ({
  user: one(users, {
    fields: [coffees.userId],
    references: [users.id],
  }),
  flavorProfile: one(flavorProfiles, {
    fields: [coffees.id],
    references: [flavorProfiles.coffeeId],
  }),
}));

export const flavorProfilesRelations = relations(flavorProfiles, ({ one }) => ({
  coffee: one(coffees, {
    fields: [flavorProfiles.coffeeId],
    references: [coffees.id],
  }),
}));

// ============= ZOD SCHEMAS =============

// User schemas
export const insertUserSchema = createInsertSchema(users, {
  username: z
    .string()
    .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
    .max(30, "El nombre de usuario no puede exceder 30 caracteres")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "El nombre de usuario solo puede contener letras, números y guiones bajos"
    ),
  email: z.string().email("Correo electrónico inválido"),
  displayName: z
    .string()
    .min(1, "El nombre para mostrar es requerido")
    .max(100, "El nombre para mostrar no puede exceder 100 caracteres"),
  passwordHash: z.string().min(1),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

// Registration schema (accepts password instead of passwordHash)
export const registerUserSchema = insertUserSchema.omit({ passwordHash: true }).extend({
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
});

export const selectUserSchema = createSelectSchema(users);

// Coffee schemas
export const insertCoffeeSchema = createInsertSchema(coffees, {
  name: z
    .string()
    .min(1, "El nombre del café es requerido")
    .max(200, "El nombre no puede exceder 200 caracteres"),
  roaster: z
    .string()
    .min(1, "El tostador es requerido")
    .max(200, "El tostador no puede exceder 200 caracteres"),
  rating: z
    .number()
    .min(0, "La valoración debe ser al menos 0")
    .max(10, "La valoración no puede exceder 10")
    .default(0),
  price: z.number().positive("El precio debe ser positivo").optional(),
  roastLevel: z.enum(["Claro", "Medio", "Oscuro"]).optional(),
  processingMethod: z.enum(["Lavado", "Natural", "Honey"]).optional(),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Color hex inválido").optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  deletedAt: true,
});

export const updateCoffeeSchema = insertCoffeeSchema.partial();
export const selectCoffeeSchema = createSelectSchema(coffees);

// Flavor profile schemas
export const insertFlavorProfileSchema = createInsertSchema(flavorProfiles, {
  strengthIntensity: z
    .number()
    .min(1, "El valor debe estar entre 1 y 5")
    .max(5, "El valor debe estar entre 1 y 5")
    .optional(),
  aromaIntensity: z
    .number()
    .min(1, "El valor debe estar entre 1 y 5")
    .max(5, "El valor debe estar entre 1 y 5")
    .optional(),
  sweetnessLevel: z
    .number()
    .min(1, "El valor debe estar entre 1 y 5")
    .max(5, "El valor debe estar entre 1 y 5")
    .optional(),
  acidityLevel: z
    .number()
    .min(1, "El valor debe estar entre 1 y 5")
    .max(5, "El valor debe estar entre 1 y 5")
    .optional(),
  bitternessLevel: z
    .number()
    .min(1, "El valor debe estar entre 1 y 5")
    .max(5, "El valor debe estar entre 1 y 5")
    .optional(),
  bodyWeight: z
    .number()
    .min(1, "El valor debe estar entre 1 y 5")
    .max(5, "El valor debe estar entre 1 y 5")
    .optional(),
  aftertasteLength: z
    .number()
    .min(1, "El valor debe estar entre 1 y 5")
    .max(5, "El valor debe estar entre 1 y 5")
    .optional(),
  aftertastePleasant: z
    .number()
    .min(1, "El valor debe estar entre 1 y 5")
    .max(5, "El valor debe estar entre 1 y 5")
    .optional(),
  flavorNotes: z.array(z.string()).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateFlavorProfileSchema = insertFlavorProfileSchema.partial();
export const selectFlavorProfileSchema = createSelectSchema(flavorProfiles);

// ============= TYPESCRIPT TYPES =============

export type User = typeof users.$inferSelect;
export type NewUser = z.infer<typeof insertUserSchema>;
export type InsertUser = z.infer<typeof insertUserSchema> & { passwordHash: string };

export type Coffee = typeof coffees.$inferSelect;
export type NewCoffee = z.infer<typeof insertCoffeeSchema>;
export type UpdateCoffee = z.infer<typeof updateCoffeeSchema>;

export type FlavorProfile = typeof flavorProfiles.$inferSelect;
export type NewFlavorProfile = z.infer<typeof insertFlavorProfileSchema>;
export type UpdateFlavorProfile = z.infer<typeof updateFlavorProfileSchema>;

// Combined type for coffee with user and profile
export type CoffeeWithDetails = Coffee & {
  user: Pick<User, "id" | "username" | "displayName">;
  flavorProfile: FlavorProfile | null;
};

// User without sensitive data
export type SafeUser = Omit<User, "passwordHash">;
