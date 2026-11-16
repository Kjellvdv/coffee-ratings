import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCoffee } from '../hooks/useCoffees';
import { createFlavorProfile } from '../lib/api';
import { useI18n, type TranslationKey } from '../i18n';
import { RatingStars } from './RatingStars';
import { ImageUpload } from './ImageUpload';
import { ColorPicker } from './ColorPicker';
import { LanguageToggle } from './LanguageToggle';
import type { NewCoffee } from '@shared/schema';

// Stored in Spanish; displayed through the note.* translations
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

const TOTAL_STEPS = 6;

const inputClass =
  'w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500';

type ScaleName =
  | 'strength'
  | 'aroma'
  | 'sweetness'
  | 'acidity'
  | 'bitterness'
  | 'body'
  | 'aftertaste'
  | 'pleasant';

function ScaleQuestion({
  name,
  question,
  value,
  onChange,
}: {
  name: ScaleName;
  question: string;
  value: number;
  onChange: (value: number) => void;
}) {
  const { t } = useI18n();
  return (
    <fieldset>
      <legend className="block text-lg font-medium text-gray-800 mb-3">{question}</legend>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((option) => (
          <label
            key={option}
            className={`flex items-center p-3 border-2 rounded-md cursor-pointer transition-colors ${
              value === option ? 'border-amber-600 bg-amber-50' : 'border-gray-200 hover:border-amber-300'
            }`}
          >
            <input
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              onChange={() => onChange(option)}
              className="mr-3"
            />
            <span className="font-medium">{t(`wizard.${name}.${option}` as TranslationKey)}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function FlavorProfileWizard() {
  const navigate = useNavigate();
  const { t, tv } = useI18n();
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
  // Set once the coffee exists, so a retry after a failed profile save
  // doesn't create the coffee a second time
  const [savedCoffeeId, setSavedCoffeeId] = useState<number | null>(null);

  const toggleNote = (note: string) => {
    setSelectedNotes((prev) =>
      prev.includes(note) ? prev.filter((n) => n !== note) : [...prev, note]
    );
  };

  const handleNext = () => {
    if (currentStep === 1 && (!name || !roaster)) {
      setError(t('field.nameRoasterRequired'));
      return;
    }
    if (currentStep === 2 && rating === 0) {
      setError(t('wizard.ratingRequired'));
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

    let coffeeId = savedCoffeeId;
    try {
      if (coffeeId === null) {
        const coffeeData: NewCoffee = {
          name,
          roaster,
          origin: origin || undefined,
          roastLevel: (roastLevel || undefined) as NewCoffee['roastLevel'],
          processingMethod: (processingMethod || undefined) as NewCoffee['processingMethod'],
          beansMix: (beansMix || undefined) as NewCoffee['beansMix'],
          website: website || undefined,
          price: price ? parseFloat(price) : undefined,
          color: color || undefined,
          image: image || undefined,
          description: description || undefined,
          rating,
          isPrivate,
        };

        const coffee = await createMutation.mutateAsync(coffeeData);
        coffeeId = coffee.id;
        setSavedCoffeeId(coffee.id);
      }
    } catch (err) {
      console.error('Saving coffee failed:', err);
      setError((err as Error).message || t('wizard.saveFailed'));
      setIsSubmitting(false);
      return;
    }

    if (!skipProfile) {
      try {
        await createFlavorProfile(coffeeId, {
          strengthIntensity,
          aromaIntensity,
          sweetnessLevel,
          acidityLevel,
          bitternessLevel,
          bodyWeight,
          aftertasteLength,
          aftertastePleasant,
          flavorNotes: selectedNotes.length > 0 ? selectedNotes : undefined,
        });
      } catch (err) {
        console.error('Saving flavor profile failed:', err);
        setError(t('wizard.profileSaveFailed', { message: (err as Error).message }));
        setIsSubmitting(false);
        return;
      }
    }

    navigate('/');
  };

  const renderProgressBar = () => (
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        {[1, 2, 3, 4, 5, 6].map((step) => (
          <div
            key={step}
            className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center font-bold ${
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

  const navButtons = (
    <div className="flex gap-3">
      <button
        onClick={handleBack}
        className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300"
      >
        {t('common.back')}
      </button>
      <button
        onClick={handleNext}
        className="flex-1 bg-amber-600 text-white py-3 px-4 rounded-md hover:bg-amber-700 font-medium"
      >
        {t('common.next')}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 sm:p-8">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">{t('wizard.title')}</h1>
            <LanguageToggle />
          </div>
          <p className="text-gray-600 mb-6">
            {t('wizard.step', { current: currentStep, total: TOTAL_STEPS })}
          </p>

          {renderProgressBar()}

          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">{t('wizard.basicInfo')}</h2>

              <div>
                <label htmlFor="wiz-name" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('field.name')} *
                </label>
                <input
                  id="wiz-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputClass}
                  placeholder={t('field.namePlaceholder')}
                  maxLength={200}
                  required
                />
              </div>

              <div>
                <label htmlFor="wiz-roaster" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('field.roaster')} *
                </label>
                <input
                  id="wiz-roaster"
                  type="text"
                  value={roaster}
                  onChange={(e) => setRoaster(e.target.value)}
                  className={inputClass}
                  placeholder={t('field.roasterPlaceholder')}
                  maxLength={200}
                  required
                />
              </div>

              <div>
                <label htmlFor="wiz-origin" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('field.origin')}
                </label>
                <input
                  id="wiz-origin"
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className={inputClass}
                  placeholder={t('field.originPlaceholder')}
                  maxLength={200}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="wiz-roast" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('field.roastLevel')}
                  </label>
                  <select
                    id="wiz-roast"
                    value={roastLevel}
                    onChange={(e) => setRoastLevel(e.target.value)}
                    className={inputClass}
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
                  <label htmlFor="wiz-process" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('field.processingMethod')}
                  </label>
                  <select
                    id="wiz-process"
                    value={processingMethod}
                    onChange={(e) => setProcessingMethod(e.target.value)}
                    className={inputClass}
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
                <label htmlFor="wiz-beans" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('field.beansMix')}
                </label>
                <select
                  id="wiz-beans"
                  value={beansMix}
                  onChange={(e) => setBeansMix(e.target.value)}
                  className={inputClass}
                >
                  <option value="">{t('common.select')}</option>
                  {['100% Arabica', '100% Robusta', 'Arabica/Robusta Blend', 'Liberica/Excelsa'].map(
                    (mix) => (
                      <option key={mix} value={mix}>
                        {tv('beans', mix)}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="wiz-website" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('field.website')}
                  </label>
                  <input
                    id="wiz-website"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className={inputClass}
                    placeholder="https://example.com"
                    maxLength={500}
                  />
                </div>

                <div>
                  <label htmlFor="wiz-price" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('field.price')}
                  </label>
                  <input
                    id="wiz-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className={inputClass}
                    placeholder="15.99"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('field.image')}</label>
                <ImageUpload image={image} onImageChange={setImage} onColorPick={setColor} />
              </div>

              {image && <ColorPicker color={color} onColorChange={setColor} />}

              <div>
                <label htmlFor="wiz-notes" className="block text-sm font-medium text-gray-700 mb-1">
                  {t('field.notesOptional')}
                </label>
                <textarea
                  id="wiz-notes"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className={inputClass}
                  placeholder={t('field.notesPlaceholder')}
                  maxLength={5000}
                />
              </div>

              <button
                onClick={handleNext}
                className="w-full bg-amber-600 text-white py-3 px-4 rounded-md hover:bg-amber-700 font-medium"
              >
                {t('common.next')}
              </button>
            </div>
          )}

          {/* Step 2: Quick Rating */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">{t('wizard.quickRating')}</h2>

              <div className="text-center">
                <p className="text-lg text-gray-700 mb-4">{t('wizard.howMuch')}</p>
                <div className="flex justify-center mb-6">
                  <RatingStars rating={rating} onRatingChange={setRating} />
                </div>
                <p className="text-3xl font-bold text-amber-600">{rating} / 10</p>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <p className="text-gray-700 mb-4">{t('wizard.addProfileQuestion')}</p>
                <p className="text-sm text-gray-500 mb-4">{t('wizard.addProfileHint')}</p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={handleSkipProfile}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300 font-medium"
                  >
                    {t('wizard.skipProfile')}
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex-1 bg-amber-600 text-white py-3 px-4 rounded-md hover:bg-amber-700 font-medium"
                  >
                    {t('wizard.continueProfile')}
                  </button>
                </div>
              </div>

              <button
                onClick={handleBack}
                className="w-full bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
              >
                {t('common.back')}
              </button>
            </div>
          )}

          {/* Step 3: Strength & Intensity */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">{t('wizard.strengthTitle')}</h2>
              <ScaleQuestion
                name="strength"
                question={t('wizard.strengthQuestion')}
                value={strengthIntensity}
                onChange={setStrengthIntensity}
              />
              <ScaleQuestion
                name="aroma"
                question={t('wizard.aromaQuestion')}
                value={aromaIntensity}
                onChange={setAromaIntensity}
              />
              {navButtons}
            </div>
          )}

          {/* Step 4: Taste Balance */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">{t('wizard.balanceTitle')}</h2>
              <ScaleQuestion
                name="sweetness"
                question={t('wizard.sweetnessQuestion')}
                value={sweetnessLevel}
                onChange={setSweetnessLevel}
              />
              <ScaleQuestion
                name="acidity"
                question={t('wizard.acidityQuestion')}
                value={acidityLevel}
                onChange={setAcidityLevel}
              />
              <ScaleQuestion
                name="bitterness"
                question={t('wizard.bitternessQuestion')}
                value={bitternessLevel}
                onChange={setBitternessLevel}
              />
              {navButtons}
            </div>
          )}

          {/* Step 5: Flavor Notes & Body */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">{t('wizard.notesBodyTitle')}</h2>

              <fieldset>
                <legend className="block text-lg font-medium text-gray-800 mb-3">
                  {t('wizard.notesQuestion')}
                </legend>
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
                      <span className="font-medium">{tv('note', note)}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <ScaleQuestion
                name="body"
                question={t('wizard.bodyQuestion')}
                value={bodyWeight}
                onChange={setBodyWeight}
              />
              <ScaleQuestion
                name="aftertaste"
                question={t('wizard.aftertasteQuestion')}
                value={aftertasteLength}
                onChange={setAftertasteLength}
              />
              <ScaleQuestion
                name="pleasant"
                question={t('wizard.pleasantQuestion')}
                value={aftertastePleasant}
                onChange={setAftertastePleasant}
              />
              {navButtons}
            </div>
          )}

          {/* Step 6: Review & Save */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">{t('wizard.reviewTitle')}</h2>

              <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                <div>
                  <h3 className="font-bold text-gray-900">{name}</h3>
                  <p className="text-gray-600">{t('common.by', { roaster })}</p>
                </div>

                {origin && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{t('field.origin')}:</span> {origin}
                  </p>
                )}

                {roastLevel && (
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{t('field.roastShort')}:</span> {tv('roast', roastLevel)}
                  </p>
                )}

                <div>
                  <p className="text-sm text-gray-700 font-medium mb-1">{t('wizard.ratingLabel')}</p>
                  <RatingStars rating={rating} readonly />
                </div>

                {!skipProfile && (
                  <>
                    <div className="border-t border-gray-300 pt-4">
                      <p className="font-medium text-gray-900 mb-2">{t('wizard.detectedProfile')}</p>
                      <span className="inline-block bg-amber-100 text-amber-800 px-3 py-1 rounded-full font-medium">
                        {/* The server calculates the profile on save */}
                        {t('wizard.autoProfile')}
                      </span>
                    </div>

                    {selectedNotes.length > 0 && (
                      <div>
                        <p className="font-medium text-gray-900 mb-2">{t('wizard.flavorNotes')}</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedNotes.map((note) => (
                            <span key={note} className="bg-gray-200 text-gray-700 px-2 py-1 rounded text-sm">
                              {tv('note', note)}
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
                    disabled={savedCoffeeId !== null}
                    className="mr-2"
                  />
                  <span className="text-gray-700">{t('wizard.keepPrivate')}</span>
                </label>
                <p className="text-xs text-gray-500 ml-6 mt-1">{t('wizard.privateHint')}</p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-300"
                  disabled={isSubmitting || savedCoffeeId !== null}
                >
                  {t('common.back')}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex-1 bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting
                    ? t('wizard.saving')
                    : savedCoffeeId !== null
                    ? t('wizard.saveProfileAgain')
                    : t('wizard.save')}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
