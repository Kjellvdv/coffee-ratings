import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCoffees, useDeleteCoffee } from '../hooks/useCoffees';
import { CoffeeCard } from '../components/CoffeeCard';
import { Stats } from '../components/Stats';
import { SearchBar } from '../components/SearchBar';
import { FilterControls } from '../components/FilterControls';
import { ExportMenu } from '../components/ExportMenu';
import type { CoffeeWithDetails } from '@shared/schema';

export function MyCollection() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [search, setSearch] = useState('');
  const [roastLevel, setRoastLevel] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const { data: coffees, isLoading, error } = useCoffees({
    search,
    roastLevel: roastLevel || undefined,
    sortBy,
    sortOrder,
  });

  const deleteMutation = useDeleteCoffee();

  const handleDelete = async (id: number) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este café?')) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error: any) {
        alert(error.message || 'Error al eliminar café');
      }
    }
  };

  const handleEdit = (coffee: CoffeeWithDetails) => {
    // TODO: Implement edit functionality later
    alert('Funcionalidad de edición próximamente');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                ☕ Mi Colección
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Bienvenido, {user?.displayName}
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
              <ExportMenu coffees={coffees || []} />
              <Link
                to="/feed"
                className="bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-md hover:bg-gray-300 text-sm sm:text-base"
              >
                Ver Comunidad
              </Link>
              <button
                onClick={() => navigate('/add-coffee')}
                className="bg-amber-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-amber-700 text-sm sm:text-base"
              >
                + Agregar Café
              </button>
              <button
                onClick={logout}
                className="bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-md hover:bg-gray-300 text-sm sm:text-base"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-6">
          <Stats />
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buscar
            </label>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Nombre, tostador, descripción..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtros y Ordenamiento
            </label>
            <FilterControls
              roastLevel={roastLevel}
              onRoastLevelChange={setRoastLevel}
              sortBy={sortBy}
              onSortByChange={setSortBy}
              sortOrder={sortOrder}
              onSortOrderChange={setSortOrder}
            />
          </div>
        </div>

        {/* Coffee Grid */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando cafés...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Error al cargar cafés: {(error as Error).message}
          </div>
        )}

        {coffees && coffees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">
              No tienes cafés en tu colección todavía
            </p>
            <button
              onClick={() => navigate('/add-coffee')}
              className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700"
            >
              Agregar tu Primer Café
            </button>
          </div>
        )}

        {coffees && coffees.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coffees.map((coffee) => (
              <CoffeeCard
                key={coffee.id}
                coffee={coffee}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
