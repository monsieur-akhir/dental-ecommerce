import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Product } from '../types';
import { getImageUrl, handleImageError as handleImageErrorUtil } from '../utils/imageUtils';

interface SimilarProductCardProps {
  product: Product;
  originalProduct: Product;
  className?: string;
}

const SimilarProductCard: React.FC<SimilarProductCardProps> = ({ 
  product, 
  originalProduct,
  className = '' 
}) => {
  const { user } = useAuth();
  const { addToCart, isAddingToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageError = (event: Event) => {
    setImageError(true);
    handleImageErrorUtil(event);
  };

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (stock > 0) {
      await addToCart(product, 1);
    }
  };

  const handleWishlistToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (user) {
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

  const getStockStatus = () => {
    if (stock === 0) return { text: 'Rupture', color: 'error', bg: 'error' };
    if (stock <= 5) return { text: 'Stock limité', color: 'warning', bg: 'warning' };
    return { text: 'En stock', color: 'success', bg: 'success' };
  };

  const stock = product.stock || product.stockQuantity || 0;
  const stockStatus = getStockStatus();

  const getMainImage = () => {
    if (!product.images || product.images.length === 0) {
      return null;
    }
    
    const primaryImage = product.images.find(img => img.isPrimary);
    if (primaryImage) {
      return primaryImage;
    }
    
    return product.images[0];
  };

  const mainImage = getMainImage();

  // Identifier les différences avec le produit original
  const getDifferences = () => {
    const differences = [];
    
    // Différence de taille
    if (product.size && originalProduct.size && product.size !== originalProduct.size) {
      differences.push({ type: 'size', value: product.size, label: 'Taille' });
    }
    
    // Différence de couleur
    if (product.color && originalProduct.color && product.color !== originalProduct.color) {
      differences.push({ type: 'color', value: product.color, label: 'Couleur' });
    }
    
    // Différence de prix
    const priceDiff = product.price - originalProduct.price;
    if (Math.abs(priceDiff) > 0.01) {
      differences.push({ 
        type: 'price', 
        value: priceDiff > 0 ? `+${formatPrice(priceDiff)}` : formatPrice(priceDiff),
        label: 'Prix'
      });
    }
    
    // Différence de marque
    if (product.brand && originalProduct.brand && product.brand !== originalProduct.brand) {
      differences.push({ type: 'brand', value: product.brand, label: 'Marque' });
    }
    
    return differences;
  };

  const differences = getDifferences();

  return (
    <div 
      className={`group bg-white rounded-2xl shadow-soft hover:shadow-large transition-all duration-300 border border-primary-100 overflow-hidden flex flex-col h-full ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-primary-50 to-secondary-50 overflow-hidden flex-shrink-0">
        {imageError ? (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        ) : (
          <img
            src={mainImage ? getImageUrl(mainImage.url) : '/images/no-image.svg'}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => handleImageError(e.nativeEvent)}
          />
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col space-y-2">
          {stock === 0 && (
            <span className="badge badge-error text-xs font-semibold">
              Rupture
            </span>
          )}
          {stock > 0 && stock <= 5 && (
            <span className="badge badge-warning text-xs font-semibold">
              Stock limité
            </span>
          )}
          {(product.featured || product.isFeatured) && (
            <span className="badge badge-primary text-xs font-semibold">
              Vedette
            </span>
          )}
          {product.new && (
            <span className="badge badge-secondary text-xs font-semibold">
              Nouveau
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        {user && (
          <button
            onClick={handleWishlistToggle}
            className={`absolute top-3 right-3 p-2 rounded-full transition-all duration-200 ${
              isInWishlist(product.id)
                ? 'bg-accent-500 text-white shadow-medium'
                : 'bg-white/90 text-primary-600 hover:bg-accent-500 hover:text-white shadow-soft'
            }`}
          >
            <svg className="w-4 h-4" fill={isInWishlist(product.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        )}

        {/* Quick Actions Overlay */}
        {isHovered && stock > 0 && (
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center transition-all duration-200">
            <button
              onClick={handleAddToCart}
              disabled={isAddingToCart}
              className="bg-accent-500 hover:bg-accent-600 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 shadow-medium hover:shadow-large disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAddingToCart ? (
                <div className="flex items-center space-x-2">
                  <div className="loader w-4 h-4"></div>
                  <span>Ajout...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
                  </svg>
                  <span>Ajouter</span>
                </div>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        {/* Category */}
        {product.category && (
          <div className="mb-2">
            <span className="text-xs font-medium text-accent-600 uppercase tracking-wide">
              {product.category.name}
            </span>
          </div>
        )}

        {/* Title */}
        <Link to={`/products/${product.id}`} className="block">
          <h3 className="text-sm font-semibold text-primary-800 mb-2 line-clamp-2 leading-tight hover:text-accent-600 transition-colors duration-200">
            {product.name}
          </h3>
        </Link>

        {/* Différences mises en évidence */}
        {differences.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-1">
              {differences.map((diff, index) => (
                <span 
                  key={index} 
                  className={`text-xs px-2 py-1 rounded-full font-medium ${
                    diff.type === 'price' && diff.value.startsWith('+')
                      ? 'bg-error-100 text-error-700'
                      : diff.type === 'price' && diff.value.startsWith('-')
                      ? 'bg-success-100 text-success-700'
                      : diff.type === 'size'
                      ? 'bg-secondary-100 text-secondary-700'
                      : diff.type === 'color'
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-accent-100 text-accent-700'
                  }`}
                >
                  {diff.label}: {diff.value}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        {product.description && (
          <p className="text-xs text-primary-600 mb-3 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Variantes */}
        {(product.colors && product.colors.length > 0) || (product.sizes && product.sizes.length > 0) && (
          <div className="mb-3">
            {/* Couleurs disponibles */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-2">
                <span className="text-xs font-medium text-primary-700 mb-1 block">Couleurs :</span>
                <div className="flex flex-wrap gap-1">
                  {product.colors.slice(0, 3).map((color, index) => (
                    <span key={index} className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                      {color}
                    </span>
                  ))}
                  {product.colors.length > 3 && (
                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
                      +{product.colors.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Tailles disponibles */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <span className="text-xs font-medium text-primary-700 mb-1 block">Tailles :</span>
                <div className="flex flex-wrap gap-1">
                  {product.sizes.slice(0, 4).map((size, index) => (
                    <span key={index} className="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded-full">
                      {size}
                    </span>
                  ))}
                  {product.sizes.length > 4 && (
                    <span className="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded-full">
                      +{product.sizes.length - 4}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Marque */}
        {product.brand && (
          <div className="mb-2">
            <span className="text-xs font-medium text-accent-600">
              {product.brand}
            </span>
          </div>
        )}

        {/* Spacer to push button to bottom */}
        <div className="flex-1"></div>

        {/* Price and Stock */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-primary-800">
              {formatPrice(product.price)}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-primary-500 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
          <div className="text-right">
            <span className={`badge badge-${stockStatus.bg} text-xs font-semibold`}>
              {stockStatus.text}
            </span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAddingToCart || stock === 0}
          className={`w-full py-2 px-4 rounded-xl font-medium transition-all duration-200 ${
            stock === 0
              ? 'bg-primary-100 text-primary-400 cursor-not-allowed'
              : 'bg-accent-500 hover:bg-accent-600 text-white shadow-soft hover:shadow-medium'
          }`}
        >
          {isAddingToCart ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="loader w-4 h-4"></div>
              <span>Ajout au panier...</span>
            </div>
          ) : stock === 0 ? (
            'Rupture de stock'
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
              </svg>
              <span>Ajouter au panier</span>
            </div>
          )}
        </button>
      </div>
    </div>
  );
};

export default SimilarProductCard; 