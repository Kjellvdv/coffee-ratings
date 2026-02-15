import { useAuth } from '../context/AuthContext';
import { useFeed } from '../hooks/useFeed';
import { FeedCard } from '../components/FeedCard';
import { Link } from 'react-router-dom';

export function FeedPage() {
  const { user, logout } = useAuth();
  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } = useFeed();

  const allCoffees = data?.pages.flat() || [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                ☕ Comunidad
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                Descubre cafés de otros usuarios
              </p>
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
              <Link
                to="/"
                className="bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-md hover:bg-gray-300 text-sm sm:text-base"
              >
                Mi Colección
              </Link>
              <Link
                to="/add-coffee"
                className="bg-amber-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-amber-700 text-sm sm:text-base"
              >
                + Agregar Café
              </Link>
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
        {/* Welcome Message */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-amber-900">
            👋 <span className="font-medium">Hola, {user?.displayName}!</span>
            {' '}Aquí puedes ver las valoraciones públicas de café de toda la comunidad.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando feed...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Error al cargar el feed: {(error as Error).message}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && allCoffees.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">☕</div>
            <p className="text-gray-600 text-lg mb-2">
              No hay cafés públicos todavía
            </p>
            <p className="text-gray-500 mb-4">
              Sé el primero en compartir tu valoración de café
            </p>
            <Link
              to="/add-coffee"
              className="inline-block bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700"
            >
              Agregar un Café
            </Link>
          </div>
        )}

        {/* Feed Grid */}
        {allCoffees.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allCoffees.map((coffee) => (
                <FeedCard key={coffee.id} coffee={coffee} />
              ))}
            </div>

            {/* Load More Button */}
            {hasNextPage && (
              <div className="text-center mt-8">
                <button
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="bg-amber-600 text-white px-8 py-3 rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isFetchingNextPage ? 'Cargando...' : 'Cargar Más'}
                </button>
              </div>
            )}

            {/* End of Feed */}
            {!hasNextPage && allCoffees.length > 0 && (
              <div className="text-center mt-8 text-gray-500">
                <p>Has visto todos los cafés 🎉</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
