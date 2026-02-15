import { drizzle } from "drizzle-orm/node-postgres";
import { eq, and, isNull, desc, like, or, sql } from "drizzle-orm";
import pg from "pg";
import {
  users,
  coffees,
  flavorProfiles,
  type User,
  type InsertUser,
  type Coffee,
  type NewCoffee,
  type UpdateCoffee,
  type FlavorProfile,
  type NewFlavorProfile,
  type UpdateFlavorProfile,
  type CoffeeWithDetails,
} from "@shared/schema";

const { Pool } = pg;

/**
 * Storage interface - abstract data access layer
 */
export interface IStorage {
  // Users
  getUserById(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Coffees
  getCoffees(
    userId: number,
    filters?: CoffeeFilters
  ): Promise<CoffeeWithDetails[]>;
  getCoffee(id: number, userId?: number): Promise<CoffeeWithDetails | undefined>;
  createCoffee(coffee: NewCoffee & { userId: number }): Promise<Coffee>;
  updateCoffee(
    id: number,
    userId: number,
    coffee: UpdateCoffee
  ): Promise<Coffee | undefined>;
  deleteCoffee(id: number, userId: number): Promise<boolean>;

  // Flavor profiles
  getFlavorProfile(coffeeId: number): Promise<FlavorProfile | undefined>;
  createFlavorProfile(profile: NewFlavorProfile): Promise<FlavorProfile>;
  updateFlavorProfile(
    coffeeId: number,
    profile: UpdateFlavorProfile
  ): Promise<FlavorProfile | undefined>;

  // Social feed
  getFeedCoffees(
    currentUserId: number,
    limit: number,
    offset: number
  ): Promise<CoffeeWithDetails[]>;

  // Stats
  getUserStats(userId: number): Promise<UserStats>;
}

export interface CoffeeFilters {
  search?: string;
  roastLevel?: string;
  minRating?: number;
  maxRating?: number;
  sortBy?: "createdAt" | "rating" | "name" | "price";
  sortOrder?: "asc" | "desc";
}

export interface UserStats {
  totalCoffees: number;
  averageRating: number;
  averagePrice: number;
  roastLevelDistribution: Record<string, number>;
}

/**
 * PostgreSQL implementation of IStorage
 */
export class DbStorage implements IStorage {
  private db: ReturnType<typeof drizzle>;

  constructor(connectionString: string) {
    const pool = new Pool({ connectionString });
    this.db = drizzle(pool);
  }

  // ============= USERS =============

  async getUserById(id: number): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(and(eq(users.id, id), isNull(users.deletedAt)))
      .limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(and(eq(users.username, username), isNull(users.deletedAt)))
      .limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await this.db
      .select()
      .from(users)
      .where(and(eq(users.email, email), isNull(users.deletedAt)))
      .limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await this.db.insert(users).values(user).returning();
    return result[0];
  }

  // ============= COFFEES =============

  async getCoffees(
    userId: number,
    filters?: CoffeeFilters
  ): Promise<CoffeeWithDetails[]> {
    let query = this.db
      .select({
        coffee: coffees,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
        },
        flavorProfile: flavorProfiles,
      })
      .from(coffees)
      .leftJoin(users, eq(coffees.userId, users.id))
      .leftJoin(flavorProfiles, eq(coffees.id, flavorProfiles.coffeeId))
      .where(and(eq(coffees.userId, userId), isNull(coffees.deletedAt)));

    // Apply filters
    if (filters?.search) {
      query = query.where(
        or(
          like(coffees.name, `%${filters.search}%`),
          like(coffees.roaster, `%${filters.search}%`),
          like(coffees.description, `%${filters.search}%`)
        )
      );
    }

    if (filters?.roastLevel) {
      query = query.where(eq(coffees.roastLevel, filters.roastLevel));
    }

    if (filters?.minRating !== undefined) {
      query = query.where(sql`${coffees.rating} >= ${filters.minRating}`);
    }

    if (filters?.maxRating !== undefined) {
      query = query.where(sql`${coffees.rating} <= ${filters.maxRating}`);
    }

    // Apply sorting
    const sortBy = filters?.sortBy || "createdAt";
    const sortOrder = filters?.sortOrder || "desc";

    if (sortOrder === "desc") {
      query = query.orderBy(desc(coffees[sortBy]));
    } else {
      query = query.orderBy(coffees[sortBy]);
    }

    const results = await query;

