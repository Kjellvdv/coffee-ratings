import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFeedCoffee } from '../hooks/useFeed';

export function FeedDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: coffee, isLoading, error } = useFeedCoffee(parseInt(id || '0'));

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(10)].map((_, i) => (
          <span
            key={i}
            className={`text-2xl ${
              i < rating ? 'text-yellow-500' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando café...</p>
        </div>
      </div>
    );
  }

  if (error || !coffee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error ? (error as Error).message : 'Café no encontrado'}
          </p>
          <button
            onClick={() => navigate('/feed')}
            className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700"
          >
            Volver al Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6">
          <button
            onClick={() => navigate('/feed')}
            className="text-amber-600 hover:text-amber-700 mb-2"
          >
            ← Volver al Feed
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* User Info */}
          <div className="bg-amber-50 p-4 sm:p-6 border-b border-amber-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">Valorado por</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">
                  {coffee.user.displayName}
                </p>
                <p className="text-sm sm:text-base text-gray-500">@{coffee.user.username}</p>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">
                {new Date(coffee.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Image */}
          {coffee.image && (
            <div className="relative h-64 sm:h-96 bg-gray-200">
              <img
                src={coffee.image}
                alt={coffee.name}
                className="w-full h-full object-cover"
              />
              {coffee.color && (
                <div
                  className="absolute top-4 right-4 w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-white shadow-lg"
                  style={{ backgroundColor: coffee.color }}
                />
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-4 sm:p-6">
            {/* Coffee Name */}
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
              {coffee.name}
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-6">por {coffee.roaster}</p>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {coffee.origin && (
                <div>
                  <p className="text-sm text-gray-500">Origen</p>
                  <p className="font-medium text-gray-900">{coffee.origin}</p>
                </div>
              )}
              {coffee.roastLevel && (
                <div>
                  <p className="text-sm text-gray-500">Nivel de Tueste</p>
                  <p className="font-medium text-gray-900">{coffee.roastLevel}</p>
                </div>
              )}
              {coffee.processingMethod && (
                <div>
                  <p className="text-sm text-gray-500">Método de Proceso</p>
                  <p className="font-medium text-gray-900">
                    {coffee.processingMethod}
                  </p>
                </div>
              )}
              {coffee.price && (
                <div>
                  <p className="text-sm text-gray-500">Precio</p>
                  <p className="font-medium text-gray-900">${coffee.price}</p>
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">Valoración General</p>
              <div className="overflow-x-auto">{renderStars(coffee.rating)}</div>
              <p className="text-2xl sm:text-3xl font-bold text-amber-600 mt-2">
                {coffee.rating} / 10
              </p>
            </div>

            {/* Flavor Profile */}
            {coffee.flavorProfile && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Perfil de Sabor
                </h2>

                {/* Calculated Profile */}
                {coffee.flavorProfile.calculatedFlavorProfile && (
                  <div className="mb-6">
                    <span className="inline-block bg-amber-100 text-amber-800 text-lg font-medium px-4 py-2 rounded-full">
                      {coffee.flavorProfile.calculatedFlavorProfile}
                    </span>
                  </div>
                )}

                {/* Flavor Notes */}
                {coffee.flavorProfile.flavorNotes &&
                  coffee.flavorProfile.flavorNotes.length > 0 && (
                    <div className="mb-6">
                      <p className="font-medium text-gray-900 mb-2">
                        Notas de Sabor:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {coffee.flavorProfile.flavorNotes.map((note) => (
                          <span
                            key={note}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full"
                          >
                            {note}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                {/* Detailed Scores */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {coffee.flavorProfile.strengthIntensity && (
                    <div>
                      <p className="text-sm text-gray-500">Fuerza</p>
                      <p className="font-medium">
                        {coffee.flavorProfile.strengthIntensity}/5
                      </p>
                    </div>
                  )}
                  {coffee.flavorProfile.aromaIntensity && (
                    <div>
                      <p className="text-sm text-gray-500">Aroma</p>
                      <p className="font-medium">
                        {coffee.flavorProfile.aromaIntensity}/5
                      </p>
                    </div>
                  )}
                  {coffee.flavorProfile.sweetnessLevel && (
                    <div>
                      <p className="text-sm text-gray-500">Dulzura</p>
                      <p className="font-medium">
                        {coffee.flavorProfile.sweetnessLevel}/5
                      </p>
                    </div>
                  )}
                  {coffee.flavorProfile.acidityLevel && (
                    <div>
                      <p className="text-sm text-gray-500">Acidez</p>
                      <p className="font-medium">
                        {coffee.flavorProfile.acidityLevel}/5
                      </p>
                    </div>
                  )}
                  {coffee.flavorProfile.bitternessLevel && (
                    <div>
                      <p className="text-sm text-gray-500">Amargor</p>
                      <p className="font-medium">
                        {coffee.flavorProfile.bitternessLevel}/5
                      </p>
                    </div>
                  )}
                  {coffee.flavorProfile.bodyWeight && (
                    <div>
                      <p className="text-sm text-gray-500">Cuerpo</p>
                      <p className="font-medium">
                        {coffee.flavorProfile.bodyWeight}/5
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {coffee.description && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">Notas</h2>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {coffee.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
