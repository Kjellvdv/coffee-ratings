import { useState, useEffect } from 'react';
import { RatingStars } from './RatingStars';
import type { CoffeeWithDetails, UpdateCoffee } from '@shared/schema';

interface EditCoffeeModalProps {
  coffee: CoffeeWithDetails;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, data: UpdateCoffee) => Promise<void>;
}

export function EditCoffeeModal({ coffee, isOpen, onClose, onSave }: EditCoffeeModalProps) {
  const [name, setName] = useState(coffee.name);
  const [roaster, setRoaster] = useState(coffee.roaster);
  const [origin, setOrigin] = useState(coffee.origin || '');
  const [roastLevel, setRoastLevel] = useState<string>(coffee.roastLevel || '');
  const [processingMethod, setProcessingMethod] = useState<string>(coffee.processingMethod || '');
  const [beansMix, setBeansMix] = useState<string>(coffee.beansMix || '');
  const [website, setWebsite] = useState(coffee.website || '');
  const [price, setPrice] = useState(coffee.price?.toString() || '');
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
    setRating(coffee.rating);
    setDescription(coffee.description || '');
    setIsPrivate(coffee.isPrivate);
    setError('');
  }, [coffee]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !roaster) {
      setError('Nombre y tostador son requeridos');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const updateData: UpdateCoffee = {
        name,
        roaster,
        origin: origin || undefined,
        roastLevel: roastLevel || undefined,
        processingMethod: processingMethod || undefined,
        beansMix: beansMix || undefined,
        website: website || undefined,
        price: price ? parseFloat(price) : undefined,
        rating,
        description: description || undefined,
        isPrivate,
      };

      await onSave(coffee.id, updateData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error al actualizar el café');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-gray-900">Editar Café</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre del Café *
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
              Tostador *
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
              Origen
            </label>
            <input
              type="text"
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Ej: Colombia, Huila"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nivel de Tueste
              </label>
              <select
                value={roastLevel}
                onChange={(e) => setRoastLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Seleccionar</option>
                <option value="Claro">Claro</option>
                <option value="Medio">Medio</option>
                <option value="Oscuro">Oscuro</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Método de Proceso
              </label>
              <select
                value={processingMethod}
                onChange={(e) => setProcessingMethod(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">Seleccionar</option>
                <option value="Lavado">Lavado</option>
                <option value="Natural">Natural</option>
                <option value="Honey">Honey</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mezcla de Granos
            </label>
            <select
              value={beansMix}
              onChange={(e) => setBeansMix(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option value="">Seleccionar</option>
              <option value="100% Arabica">100% Arabica</option>
              <option value="100% Robusta">100% Robusta</option>
              <option value="Arabica/Robusta Blend">Mezcla Arabica/Robusta</option>
              <option value="Liberica/Excelsa">Liberica/Excelsa</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sitio Web
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
                Precio
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
              Valoración *
            </label>
            <RatingStars rating={rating} onRatingChange={setRating} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Tus notas sobre este café..."
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
              Mantener privado
            </label>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              disabled={isSubmitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
