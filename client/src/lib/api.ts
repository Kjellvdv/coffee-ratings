import type {
  Coffee,
  NewCoffee,
  UpdateCoffee,
  CoffeeWithDetails,
  FlavorProfile,
  NewFlavorProfile,
} from '@shared/schema';
import { getLang, translate } from '../i18n';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: unknown;
}

/**
 * fetch with the session cookie and the UI language, so server error
 * messages come back in the language picked in the toggle.
 */
export function apiFetch(url: string, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  headers.set('Accept-Language', getLang());
  return fetch(url, { credentials: 'include', ...init, headers });
}

export async function readError(response: Response): Promise<string> {
  try {
    const data: ApiResponse<unknown> = await response.json();
    if (data.error) return data.error;
  } catch {
    // Not JSON: a proxy error page, for instance
  }
  return translate('common.serverError', { status: response.status });
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await readError(response));
  }

  const data: ApiResponse<T> = await response.json();
  if (!data.success) {
    throw new Error(data.error || translate('common.serverError', { status: response.status }));
  }

  return data.data as T;
}

function jsonInit(method: string, body: unknown): RequestInit {
  return {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
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
  const response = await apiFetch(`/api/coffees${queryString ? `?${queryString}` : ''}`);
  return handleResponse<CoffeeWithDetails[]>(response);
}

export async function getCoffee(id: number): Promise<CoffeeWithDetails> {
  return handleResponse<CoffeeWithDetails>(await apiFetch(`/api/coffees/${id}`));
}

export async function createCoffee(coffee: NewCoffee): Promise<Coffee> {
  return handleResponse<Coffee>(await apiFetch('/api/coffees', jsonInit('POST', coffee)));
}

export async function updateCoffee(id: number, coffee: UpdateCoffee): Promise<Coffee> {
  return handleResponse<Coffee>(await apiFetch(`/api/coffees/${id}`, jsonInit('PUT', coffee)));
}

export async function duplicateCoffee(id: number): Promise<Coffee> {
  return handleResponse<Coffee>(await apiFetch(`/api/coffees/${id}/duplicate`, { method: 'POST' }));
}

export async function deleteCoffee(id: number): Promise<void> {
  const response = await apiFetch(`/api/coffees/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(await readError(response));
  }
}

export async function createFlavorProfile(
  coffeeId: number,
  profile: Omit<NewFlavorProfile, 'coffeeId'>
): Promise<FlavorProfile> {
  return handleResponse<FlavorProfile>(
    await apiFetch(`/api/coffees/${coffeeId}/profile`, jsonInit('POST', profile))
  );
}

// ============= FEED API =============

export async function getFeed(limit: number = 20, offset: number = 0): Promise<CoffeeWithDetails[]> {
  return handleResponse<CoffeeWithDetails[]>(
    await apiFetch(`/api/feed?limit=${limit}&offset=${offset}`)
  );
}

export async function getFeedCoffee(id: number): Promise<CoffeeWithDetails> {
  return handleResponse<CoffeeWithDetails>(await apiFetch(`/api/feed/${id}`));
}

export async function getMyMatches(feedCoffeeId: number): Promise<CoffeeWithDetails[]> {
  return handleResponse<CoffeeWithDetails[]>(await apiFetch(`/api/feed/${feedCoffeeId}/my-matches`));
}

export async function getUserCoffees(userId: number): Promise<CoffeeWithDetails[]> {
  return handleResponse<CoffeeWithDetails[]>(await apiFetch(`/api/feed/users/${userId}/coffees`));
}

// ============= STATS API =============

export interface UserStats {
  totalCoffees: number;
  averageRating: number;
  averagePrice: number;
  roastLevelDistribution: Record<string, number>;
}

export async function getStats(): Promise<UserStats> {
  return handleResponse<UserStats>(await apiFetch('/api/stats'));
}
