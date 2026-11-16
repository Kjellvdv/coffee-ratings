import { useState, useEffect } from 'react';
import { RatingStars } from './RatingStars';
import { ImageUpload } from './ImageUpload';
import { ColorPicker } from './ColorPicker';
import { useI18n } from '../i18n';
import type { CoffeeWithDetails, UpdateCoffee } from '@shared/schema';

interface EditCoffeeModalProps {
  coffee: CoffeeWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, data: UpdateCoffee) => Promise<void>;
}

export function EditCoffeeModal({ coffee, isOpen, onClose, onSave }: EditCoffeeModalProps) {
  const { t, tv } = useI18n();
  const [name, setName] = useState(coffee.name);
  const [roaster, setRoaster] = useState(coffee.roaster);
  const [origin, setOrigin] = useState(coffee.origin || '');
  const [roastLevel, setRoastLevel] = useState<string>(coffee.roastLevel || '');
  const [processingMethod, setProcessingMethod] = useState<string>(coffee.processingMethod || '');
  const [beansMix, setBeansMix] = useState<string>(coffee.beansMix || '');
  const [website, setWebsite] = useState(coffee.website || '');
  const [price, setPrice] = useState(coffee.price?.toString() || '');
  const [image, setImage] = useState<string | null>(coffee.image || null);
  const [color, setColor] = useState(coffee.color || '#8B4513');
  const [rating, setRating] = useState(coffee.rating);
  const [description, setDescription] = useState(coffee.description || '');
  const [isPrivate, setIsPrivate] = useState(coffee.isPrivate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Reset form when coffee changes
  useEffect(() => {
    setName(coffee.name);
    setRoaster(coffee.roaster);
    setOrigin(coffee.origin || '');
    setRoastLevel(coffee.roastLevel || '');
    setProcessingMethod(coffee.processingMethod || '');
    setBeansMix(coffee.beansMix || '');
    setWebsite(coffee.website || '');
    setPrice(coffee.price?.toString() || '');
    setImage(coffee.image || null);
    setColor(coffee.color || '#8B4513');
    setRating(coffee.rating);
    setDescription(coffee.description || '');
    setIsPrivate(coffee.isPrivate);
    setError('');
  }, [coffee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !roaster) {
      setError(t('field.nameRoasterRequired'));
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const updateData: UpdateCoffee = {
        name,
        roaster,
        origin: origin || undefined,
        roastLevel: (roastLevel || undefined) as UpdateCoffee['roastLevel'],
        processingMethod: (processingMethod || undefined) as UpdateCoffee['processingMethod'],
        beansMix: (beansMix || undefined) as UpdateCoffee['beansMix'],
        website: website || undefined,
        price: price ? parseFloat(price) : undefined,
        image: image || undefined,
        color: color || undefined,
        rating,
        description: description || undefined,
        isPrivate,
      };

      await onSave(coffee.id, updateData);
      onClose();
    } catch (err) {
      console.error('Updating coffee failed:', err);
      setError((err as Error).message || t('edit.updateFailed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div role="dialog" aria-modal="true" aria-labelledby="edit-coffee-title" className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 id="edit-coffee-title" className="text-2xl font-bold text-gray-900">{t('edit.title')}</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('edit.close')}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('field.name')} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('field.roaster')} *
            </label>
            <input
              type="text"
              value={roaster}
              onChange={(e) => setRoaster(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('field.origin')}
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder={t('field.originPlaceholder')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('field.roastLevel')}
              </label>
              <select
                value={roastLevel}
                onChange={(e) => setRoastLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">{t('common.select')}</option>
                {['Claro', 'Medio', 'Oscuro'].map((level) => (
                  <option key={level} value={level}>
                    {tv('roast', level)}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('field.processingMethod')}
              </label>
              <select
                value={processingMethod}
                onChange={(e) => setProcessingMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">{t('common.select')}</option>
                {['Lavado', 'Natural', 'Honey'].map((method) => (
                  <option key={method} value={method}>
                    {tv('process', method)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('field.beansMix')}
            </label>
            <select
              value={beansMix}
              onChange={(e) => setBeansMix(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">{t('common.select')}</option>
              {['100% Arabica', '100% Robusta', 'Arabica/Robusta Blend', 'Liberica/Excelsa'].map((mix) => (
                <option key={mix} value={mix}>
                  {tv('beans', mix)}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('field.website')}
              </label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="https://example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('field.price')}
              </label>
              <input
                type="number"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="15.99"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('field.image')}
            </label>
            <ImageUpload
              image={image}
              onImageChange={setImage}
              onColorPick={setColor}
            />
          </div>

          {image && (
            <ColorPicker color={color} onColorChange={setColor} />
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('field.rating')} *
            </label>
            <RatingStars rating={rating} onRatingChange={setRating} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('field.notes')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder={t('field.editNotesPlaceholder')}
              maxLength={5000}
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="isPrivate"
              checked={isPrivate}
              onChange={(e) => setIsPrivate(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="isPrivate" className="text-sm text-gray-700">
              {t('field.keepPrivate')}
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              disabled={isSubmitting}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('edit.saving') : t('edit.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
