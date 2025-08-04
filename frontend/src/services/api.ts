import axios from 'axios';
import { AuthResponse, LoginData, RegisterData, Product, Category, Order, CreateOrderData, User } from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token JWT aux requêtes
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Intercepteur pour gérer les erreurs d'authentification
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  getProfile: async (): Promise<{ user: User }> => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  forgotPassword: async (data: { email: string }): Promise<{ message: string }> => {
    const response = await api.post('/auth/forgot-password', data);
    return response.data;
  },

  resetPassword: async (data: { token: string; password: string }): Promise<{ message: string }> => {
    const response = await api.post('/auth/reset-password', data);
    return response.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<{ message: string }> => {
    const response = await api.post('/auth/change-password', data);
    return response.data;
  },
};

// Services des produits
export const productService = {
  getAll: async (params?: {
    categoryId?: number;
    categoryIds?: number[];
    search?: string;
    isActive?: boolean;
    isFeatured?: boolean;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: string;
    page?: number;
    limit?: number;
    color?: string;
    size?: string;
    brand?: string;
    excludeId?: number;
  }): Promise<{ products: Product[]; total: number }> => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getBestSellers: async (limit?: number): Promise<Product[]> => {
    const response = await api.get('/products/best-sellers', {
      params: { limit },
    });
    return response.data;
  },

  create: async (data: Partial<Product>): Promise<Product> => {
    const response = await api.post('/products', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Product>): Promise<Product> => {
    const response = await api.patch(`/products/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/products/${id}`);
  },

  uploadImages: async (productId: number, formData: FormData): Promise<any> => {
    const response = await api.post(`/products/${productId}/images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteImage: async (imageId: number): Promise<void> => {
    await api.delete(`/products/images/${imageId}`);
  },

  // Nouvelles méthodes pour les variantes
  getAvailableColors: async (): Promise<string[]> => {
    const response = await api.get('/products/colors');
    return response.data;
  },

  getAvailableSizes: async (): Promise<string[]> => {
    const response = await api.get('/products/sizes');
    return response.data;
  },
};

// Services des catégories
export const categoryService = {
  getAll: async (isActive?: boolean): Promise<Category[]> => {
    const response = await api.get('/categories', {
      params: { isActive },
    });
    return response.data;
  },

  getById: async (id: number): Promise<Category> => {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  create: async (data: Partial<Category>): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  update: async (id: number, data: Partial<Category>): Promise<Category> => {
    const response = await api.patch(`/categories/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};

// Services des commandes
export const orderService = {
  create: async (data: CreateOrderData): Promise<Order> => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  getMyOrders: async (): Promise<Order[]> => {
    const response = await api.get('/orders/my-orders');
    return response.data;
  },

  getAll: async (params?: {
    userId?: number;
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ orders: Order[]; total: number }> => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  getById: async (id: number): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  update: async (id: number, data: Partial<Order>): Promise<Order> => {
    const response = await api.patch(`/orders/${id}`, data);
    return response.data;
  },

  getStats: async (): Promise<{
    totalOrders: number;
    totalRevenue: number;
    pendingOrders: number;
    completedOrders: number;
  }> => {
    const response = await api.get('/orders/stats');
    return response.data;
  },
};

// Services des utilisateurs
export const userService = {
  getAll: async (params?: {
    isActive?: boolean;
    roleId?: number;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ users: User[]; total: number }> => {
    const response = await api.get('/users', { params });
    return response.data;
  },

  getById: async (id: number): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  update: async (id: number, data: Partial<User>): Promise<User> => {
    const response = await api.patch(`/users/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },

  toggleActive: async (id: number): Promise<User> => {
    const response = await api.patch(`/users/${id}/toggle-active`);
    return response.data;
  },

  getStats: async (): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    adminUsers: number;
    clientUsers: number;
  }> => {
    const response = await api.get('/users/stats');
    return response.data;
  },
};

// Services d'upload
export const uploadService = {
  uploadImage: async (file: File, productId?: number): Promise<any> => {
    const formData = new FormData();
    formData.append('file', file);
    if (productId) {
      formData.append('productId', productId.toString());
    }

    const response = await api.post('/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  uploadMultipleImages: async (files: File[], productId?: number): Promise<any[]> => {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });
    if (productId) {
      formData.append('productId', productId.toString());
    }

    const response = await api.post('/uploads/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  getAll: async (): Promise<any[]> => {
    const response = await api.get('/uploads');
    return response.data;
  },

  getById: async (id: number): Promise<any> => {
    const response = await api.get(`/uploads/${id}`);
    return response.data;
  },

  getByProduct: async (productId: number): Promise<any[]> => {
    const response = await api.get(`/uploads/product/${productId}`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/uploads/${id}`);
  },

  updateProductId: async (imageId: number, productId: number): Promise<any> => {
    const response = await api.post(`/uploads/${imageId}/product/${productId}`);
    return response.data;
  },
};

// Service des promotions
export const promotionService = {
  getAll: async (params?: {
    isActive?: boolean;
    page?: number;
    limit?: number;
    search?: string;
  }): Promise<{ promotions: any[]; total: number }> => {
    const response = await api.get('/promotions', { params });
    return response.data;
  },

  getById: async (id: number): Promise<any> => {
    const response = await api.get(`/promotions/${id}`);
    return response.data;
  },

  create: async (data: any): Promise<any> => {
    const response = await api.post('/promotions', data);
    return response.data;
  },

  update: async (id: number, data: any): Promise<any> => {
    const response = await api.patch(`/promotions/${id}`, data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/promotions/${id}`);
  },

  apply: async (code: string): Promise<any> => {
    const response = await api.post('/promotions/apply', { code });
    return response.data;
  },

  getStats: async (): Promise<{
    totalPromotions: number;
    activePromotions: number;
    totalUsage: number;
  }> => {
    const response = await api.get('/promotions/stats');
    return response.data;
  },
};

// Services du panier
export const cartService = {
  getCart: async (): Promise<any[]> => {
    const response = await api.get('/cart');
    return response.data;
  },

  addToCart: async (productId: number, quantity: number = 1): Promise<any> => {
    const response = await api.post('/cart/items', { productId, quantity });
    return response.data;
  },

  updateCartItem: async (productId: number, quantity: number): Promise<any> => {
    const response = await api.patch(`/cart/items/${productId}`, { quantity });
    return response.data;
  },

  removeFromCart: async (productId: number): Promise<void> => {
    await api.delete(`/cart/items/${productId}`);
  },

  clearCart: async (): Promise<void> => {
    await api.delete('/cart');
  },

  getCartCount: async (): Promise<number> => {
    const response = await api.get('/cart/count');
    return response.data.count;
  },

  getCartTotal: async (): Promise<number> => {
    const response = await api.get('/cart/total');
    return response.data.total;
  },
};

// Services de wishlist
export const wishlistService = {
  getWishlist: async (): Promise<any[]> => {
    const response = await api.get('/wishlist');
    return response.data;
  },

  addToWishlist: async (productId: number): Promise<any> => {
    const response = await api.post('/wishlist', { productId });
    return response.data;
  },

  removeFromWishlist: async (productId: number): Promise<void> => {
    await api.delete(`/wishlist/${productId}`);
  },

  isInWishlist: async (productId: number): Promise<boolean> => {
    const response = await api.get(`/wishlist/check/${productId}`);
    return response.data.isInWishlist;
  },

  getWishlistCount: async (): Promise<number> => {
    const response = await api.get('/wishlist/count');
    return response.data.count;
  },

  clearWishlist: async (): Promise<void> => {
    await api.delete('/wishlist');
  },

  getWishlistStats: async (): Promise<any> => {
    const response = await api.get('/wishlist/stats');
    return response.data;
  },

  moveToCart: async (productId: number): Promise<void> => {
    await api.post(`/wishlist/move-to-cart/${productId}`);
  },
};

// Services d'email
export const emailService = {
  sendOrderConfirmation: async (email: string, firstName: string, orderNumber: string, orderTotal: number): Promise<any> => {
    const response = await api.post('/email/order-confirmation', {
      email,
      firstName,
      orderNumber,
      orderTotal
    });
    return response.data;
  },

  sendWelcomeEmail: async (email: string, firstName: string): Promise<any> => {
    const response = await api.post('/email/welcome', { email, firstName });
    return response.data;
  },

  sendPasswordReset: async (email: string, firstName: string): Promise<any> => {
    const response = await api.post('/email/password-reset', { email, firstName });
    return response.data;
  },

  testConnection: async (): Promise<any> => {
    const response = await api.get('/email/test-connection');
    return response.data;
  },
};

// Services de rapports
export const reportsService = {
  getSalesReport: async (period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<any> => {
    const response = await api.get(`/reports/sales?period=${period}`);
    return response.data;
  },
  
  getOrdersReport: async (period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<any> => {
    const response = await api.get(`/reports/orders?period=${period}`);
    return response.data;
  },
  
  getProductsReport: async (): Promise<any> => {
    const response = await api.get('/reports/products');
    return response.data;
  },
  
  getUsersReport: async (period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<any> => {
    const response = await api.get(`/reports/users?period=${period}`);
    return response.data;
  },
  
  getCompleteReport: async (period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<any> => {
    const response = await api.get(`/reports/complete?period=${period}`);
    return response.data;
  },
};

export default api;

