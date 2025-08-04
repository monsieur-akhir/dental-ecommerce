import React, { useState } from 'react';
import { Product } from '../types';

interface ProductVariantsProps {
  product: Product;
  onVariantChange?: (color?: string, size?: string) => void;
  selectedColor?: string;
  selectedSize?: string;
}

const ProductVariants: React.FC<ProductVariantsProps> = ({
  product,
  onVariantChange,
  selectedColor,
  selectedSize
}) => {
  const [localSelectedColor, setLocalSelectedColor] = useState<string | undefined>(selectedColor);
  const [localSelectedSize, setLocalSelectedSize] = useState<string | undefined>(selectedSize);

  const handleColorChange = (color: string) => {
    setLocalSelectedColor(color);
    onVariantChange?.(color, localSelectedSize);
  };

  const handleSizeChange = (size: string) => {
    setLocalSelectedSize(size);
    onVariantChange?.(localSelectedColor, size);
  };

  const currentColor = selectedColor || localSelectedColor;
  const currentSize = selectedSize || localSelectedSize;

  if (!product.colors?.length && !product.sizes?.length) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Couleurs */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-primary-800 mb-2">
            Couleur {currentColor && `: ${currentColor}`}
          </h4>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((color) => (
              <button
                key={color}
                onClick={() => handleColorChange(color)}
                className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                  currentColor === color
                    ? 'border-accent-500 bg-accent-50 text-accent-700'
                    : 'border-primary-200 bg-white text-primary-700 hover:border-primary-300 hover:bg-primary-50'
                }`}
              >
                {color}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tailles */}
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-primary-800 mb-2">
            Taille {currentSize && `: ${currentSize}`}
          </h4>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => handleSizeChange(size)}
                className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                  currentSize === size
                    ? 'border-accent-500 bg-accent-50 text-accent-700'
                    : 'border-primary-200 bg-white text-primary-700 hover:border-primary-300 hover:bg-primary-50'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Informations sur les variantes */}
      <div className="text-xs text-primary-600 space-y-1">
        {product.colors && product.colors.length > 0 && (
          <p>• {product.colors.length} couleur{product.colors.length > 1 ? 's' : ''} disponible{product.colors.length > 1 ? 's' : ''}</p>
        )}
        {product.sizes && product.sizes.length > 0 && (
          <p>• {product.sizes.length} taille{product.sizes.length > 1 ? 's' : ''} disponible{product.sizes.length > 1 ? 's' : ''}</p>
        )}
      </div>
    </div>
  );
};

export default ProductVariants; 