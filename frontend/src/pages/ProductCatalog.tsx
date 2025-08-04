import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Product, Category } from '../types';
import { productService, categoryService } from '../services/api';
import ProductCard from '../components/ProductCard';

const ProductCatalog: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);

  // Filtres
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categoryIds: searchParams.get('categories')?.split(',').map(Number) || [],
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: searchParams.get('inStock') === 'true',
    isFeatured: searchParams.get('featured') === 'true',
    brand: searchParams.get('brand') || '',
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '12'),
  });

  const [brands, setBrands] = useState<string[]>([]);

  // Charger les catégories
  const fetchCategories = useCallback(async () => {
    try {
      const categoriesData = await categoryService.getAll();
      setCategories(categoriesData);
    } catch (err) {
      console.error('Erreur lors du chargement des catégories:', err);
    }
  }, []);

  // Charger les produits
  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const params: any = {
        page: filters.page,
        limit: filters.limit,
        sortBy,
        sortOrder,
      };

      if (filters.search) params.search = filters.search;
      if (filters.categoryIds.length > 0) params.categoryIds = filters.categoryIds;
      if (filters.minPrice) params.minPrice = parseFloat(filters.minPrice);
      if (filters.maxPrice) params.maxPrice = parseFloat(filters.maxPrice);
      if (filters.inStock) params.inStock = true;
      if (filters.isFeatured) params.isFeatured = true;
      if (filters.brand) params.brand = filters.brand;

      const response = await productService.getAll(params);
      setProducts(response.products);
      setTotal(response.total);

      // Extraire les marques uniques
      const brands = response.products
        .map(p => p.brand)
        .filter((brand): brand is string => brand !== undefined && brand !== null && brand !== '');
      const uniqueBrands = Array.from(new Set(brands));
      setBrands(uniqueBrands);

      // Mettre à jour l'URL
      const newSearchParams = new URLSearchParams();
      if (filters.search) newSearchParams.set('search', filters.search);
      if (filters.categoryIds.length > 0) newSearchParams.set('categories', filters.categoryIds.join(','));
      if (filters.minPrice) newSearchParams.set('minPrice', filters.minPrice);
      if (filters.maxPrice) newSearchParams.set('maxPrice', filters.maxPrice);
      if (filters.inStock) newSearchParams.set('inStock', 'true');
      if (filters.isFeatured) newSearchParams.set('featured', 'true');
      if (filters.brand) newSearchParams.set('brand', filters.brand);
      if (filters.page > 1) newSearchParams.set('page', filters.page.toString());
      if (filters.limit !== 12) newSearchParams.set('limit', filters.limit.toString());
      if (sortBy !== 'name') newSearchParams.set('sortBy', sortBy);
      if (sortOrder !== 'asc') newSearchParams.set('sortOrder', sortOrder);

      setSearchParams(newSearchParams);
    } catch (err) {
      console.error('Erreur lors du chargement des produits:', err);
    } finally {
      setLoading(false);
    }
  }, [filters, sortBy, sortOrder, setSearchParams]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handleCategoryToggle = (categoryId: number) => {
    setFilters(prev => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(categoryId)
        ? prev.categoryIds.filter(id => id !== categoryId)
        : [...prev.categoryIds, categoryId],
      page: 1,
    }));
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      categoryIds: [],
      minPrice: '',
      maxPrice: '',
      inStock: false,
      isFeatured: false,
      brand: '',
      page: 1,
      limit: 12,
    });
    setSortBy('name');
    setSortOrder('asc');
  };

  const totalPages = Math.ceil(total / filters.limit);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <Link to="/" className="hover:text-gray-700">Accueil</Link>
            <span>/</span>
            <span className="text-gray-900">Catalogue</span>
          </nav>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Catalogue de produits</h1>
              <p className="text-gray-600 mt-2">
                {total} produit{total > 1 ? 's' : ''} trouvé{total > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Bouton filtres mobile */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                </svg>
                Filtres
              </button>

              {/* Mode d'affichage */}
              <div className="flex border border-gray-300 rounded-lg">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 text-sm font-medium ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } rounded-l-lg`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h7v7H3V3zm0 11h7v7H3v-7zm11-11h7v7h-7V3zm0 11h7v7h-7v-7z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 text-sm font-medium ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  } rounded-r-lg`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Filtres - Desktop */}
          <div className={`lg:block ${showFilters ? 'block' : 'hidden'} lg:w-80 flex-shrink-0`}>
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-semibold text-gray-900">Filtres</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Effacer tout
                </button>
              </div>

              {/* Recherche */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Recherche</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Catégories */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Catégories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={filters.categoryIds.includes(category.id)}
                        onChange={() => handleCategoryToggle(category.id)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{category.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Prix */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Prix</h3>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    placeholder="Min"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    placeholder="Max"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Marques */}
              {brands.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Marques</h3>
                  <select
                    value={filters.brand}
                    onChange={(e) => handleFilterChange('brand', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Toutes les marques</option>
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Options */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Options</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">En stock uniquement</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.isFeatured}
                      onChange={(e) => handleFilterChange('isFeatured', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Produits vedettes</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu principal */}
          <div className="flex-1">
            {/* Barre d'outils */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">
                    {total} produit{total > 1 ? 's' : ''}
                  </span>
                  {filters.categoryIds.length > 0 && (
                    <span className="text-sm text-gray-500">
                      dans {filters.categoryIds.length} catégorie{filters.categoryIds.length > 1 ? 's' : ''}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  <label className="text-sm text-gray-700">Trier par:</label>
                  <select
                    value={`${sortBy}-${sortOrder}`}
                    onChange={(e) => {
                      const [newSortBy, newSortOrder] = e.target.value.split('-');
                      setSortBy(newSortBy);
                      setSortOrder(newSortOrder as 'asc' | 'desc');
                    }}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="name-asc">Nom A-Z</option>
                    <option value="name-desc">Nom Z-A</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                    <option value="createdAt-desc">Plus récents</option>
                    <option value="createdAt-asc">Plus anciens</option>
                  </select>

                  <select
                    value={filters.limit}
                    onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={12}>12 par page</option>
                    <option value={24}>24 par page</option>
                    <option value={48}>48 par page</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Grille de produits */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="text-gray-600">Chargement des produits...</span>
                </div>
              </div>
            ) : products.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch' : 'space-y-4'}>
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun produit trouvé</h3>
                <p className="text-gray-600 mb-4">
                  Essayez d'ajuster vos filtres ou de modifier votre recherche.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Effacer les filtres
                </button>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <nav className="flex items-center space-x-2">
                  <button
                    onClick={() => handleFilterChange('page', filters.page - 1)}
                    disabled={filters.page <= 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Précédent
                  </button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const page = i + 1;
                    if (totalPages <= 5) {
                      return page;
                    }
                    if (page === 1 || page === totalPages) {
                      return page;
                    }
                    if (page >= filters.page - 1 && page <= filters.page + 1) {
                      return page;
                    }
                    if (page === filters.page - 2 || page === filters.page + 2) {
                      return '...';
                    }
                    return null;
                  }).filter(Boolean).map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' && handleFilterChange('page', page)}
                      disabled={page === '...'}
                      className={`px-3 py-2 border rounded-lg text-sm font-medium ${
                        page === filters.page
                          ? 'bg-blue-600 text-white border-blue-600'
                          : page === '...'
                          ? 'border-gray-300 text-gray-500 cursor-not-allowed'
                          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => handleFilterChange('page', filters.page + 1)}
                    disabled={filters.page >= totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                  </button>
                </nav>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCatalog; 