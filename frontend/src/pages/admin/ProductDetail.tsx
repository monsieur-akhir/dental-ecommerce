import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { productService } from '../../services/api';
import { Product } from '../../types';
import { getImageUrl, handleImageError } from '../../utils/imageUtils';

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const productData = await productService.getById(parseInt(id));
        setProduct(productData);
      } catch (err: any) {
        console.error('Erreur lors du chargement du produit:', err);
        setError(err.response?.data?.message || 'Erreur lors du chargement du produit');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Chargement du produit...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
          <Link
            to="/admin/products"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Retour à la liste des produits
          </Link>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600 mb-4">Produit non trouvé</div>
          <Link
            to="/admin/products"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Retour à la liste des produits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
              <Link to="/admin" className="hover:text-gray-700">Admin</Link>
              <span>/</span>
              <Link to="/admin/products" className="hover:text-gray-700">Produits</Link>
              <span>/</span>
              <span className="text-gray-900">{product.name}</span>
            </nav>
            <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
            <p className="text-gray-600 mt-2">Détails du produit</p>
          </div>
          <div className="flex space-x-3">
            <Link
              to="/admin/products"
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Retour
            </Link>
            <button
              onClick={() => navigate(`/admin/products/edit/${product.id}`)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Modifier
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images du produit */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Images du produit</h2>
            {product.images && product.images.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {product.images.map((image, index) => (
                  <div key={image.id} className="relative group">
                    <img
                      src={getImageUrl(image.url)}
                      alt={image.altText || `Image ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => handleImageError(e.nativeEvent)}
                    />
                    {image.isPrimary && (
                      <span className="absolute top-2 left-2 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                        Principal
                      </span>
                    )}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-white text-sm font-medium">
                          {image.originalName}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>Aucune image pour ce produit</p>
              </div>
            )}
          </div>

          {/* Informations du produit */}
          <div className="space-y-6">
            {/* Informations de base */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations de base</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nom du produit</label>
                  <p className="mt-1 text-sm text-gray-900">{product.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">SKU</label>
                  <p className="mt-1 text-sm text-gray-900">{product.sku || 'Non défini'}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Prix</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className="text-lg font-semibold text-gray-900">
                      {Number(product.price || 0).toFixed(2)} €
                    </span>
                    {product.comparePrice && (
                      <span className="text-sm text-gray-500 line-through">
                        {Number(product.comparePrice || 0).toFixed(2)} €
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.stockQuantity === 0
                        ? 'bg-red-100 text-red-800'
                        : product.stockQuantity <= 10
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {product.stockQuantity} unités
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Statut</label>
                  <div className="mt-1 flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {product.isActive ? 'Actif' : 'Inactif'}
                    </span>
                    {product.isFeatured && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Vedette
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Catégories */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Catégories</h2>
              {product.categories && product.categories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {product.categories.map((category) => (
                    <span
                      key={category.id}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {category.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucune catégorie assignée</p>
              )}
            </div>

            {/* Descriptions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Descriptions</h2>
              <div className="space-y-4">
                {product.shortDescription && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Description courte</label>
                    <p className="mt-1 text-sm text-gray-900">{product.shortDescription}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Description complète</label>
                  <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">
                    {product.description || 'Aucune description'}
                  </p>
                </div>
              </div>
            </div>

            {/* Informations techniques */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Informations techniques</h2>
              <div className="space-y-4">
                {product.weight && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Poids</label>
                    <p className="mt-1 text-sm text-gray-900">{product.weight} kg</p>
                  </div>
                )}

                {product.dimensions && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Dimensions</label>
                    <p className="mt-1 text-sm text-gray-900">{product.dimensions}</p>
                  </div>
                )}

                {product.brand && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Marque</label>
                    <p className="mt-1 text-sm text-gray-900">{product.brand}</p>
                  </div>
                )}

                {product.specifications && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Spécifications</label>
                    <p className="mt-1 text-sm text-gray-900 whitespace-pre-wrap">{product.specifications}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Statistiques */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Statistiques</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vues</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{product.viewCount || 0}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ventes</label>
                  <p className="mt-1 text-lg font-semibold text-gray-900">{product.salesCount || 0}</p>
                </div>
              </div>
            </div>

            {/* Dates */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Dates</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Créé le</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(product.createdAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Modifié le</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(product.updatedAt).toLocaleDateString('fr-FR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail; 