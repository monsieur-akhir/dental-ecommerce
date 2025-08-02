import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productService, categoryService } from '../services/api';
import configService from '../services/configService';
import { Product, Category } from '../types';
import ProductCard from '../components/ProductCard';

const Home: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState({
    heroTitle: 'QUALITÉ À PRIX ACCESSIBLE !',
    heroSubtitle: 'Le meilleur de Bestdent.',
    heroCtaText: 'Découvrir maintenant !',
    heroCtaLink: '/products',
    heroImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
    heroProduct1Image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    heroProduct1Name: 'Fil dentaire',
    heroProduct2Image: 'https://images.unsplash.com/photo-1581595219315-a187dd40c322?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
    heroProduct2Name: 'Gants jetables',
    categoryBadges: {} as { [key: string]: string },
    siteName: 'DentalPro',
    freeShippingThreshold: '50',
    currencySymbol: '€'
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Charger la configuration et les données en parallèle
        const [configResponse, featuredProductsResponse, allProductsResponse, categoriesResponse] = await Promise.all([
          configService.getHomepageConfig(),
          productService.getAll({ isFeatured: true, limit: 12 }), // Augmenté à 12 produits recommandés
          productService.getAll({ limit: 24 }), // Charger 24 produits au total
          categoryService.getAll()
        ]);

        // Traiter la configuration
        setConfig({
          heroTitle: configResponse.hero_title || 'QUALITÉ À PRIX ACCESSIBLE !',
          heroSubtitle: configResponse.hero_subtitle || 'Le meilleur de Bestdent.',
          heroCtaText: configResponse.hero_cta_text || 'Découvrir maintenant !',
          heroCtaLink: configResponse.hero_cta_link || '/products',
          heroImage: configResponse.hero_image || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80',
          heroProduct1Image: configResponse.hero_product_1_image || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
          heroProduct1Name: configResponse.hero_product_1_name || 'Fil dentaire',
          heroProduct2Image: configResponse.hero_product_2_image || 'https://images.unsplash.com/photo-1581595219315-a187dd40c322?ixlib=rb-4.0.3&auto=format&fit=crop&w=150&q=80',
          heroProduct2Name: configResponse.hero_product_2_name || 'Gants jetables',
          categoryBadges: configResponse.category_badges || {},
          siteName: configResponse.site_name || 'DentalPro',
          freeShippingThreshold: configResponse.free_shipping_threshold || '50',
          currencySymbol: configResponse.currency_symbol || '€'
        });

        // Traiter les produits et catégories
        setFeaturedProducts(featuredProductsResponse.products || []);
        setAllProducts(allProductsResponse.products || []);
        setCategories(categoriesResponse || []);
      } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        setError('Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loader w-12 h-12 mx-auto mb-4"></div>
          <p className="text-primary-600">Chargement de la page d'accueil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="h-12 w-12 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-error-600 text-xl font-semibold mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn btn-primary"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${config.heroImage})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-primary-900/80 to-primary-800/60"></div>
        </div>
        
        <div className="relative container mx-auto px-4 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Contenu principal */}
            <div className="text-white">
              <h1 className="text-4xl lg:text-6xl font-display font-bold mb-6 leading-tight">
                {config.heroTitle}
              </h1>
              <p className="text-xl lg:text-2xl text-primary-100 mb-8 leading-relaxed">
                {config.heroSubtitle}
              </p>
              
              {/* Produits de la bannière */}
              <div className="flex items-center space-x-6 mb-8">
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <img 
                    src={config.heroProduct1Image} 
                    alt={config.heroProduct1Name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <span className="text-sm font-medium">{config.heroProduct1Name}</span>
                </div>
                <div className="flex items-center space-x-3 bg-white/10 backdrop-blur-sm rounded-xl p-3">
                  <img 
                    src={config.heroProduct2Image} 
                    alt={config.heroProduct2Name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                  <span className="text-sm font-medium">{config.heroProduct2Name}</span>
                </div>
              </div>

              {/* Call to Action */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to={config.heroCtaLink}
                  className="btn btn-primary btn-lg text-lg px-8 py-4"
                >
                  {config.heroCtaText}
                </Link>
                <Link
                  to="/products"
                  className="btn btn-outline btn-lg text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary-800"
                >
                  Voir tous les produits
                </Link>
              </div>
            </div>

            {/* Statistiques */}
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">500+</div>
                <div className="text-primary-100">Produits disponibles</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">1000+</div>
                <div className="text-primary-100">Professionnels satisfaits</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">24h</div>
                <div className="text-primary-100">Livraison express</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center">
                <div className="text-3xl font-bold text-white mb-2">{config.freeShippingThreshold}{config.currencySymbol}</div>
                <div className="text-primary-100">Livraison gratuite</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Catégories Principales */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-primary-800 mb-4">
              Catégories Principales
            </h2>
            <p className="text-lg text-primary-600 max-w-2xl mx-auto">
              Découvrez notre gamme complète d'équipements et fournitures dentaires professionnelles
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.slice(0, 8).map((category) => (
              <Link
                key={category.id}
                to={`/products?categoryId=${category.id}`}
                className="group bg-white rounded-2xl shadow-soft p-6 text-center hover:shadow-large transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-secondary-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:from-accent-100 group-hover:to-accent-200 transition-all duration-300">
                  <svg className="w-8 h-8 text-primary-600 group-hover:text-accent-600 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <h3 className="font-semibold text-primary-800 mb-2 group-hover:text-accent-600 transition-colors duration-300">
                  {category.name}
                </h3>
                {config.categoryBadges[category.name] && (
                  <span className="inline-block px-2 py-1 bg-accent-100 text-accent-700 text-xs font-medium rounded-full">
                    {config.categoryBadges[category.name]}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Produits Recommandés */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-primary-800 mb-4">
              Produits Recommandés
            </h2>
            <p className="text-lg text-primary-600 max-w-2xl mx-auto">
              Nos produits les plus populaires et appréciés par les professionnels
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} showQuickActions={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-primary-800 mb-2">
                Aucun produit vedette
              </h3>
              <p className="text-primary-600 mb-6">
                Aucun produit vedette n'est disponible pour le moment.
              </p>
              <Link to="/products" className="btn btn-primary">
                Voir tous les produits
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Tous les Produits */}
      <section className="py-16 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-display font-bold text-primary-800 mb-4">
              Notre Catalogue Complet
            </h2>
            <p className="text-lg text-primary-600 max-w-2xl mx-auto">
              Découvrez notre gamme complète d'équipements et fournitures dentaires de qualité professionnelle
            </p>
          </div>

          {allProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {allProducts.map((product) => (
                <ProductCard key={product.id} product={product} showQuickActions={true} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-primary-800 mb-2">
                Aucun produit disponible
              </h3>
              <p className="text-primary-600 mb-6">
                Aucun produit n'est disponible pour le moment.
              </p>
            </div>
          )}

          {allProducts.length > 0 && (
            <div className="text-center mt-12">
              <Link to="/products" className="btn btn-primary btn-lg text-lg px-8 py-4">
                Voir tous les produits ({allProducts.length})
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Call to Action Final */}
      <section className="py-16 bg-gradient-to-r from-primary-700 to-primary-800">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-display font-bold text-white mb-6">
            Prêt à équiper votre cabinet ?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de professionnels qui nous font confiance pour leurs équipements dentaires
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="btn btn-primary btn-lg text-lg px-8 py-4">
              Commencer mes achats
            </Link>
            <Link to="/contact" className="btn btn-outline btn-lg text-lg px-8 py-4 border-white text-white hover:bg-white hover:text-primary-800">
              Nous contacter
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;

