import api from './api';

export interface Review {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  title?: string;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  isVerified: boolean;
  isHelpful: boolean;
  helpfulCount: number;
  notHelpfulCount: number;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  product?: {
    id: number;
    name: string;
  };
}

export interface CreateReviewData {
  rating: number;
  title?: string;
  comment: string;
}

export interface UpdateReviewData {
  rating?: number;
  title?: string;
  comment?: string;
}

export interface ProductReviewsResponse {
  reviews: Review[];
  total: number;
  averageRating: number;
  totalReviews: number;
}

export interface ProductReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: Record<number, number>;
}

// Service pour les avis
export const reviewsService = {
  // Créer un nouvel avis
  create: async (productId: number, data: CreateReviewData): Promise<Review> => {
    const response = await api.post(`/reviews/products/${productId}`, data);
    return response.data;
  },

  // Obtenir les avis d'un produit
  getProductReviews: async (
    productId: number,
    params?: {
      status?: 'pending' | 'approved' | 'rejected';
      page?: number;
      limit?: number;
    }
  ): Promise<ProductReviewsResponse> => {
    const response = await api.get(`/reviews/products/${productId}`, { params });
    return response.data;
  },

  // Obtenir les statistiques d'avis d'un produit
  getProductReviewStats: async (productId: number): Promise<ProductReviewStats> => {
    const response = await api.get(`/reviews/products/${productId}/stats`);
    return response.data;
  },

  // Obtenir les avis de l'utilisateur connecté
  getMyReviews: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<{ reviews: Review[]; total: number }> => {
    const response = await api.get('/reviews/my-reviews', { params });
    return response.data;
  },

  // Mettre à jour un avis
  update: async (reviewId: number, data: UpdateReviewData): Promise<Review> => {
    const response = await api.put(`/reviews/${reviewId}`, data);
    return response.data;
  },

  // Supprimer un avis
  delete: async (reviewId: number): Promise<void> => {
    await api.delete(`/reviews/${reviewId}`);
  },

  // Marquer un avis comme utile
  markAsHelpful: async (reviewId: number): Promise<Review> => {
    const response = await api.post(`/reviews/${reviewId}/helpful`);
    return response.data;
  },

  // Marquer un avis comme non utile
  markAsNotHelpful: async (reviewId: number): Promise<Review> => {
    const response = await api.post(`/reviews/${reviewId}/not-helpful`);
    return response.data;
  },

  // === Routes Admin ===

  // Obtenir les avis en attente d'approbation
  getPendingReviews: async (params?: {
    page?: number;
    limit?: number;
  }): Promise<{ reviews: Review[]; total: number }> => {
    const response = await api.get('/reviews/admin/pending', { params });
    return response.data;
  },

  // Approuver un avis
  approve: async (reviewId: number): Promise<Review> => {
    const response = await api.post(`/reviews/admin/${reviewId}/approve`);
    return response.data;
  },

  // Rejeter un avis
  reject: async (reviewId: number): Promise<Review> => {
    const response = await api.post(`/reviews/admin/${reviewId}/reject`);
    return response.data;
  },
};

export default reviewsService; 