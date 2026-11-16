import { useI18n } from '../i18n';

interface FilterControlsProps {
  roastLevel: string;
  onRoastLevelChange: (value: string) => void;
  sortBy: string;
  onSortByChange: (value: string) => void;
  sortOrder: string;
  onSortOrderChange: (value: string) => void;
}

const selectClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500';

export function FilterControls({
  roastLevel,
  onRoastLevelChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
}: FilterControlsProps) {
  const { t, tv } = useI18n();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Roast Level Filter */}
      <div>
        <label htmlFor="filter-roast" className="block text-sm font-medium text-gray-700 mb-1">
          {t('filters.roastLevel')}
        </label>
        <select
          id="filter-roast"
          value={roastLevel}
          onChange={(e) => onRoastLevelChange(e.target.value)}
          className={selectClass}
        >
          <option value="">{t('filters.all')}</option>
          {['Claro', 'Medio', 'Oscuro'].map((level) => (
            <option key={level} value={level}>
              {tv('roast', level)}
            </option>
          ))}
        </select>
      </div>

      {/* Sort By */}
      <div>
        <label htmlFor="filter-sort" className="block text-sm font-medium text-gray-700 mb-1">
          {t('filters.sortBy')}
        </label>
        <select
          id="filter-sort"
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className={selectClass}
        >
          <option value="createdAt">{t('filters.sort.createdAt')}</option>
          <option value="rating">{t('filters.sort.rating')}</option>
          <option value="name">{t('filters.sort.name')}</option>
          <option value="price">{t('filters.sort.price')}</option>
        </select>
      </div>

      {/* Sort Order */}
      <div>
        <label htmlFor="filter-order" className="block text-sm font-medium text-gray-700 mb-1">
          {t('filters.order')}
        </label>
        <select
          id="filter-order"
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value)}
          className={selectClass}
        >
          <option value="desc">{t('filters.desc')}</option>
          <option value="asc">{t('filters.asc')}</option>
        </select>
      </div>
    </div>
  );
}
