import type { Coffee, NewCoffee, UpdateCoffee, CoffeeWithDetails } from '@shared/schema';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: any;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const data: ApiResponse<T> = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Error en la solicitud');
  }

  return data.data as T;
}

// ============= COFFEES API =============

export async function getCoffees(filters?: {
  search?: string;
  roastLevel?: string;
  minRating?: number;
  maxRating?: number;
  sortBy?: string;
  sortOrder?: string;
}): Promise<CoffeeWithDetails[]> {
  const params = new URLSearchParams();

  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        params.append(key, String(value));
      }
    });
  }

  const queryString = params.toString();
  const url = `/api/coffees${queryString ? `?${queryString}` : ''}`;

  const response = await fetch(url, {
    credentials: 'include',
  });

  return handleResponse<CoffeeWithDetails[]>(response);
}

export async function getCoffee(id: number): Promise<CoffeeWithDetails> {
  const response = await fetch(`/api/coffees/${id}`, {
    credentials: 'include',
  });

  return handleResponse<CoffeeWithDetails>(response);
}

export async function createCoffee(coffee: NewCoffee): Promise<Coffee> {
  const response = await fetch('/api/coffees', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(coffee),
  });

  return handleResponse<Coffee>(response);
}

export async function updateCoffee(id: number, coffee: UpdateCoffee): Promise<Coffee> {
  const response = await fetch(`/api/coffees/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(coffee),
  });

  return handleResponse<Coffee>(response);
}

export async function deleteCoffee(id: number): Promise<void> {
  const response = await fetch(`/api/coffees/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Error al eliminar café');
  }
}

// ============= FEED API =============

export async function getFeed(limit: number = 20, offset: number = 0): Promise<CoffeeWithDetails[]> {
  const response = await fetch(`/api/feed?limit=${limit}&offset=${offset}`, {
    credentials: 'include',
  });

  return handleResponse<CoffeeWithDetails[]>(response);
}

export async function getFeedCoffee(id: number): Promise<CoffeeWithDetails> {
  const response = await fetch(`/api/feed/${id}`, {
    credentials: 'include',
  });

  return handleResponse<CoffeeWithDetails>(response);
}

export async function getUserCoffees(userId: number): Promise<CoffeeWithDetails[]> {
  const response = await fetch(`/api/feed/users/${userId}/coffees`, {
    credentials: 'include',
  });

  return handleResponse<CoffeeWithDetails[]>(response);
}

// ============= STATS API =============

export interface UserStats {
  totalCoffees: number;
  averageRating: number;
  averagePrice: number;
  roastLevelDistribution: Record<string, number>;
}

export async function getStats(): Promise<UserStats> {
  const response = await fetch('/api/stats', {
    credentials: 'include',
  });

  return handleResponse<UserStats>(response);
}
