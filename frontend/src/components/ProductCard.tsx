import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useWishlist } from '../contexts/WishlistContext';
import { Product } from '../types';
import { getImageUrl, handleImageError as handleImageErrorUtil } from '../utils/imageUtils';

interface ProductCardProps {
  product: Product;
  showQuickActions?: boolean;
  className?: string;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  showQuickActions = true,
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
    if (user && stock > 0) {
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
    
    // Chercher l'image principale
    const primaryImage = product.images.find(img => img.isPrimary);
    if (primaryImage) {
      return primaryImage;
    }
    
    // Sinon, retourner la première image
    return product.images[0];
  };

  const mainImage = getMainImage();

  return (
    <div 
      className={`group bg-white rounded-2xl shadow-soft hover:shadow-large transition-all duration-300 border border-primary-100 overflow-hidden ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container */}
      <div className="relative aspect-[4/3] bg-gradient-to-br from-primary-50 to-secondary-50 overflow-hidden">
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
        {user && showQuickActions && (
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
        {showQuickActions && isHovered && user && stock > 0 && (
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
      <div className="p-4">
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

        {/* Description */}
        {product.description && (
          <p className="text-xs text-primary-600 mb-3 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        )}

        {/* Rating */}
        {product.rating && (
          <div className="flex items-center mb-3">
            <div className="flex items-center mr-2">
              {[...Array(5)].map((_, i) => (
                <svg
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(product.rating!)
                      ? 'text-warning-400'
                      : 'text-primary-300'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <span className="text-xs text-primary-500">
              ({product.reviewCount || 0} avis)
            </span>
          </div>
        )}

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
        {showQuickActions && (
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
        )}
      </div>
    </div>
  );
};

export default ProductCard;

