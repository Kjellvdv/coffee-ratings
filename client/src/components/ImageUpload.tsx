import { useRef } from 'react';

interface ImageUploadProps {
  image: string | null;
  onImageChange: (image: string | null) => void;
  onColorPick?: (color: string) => void;
}

export function ImageUpload({ image, onImageChange, onColorPick }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 10MB.');
      return;
    }

    // Read file as base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      onImageChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!image || !onColorPick) return;

    const img = e.currentTarget;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Get click coordinates relative to image
    const rect = img.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Scale coordinates to actual image size
    const scaleX = img.naturalWidth / rect.width;
    const scaleY = img.naturalHeight / rect.height;
    const actualX = Math.floor(x * scaleX);
    const actualY = Math.floor(y * scaleY);

    // Draw image to canvas
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    // Get pixel color
    const pixel = ctx.getImageData(actualX, actualY, 1, 1).data;
    const hex = `#${((1 << 24) + (pixel[0] << 16) + (pixel[1] << 8) + pixel[2])
      .toString(16)
      .slice(1)}`;

    onColorPick(hex);
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {image ? (
        <div className="space-y-2">
          <div className="relative">
            <img
              src={image}
              alt="Vista previa"
              className={`w-full h-64 object-cover rounded-lg ${
                onColorPick ? 'cursor-crosshair' : ''
              }`}
              onClick={handleImageClick}
            />
            {onColorPick && (
              <p className="text-xs text-gray-500 mt-1">
                Haz clic en la imagen para extraer el color
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-300"
            >
              Cambiar Imagen
            </button>
            <button
              type="button"
              onClick={() => onImageChange(null)}
              className="flex-1 bg-red-100 text-red-700 py-2 px-4 rounded-md hover:bg-red-200"
            >
              Eliminar
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="w-full h-64 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center hover:border-amber-500 hover:bg-amber-50 transition-colors"
        >
          <svg
            className="w-12 h-12 text-gray-400 mb-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-gray-600">Subir imagen del café</span>
          <span className="text-xs text-gray-400 mt-1">PNG, JPG hasta 10MB</span>
        </button>
      )}

      {/* Hidden canvas for color extraction */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
