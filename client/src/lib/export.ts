import type { CoffeeWithDetails } from '@shared/schema';
import type { Lang, TranslationKey } from '../i18n';

type Translate = (key: TranslationKey) => string;
type TranslateValue = (group: 'roast' | 'process' | 'note' | 'profile', value: string | null | undefined) => string;

export interface ExportOptions {
  lang: Lang;
  locale: string;
  t: Translate;
  tv: TranslateValue;
}

function rowsFor(coffees: CoffeeWithDetails[], { locale, t, tv }: ExportOptions) {
  const na = t('common.notAvailable');
  return coffees.map((coffee) => ({
    name: coffee.name,
    roaster: coffee.roaster,
    origin: coffee.origin || na,
    roastLevel: tv('roast', coffee.roastLevel) || na,
    processingMethod: tv('process', coffee.processingMethod) || na,
    price: coffee.price ?? na,
    rating: coffee.rating,
    description: coffee.description || '',
    flavorProfile: tv('profile', coffee.flavorProfile?.calculatedFlavorProfile) || na,
    flavorNotes: coffee.flavorProfile?.flavorNotes?.map((n) => tv('note', n)).join(', ') || na,
    private: coffee.isPrivate ? t('common.yes') : t('common.no'),
    createdAt: new Date(coffee.createdAt).toLocaleDateString(locale),
  }));
}

// The Spanish export keeps the JSON keys it always had
const SPANISH_JSON_KEYS: Record<string, string> = {
  name: 'nombre',
  roaster: 'tostador',
  origin: 'origen',
  roastLevel: 'nivelTueste',
  processingMethod: 'metodoProcesamieto',
  price: 'precio',
  rating: 'valoracion',
  description: 'descripcion',
  flavorProfile: 'perfilSabor',
  flavorNotes: 'notasSabor',
  private: 'privado',
  createdAt: 'fechaCreacion',
};

function download(content: BlobPart, type: string, filename: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function filename(options: ExportOptions, extension: string) {
  return `${options.t('export.filename')}-${new Date().toISOString().split('T')[0]}.${extension}`;
}

/**
 * Export user's coffee collection to JSON format
 */
export function exportToJSON(coffees: CoffeeWithDetails[], options: ExportOptions): void {
  const rows = rowsFor(coffees, options).map((row) =>
    options.lang === 'es'
      ? Object.fromEntries(Object.entries(row).map(([key, value]) => [SPANISH_JSON_KEYS[key] ?? key, value]))
      : row
  );
  download(JSON.stringify(rows, null, 2), 'application/json', filename(options, 'json'));
}

/**
 * Export user's coffee collection to CSV format
 */
export function exportToCSV(coffees: CoffeeWithDetails[], options: ExportOptions): void {
  const { t } = options;
  const headers = [
    t('export.col.name'),
    t('field.roaster'),
    t('field.origin'),
    t('field.roastLevel'),
    t('field.processingMethod'),
    t('field.price'),
    t('field.rating'),
    t('export.col.description'),
    t('detail.flavorProfile'),
    t('export.col.flavorNotes'),
    t('export.col.private'),
    t('export.col.createdAt'),
  ];

  const rows = rowsFor(coffees, options).map((row) =>
    Object.values(row).map((value) => escapeCSV(String(value)))
  );

  const csvContent = [headers.map(escapeCSV).join(','), ...rows.map((row) => row.join(','))].join('\n');

  // BOM so Excel opens the file as UTF-8
  download('﻿' + csvContent, 'text/csv;charset=utf-8;', filename(options, 'csv'));
}

/**
 * Escape a CSV cell. Cells starting with = + - @ get a leading apostrophe so a
 * spreadsheet shows them as text instead of running them as a formula (a
 * coffee name copied from someone else's feed could carry one).
 */
function escapeCSV(value: string): string {
  if (!value) return '';

  let safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;

  if (/[",\n\r]/.test(safe)) {
    safe = `"${safe.replace(/"/g, '""')}"`;
  }

  return safe;
}
