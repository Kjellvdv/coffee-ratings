import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useFeedCoffee } from '../hooks/useFeed';
import { useAuth } from '../context/AuthContext';
import { getMyMatches } from '../lib/api';
import { useI18n, type TranslationKey } from '../i18n';
import { LanguageToggle } from '../components/LanguageToggle';
import type { CoffeeWithDetails, FlavorProfile } from '@shared/schema';

const SCORES: Array<[keyof FlavorProfile, TranslationKey]> = [
  ['strengthIntensity', 'score.strength'],
  ['aromaIntensity', 'score.aroma'],
  ['sweetnessLevel', 'score.sweetness'],
  ['acidityLevel', 'score.acidity'],
  ['bitternessLevel', 'score.bitterness'],
  ['bodyWeight', 'score.body'],
];

export function FeedDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t, tv, locale } = useI18n();
  const { data: coffee, isLoading, error } = useFeedCoffee(parseInt(id || '0'));

  const [compareState, setCompareState] = useState<'idle' | 'loading' | 'none' | 'choose' | 'error'>('idle');
  const [compareError, setCompareError] = useState('');
  const [matches, setMatches] = useState<CoffeeWithDetails[]>([]);

  async function handleCompare() {
    if (!coffee) return;
    setCompareState('loading');
    setCompareError('');
    try {
      const found = await getMyMatches(coffee.id);
      if (found.length === 0) {
        setCompareState('none');
      } else if (found.length === 1) {
        navigate(`/compare/${coffee.id}/${found[0].id}`);
      } else {
        setMatches(found);
        setCompareState('choose');
      }
    } catch (err) {
      console.error('Finding matches failed:', err);
      setCompareError((err as Error).message);
      setCompareState('error');
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1" aria-label={`${rating}/10`}>
        {[...Array(10)].map((_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`text-2xl ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`}
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
          <p className="mt-4 text-gray-600">{t('detail.loading')}</p>
        </div>
      </div>
    );
  }

  if (error || !coffee) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p role="alert" className="text-red-600 mb-4">
            {error ? (error as Error).message : t('detail.notFound')}
          </p>
          <button
            onClick={() => navigate('/feed')}
            className="bg-amber-600 text-white px-6 py-2 rounded-md hover:bg-amber-700"
          >
            {t('nav.backToFeedButton')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4 sm:px-6 flex items-center justify-between gap-4">
          <button onClick={() => navigate('/feed')} className="text-amber-600 hover:text-amber-700">
            {t('nav.backToFeed')}
          </button>
          <LanguageToggle />
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* User Info */}
          <div className="bg-amber-50 p-4 sm:p-6 border-b border-amber-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <p className="text-xs sm:text-sm text-gray-600">{t('detail.ratedBy')}</p>
                <p className="text-xl sm:text-2xl font-bold text-gray-900">{coffee.user.displayName}</p>
                <p className="text-sm sm:text-base text-gray-500">@{coffee.user.username}</p>
              </div>
              <p className="text-xs sm:text-sm text-gray-500">
                {new Date(coffee.createdAt).toLocaleDateString(locale, {
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
              <img src={coffee.image} alt={coffee.name} className="w-full h-full object-cover" />
              {coffee.color && (
                <div
                  className="absolute top-4 right-4 w-12 h-12 sm:w-16 sm:h-16 rounded-full border-4 border-white shadow-lg"
                  style={{ backgroundColor: coffee.color }}
                  title={t('card.colorTitle', { color: coffee.color })}
                />
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-4 sm:p-6">
            {/* Coffee Name */}
            <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">{coffee.name}</h1>
            <p className="text-lg sm:text-xl text-gray-600 mb-6">
              {t('common.by', { roaster: coffee.roaster })}
            </p>

            {/* Details Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
              {coffee.origin && (
                <div>
                  <p className="text-sm text-gray-500">{t('field.origin')}</p>
                  <p className="font-medium text-gray-900">{coffee.origin}</p>
                </div>
              )}
              {coffee.roastLevel && (
                <div>
                  <p className="text-sm text-gray-500">{t('field.roastLevel')}</p>
                  <p className="font-medium text-gray-900">{tv('roast', coffee.roastLevel)}</p>
                </div>
              )}
              {coffee.processingMethod && (
                <div>
                  <p className="text-sm text-gray-500">{t('field.processingMethod')}</p>
                  <p className="font-medium text-gray-900">{tv('process', coffee.processingMethod)}</p>
                </div>
              )}
              {coffee.price && (
                <div>
                  <p className="text-sm text-gray-500">{t('field.price')}</p>
                  <p className="font-medium text-gray-900">${coffee.price}</p>
                </div>
              )}
            </div>

            {/* Rating */}
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">{t('field.overallRating')}</p>
              <div className="overflow-x-auto">{renderStars(coffee.rating)}</div>
              <p className="text-2xl sm:text-3xl font-bold text-amber-600 mt-2">{coffee.rating} / 10</p>
            </div>

            {/* Compare button (only for other people's coffees) */}
            {coffee.userId !== user?.id && (
              <div className="mb-6">
                <button
                  onClick={handleCompare}
                  disabled={compareState === 'loading'}
                  className="bg-amber-600 text-white px-5 py-2 rounded-md hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                  {compareState === 'loading' ? t('detail.searching') : t('detail.compare')}
                </button>

                {compareState === 'error' && (
                  <p role="alert" className="mt-2 text-sm text-red-600">
                    {t('detail.compareFailed', { message: compareError })}
                  </p>
                )}

                {compareState === 'none' && (
                  <p className="mt-2 text-sm text-gray-500">
                    {t('detail.noMatchBefore')}{' '}
                    <Link to="/feed" className="text-amber-600 hover:underline">
                      {t('detail.noMatchLink')}
                    </Link>{' '}
                    {t('detail.noMatchAfter')}
                  </p>
                )}

                {compareState === 'choose' && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm text-gray-600">
                      {t('detail.chooseMatch', { count: matches.length })}
                    </p>
                    {matches.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => navigate(`/compare/${coffee.id}/${m.id}`)}
                        className="block w-full text-left border border-amber-300 rounded-md px-4 py-2 text-sm hover:bg-amber-50"
                      >
                        <span className="font-medium">{m.name}</span>
                        <span className="text-gray-500 ml-2">
                          {t('detail.matchRating', { rating: m.rating })}
                          {m.flavorProfile ? t('detail.matchHasProfile') : ''}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Flavor Profile */}
            {coffee.flavorProfile && (
              <div className="border-t border-gray-200 pt-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('detail.flavorProfile')}</h2>

                {/* Calculated Profile */}
                {coffee.flavorProfile.calculatedFlavorProfile && (
                  <div className="mb-6">
                    <span className="inline-block bg-amber-100 text-amber-800 text-lg font-medium px-4 py-2 rounded-full">
                      {tv('profile', coffee.flavorProfile.calculatedFlavorProfile)}
                    </span>
                  </div>
                )}

                {/* Flavor Notes */}
                {coffee.flavorProfile.flavorNotes && coffee.flavorProfile.flavorNotes.length > 0 && (
                  <div className="mb-6">
                    <p className="font-medium text-gray-900 mb-2">{t('detail.flavorNotes')}</p>
                    <div className="flex flex-wrap gap-2">
                      {coffee.flavorProfile.flavorNotes.map((note) => (
                        <span key={note} className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full">
                          {tv('note', note)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Detailed Scores */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {SCORES.map(([key, label]) => {
                    const value = coffee.flavorProfile?.[key] as number | null | undefined;
                    if (!value) return null;
                    return (
                      <div key={key}>
                        <p className="text-sm text-gray-500">{t(label)}</p>
                        <p className="font-medium">{value}/5</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Description */}
            {coffee.description && (
              <div className="border-t border-gray-200 pt-6 mt-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2">{t('field.notes')}</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{coffee.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
