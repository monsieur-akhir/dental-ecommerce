import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { Product, Category } from '../types';
import { productService, categoryService } from '../services/api';

const Products: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalProducts, setTotalProducts] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  // Filtres
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    categoryId: searchParams.get('categoryId') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    inStock: searchParams.get('inStock') === 'true',
    featured: searchParams.get('featured') === 'true',
    sortBy: searchParams.get('sortBy') || 'name',
    sortOrder: searchParams.get('sortOrder') || 'asc'
  });

  const productsPerPage = 20; // Augmenter le nombre de produits par page

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Construire les paramètres de recherche
        const searchParams: any = {
          page: currentPage,
          limit: productsPerPage
        };

        // Ajouter les filtres seulement s'ils ont des valeurs
        if (filters.search) searchParams.search = filters.search;
        if (filters.categoryId) searchParams.categoryId = parseInt(filters.categoryId);
        if (filters.featured) searchParams.isFeatured = true;
        if (filters.inStock) searchParams.isActive = true; // En stock = produits actifs
        if (filters.minPrice) searchParams.minPrice = parseFloat(filters.minPrice);
        if (filters.maxPrice) searchParams.maxPrice = parseFloat(filters.maxPrice);
        if (filters.sortBy && filters.sortOrder) {
          searchParams.sortBy = filters.sortBy;
          searchParams.sortOrder = filters.sortOrder;
        }

        const [productsResponse, categoriesResponse] = await Promise.all([
          productService.getAll(searchParams),
          categoryService.getAll()
        ]);

        setProducts(productsResponse.products || []);
        setTotalProducts(productsResponse.total || 0);
        setCategories(categoriesResponse || []);
      } catch (err) {
        setError('Erreur lors du chargement des produits');
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, currentPage]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    setCurrentPage(1);

    // Mettre à jour les paramètres d'URL
    const newSearchParams = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== '' && value !== false) {
        newSearchParams.set(key, value.toString());
      }
    });
    setSearchParams(newSearchParams);
  };

  const clearFilters = () => {
    const newFilters = {
      search: '',
      categoryId: '',
      minPrice: '',
      maxPrice: '',
      inStock: false,
      featured: false,
      sortBy: 'name',
      sortOrder: 'asc'
    };
    setFilters(newFilters);
    setCurrentPage(1);
    setSearchParams({});
  };

  const totalPages = Math.ceil(totalProducts / productsPerPage);



  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="loader w-12 h-12 mx-auto mb-4"></div>
              <p className="text-primary-600">Chargement des produits...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header Section */}
      <section className="bg-gradient-to-br from-primary-700 to-primary-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-display font-bold mb-4">
              Catalogue Produits
            </h1>
            <p className="text-xl text-primary-100 max-w-2xl mx-auto">
              Découvrez notre gamme complète d'équipements dentaires professionnels
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filtres Sidebar */}
          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-2xl shadow-soft p-4 sticky top-8">
              {/* Header Filtres */}
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-primary-800">Filtres</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden p-2 text-primary-600 hover:text-accent-600 transition-colors duration-200"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                </button>
              </div>

              <div className={`${showFilters ? 'block' : 'hidden lg:block'}`}>
                {/* Recherche */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Recherche
                  </label>
                  <input
                    type="text"
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    placeholder="Nom du produit..."
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200 text-sm"
                  />
                </div>

                {/* Catégories */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={filters.categoryId}
                    onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200 text-sm"
                  >
                    <option value="">Toutes les catégories</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Prix */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Fourchette de prix
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      placeholder="Min"
                      className="px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200 text-sm"
                    />
                    <input
                      type="number"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      placeholder="Max"
                      className="px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200 text-sm"
                    />
                  </div>
                </div>

                {/* Options */}
                <div className="mb-4 space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.inStock}
                      onChange={(e) => handleFilterChange('inStock', e.target.checked)}
                      className="w-4 h-4 text-accent-600 border-primary-300 rounded focus:ring-accent-500"
                    />
                    <span className="ml-2 text-sm text-primary-700">En stock uniquement</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.featured}
                      onChange={(e) => handleFilterChange('featured', e.target.checked)}
                      className="w-4 h-4 text-accent-600 border-primary-300 rounded focus:ring-accent-500"
                    />
                    <span className="ml-2 text-sm text-primary-700">Produits vedettes</span>
                  </label>
                </div>

                {/* Tri */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-primary-700 mb-2">
                    Trier par
                  </label>
                  <select
                    value={`${filters.sortBy}-${filters.sortOrder}`}
                    onChange={(e) => {
                      const [sortBy, sortOrder] = e.target.value.split('-');
                      handleFilterChange('sortBy', sortBy);
                      handleFilterChange('sortOrder', sortOrder);
                    }}
                    className="w-full px-3 py-2 border border-primary-200 rounded-lg focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-all duration-200 text-sm"
                  >
                    <option value="name-asc">Nom (A-Z)</option>
                    <option value="name-desc">Nom (Z-A)</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                    <option value="createdAt-desc">Plus récents</option>
                    <option value="rating-desc">Mieux notés</option>
                  </select>
                </div>

                {/* Boutons */}
                <div className="space-y-2">
                  <button
                    onClick={clearFilters}
                    className="w-full px-3 py-2 text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-50 transition-all duration-200 font-medium text-sm"
                  >
                    Effacer les filtres
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Contenu Principal */}
          <div className="flex-1">
            {/* Résultats et Actions */}
            <div className="bg-white rounded-2xl shadow-soft p-4 mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-semibold text-primary-800 mb-1">
                    {totalProducts} produit{totalProducts > 1 ? 's' : ''} trouvé{totalProducts > 1 ? 's' : ''}
                  </h2>
                  {filters.search && (
                    <p className="text-sm text-primary-600">
                      Recherche pour : <span className="font-medium">"{filters.search}"</span>
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center space-x-2 px-3 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors duration-200 text-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.207A1 1 0 013 6.5V4z" />
                  </svg>
                  <span>Filtres</span>
                </button>
              </div>
            </div>

            {/* Grille de Produits */}
            {error ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-primary-800 mb-2">Erreur de chargement</h3>
                <p className="text-primary-600 mb-4">{error}</p>
                <button 
                  onClick={() => window.location.reload()}
                  className="btn btn-primary"
                >
                  Réessayer
                </button>
              </div>
            ) : products.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6 items-stretch">
                  {products.map((product) => (
                    <ProductCard key={product.id} product={product} showQuickActions={true} />
                  ))}
                </div>

                {/* Pagination et Actions */}
                <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {/* Informations de pagination */}
                  <div className="text-sm text-primary-600">
                    Affichage de {((currentPage - 1) * productsPerPage) + 1} à {Math.min(currentPage * productsPerPage, totalProducts)} sur {totalProducts} produits
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 text-primary-600 border border-primary-200 rounded-xl hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Précédent
                      </button>
                      
                      {/* Pages visibles */}
                      {(() => {
                        const pages = [];
                        const startPage = Math.max(1, currentPage - 2);
                        const endPage = Math.min(totalPages, currentPage + 2);
                        
                        for (let i = startPage; i <= endPage; i++) {
                          pages.push(i);
                        }
                        
                        return pages.map((page) => (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-4 py-2 rounded-xl transition-all duration-200 ${
                              currentPage === page
                                ? 'bg-accent-500 text-white shadow-medium'
                                : 'text-primary-600 border border-primary-200 hover:bg-primary-50'
                            }`}
                          >
                            {page}
                          </button>
                        ));
                      })()}
                      
                      <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 text-primary-600 border border-primary-200 rounded-xl hover:bg-primary-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                      >
                        Suivant
                      </button>
                    </nav>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-primary-800 mb-2">Aucun produit trouvé</h3>
                <p className="text-primary-600 mb-6">
                  Aucun produit ne correspond à vos critères de recherche
                </p>
                <button
                  onClick={clearFilters}
                  className="btn btn-primary"
                >
                  Effacer les filtres
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Products;

