import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useNotification } from '../contexts/NotificationContext';
import { productService } from '../services/api';
import { Product } from '../types';
import { getImageUrl, handleImageError } from '../utils/imageUtils';
import ProductVariants from '../components/ProductVariants';
import ProductCard from '../components/ProductCard';
import SimilarProductCard from '../components/SimilarProductCard';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(product?.color);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product?.size);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  const { addToCart, isAddingToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();
  const { addNotification } = useNotification();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const productData = await productService.getById(parseInt(id));
        setProduct(productData);
        
        // Charger les produits similaires après avoir récupéré le produit
        if (productData) {
          await fetchSimilarProducts(
            productData.id,
            productData.name,
            productData.category?.id,
            productData.brand
          );
        }
      } catch (err) {
        console.error('Erreur lors du chargement du produit:', err);
        setError('Produit non trouvé');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (product) {
      try {
        await addToCart(product, quantity);
      } catch (error) {
        addNotification({
          type: 'error',
          title: 'Erreur',
          message: 'Impossible d\'ajouter le produit au panier. Veuillez réessayer.',
          duration: 5000
        });
      }
    }
  };

  const handleVariantChange = (color?: string, size?: string) => {
    setSelectedColor(color);
    setSelectedSize(size);
  };

  const fetchSimilarProducts = async (productId: number, productName: string, categoryId?: number, brand?: string) => {
    try {
      setLoadingSimilar(true);
      
      // Extraire les mots-clés du nom du produit
      const keywords = productName
        .toLowerCase()
        .split(/\s+/)
        .filter(word => word.length > 2) // Ignorer les mots trop courts
        .filter(word => !['de', 'la', 'le', 'et', 'ou', 'avec', 'pour', 'dans', 'sur', 'par'].includes(word)); // Ignorer les mots de liaison

      // Rechercher des produits avec des noms similaires
      const similarProducts: Product[] = [];
      
      // Stratégie 1: Recherche par mots-clés dans le nom
      for (const keyword of keywords) {
        if (similarProducts.length >= 8) break;
        
        const params: any = {
          search: keyword,
          limit: 12,
          excludeId: productId
        };
        
        if (categoryId) {
          params.categoryIds = [categoryId];
        }
        
        const response = await productService.getAll(params);
        const newProducts = response.products.filter(p => 
          !similarProducts.some(sp => sp.id === p.id)
        );
        similarProducts.push(...newProducts.slice(0, 8 - similarProducts.length));
      }

      // Stratégie 2: Même marque avec nom similaire
      if (brand && similarProducts.length < 8) {
        const params: any = {
          brand: brand,
          limit: 12,
          excludeId: productId
        };
        
        const response = await productService.getAll(params);
        const brandProducts = response.products.filter(p => 
          !similarProducts.some(sp => sp.id === p.id) &&
          // Vérifier si le nom contient des mots-clés similaires
          keywords.some(keyword => 
            p.name.toLowerCase().includes(keyword)
          )
        );
        similarProducts.push(...brandProducts.slice(0, 8 - similarProducts.length));
      }

      // Stratégie 3: Même catégorie avec nom similaire
      if (categoryId && similarProducts.length < 8) {
        const params: any = {
          categoryIds: [categoryId],
          limit: 12,
          excludeId: productId
        };
        
        const response = await productService.getAll(params);
        const categoryProducts = response.products.filter(p => 
          !similarProducts.some(sp => sp.id === p.id) &&
          // Vérifier si le nom contient des mots-clés similaires
          keywords.some(keyword => 
            p.name.toLowerCase().includes(keyword)
          )
        );
        similarProducts.push(...categoryProducts.slice(0, 8 - similarProducts.length));
      }

      // Stratégie 4: Produits avec variantes (même nom de base mais différentes tailles/couleurs)
      if (similarProducts.length < 8) {
        // Chercher des produits qui ont le même nom de base
        const baseName = productName.toLowerCase().replace(/\d+mm|\d+cm|\d+"/g, '').trim();
        
        const params: any = {
          search: baseName.split(' ').slice(0, 3).join(' '), // Prendre les 3 premiers mots
          limit: 20,
          excludeId: productId
        };
        
        const response = await productService.getAll(params);
        const variantProducts = response.products.filter(p => 
          !similarProducts.some(sp => sp.id === p.id) &&
          // Vérifier si c'est une variante (même nom de base mais différences)
          p.name.toLowerCase().includes(baseName.split(' ')[0]) &&
          p.name.toLowerCase().includes(baseName.split(' ')[1])
        );
        similarProducts.push(...variantProducts.slice(0, 8 - similarProducts.length));
      }

      // Stratégie 5: Produits vedettes comme fallback
      if (similarProducts.length < 4) {
        const params: any = {
          isFeatured: true,
          limit: 8,
          excludeId: productId
        };
        
        const response = await productService.getAll(params);
        const featuredProducts = response.products.filter(p => 
          !similarProducts.some(sp => sp.id === p.id)
        );
        similarProducts.push(...featuredProducts.slice(0, 8 - similarProducts.length));
      }

      setSimilarProducts(similarProducts);
    } catch (err) {
      console.error('Erreur lors du chargement des produits similaires:', err);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handleWishlistToggle = async () => {
    if (product && user) {
      if (isInWishlist(product.id)) {
        await removeFromWishlist(product.id);
      } else {
        await addToWishlist(product.id);
      }
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="loader w-12 h-12 mx-auto mb-4"></div>
          <p className="text-primary-600 text-lg">Chargement du produit...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-error-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="h-12 w-12 text-error-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-error-600 text-xl font-semibold mb-4">{error}</p>
          <Link
            to="/products"
            className="btn btn-primary btn-lg"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour aux produits
          </Link>
        </div>
      </div>
    );
  }

  const images = product.images || [];
  const currentImage = images[selectedImageIndex] || images[0];
  const currentImageUrl = typeof currentImage === 'string' ? getImageUrl(currentImage) : getImageUrl(currentImage?.url);

  const stock = product.stock || product.stockQuantity || 0;
  const isOutOfStock = stock === 0;
  const isLowStock = stock > 0 && stock <= 5;
  const hasDiscount = product.comparePrice && product.comparePrice > product.price;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-8">
      <div className="container mx-auto px-4">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link to="/" className="text-primary-700 hover:text-accent-600 font-medium transition-colors duration-200">
                Accueil
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <Link to="/products" className="ml-1 text-primary-700 hover:text-accent-600 font-medium transition-colors duration-200">
                  Produits
                </Link>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <svg className="w-6 h-6 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
                <span className="ml-1 text-primary-600 font-medium">{product.name}</span>
              </div>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-6">
            {/* Image principale */}
            <div className="aspect-square bg-gradient-to-br from-primary-50 to-secondary-50 rounded-2xl overflow-hidden shadow-soft">
                              {currentImage ? (
                  <img
                    src={currentImageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => handleImageError(e.nativeEvent)}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500">Aucune image disponible</span>
                  </div>
                )}
            </div>

            {/* Miniatures */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-3">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                      selectedImageIndex === index
                        ? 'border-accent-500 shadow-medium'
                        : 'border-primary-200 hover:border-accent-300'
                    }`}
                  >
                    <img
                      src={typeof image === 'string' ? getImageUrl(image) : getImageUrl(image?.url)}
                      alt={`${product.name} - Image ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => handleImageError(e.nativeEvent)}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informations produit */}
          <div className="space-y-8">
            {/* En-tête */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-3xl lg:text-4xl font-display font-bold text-primary-800">
                  {product.name}
                </h1>
                {user && (
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-3 rounded-xl transition-all duration-200 ${
                      isInWishlist(product.id)
                        ? 'bg-accent-500 text-white shadow-medium'
                        : 'bg-primary-100 text-primary-600 hover:bg-accent-500 hover:text-white'
                    }`}
                  >
                    <svg className="w-6 h-6" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Catégorie */}
              {product.category && (
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 bg-accent-100 text-accent-700 text-sm font-medium rounded-full">
                    {product.category.name}
                  </span>
                </div>
              )}

              {/* Prix */}
              <div className="flex items-center space-x-4 mb-6">
                <span className="text-3xl font-bold text-primary-800">
                  {formatPrice(product.price)}
                </span>
                {hasDiscount && (
                  <>
                    <span className="text-xl text-primary-500 line-through">
                      {formatPrice(product.comparePrice!)}
                    </span>
                    <span className="px-2 py-1 bg-error-100 text-error-700 text-sm font-medium rounded-full">
                      -{Math.round(((product.comparePrice! - product.price) / product.comparePrice!) * 100)}%
                    </span>
                  </>
                )}
              </div>

              {/* Stock */}
              <div className="mb-6">
                {isOutOfStock ? (
                  <span className="inline-flex items-center px-3 py-1 bg-error-100 text-error-700 text-sm font-medium rounded-full">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Rupture de stock
                  </span>
                ) : isLowStock ? (
                  <span className="inline-flex items-center px-3 py-1 bg-warning-100 text-warning-700 text-sm font-medium rounded-full">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Plus que {stock} en stock
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 bg-success-100 text-success-700 text-sm font-medium rounded-full">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    En stock
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <div>
                <h3 className="text-lg font-semibold text-primary-800 mb-3">Description</h3>
                <p className="text-primary-600 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Variantes */}
            <ProductVariants
              product={product}
              onVariantChange={handleVariantChange}
              selectedColor={selectedColor}
              selectedSize={selectedSize}
            />

            {/* Marque */}
            {product.brand && (
              <div>
                <h3 className="text-lg font-semibold text-primary-800 mb-3">Marque</h3>
                <p className="text-primary-600">
                  {product.brand}
                </p>
              </div>
            )}

            {/* Spécifications */}
            {product.specifications && (
              <div>
                <h3 className="text-lg font-semibold text-primary-800 mb-3">Spécifications techniques</h3>
                <div className="text-primary-600 leading-relaxed whitespace-pre-line">
                  {product.specifications}
                </div>
              </div>
            )}

            {/* Quantité et Ajout au panier */}
            <div className="space-y-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-semibold text-primary-700 mb-2">
                  Quantité
                </label>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors duration-200 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <input
                    type="number"
                    id="quantity"
                    min="1"
                    max={stock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-20 text-center border border-primary-200 rounded-lg py-2 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:border-transparent"
                  />
                  <button
                    onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                    className="w-10 h-10 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors duration-200 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || isOutOfStock}
                className="w-full py-4 px-6 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-medium hover:shadow-large disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isAddingToCart ? (
                  <>
                    <div className="loader w-5 h-5"></div>
                    <span>Ajout en cours...</span>
                  </>
                ) : isOutOfStock ? (
                  <span>Rupture de stock</span>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
                    </svg>
                    <span>Ajouter au panier</span>
                  </>
                )}
              </button>
              
              {!user && (
                <div className="text-center">
                  <p className="text-sm text-primary-600 mb-2">
                    Connectez-vous pour sauvegarder votre panier et accéder à vos commandes
                  </p>
                  <Link
                    to="/login"
                    className="inline-flex items-center px-4 py-2 bg-primary-100 text-primary-700 rounded-lg hover:bg-primary-200 transition-colors duration-200 text-sm font-medium"
                  >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Se connecter
                  </Link>
                </div>
              )}
            </div>

            {/* Caractéristiques */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-primary-800 mb-3">Caractéristiques</h3>
                <ul className="space-y-2">
                  {product.features.map((feature, index) => (
                    <li key={index} className="flex items-center text-primary-600">
                      <svg className="w-4 h-4 text-accent-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Produits Similaires */}
      {similarProducts.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-primary-50 via-white to-secondary-50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl lg:text-4xl font-display font-bold text-primary-800 mb-4">
                Produits Similaires
              </h2>
              <p className="text-lg text-primary-600 max-w-2xl mx-auto">
                Découvrez d'autres produits qui pourraient vous intéresser
              </p>
            </div>

            {loadingSimilar ? (
              <div className="flex justify-center items-center py-12">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-600"></div>
                  <span className="text-primary-600">Chargement des produits similaires...</span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 items-stretch">
                {similarProducts.map((similarProduct) => (
                  <SimilarProductCard 
                    key={similarProduct.id} 
                    product={similarProduct} 
                    originalProduct={product!}
                  />
                ))}
              </div>
            )}

            <div className="text-center mt-12">
              <Link 
                to="/products" 
                className="btn btn-primary btn-lg text-lg px-8 py-4"
              >
                Voir tous les produits
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetail;

