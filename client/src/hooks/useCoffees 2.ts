import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCoffees, getCoffee, createCoffee, updateCoffee, deleteCoffee } from '../lib/api';
import type { NewCoffee, UpdateCoffee } from '@shared/schema';

export function useCoffees(filters?: {
  search?: string;
  roastLevel?: string;
  minRating?: number;
  maxRating?: number;
  sortBy?: string;
  sortOrder?: string;
}) {
  return useQuery({
    queryKey: ['coffees', filters],
    queryFn: () => getCoffees(filters),
  });
}

export function useCoffee(id: number) {
  return useQuery({
    queryKey: ['coffee', id],
    queryFn: () => getCoffee(id),
    enabled: !!id,
  });
}

export function useCreateCoffee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (coffee: NewCoffee) => createCoffee(coffee),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coffees'] });
    },
  });
}

export function useUpdateCoffee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, coffee }: { id: number; coffee: UpdateCoffee }) =>
      updateCoffee(id, coffee),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['coffees'] });
      queryClient.invalidateQueries({ queryKey: ['coffee', variables.id] });
    },
  });
}

export function useDeleteCoffee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCoffee(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['coffees'] });
    },
  });
}
