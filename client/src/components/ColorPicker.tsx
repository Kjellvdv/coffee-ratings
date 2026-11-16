import { useI18n } from '../i18n';

interface ColorPickerProps {
  color: string;
  onColorChange: (color: string) => void;
}

export function ColorPicker({ color, onColorChange }: ColorPickerProps) {
  const { t } = useI18n();

  return (
    <div className="space-y-2">
      <label htmlFor="color-hex" className="block text-sm font-medium text-gray-700">
        {t('color.label')}
      </label>
      <div className="flex gap-3 items-center">
        <input
          type="color"
          value={color || '#8B4513'}
          onChange={(e) => onColorChange(e.target.value)}
          aria-label={t('color.label')}
          className="w-16 h-16 rounded border-2 border-gray-300 cursor-pointer"
        />
        <div className="flex-1">
          <input
            id="color-hex"
            type="text"
            value={color || ''}
            onChange={(e) => {
              const value = e.target.value;
              if (value.match(/^#[0-9A-Fa-f]{0,6}$/)) {
                onColorChange(value);
              }
            }}
            placeholder="#8B4513"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500"
            maxLength={7}
          />
          <p className="text-xs text-gray-500 mt-1">{t('color.hint')}</p>
        </div>
      </div>
    </div>
  );
}
