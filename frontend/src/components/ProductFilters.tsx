import React, { useState, useEffect } from 'react';
import { productService } from '../services/api';

interface ProductFiltersProps {
  onFilterChange: (filters: {
    search?: string;
    categoryId?: number;
    color?: string;
    size?: string;
    minPrice?: number;
    maxPrice?: number;
  }) => void;
  currentFilters: {
    search?: string;
    categoryId?: number;
    color?: string;
    size?: string;
    minPrice?: number;
    maxPrice?: number;
  };
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  onFilterChange,
  currentFilters
}) => {
  const [availableColors, setAvailableColors] = useState<string[]>([]);
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVariants = async () => {
      try {
        const [colors, sizes] = await Promise.all([
          productService.getAvailableColors(),
          productService.getAvailableSizes()
        ]);
        setAvailableColors(colors);
        setAvailableSizes(sizes);
      } catch (error) {
        console.error('Erreur lors du chargement des variantes:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVariants();
  }, []);

  const handleFilterChange = (key: string, value: any) => {
    onFilterChange({
      ...currentFilters,
      [key]: value
    });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-soft p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-primary-200 rounded w-1/4"></div>
          <div className="h-4 bg-primary-200 rounded w-1/2"></div>
          <div className="h-4 bg-primary-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-soft p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary-800">Filtres</h3>
        <button
          onClick={clearFilters}
          className="text-sm text-accent-600 hover:text-accent-700 font-medium"
        >
          Effacer tout
        </button>
      </div>

      {/* Recherche */}
      <div>
        <label className="block text-sm font-medium text-primary-700 mb-2">
          Rechercher
        </label>
        <input
          type="text"
          value={currentFilters.search || ''}
          onChange={(e) => handleFilterChange('search', e.target.value)}
          placeholder="Nom du produit..."
          className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
        />
      </div>

      {/* Couleurs */}
      {availableColors.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-2">
            Couleur
          </label>
          <select
            value={currentFilters.color || ''}
            onChange={(e) => handleFilterChange('color', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
          >
            <option value="">Toutes les couleurs</option>
            {availableColors.map((color) => (
              <option key={color} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tailles */}
      {availableSizes.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-primary-700 mb-2">
            Taille
          </label>
          <select
            value={currentFilters.size || ''}
            onChange={(e) => handleFilterChange('size', e.target.value || undefined)}
            className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
          >
            <option value="">Toutes les tailles</option>
            {availableSizes.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Prix */}
      <div>
        <label className="block text-sm font-medium text-primary-700 mb-2">
          Prix
        </label>
        <div className="grid grid-cols-2 gap-2">
          <input
            type="number"
            placeholder="Min"
            value={currentFilters.minPrice || ''}
            onChange={(e) => handleFilterChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
          />
          <input
            type="number"
            placeholder="Max"
            value={currentFilters.maxPrice || ''}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
            className="px-3 py-2 border border-primary-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Filtres actifs */}
      {Object.values(currentFilters).some(value => value !== undefined && value !== '') && (
        <div className="pt-4 border-t border-primary-100">
          <h4 className="text-sm font-medium text-primary-700 mb-2">Filtres actifs :</h4>
          <div className="flex flex-wrap gap-2">
            {currentFilters.search && (
              <span className="inline-flex items-center px-2 py-1 bg-accent-100 text-accent-700 text-xs rounded-full">
                Recherche: {currentFilters.search}
                <button
                  onClick={() => handleFilterChange('search', undefined)}
                  className="ml-1 text-accent-600 hover:text-accent-800"
                >
                  ×
                </button>
              </span>
            )}
            {currentFilters.color && (
              <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-700 text-xs rounded-full">
                Couleur: {currentFilters.color}
                <button
                  onClick={() => handleFilterChange('color', undefined)}
                  className="ml-1 text-primary-600 hover:text-primary-800"
                >
                  ×
                </button>
              </span>
            )}
            {currentFilters.size && (
              <span className="inline-flex items-center px-2 py-1 bg-secondary-100 text-secondary-700 text-xs rounded-full">
                Taille: {currentFilters.size}
                <button
                  onClick={() => handleFilterChange('size', undefined)}
                  className="ml-1 text-secondary-600 hover:text-secondary-800"
                >
                  ×
                </button>
              </span>
            )}
            {(currentFilters.minPrice || currentFilters.maxPrice) && (
              <span className="inline-flex items-center px-2 py-1 bg-warning-100 text-warning-700 text-xs rounded-full">
                Prix: {currentFilters.minPrice || 0}€ - {currentFilters.maxPrice || '∞'}€
                <button
                  onClick={() => {
                    handleFilterChange('minPrice', undefined);
                    handleFilterChange('maxPrice', undefined);
                  }}
                  className="ml-1 text-warning-600 hover:text-warning-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductFilters; 