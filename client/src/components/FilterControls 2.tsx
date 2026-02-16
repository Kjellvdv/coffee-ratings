interface FilterControlsProps {
  roastLevel: string;
  onRoastLevelChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: string;
  onSortOrderChange: (value: string) => void;
}

export function FilterControls({
  roastLevel,
  onRoastLevelChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: FilterControlsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Roast Level Filter */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nivel de Tueste
        </label>
        <select
          value={roastLevel}
          onChange={(e) => onRoastLevelChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="">Todos</option>
          <option value="Claro">Claro</option>
          <option value="Medio">Medio</option>
          <option value="Oscuro">Oscuro</option>
        </select>
      </div>

      {/* Sort By */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Ordenar por
        </label>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="createdAt">Fecha</option>
          <option value="rating">Valoración</option>
          <option value="name">Nombre</option>
          <option value="price">Precio</option>
        </select>
      </div>

      {/* Sort Order */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Orden
        </label>
        <select
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
        >
          <option value="desc">Descendente</option>
          <option value="asc">Ascendente</option>
        </select>
      </div>
    </div>
  );
}
