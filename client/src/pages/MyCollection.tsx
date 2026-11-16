import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCoffees, useDeleteCoffee, useUpdateCoffee } from '../hooks/useCoffees';
import { useI18n } from '../i18n';
import { CoffeeCard } from '../components/CoffeeCard';
import { Stats } from '../components/Stats';
import { SearchBar } from '../components/SearchBar';
import { FilterControls } from '../components/FilterControls';
import { ExportMenu } from '../components/ExportMenu';
import { EditCoffeeModal } from '../components/EditCoffeeModal';
import { LanguageToggle } from '../components/LanguageToggle';
import type { CoffeeWithDetails, UpdateCoffee } from '@shared/schema';

export function MyCollection() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [roastLevel, setRoastLevel] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [editingCoffee, setEditingCoffee] = useState<CoffeeWithDetails | null>(null);

  const { data: coffees, isLoading, error } = useCoffees({
    search,
    roastLevel: roastLevel || undefined,
    sortBy,
    sortOrder,
  });

  const deleteMutation = useDeleteCoffee();
  const updateMutation = useUpdateCoffee();

  const handleDelete = async (id: number) => {
    if (window.confirm(t('collection.confirmDelete'))) {
      try {
        await deleteMutation.mutateAsync(id);
      } catch (error) {
        console.error('Deleting coffee failed:', error);
        alert((error as Error).message || t('collection.deleteFailed'));
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Signing out failed:', error);
      alert((error as Error).message);
    }
  };

  const handleSaveEdit = async (id: number, data: UpdateCoffee) => {
    await updateMutation.mutateAsync({ id, coffee: data });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                {t('collection.title')}
              </h1>
              <p className="text-sm sm:text-base text-gray-600">
                {t('collection.welcome', { name: user?.displayName ?? '' })}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <ExportMenu coffees={coffees || []} />
              <Link
                to="/feed"
                className="bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-md hover:bg-gray-300 text-sm sm:text-base"
              >
                {t('nav.viewCommunity')}
              </Link>
              <button
                onClick={() => navigate('/add-coffee')}
                className="bg-amber-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-amber-700 text-sm sm:text-base"
              >
                {t('nav.addCoffee')}
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-md hover:bg-gray-300 text-sm sm:text-base"
              >
                {t('nav.signOut')}
              </button>
              <LanguageToggle />
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
              {t('collection.search')}
            </label>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder={t('collection.searchPlaceholder')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('collection.filters')}
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
            <p className="mt-4 text-gray-600">{t('collection.loading')}</p>
          </div>
        )}

        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {t('collection.loadError', { message: (error as Error).message })}
          </div>
        )}

        {coffees && coffees.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg mb-4">{t('collection.empty')}</p>
            <button
              onClick={() => navigate('/add-coffee')}
              className="bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700"
            >
              {t('collection.addFirst')}
            </button>
          </div>
        )}

        {coffees && coffees.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coffees.map((coffee) => (
              <CoffeeCard
                key={coffee.id}
                coffee={coffee}
                onEdit={setEditingCoffee}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {editingCoffee && (
        <EditCoffeeModal
          coffee={editingCoffee}
          isOpen={!!editingCoffee}
          onClose={() => setEditingCoffee(null)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
