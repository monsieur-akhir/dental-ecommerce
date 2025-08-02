import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useWishlist } from '../contexts/WishlistContext';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import WishlistButton from '../components/WishlistButton';
import { getImageUrl, handleImageError } from '../utils/imageUtils';

const Wishlist: React.FC = () => {
  const { wishlistItems, isLoading, clearWishlist, getWishlistStats } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [stats, setStats] = useState<any>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const statsData = await getWishlistStats();
      setStats(statsData);
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  }, [getWishlistStats]);

  useEffect(() => {
    if (isAuthenticated) {
      loadStats();
    }
  }, [isAuthenticated, loadStats]);

  const handleAddToCart = async (productId: number) => {
    try {
      // Trouver le produit dans la wishlist
      const wishlistItem = wishlistItems.find(item => item.product.id === productId);
      if (wishlistItem) {
        await addToCart(wishlistItem.product, 1);
        // Optionnel: retirer de la wishlist après ajout au panier
        // await removeFromWishlist(productId);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
    }
  };

  const handleClearWishlist = async () => {
    try {
      await clearWishlist();
      setShowClearConfirm(false);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Connectez-vous pour voir vos favoris
          </h2>
          <p className="text-gray-600 mb-6">
            Vous devez être connecté pour accéder à votre liste de souhaits.
          </p>
          <Link
            to="/login"
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Ma liste de souhaits
          </h1>
          
          {/* Statistiques */}
          {stats && (
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {stats.totalItems}
                  </div>
                  <div className="text-gray-600">Produits</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {Number(stats.totalValue || 0).toFixed(2)} €
                  </div>
                  <div className="text-gray-600">Valeur totale</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {Object.keys(stats.categories).length}
                  </div>
                  <div className="text-gray-600">Catégories</div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          {wishlistItems.length > 0 && (
            <div className="flex justify-between items-center">
              <p className="text-gray-600">
                {wishlistItems.length} produit{wishlistItems.length > 1 ? 's' : ''} dans vos favoris
              </p>
              <button
                onClick={() => setShowClearConfirm(true)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Vider la liste
              </button>
            </div>
          )}
        </div>

        {/* Liste des produits */}
        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 text-gray-300">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              Votre liste de souhaits est vide
            </h3>
            <p className="text-gray-600 mb-6">
              Découvrez nos produits et ajoutez vos favoris !
            </p>
            <Link
              to="/products"
              className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              Parcourir les produits
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <Link to={`/products/${item.product.id}`}>
                    <img
                      src={(() => {
                        if (!item.product.images || item.product.images.length === 0) {
                          return '/images/no-image.svg';
                        }
                        const primaryImage = item.product.images.find((img: any) => img.isPrimary);
                        const imageToUse = primaryImage || item.product.images[0];
                        return getImageUrl(imageToUse.url);
                      })()}
                      alt={item.product.name}
                      className="w-full h-48 object-cover"
                      onError={(e) => handleImageError(e.nativeEvent)}
                    />
                  </Link>
                  <div className="absolute top-2 right-2">
                    <WishlistButton productId={item.product.id} size="sm" />
                  </div>
                </div>
                
                <div className="p-4">
                  <Link to={`/products/${item.product.id}`}>
                    <h3 className="font-medium text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                      {item.product.name}
                    </h3>
                  </Link>
                  
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-lg font-bold text-blue-600">
                      {item.product.price} €
                    </span>
                  </div>

                  {/* Catégories */}
                  {item.product.categories && item.product.categories.length > 0 && (
                    <div className="mb-3">
                      <div className="flex flex-wrap gap-1">
                        {item.product.categories.slice(0, 2).map((category: any) => (
                          <span
                            key={category.id}
                            className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded"
                          >
                            {category.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(item.product.id)}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Ajouter au panier
                    </button>
                    <Link
                      to={`/products/${item.product.id}`}
                      className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </Link>
                  </div>

                  {/* Date d'ajout */}
                  <div className="mt-2 text-xs text-gray-500">
                    Ajouté le {new Date(item.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal de confirmation pour vider la liste */}
        {showClearConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Vider la liste de souhaits
              </h3>
              <p className="text-gray-600 mb-6">
                Êtes-vous sûr de vouloir supprimer tous les produits de votre liste de souhaits ? 
                Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleClearWishlist}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Vider
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;

