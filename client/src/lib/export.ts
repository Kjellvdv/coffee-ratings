import type { CoffeeWithDetails } from '@shared/schema';

/**
 * Export user's coffee collection to JSON format
 */
export function exportToJSON(coffees: CoffeeWithDetails[]): void {
  const exportData = coffees.map((coffee) => ({
    nombre: coffee.name,
    tostador: coffee.roaster,
    origen: coffee.origin || 'N/A',
    nivelTueste: coffee.roastLevel || 'N/A',
    metodoProcesamieto: coffee.processingMethod || 'N/A',
    precio: coffee.price || 'N/A',
    valoracion: coffee.rating,
    descripcion: coffee.description || '',
    perfilSabor: coffee.flavorProfile?.calculatedFlavorProfile || 'N/A',
    notasSabor: coffee.flavorProfile?.flavorNotes?.join(', ') || 'N/A',
    privado: coffee.isPrivate ? 'Sí' : 'No',
    fechaCreacion: new Date(coffee.createdAt).toLocaleDateString('es-ES'),
  }));

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });

  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mis-cafes-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export user's coffee collection to CSV format
 */
export function exportToCSV(coffees: CoffeeWithDetails[]): void {
  // CSV Headers (in Spanish)
  const headers = [
    'Nombre',
    'Tostador',
    'Origen',
    'Nivel de Tueste',
    'Método de Procesamiento',
    'Precio',
    'Valoración',
    'Descripción',
    'Perfil de Sabor',
    'Notas de Sabor',
    'Privado',
    'Fecha de Creación',
  ];

  // Convert data to CSV rows
  const rows = coffees.map((coffee) => {
    return [
      escapeCSV(coffee.name),
      escapeCSV(coffee.roaster),
      escapeCSV(coffee.origin || 'N/A'),
      escapeCSV(coffee.roastLevel || 'N/A'),
      escapeCSV(coffee.processingMethod || 'N/A'),
      coffee.price?.toString() || 'N/A',
      coffee.rating.toString(),
      escapeCSV(coffee.description || ''),
      escapeCSV(coffee.flavorProfile?.calculatedFlavorProfile || 'N/A'),
      escapeCSV(coffee.flavorProfile?.flavorNotes?.join(', ') || 'N/A'),
      coffee.isPrivate ? 'Sí' : 'No',
      new Date(coffee.createdAt).toLocaleDateString('es-ES'),
    ];
  });

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  // Add BOM for Excel UTF-8 support
  const BOM = '\uFEFF';
  const dataBlob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });

  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mis-cafes-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Escape special characters for CSV format
 */
function escapeCSV(value: string): string {
  if (!value) return '';

  // If value contains comma, quote, or newline, wrap in quotes and escape quotes
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }

  return value;
}
