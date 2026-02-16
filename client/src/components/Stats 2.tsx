import { useStats } from '../hooks/useStats';

export function Stats() {
  const { data: stats, isLoading, error } = useStats();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        Error al cargar estadísticas
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Total de Cafés</p>
          <p className="text-3xl font-bold text-gray-900">{stats.totalCoffees}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Valoración Promedio</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.averageRating}
            <span className="text-lg text-yellow-500 ml-1">★</span>
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-600">Precio Promedio</p>
          <p className="text-3xl font-bold text-gray-900">
            {stats.averagePrice > 0 ? `$${stats.averagePrice}` : 'N/A'}
          </p>
        </div>
      </div>

      {/* Roast Level Distribution */}
      {Object.keys(stats.roastLevelDistribution).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Distribución por Nivel de Tueste
          </h3>
          <div className="space-y-3">
            {Object.entries(stats.roastLevelDistribution).map(([level, count]) => (
              <div key={level}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">{level}</span>
                  <span className="text-sm text-gray-600">
                    {count} ({Math.round((count / stats.totalCoffees) * 100)}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-amber-600 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${(count / stats.totalCoffees) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
