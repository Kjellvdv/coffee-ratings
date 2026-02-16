import { Link } from 'react-router-dom';
import type { CoffeeWithDetails } from '@shared/schema';

interface FeedCardProps {
  coffee: CoffeeWithDetails;
}

export function FeedCard({ coffee }: FeedCardProps) {
  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[...Array(10)].map((_, i) => (
          <span
            key={i}
            className={`text-lg ${
              i < rating ? 'text-yellow-500' : 'text-gray-300'
            }`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Justo ahora';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours}h`;
    if (diffDays < 7) return `Hace ${diffDays}d`;
    return new Date(date).toLocaleDateString('es-ES');
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* User Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-900">{coffee.user.displayName}</p>
            <p className="text-sm text-gray-500">@{coffee.user.username}</p>
          </div>
          <p className="text-xs text-gray-400">
            {formatTimeAgo(coffee.createdAt)}
          </p>
        </div>
      </div>

      {/* Image */}
      {coffee.image && (
        <div className="relative h-48 bg-gray-200">
          <img
            src={coffee.image}
            alt={coffee.name}
            className="w-full h-full object-cover"
          />
          {coffee.color && (
            <div
              className="absolute top-2 right-2 w-8 h-8 rounded-full border-2 border-white shadow-md"
              style={{ backgroundColor: coffee.color }}
              title={`Color: ${coffee.color}`}
            />
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Coffee Name & Roaster */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-900 mb-1">
            {coffee.name}
          </h3>
          <p className="text-gray-600">por {coffee.roaster}</p>
        </div>

        {/* Details */}
        <div className="space-y-1 mb-3 text-sm text-gray-700">
          {coffee.origin && (
            <p>
              <span className="font-medium">Origen:</span> {coffee.origin}
            </p>
          )}
          {coffee.roastLevel && (
            <p>
              <span className="font-medium">Tueste:</span> {coffee.roastLevel}
            </p>
          )}
        </div>

        {/* Rating */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">Valoración</p>
          {renderStars(coffee.rating)}
        </div>

        {/* Flavor Profile Badge */}
        {coffee.flavorProfile?.calculatedFlavorProfile && (
          <div className="mb-3">
            <span className="inline-block bg-amber-100 text-amber-800 text-sm font-medium px-3 py-1 rounded-full">
              {coffee.flavorProfile.calculatedFlavorProfile}
            </span>
          </div>
        )}

        {/* Flavor Notes */}
        {coffee.flavorProfile?.flavorNotes &&
          coffee.flavorProfile.flavorNotes.length > 0 && (
            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {coffee.flavorProfile.flavorNotes.slice(0, 3).map((note) => (
                  <span
                    key={note}
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
                  >
                    {note}
                  </span>
                ))}
                {coffee.flavorProfile.flavorNotes.length > 3 && (
                  <span className="text-xs text-gray-500 px-2 py-1">
                    +{coffee.flavorProfile.flavorNotes.length - 3} más
                  </span>
                )}
              </div>
            </div>
          )}

        {/* Description */}
        {coffee.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {coffee.description}
          </p>
        )}

        {/* View Details Link */}
        <Link
          to={`/feed/${coffee.id}`}
          className="inline-block text-amber-600 hover:text-amber-700 text-sm font-medium"
        >
          Ver Detalles →
        </Link>
      </div>
    </div>
  );
}
