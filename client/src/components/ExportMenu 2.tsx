import { useState } from 'react';
import type { CoffeeWithDetails } from '@shared/schema';
import { exportToJSON, exportToCSV } from '../lib/export';

interface ExportMenuProps {
  coffees: CoffeeWithDetails[];
}

export function ExportMenu({ coffees }: ExportMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExportJSON = () => {
    exportToJSON(coffees);
    setIsOpen(false);
  };

  const handleExportCSV = () => {
    exportToCSV(coffees);
    setIsOpen(false);
  };

  if (coffees.length === 0) {
    return null; // Don't show export if no coffees
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center gap-2"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
        Exportar
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-20 border border-gray-200">
            <div className="py-1">
              <button
                onClick={handleExportJSON}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Exportar como JSON
              </button>

              <button
                onClick={handleExportCSV}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                Exportar como CSV
              </button>

              <div className="border-t border-gray-200 mt-1 pt-1 px-4 py-2">
                <p className="text-xs text-gray-500">
                  {coffees.length} {coffees.length === 1 ? 'café' : 'cafés'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
