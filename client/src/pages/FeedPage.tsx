import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useFeed } from '../hooks/useFeed';
import { useI18n } from '../i18n';
import { FeedCard } from '../components/FeedCard';
import { LanguageToggle } from '../components/LanguageToggle';

export function FeedPage() {
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const { data, isLoading, error, hasNextPage, fetchNextPage, isFetchingNextPage } = useFeed();

  const allCoffees = data?.pages.flat() || [];

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Signing out failed:', error);
      alert((error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">{t('feed.title')}</h1>
              <p className="text-sm sm:text-base text-gray-600">{t('feed.subtitle')}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <Link
                to="/"
                className="bg-gray-200 text-gray-700 px-3 sm:px-4 py-2 rounded-md hover:bg-gray-300 text-sm sm:text-base"
              >
                {t('nav.viewMyCollection')}
              </Link>
              <Link
                to="/add-coffee"
                className="bg-amber-600 text-white px-3 sm:px-4 py-2 rounded-md hover:bg-amber-700 text-sm sm:text-base"
              >
                {t('nav.addCoffee')}
              </Link>
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
        {/* Welcome Message */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-amber-900">
            👋 <span className="font-medium">{t('feed.greeting', { name: user?.displayName ?? '' })}</span>{' '}
            {t('feed.intro')}
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">{t('feed.loading')}</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {t('feed.loadError', { message: (error as Error).message })}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && allCoffees.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">☕</div>
            <p className="text-gray-600 text-lg mb-2">{t('feed.empty')}</p>
            <p className="text-gray-500 mb-4">{t('feed.emptyHint')}</p>
            <Link
              to="/add-coffee"
              className="inline-block bg-amber-600 text-white px-6 py-3 rounded-md hover:bg-amber-700"
            >
              {t('feed.addOne')}
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
                  {isFetchingNextPage ? t('common.loading') : t('feed.loadMore')}
                </button>
              </div>
            )}

            {/* End of Feed */}
            {!hasNextPage && (
              <div className="text-center mt-8 text-gray-500">
                <p>{t('feed.end')}</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
