import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCoffee } from '../hooks/useCoffees';
import { RatingStars } from './RatingStars';
import { ImageUpload } from './ImageUpload';
import { ColorPicker } from './ColorPicker';
import type { NewCoffee, NewFlavorProfile } from '@shared/schema';

const FLAVOR_NOTES = [
  'Chocolate',
  'Nueces',
  'Caramelo',
  'Frutal',
  'Floral',
  'Especiado',
  'Terroso',
  'Ahumado',
];

export function FlavorProfileWizard() {
  const navigate = useNavigate();
  const createMutation = useCreateCoffee();
  const [currentStep, setCurrentStep] = useState(1);
  const [skipProfile, setSkipProfile] = useState(false);

  // Step 1: Basic Info
  const [name, setName] = useState('');
  const [roaster, setRoaster] = useState('');
  const [origin, setOrigin] = useState('');
  const [roastLevel, setRoastLevel] = useState<string>('');
  const [processingMethod, setProcessingMethod] = useState<string>('');
  const [beansMix, setBeansMix] = useState<string>('');
  const [website, setWebsite] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [color, setColor] = useState('#8B4513');
  const [description, setDescription] = useState('');

  // Step 2: Quick Rating
  const [rating, setRating] = useState(0);

  // Step 3: Strength & Intensity
  const [strengthIntensity, setStrengthIntensity] = useState(3);
  const [aromaIntensity, setAromaIntensity] = useState(3);

  // Step 4: Taste Balance
  const [sweetnessLevel, setSweetnessLevel] = useState(3);
  const [acidityLevel, setAcidityLevel] = useState(3);
  const [bitternessLevel, setBitternessLevel] = useState(3);

  // Step 5: Flavor Notes & Body
  const [selectedNotes, setSelectedNotes] = useState<string[]>([]);
  const [bodyWeight, setBodyWeight] = useState(3);
  const [aftertasteLength, setAftertasteLength] = useState(3);
  const [aftertastePleasant, setAftertastePleasant] = useState(3);

  // Step 6: Privacy
  const [isPrivate, setIsPrivate] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const toggleNote = (note: string) => {
    setSelectedNotes((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
    );
  };

  const handleNext = () => {
    if (currentStep === 1 && (!name || !roaster)) {
      setError('Nombre y tostador son requeridos');
      return;
    }
    if (currentStep === 2 && rating === 0) {
      setError('Por favor selecciona una valoración');
      return;
    }
    setError('');
    setCurrentStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setCurrentStep((prev) => prev - 1);
  };

  const handleSkipProfile = () => {
    setSkipProfile(true);
    setCurrentStep(6);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError('');

    try {
      const coffeeData: NewCoffee = {
        name,
        roaster,
        origin: origin || undefined,
        roastLevel: roastLevel || undefined,
        processingMethod: processingMethod || undefined,
        beansMix: beansMix || undefined,
        website: website || undefined,
        price: price ? parseFloat(price) : undefined,
        color: color || undefined,
        image: image || undefined,
        description: description || undefined,
        rating,
        isPrivate,
      };

      const coffee = await createMutation.mutateAsync(coffeeData);

      // Create flavor profile if not skipped
      if (!skipProfile && coffee.id) {
        const profileData: NewFlavorProfile = {
          coffeeId: coffee.id,
          strengthIntensity,
          aromaIntensity,
          sweetnessLevel,
          acidityLevel,
          bitternessLevel,
          bodyWeight,
          aftertasteLength,
          aftertastePleasant,
          flavorNotes: selectedNotes.length > 0 ? selectedNotes : undefined,
        };

        await fetch(`/api/coffees/${coffee.id}/profile`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(profileData),
        });
      }

      // Navigate back to collection
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Error al guardar el café');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <div
            key={step}
            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold ${
              step < currentStep
                ? 'bg-green-500 text-white'
                : step === currentStep
                ? 'bg-amber-600 text-white'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {step < currentStep ? '✓' : step}
          </div>
        ))}
      </div>
      <div className="h-2 bg-gray-200 rounded-full">
        <div
          className="h-2 bg-amber-600 rounded-full transition-all duration-300"
          style={{ width: `${((currentStep - 1) / 5) * 100}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Agregar Café
          </h1>
          <p className="text-gray-600 mb-6">
            Paso {currentStep} de 6
          </p>

          {renderProgressBar()}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Información Básica
              </h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Café *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Ej: Colombian Supremo"
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
                  placeholder="Ej: Café de Colombia"
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
                  Imagen del Café
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
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas (opcional)
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
                  placeholder="Tus impresiones sobre este café..."
                />
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-amber-600 text-white py-3 px-4 rounded-md hover:bg-amber-700 font-medium"
              >
                Siguiente
              </button>
            </div>
          )}

          {/* Step 2: Quick Rating */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Valoración Rápida
              </h2>

              <div className="text-center">
                <p className="text-lg text-gray-700 mb-4">
                  ¿Cuánto te gustó este café en general?
                </p>
                <div className="flex justify-center mb-6">
                  <RatingStars rating={rating} onRatingChange={setRating} />
                </div>
                <p className="text-3xl font-bold text-amber-600">
                  {rating} / 10
                </p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <p className="text-gray-700 mb-4">
                  ¿Quieres agregar un perfil de sabor detallado?
                </p>
                <p className="text-sm text-gray-500 mb-4">
                  Te guiaremos con preguntas sencillas para determinar el perfil
                  de sabor de este café.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={handleSkipProfile}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 font-medium"
                  >
                    Omitir Perfil de Sabor
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 bg-amber-600 text-white py-3 px-4 rounded-md hover:bg-amber-700 font-medium"
                  >
                    Continuar a Preguntas de Sabor
                  </button>
                </div>
              </div>

              <button
                onClick={handleBack}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
              >
                Volver
              </button>
            </div>
          )}

          {/* Step 3: Strength & Intensity */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Fuerza e Intensidad
              </h2>

              <div>
                <label className="block text-lg font-medium text-gray-800 mb-3">
                  ¿Qué tan fuerte era el café?
                </label>
                <div className="space-y-2">
                  {[
                    { value: 1, label: 'Muy débil (como té)' },
                    { value: 2, label: 'Débil' },
                    { value: 3, label: 'Moderado (justo)' },
                    { value: 4, label: 'Fuerte' },
                    { value: 5, label: 'Muy fuerte (como espresso)' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 border-2 rounded-md cursor-pointer transition-colors ${
                        strengthIntensity === option.value
                          ? 'border-amber-600 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="strength"
                        value={option.value}
                        checked={strengthIntensity === option.value}
                        onChange={() => setStrengthIntensity(option.value)}
                        className="mr-3"
                      />
                      <span className="font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-800 mb-3">
                  ¿Qué tan poderoso era el aroma?
                </label>
                <div className="space-y-2">
                  {[
                    { value: 1, label: 'Apenas perceptible' },
                    { value: 2, label: 'Sutil' },
                    { value: 3, label: 'Moderado' },
                    { value: 4, label: 'Fuerte' },
                    { value: 5, label: 'Llenó la habitación' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 border-2 rounded-md cursor-pointer transition-colors ${
                        aromaIntensity === option.value
                          ? 'border-amber-600 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="aroma"
                        value={option.value}
                        checked={aromaIntensity === option.value}
                        onChange={() => setAromaIntensity(option.value)}
                        className="mr-3"
                      />
                      <span className="font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300"
                >
                  Volver
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-amber-600 text-white py-3 px-4 rounded-md hover:bg-amber-700 font-medium"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Taste Balance */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Balance de Sabor
              </h2>

              <div>
                <label className="block text-lg font-medium text-gray-800 mb-3">
                  🍬 ¿Qué tan dulce sabía?
                </label>
                <div className="space-y-2">
                  {[
                    { value: 1, label: 'Nada dulce' },
                    { value: 2, label: 'Ligeramente dulce' },
                    { value: 3, label: 'Moderadamente dulce' },
                    { value: 4, label: 'Dulce' },
                    { value: 5, label: 'Muy dulce (como postre)' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 border-2 rounded-md cursor-pointer transition-colors ${
                        sweetnessLevel === option.value
                          ? 'border-amber-600 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="sweetness"
                        value={option.value}
                        checked={sweetnessLevel === option.value}
                        onChange={() => setSweetnessLevel(option.value)}
                        className="mr-3"
                      />
                      <span className="font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-800 mb-3">
                  🍋 ¿Qué tan ácido/brillante era?
                </label>
                <div className="space-y-2">
                  {[
                    { value: 1, label: 'Plano/sin brillo' },
                    { value: 2, label: 'Baja acidez' },
                    { value: 3, label: 'Balanceado' },
                    { value: 4, label: 'Brillante (con chispa)' },
                    { value: 5, label: 'Muy brillante/ácido' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 border-2 rounded-md cursor-pointer transition-colors ${
                        acidityLevel === option.value
                          ? 'border-amber-600 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="acidity"
                        value={option.value}
                        checked={acidityLevel === option.value}
                        onChange={() => setAcidityLevel(option.value)}
                        className="mr-3"
                      />
                      <span className="font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-800 mb-3">
                  🌿 ¿Qué tan amargo era?
                </label>
                <div className="space-y-2">
                  {[
                    { value: 1, label: 'Nada amargo' },
                    { value: 2, label: 'Ligeramente amargo' },
                    { value: 3, label: 'Moderadamente amargo (agradable)' },
                    { value: 4, label: 'Bastante amargo' },
                    { value: 5, label: 'Muy amargo' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 border-2 rounded-md cursor-pointer transition-colors ${
                        bitternessLevel === option.value
                          ? 'border-amber-600 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="bitterness"
                        value={option.value}
                        checked={bitternessLevel === option.value}
                        onChange={() => setBitternessLevel(option.value)}
                        className="mr-3"
                      />
                      <span className="font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300"
                >
                  Volver
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-amber-600 text-white py-3 px-4 rounded-md hover:bg-amber-700 font-medium"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* Step 5: Flavor Notes & Body */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Notas de Sabor y Cuerpo
              </h2>

              <div>
                <label className="block text-lg font-medium text-gray-800 mb-3">
                  ¿Qué sabores notaste? (Selecciona todos los que apliquen)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {FLAVOR_NOTES.map((note) => (
                    <label
                      key={note}
                      className={`flex items-center p-3 border-2 rounded-md cursor-pointer transition-colors ${
                        selectedNotes.includes(note)
                          ? 'border-amber-600 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selectedNotes.includes(note)}
                        onChange={() => toggleNote(note)}
                        className="mr-3"
                      />
                      <span className="font-medium">{note}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-800 mb-3">
                  ¿Cómo se sentía en tu boca?
                </label>
                <div className="space-y-2">
                  {[
                    { value: 1, label: 'Ligero y acuoso (como té)' },
                    { value: 2, label: 'Ligero' },
                    { value: 3, label: 'Medio (como leche)' },
                    { value: 4, label: 'Con cuerpo' },
                    { value: 5, label: 'Pesado y almibarado (como crema)' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 border-2 rounded-md cursor-pointer transition-colors ${
                        bodyWeight === option.value
                          ? 'border-amber-600 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="body"
                        value={option.value}
                        checked={bodyWeight === option.value}
                        onChange={() => setBodyWeight(option.value)}
                        className="mr-3"
                      />
                      <span className="font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-800 mb-3">
                  ¿Cuánto duró el sabor?
                </label>
                <div className="space-y-2">
                  {[
                    { value: 1, label: 'Muy corto' },
                    { value: 2, label: 'Corto' },
                    { value: 3, label: 'Moderado' },
                    { value: 4, label: 'Largo' },
                    { value: 5, label: 'Muy largo' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 border-2 rounded-md cursor-pointer transition-colors ${
                        aftertasteLength === option.value
                          ? 'border-amber-600 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="aftertaste"
                        value={option.value}
                        checked={aftertasteLength === option.value}
                        onChange={() => setAftertasteLength(option.value)}
                        className="mr-3"
                      />
                      <span className="font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-lg font-medium text-gray-800 mb-3">
                  ¿El retrogusto fue agradable?
                </label>
                <div className="space-y-2">
                  {[
                    { value: 1, label: 'Desagradable' },
                    { value: 2, label: 'Neutral' },
                    { value: 3, label: 'Agradable' },
                    { value: 4, label: 'Muy agradable' },
                    { value: 5, label: 'Excelente' },
                  ].map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 border-2 rounded-md cursor-pointer transition-colors ${
                        aftertastePleasant === option.value
                          ? 'border-amber-600 bg-amber-50'
                          : 'border-gray-200 hover:border-amber-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="pleasant"
                        value={option.value}
                        checked={aftertastePleasant === option.value}
                        onChange={() => setAftertastePleasant(option.value)}
                        className="mr-3"
                      />
                      <span className="font-medium">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300"
                >
                  Volver
                </button>
                <button
                  onClick={handleNext}
                  className="flex-1 bg-amber-600 text-white py-3 px-4 rounded-md hover:bg-amber-700 font-medium"
                >
                  Siguiente
                </button>
              </div>
            </div>
          )}

          {/* Step 6: Review & Save */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Revisar y Guardar
              </h2>

              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900">{name}</h3>
                  <p className="text-gray-600">por {roaster}</p>
                </div>

                {origin && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Origen:</span> {origin}
                  </p>
                )}

                {roastLevel && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Tueste:</span> {roastLevel}
                  </p>
                )}

                <div>
                  <p className="text-sm text-gray-700 font-medium mb-1">
                    Valoración:
                  </p>
                  <RatingStars rating={rating} readonly />
                </div>

                {!skipProfile && (
                  <>
                    <div className="border-t border-gray-300 pt-4">
                      <p className="font-medium text-gray-900 mb-2">
                        Perfil de Sabor Detectado:
                      </p>
                      <span className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">
                        {/* This will be calculated by the server */}
                        Perfil calculado automáticamente
                      </span>
                    </div>

                    {selectedNotes.length > 0 && (
                      <div>
                        <p className="font-medium text-gray-900 mb-2">
                          Notas de Sabor:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {selectedNotes.map((note) => (
                            <span
                              key={note}
                              className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm"
                            >
                              {note}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(e) => setIsPrivate(e.target.checked)}
                    className="mr-2"
                  />
                  <span className="text-gray-700">
                    🔒 Mantener esta valoración privada
                  </span>
                </label>
                <p className="text-xs text-gray-500 ml-6 mt-1">
                  Solo tú podrás ver este café si está privado
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300"
                  disabled={isSubmitting}
                >
                  Volver
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Guardando...' : 'Guardar Café'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
