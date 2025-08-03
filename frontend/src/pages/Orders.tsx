import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { orderService } from '../services/api';
import { Order, OrderStatus } from '../types';
import { getImageUrl, handleImageError } from '../utils/imageUtils';

const Orders: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string | OrderStatus>('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      // Appel réel à l'API pour récupérer les commandes de l'utilisateur
      const orders = await orderService.getMyOrders();
      setOrders(orders || []);
    } catch (error) {
      console.error('Erreur lors du chargement des commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const statusConfig = {
      [OrderStatus.PENDING]: { text: 'En attente', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      [OrderStatus.CONFIRMED]: { text: 'Confirmée', color: 'bg-blue-100 text-blue-800', icon: '✓' },
      [OrderStatus.PROCESSING]: { text: 'En traitement', color: 'bg-blue-100 text-blue-800', icon: '⚙️' },
      [OrderStatus.SHIPPED]: { text: 'Expédiée', color: 'bg-purple-100 text-purple-800', icon: '📦' },
      [OrderStatus.DELIVERED]: { text: 'Livrée', color: 'bg-green-100 text-green-800', icon: '✅' },
      [OrderStatus.CANCELLED]: { text: 'Annulée', color: 'bg-red-100 text-red-800', icon: '❌' }
    };

    const config = statusConfig[status] || statusConfig[OrderStatus.PENDING];
    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.text}
      </span>
    );
  };

  const getStatusTimeline = (status: OrderStatus) => {
    const steps = [
      { key: OrderStatus.PENDING, label: 'Commande reçue', completed: true },
      { key: OrderStatus.PROCESSING, label: 'En préparation', completed: [OrderStatus.PROCESSING, OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(status) },
      { key: OrderStatus.SHIPPED, label: 'Expédiée', completed: [OrderStatus.SHIPPED, OrderStatus.DELIVERED].includes(status) },
      { key: OrderStatus.DELIVERED, label: 'Livrée', completed: status === OrderStatus.DELIVERED }
    ];

    return (
      <div className="flex items-center space-x-4">
        {steps.map((step, index) => (
          <div key={step.key} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step.completed 
                ? 'bg-accent-500 text-white' 
                : 'bg-gray-200 text-gray-500'
            }`}>
              {step.completed ? '✓' : index + 1}
            </div>
            <span className={`ml-2 text-sm ${
              step.completed ? 'text-primary-800' : 'text-gray-500'
            }`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-2 ${
                step.completed ? 'bg-accent-500' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const filteredOrders = orders.filter(order => 
    filterStatus === 'all' || order.status === filterStatus as OrderStatus
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-primary-800 mb-4">Accès refusé</h1>
          <p className="text-primary-600">Vous devez être connecté pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary-800 mb-2">Mes Commandes</h1>
          <p className="text-primary-600">Suivez vos commandes et consultez leur statut</p>
        </div>

        {/* Filter */}
        <div className="mb-6">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                filterStatus === 'all'
                  ? 'bg-primary-100 text-primary-800'
                  : 'bg-white text-primary-600 hover:bg-primary-50'
              }`}
            >
              Toutes ({orders.length})
            </button>
            <button
              onClick={() => setFilterStatus(OrderStatus.PENDING)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                filterStatus === OrderStatus.PENDING
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-white text-primary-600 hover:bg-yellow-50'
              }`}
            >
              En attente ({orders.filter(o => o.status === OrderStatus.PENDING).length})
            </button>
            <button
              onClick={() => setFilterStatus('shipped')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                filterStatus === 'shipped'
                  ? 'bg-purple-100 text-purple-800'
                  : 'bg-white text-primary-600 hover:bg-purple-50'
              }`}
            >
              Expédiées ({orders.filter(o => o.status === 'shipped').length})
            </button>
            <button
              onClick={() => setFilterStatus('delivered')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                filterStatus === 'delivered'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-white text-primary-600 hover:bg-green-50'
              }`}
            >
              Livrées ({orders.filter(o => o.status === 'delivered').length})
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-primary-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium text-primary-800 mb-2">Aucune commande</h3>
            <p className="text-primary-600 mb-6">Vous n'avez pas encore passé de commande.</p>
            <Link to="/products" className="btn btn-primary">
              Découvrir nos produits
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredOrders.map((order) => (
              <div key={order.id} className="bg-white rounded-xl shadow-soft overflow-hidden">
                {/* Order Header */}
                <div className="p-6 border-b border-primary-100">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-primary-800">{order.orderNumber}</h3>
                      <p className="text-sm text-primary-500">
                        Commande du {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary-800">{Number(order.totalAmount || 0).toFixed(2)} €</p>
                      {getStatusBadge(order.status)}
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="mb-4">
                    {getStatusTimeline(order.status)}
                  </div>

                  {/* Order Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-primary-600 font-medium">Adresse de livraison</p>
                      <p className="text-primary-800">{order.shippingAddress}</p>
                    </div>
                    {order.trackingNumber && (
                      <div>
                        <p className="text-primary-600 font-medium">Numéro de suivi</p>
                        <p className="text-primary-800 font-mono">{order.trackingNumber}</p>
                      </div>
                    )}

                  </div>
                </div>

                {/* Order Items */}
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-primary-800 mb-4">
                    Articles ({order.orderItems.length})
                  </h4>
                  <div className="space-y-4">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4 p-4 bg-primary-50 rounded-lg">
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
                            className="w-16 h-16 object-cover rounded-lg"
                            onError={(e) => handleImageError(e.nativeEvent)}
                          />
                        <div className="flex-1">
                          <h5 className="font-medium text-primary-800">{item.product.name}</h5>
                          <p className="text-sm text-primary-600">Quantité: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary-800">
                            {Number(item.totalPrice || 0).toFixed(2)} €
                          </p>
                          <p className="text-sm text-primary-600">
                            {Number(item.unitPrice || 0).toFixed(2)} € l'unité
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex flex-wrap gap-3">
                    <button className="btn btn-outline">
                      Télécharger la facture
                    </button>
                    {order.trackingNumber && (
                      <button className="btn btn-outline">
                        Suivre le colis
                      </button>
                    )}
                    {order.status === OrderStatus.DELIVERED && (
                      <button className="btn btn-outline">
                        Laisser un avis
                      </button>
                    )}
                    {order.status === OrderStatus.PENDING && (
                      <button className="btn btn-outline text-red-600 border-red-200 hover:bg-red-50">
                        Annuler la commande
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Orders; 