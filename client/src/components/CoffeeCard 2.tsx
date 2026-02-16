import type { CoffeeWithDetails } from '@shared/schema';

interface CoffeeCardProps {
  coffee: CoffeeWithDetails;
  onEdit?: (coffee: CoffeeWithDetails) => void;
  onDelete?: (id: number) => void;
}

export function CoffeeCard({ coffee, onEdit, onDelete }: CoffeeCardProps) {
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

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
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
        {/* Header */}
        <div className="mb-2">
          <h3 className="text-lg font-bold text-gray-900 truncate">
            {coffee.name}
          </h3>
          <p className="text-sm text-gray-600">por {coffee.roaster}</p>
        </div>

        {/* Details */}
        <div className="space-y-2 mb-3">
          {coffee.origin && (
            <p className="text-sm text-gray-700">
              <span className="font-medium">Origen:</span> {coffee.origin}
            </p>
          )}
          {coffee.roastLevel && (
            <p className="text-sm text-gray-700">
              <span className="font-medium">Tueste:</span> {coffee.roastLevel}
            </p>
          )}
          {coffee.price && (
            <p className="text-sm text-gray-700">
              <span className="font-medium">Precio:</span> ${coffee.price}
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
            <span className="inline-block bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full">
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
                    className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* Description */}
        {coffee.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {coffee.description}
          </p>
        )}

        {/* Privacy Badge */}
        {coffee.isPrivate && (
          <div className="mb-3">
            <span className="inline-block bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded">
              🔒 Privado
            </span>
          </div>
        )}

        {/* Actions */}
        {(onEdit || onDelete) && (
          <div className="flex gap-2 pt-3 border-t border-gray-200">
            {onEdit && (
              <button
                onClick={() => onEdit(coffee)}
                className="flex-1 bg-amber-600 text-white py-1.5 px-3 rounded hover:bg-amber-700 text-sm"
              >
                Editar
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(coffee.id)}
                className="flex-1 bg-red-600 text-white py-1.5 px-3 rounded hover:bg-red-700 text-sm"
              >
                Eliminar
              </button>
            )}
          </div>
        )}

        {/* Date */}
        <p className="text-xs text-gray-400 mt-2">
          Agregado: {new Date(coffee.createdAt).toLocaleDateString('es-ES')}
        </p>
      </div>
    </div>
  );
}
