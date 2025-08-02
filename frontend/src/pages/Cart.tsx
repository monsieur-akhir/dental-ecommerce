import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useWishlist } from '../contexts/WishlistContext';
import { getImageUrl, handleImageError } from '../utils/imageUtils';

const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, getTotalItems, getTotalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleQuantityChange = (productId: number, newQuantity: number) => {
    if (newQuantity > 0) {
      updateQuantity(productId, newQuantity);
    } else {
      removeFromCart(productId);
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      // Rediriger vers la connexion
      window.location.href = '/login?redirect=/cart';
      return;
    }
    setLoading(true);
    // Logique de checkout
    setLoading(false);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(price);
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="w-24 h-24 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h9M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6" />
              </svg>
            </div>
            <h2 className="text-2xl font-display font-bold text-primary-800 mb-4">
              Votre panier est vide
            </h2>
            <p className="text-primary-600 mb-8">
              Découvrez nos équipements professionnels et commencez vos achats
            </p>
            <Link
              to="/products"
              className="btn btn-primary btn-lg"
            >
              Découvrir nos produits
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 py-12">
      <div className="container mx-auto px-4">
        {/* En-tête */}
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold text-primary-800 mb-2">
            Mon Panier
          </h1>
          <p className="text-primary-600">
            {getTotalItems()} article{getTotalItems() > 1 ? 's' : ''} dans votre panier
          </p>
          {!user && (
            <div className="mt-4 p-4 bg-warning-50 border border-warning-200 rounded-xl">
              <div className="flex items-center space-x-3">
                <svg className="w-5 h-5 text-warning-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-warning-800">
                    Vous n'êtes pas connecté
                  </p>
                  <p className="text-xs text-warning-700">
                    Connectez-vous pour sauvegarder votre panier et procéder à la commande
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Liste des produits */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-soft p-6">
              <div className="space-y-6">
                {cart.map((item: any) => (
                  <div key={item.product.id} className="flex items-center space-x-4 p-4 border border-primary-100 rounded-xl">
                    {/* Image */}
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-50 to-secondary-50 rounded-lg overflow-hidden flex-shrink-0">
                      {item.product.images?.[0] ? (
                        <img
                          src={(() => {
                            const primaryImage = item.product.images.find((img: any) => img.isPrimary);
                            const imageToUse = primaryImage || item.product.images[0];
                            return getImageUrl(imageToUse.url);
                          })()}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          onError={(e) => handleImageError(e.nativeEvent)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-primary-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Informations produit */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-primary-800 truncate">
                        {item.product.name}
                      </h3>
                      <p className="text-primary-600 text-sm">
                        {item.product.category?.name}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-lg font-bold text-primary-800">
                          {formatPrice(item.product.price)}
                        </span>
                        {item.product.comparePrice && item.product.comparePrice > item.product.price && (
                          <span className="text-sm text-primary-500 line-through">
                            {formatPrice(item.product.comparePrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quantité */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleQuantityChange(item.product.id, item.quantity - 1)}
                        className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors duration-200 flex items-center justify-center"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                        </svg>
                      </button>
                      <span className="w-12 text-center font-semibold text-primary-800">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleQuantityChange(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="w-8 h-8 bg-primary-100 text-primary-600 rounded-lg hover:bg-primary-200 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                    </div>

                    {/* Prix total */}
                    <div className="text-right">
                      <div className="text-lg font-bold text-primary-800">
                        {formatPrice(item.product.price * item.quantity)}
                      </div>
                    </div>

                    {/* Supprimer */}
                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-primary-400 hover:text-error-600 transition-colors duration-200"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-primary-100">
                <button
                  onClick={clearCart}
                  className="text-primary-600 hover:text-error-600 transition-colors duration-200 font-medium"
                >
                  Vider le panier
                </button>
                <Link
                  to="/products"
                  className="text-accent-600 hover:text-accent-700 transition-colors duration-200 font-medium"
                >
                  Continuer les achats
                </Link>
              </div>
            </div>
          </div>

          {/* Résumé */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-soft p-6 sticky top-8">
              <h2 className="text-xl font-semibold text-primary-800 mb-6">
                Résumé de la commande
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-primary-600">
                  <span>Sous-total</span>
                  <span>{formatPrice(getTotalPrice())}</span>
                </div>
                <div className="flex justify-between text-primary-600">
                  <span>Livraison</span>
                  <span className="text-success-600 font-medium">Gratuite</span>
                </div>
                <div className="border-t border-primary-100 pt-4">
                  <div className="flex justify-between text-lg font-bold text-primary-800">
                    <span>Total</span>
                    <span>{formatPrice(getTotalPrice())}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading || cart.length === 0}
                className="w-full py-4 px-6 bg-gradient-to-r from-accent-500 to-accent-600 hover:from-accent-600 hover:to-accent-700 text-white font-semibold rounded-xl transition-all duration-200 shadow-medium hover:shadow-large disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <div className="loader w-5 h-5"></div>
                    <span>Préparation...</span>
                  </>
                ) : !user ? (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span>Se connecter pour commander</span>
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    <span>Procéder au paiement</span>
                  </>
                )}
              </button>

              <div className="mt-6 p-4 bg-primary-50 rounded-xl">
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 text-success-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-primary-800">Livraison gratuite</p>
                    <p className="text-xs text-primary-600">Pour toute commande supérieure à 50€</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;

