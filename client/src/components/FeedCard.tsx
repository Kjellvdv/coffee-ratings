import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { CoffeeWithDetails } from '@shared/schema';
import { duplicateCoffee } from '../lib/api';
import { useI18n } from '../i18n';

interface FeedCardProps {
  coffee: CoffeeWithDetails;
}

export function FeedCard({ coffee }: FeedCardProps) {
  const { t, tv, locale } = useI18n();
  const [duplicating, setDuplicating] = useState(false);
  const [duplicated, setDuplicated] = useState(false);
  const [duplicateError, setDuplicateError] = useState<string | null>(null);

  async function handleDuplicate() {
    setDuplicating(true);
    setDuplicateError(null);
    try {
      await duplicateCoffee(coffee.id);
      setDuplicated(true);
    } catch (err) {
      console.error('Copying coffee failed:', err);
      setDuplicateError((err as Error).message);
    } finally {
      setDuplicating(false);
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5" aria-label={`${rating}/10`}>
        {[...Array(10)].map((_, i) => (
          <span
            key={i}
            aria-hidden="true"
            className={`text-lg ${i < rating ? 'text-yellow-500' : 'text-gray-300'}`}
          >
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatTimeAgo = (date: Date) => {
    const diffMs = Date.now() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return t('time.justNow');
    if (diffMins < 60) return t('time.minutes', { n: diffMins });
    if (diffHours < 24) return t('time.hours', { n: diffHours });
    if (diffDays < 7) return t('time.days', { n: diffDays });
    return new Date(date).toLocaleDateString(locale);
  };

  const notes = coffee.flavorProfile?.flavorNotes ?? [];

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* User Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-gray-900">{coffee.user.displayName}</p>
            <p className="text-sm text-gray-500">@{coffee.user.username}</p>
          </div>
          <p className="text-xs text-gray-400">{formatTimeAgo(coffee.createdAt)}</p>
        </div>
      </div>

      {/* Image */}
      {coffee.image && (
        <div className="relative h-48 bg-gray-200">
          <img src={coffee.image} alt={coffee.name} className="w-full h-full object-cover" />
          {coffee.color && (
            <div
              className="absolute top-2 right-2 w-8 h-8 rounded-full border-2 border-white shadow-md"
              style={{ backgroundColor: coffee.color }}
              title={t('card.colorTitle', { color: coffee.color })}
            />
          )}
        </div>
      )}

      {/* Content */}
      <div className="p-4">
        {/* Coffee Name & Roaster */}
        <div className="mb-3">
          <h3 className="text-xl font-bold text-gray-900 mb-1">{coffee.name}</h3>
          <p className="text-gray-600">{t('common.by', { roaster: coffee.roaster })}</p>
        </div>

        {/* Details */}
        <div className="space-y-1 mb-3 text-sm text-gray-700">
          {coffee.origin && (
            <p>
              <span className="font-medium">{t('field.origin')}:</span> {coffee.origin}
            </p>
          )}
          {coffee.roastLevel && (
            <p>
              <span className="font-medium">{t('field.roastShort')}:</span>{' '}
              {tv('roast', coffee.roastLevel)}
            </p>
          )}
        </div>

        {/* Rating */}
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">{t('field.rating')}</p>
          {renderStars(coffee.rating)}
        </div>

        {/* Flavor Profile Badge */}
        {coffee.flavorProfile?.calculatedFlavorProfile && (
          <div className="mb-3">
            <span className="inline-block bg-amber-100 text-amber-800 text-sm font-medium px-3 py-1 rounded-full">
              {tv('profile', coffee.flavorProfile.calculatedFlavorProfile)}
            </span>
          </div>
        )}

        {/* Flavor Notes */}
        {notes.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {notes.slice(0, 3).map((note) => (
                <span key={note} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                  {tv('note', note)}
                </span>
              ))}
              {notes.length > 3 && (
                <span className="text-xs text-gray-500 px-2 py-1">
                  {t('card.moreNotes', { count: notes.length - 3 })}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {coffee.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">{coffee.description}</p>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between gap-2 mt-1">
          <Link
            to={`/feed/${coffee.id}`}
            className="text-amber-600 hover:text-amber-700 text-sm font-medium"
          >
            {t('card.viewDetails')}
          </Link>

          <button
            onClick={handleDuplicate}
            disabled={duplicating || duplicated}
            className="text-sm px-3 py-1 rounded-md border border-amber-600 text-amber-600 hover:bg-amber-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {duplicated ? t('card.copied') : duplicating ? t('card.copying') : t('card.copy')}
          </button>
        </div>

        {duplicateError && (
          <p role="alert" className="text-xs text-red-500 mt-1">
            {duplicateError}
          </p>
        )}
      </div>
    </div>
  );
}