    return results.map((r) => ({
      ...r.coffee,
      user: r.user!,
      flavorProfile: r.flavorProfile,
    }));
  }

  async getCoffee(id: number, userId?: number): Promise<CoffeeWithDetails | undefined> {
    const result = await this.db
      .select({
        coffee: coffees,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
        },
        flavorProfile: flavorProfiles,
      })
      .from(coffees)
      .leftJoin(users, eq(coffees.userId, users.id))
      .leftJoin(flavorProfiles, eq(coffees.id, flavorProfiles.coffeeId))
      .where(and(eq(coffees.id, id), isNull(coffees.deletedAt)))
      .limit(1);

    if (!result[0]) return undefined;

    const coffee = result[0];

    // If userId provided and coffee is private, only return if owner
    if (coffee.coffee.isPrivate && userId && coffee.coffee.userId !== userId) {
      return undefined;
    }

    return {
      ...coffee.coffee,
      user: coffee.user!,
      flavorProfile: coffee.flavorProfile,
    };
  }

  async createCoffee(coffee: NewCoffee & { userId: number }): Promise<Coffee> {
    const result = await this.db.insert(coffees).values(coffee).returning();
    return result[0];
  }

  async updateCoffee(
    id: number,
    userId: number,
    coffee: UpdateCoffee
  ): Promise<Coffee | undefined> {
    const result = await this.db
      .update(coffees)
      .set({ ...coffee, updatedAt: new Date() })
      .where(and(eq(coffees.id, id), eq(coffees.userId, userId)))
      .returning();
    return result[0];
  }

  async deleteCoffee(id: number, userId: number): Promise<boolean> {
    const result = await this.db
      .update(coffees)
      .set({ deletedAt: new Date() })
      .where(and(eq(coffees.id, id), eq(coffees.userId, userId)))
      .returning();
    return result.length > 0;
  }

  // ============= FLAVOR PROFILES =============

  async getFlavorProfile(coffeeId: number): Promise<FlavorProfile | undefined> {
    const result = await this.db
      .select()
      .from(flavorProfiles)
      .where(eq(flavorProfiles.coffeeId, coffeeId))
      .limit(1);
    return result[0];
  }

  async createFlavorProfile(profile: NewFlavorProfile): Promise<FlavorProfile> {
    const result = await this.db
      .insert(flavorProfiles)
      .values(profile)
      .returning();
    return result[0];
  }

  async updateFlavorProfile(
    coffeeId: number,
    profile: UpdateFlavorProfile
  ): Promise<FlavorProfile | undefined> {
    const result = await this.db
      .update(flavorProfiles)
      .set({ ...profile, updatedAt: new Date() })
      .where(eq(flavorProfiles.coffeeId, coffeeId))
      .returning();
    return result[0];
  }

  // ============= SOCIAL FEED =============

  async getFeedCoffees(
    currentUserId: number,
    limit: number,
    offset: number
  ): Promise<CoffeeWithDetails[]> {
    const results = await this.db
      .select({
        coffee: coffees,
        user: {
          id: users.id,
          username: users.username,
          displayName: users.displayName,
        },
        flavorProfile: flavorProfiles,
      })
      .from(coffees)
      .leftJoin(users, eq(coffees.userId, users.id))
      .leftJoin(flavorProfiles, eq(coffees.id, flavorProfiles.coffeeId))
      .where(
        and(
          isNull(coffees.deletedAt),
          eq(coffees.isPrivate, false),
          isNull(users.deletedAt)
        )
      )
      .orderBy(desc(coffees.createdAt))
      .limit(limit)
      .offset(offset);

    return results.map((r) => ({
      ...r.coffee,
      user: r.user!,
      flavorProfile: r.flavorProfile,
    }));
  }

  // ============= STATS =============

  async getUserStats(userId: number): Promise<UserStats> {
    const userCoffees = await this.db
      .select()
      .from(coffees)
      .where(and(eq(coffees.userId, userId), isNull(coffees.deletedAt)));

    const totalCoffees = userCoffees.length;
    const averageRating =
      totalCoffees > 0
        ? userCoffees.reduce((sum, c) => sum + c.rating, 0) / totalCoffees
        : 0;

    const coffeesWithPrice = userCoffees.filter((c) => c.price !== null);
    const averagePrice =
      coffeesWithPrice.length > 0
        ? coffeesWithPrice.reduce((sum, c) => sum + (c.price || 0), 0) /
          coffeesWithPrice.length
        : 0;

    const roastLevelDistribution: Record<string, number> = {};
    userCoffees.forEach((c) => {
      if (c.roastLevel) {
        roastLevelDistribution[c.roastLevel] =
          (roastLevelDistribution[c.roastLevel] || 0) + 1;
      }
    });

    return {
      totalCoffees,
      averageRating: Math.round(averageRating * 10) / 10,
      averagePrice: Math.round(averagePrice * 100) / 100,
      roastLevelDistribution,
    };
  }
}

// Export storage instance (will be initialized in server/index.ts)
let storage: IStorage;

export function initStorage(connectionString: string) {
  storage = new DbStorage(connectionString);
  return storage;
}

export function getStorage(): IStorage {
  if (!storage) {
    throw new Error("Storage not initialized");
  }
  return storage;
}
