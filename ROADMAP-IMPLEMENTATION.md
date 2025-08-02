# 🗺️ Roadmap d'Implémentation - Fonctionnalités Futures

## 📊 Phase 1 - Export & Rapports Avancés

### Backend (NestJS)
```typescript
// src/reports/reports.service.ts
@Injectable()
export class ReportsService {
  async exportOrdersToCSV(filters: ExportFiltersDto): Promise<Buffer>
  async exportProductsToExcel(filters: ExportFiltersDto): Promise<Buffer>
  async generateSalesReport(period: ReportPeriod): Promise<SalesReportDto>
  async getAnalyticsDashboard(): Promise<AnalyticsDto>
}

// src/reports/dto/export-filters.dto.ts
export class ExportFiltersDto {
  startDate?: Date;
  endDate?: Date;
  status?: OrderStatus;
  categoryId?: number;
  format: 'csv' | 'excel' | 'pdf';
}
```

### Frontend (React)
```typescript
// src/pages/admin/Reports.tsx
const Reports: React.FC = () => {
  const [reportType, setReportType] = useState<'sales' | 'products' | 'users'>('sales');
  const [filters, setFilters] = useState<ExportFilters>({});
  
  const handleExport = async (format: 'csv' | 'excel') => {
    const blob = await reportsApi.exportData(reportType, filters, format);
    downloadFile(blob, `${reportType}-report.${format}`);
  };
  
  return (
    <div className="reports-dashboard">
      <ReportFilters onFiltersChange={setFilters} />
      <ExportButtons onExport={handleExport} />
      <AnalyticsCharts data={analyticsData} />
    </div>
  );
};
```

### Dépendances à Installer
```bash
# Backend
npm install exceljs csv-writer pdf-lib

# Frontend
npm install recharts react-datepicker file-saver
```

---

## 💳 Phase 2 - Intégration Paiement (Stripe/PayPal)

### Backend (NestJS)
```typescript
// src/payments/payments.service.ts
@Injectable()
export class PaymentsService {
  constructor(private stripe: Stripe) {}
  
  async createPaymentIntent(amount: number, currency: string): Promise<PaymentIntent>
  async confirmPayment(paymentIntentId: string): Promise<PaymentResult>
  async processRefund(paymentId: string, amount?: number): Promise<RefundResult>
  async createPayPalOrder(orderData: PayPalOrderDto): Promise<PayPalOrder>
}

// src/payments/dto/payment.dto.ts
export class CreatePaymentDto {
  orderId: number;
  amount: number;
  currency: string;
  paymentMethod: 'stripe' | 'paypal';
  returnUrl?: string;
  cancelUrl?: string;
}
```

### Frontend (React)
```typescript
// src/components/PaymentForm.tsx
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const PaymentForm: React.FC<{ orderId: number }> = ({ orderId }) => {
  const stripe = useStripe();
  const elements = useElements();
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) return;
    
    const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      }
    });
    
    if (error) {
      setError(error.message);
    } else {
      // Paiement réussi
      onPaymentSuccess(paymentIntent);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <CardElement />
      <button type="submit" disabled={!stripe}>
        Payer {amount}€
      </button>
    </form>
  );
};
```

### Configuration Stripe
```typescript
// src/config/stripe.config.ts
export const stripeConfig = {
  publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
};
```

---

## ⭐ Phase 3 - Système de Reviews/Avis

### Backend (NestJS)
```typescript
// src/entities/review.entity.ts
@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ type: 'int', min: 1, max: 5 })
  rating: number;
  
  @Column('text', { nullable: true })
  comment: string;
  
  @Column({ default: false })
  isVerifiedPurchase: boolean;
  
  @Column({ default: true })
  isVisible: boolean;
  
  @ManyToOne(() => User, user => user.reviews)
  user: User;
  
  @ManyToOne(() => Product, product => product.reviews)
  product: Product;
  
  @CreateDateColumn()
  createdAt: Date;
}

// src/reviews/reviews.service.ts
@Injectable()
export class ReviewsService {
  async createReview(userId: number, createReviewDto: CreateReviewDto): Promise<Review>
  async getProductReviews(productId: number, page: number): Promise<PaginatedReviews>
  async getReviewStats(productId: number): Promise<ReviewStats>
  async moderateReview(reviewId: number, action: 'approve' | 'reject'): Promise<Review>
}
```

### Frontend (React)
```typescript
// src/components/ReviewForm.tsx
const ReviewForm: React.FC<{ productId: number }> = ({ productId }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await reviewsApi.createReview({ productId, rating, comment });
    onReviewSubmitted();
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <StarRating value={rating} onChange={setRating} />
      <textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Partagez votre expérience..."
      />
      <button type="submit">Publier l'avis</button>
    </form>
  );
};

// src/components/ReviewsList.tsx
const ReviewsList: React.FC<{ productId: number }> = ({ productId }) => {
  const { reviews, loading } = useReviews(productId);
  
  return (
    <div className="reviews-list">
      <ReviewsStats productId={productId} />
      {reviews.map(review => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
};
```

---

## 📦 Phase 4 - Gestion des Stocks Avancée

### Backend (NestJS)
```typescript
// src/entities/stock-movement.entity.ts
@Entity('stock_movements')
export class StockMovement {
  @PrimaryGeneratedColumn()
  id: number;
  
  @Column({ type: 'enum', enum: MovementType })
  type: MovementType; // IN, OUT, ADJUSTMENT, RESERVED
  
  @Column()
  quantity: number;
  
  @Column({ nullable: true })
  reason: string;
  
  @Column({ nullable: true })
  reference: string; // Order ID, Supplier ID, etc.
  
  @ManyToOne(() => Product)
  product: Product;
  
  @ManyToOne(() => User)
  user: User; // Qui a effectué le mouvement
  
  @CreateDateColumn()
  createdAt: Date;
}

// src/inventory/inventory.service.ts
@Injectable()
export class InventoryService {
  async adjustStock(productId: number, quantity: number, reason: string): Promise<void>
  async reserveStock(productId: number, quantity: number, orderId: number): Promise<void>
  async releaseReservedStock(orderId: number): Promise<void>
  async getStockAlerts(): Promise<StockAlert[]>
  async generateStockReport(): Promise<StockReport>
  async predictDemand(productId: number, days: number): Promise<DemandForecast>
}
```

### Frontend (React)
```typescript
// src/pages/admin/Inventory.tsx
const Inventory: React.FC = () => {
  const { products, updateStock } = useInventory();
  const [alerts] = useStockAlerts();
  
  return (
    <div className="inventory-management">
      <StockAlerts alerts={alerts} />
      <StockFilters onFiltersChange={setFilters} />
      <StockTable 
        products={products}
        onStockUpdate={updateStock}
      />
      <BulkActions onBulkUpdate={handleBulkUpdate} />
    </div>
  );
};

// src/components/StockAdjustmentModal.tsx
const StockAdjustmentModal: React.FC<{ product: Product }> = ({ product }) => {
  const [adjustment, setAdjustment] = useState(0);
  const [reason, setReason] = useState('');
  
  const handleAdjust = async () => {
    await inventoryApi.adjustStock(product.id, adjustment, reason);
    onStockAdjusted();
  };
  
  return (
    <Modal>
      <h3>Ajuster le stock - {product.name}</h3>
      <p>Stock actuel: {product.stock}</p>
      <input
        type="number"
        value={adjustment}
        onChange={(e) => setAdjustment(Number(e.target.value))}
        placeholder="Quantité d'ajustement"
      />
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="Raison de l'ajustement"
      />
      <button onClick={handleAdjust}>Confirmer</button>
    </Modal>
  );
};
```

---

## 📱 Phase 5 - Application Mobile & PWA

### PWA Configuration
```typescript
// public/sw.js - Service Worker
const CACHE_NAME = 'dental-ecommerce-v1';
const urlsToCache = [
  '/',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

// src/utils/pwa.ts
export const installPWA = () => {
  let deferredPrompt: any;
  
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallButton();
  });
  
  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response: ${outcome}`);
      deferredPrompt = null;
    }
  };
  
  return { handleInstall };
};
```

### React Native (Mobile)
```typescript
// src/screens/ProductsScreen.tsx
import React from 'react';
import { View, FlatList, Text } from 'react-native';
import { useProducts } from '../hooks/useProducts';
import ProductCard from '../components/ProductCard';

const ProductsScreen: React.FC = () => {
  const { products, loading, loadMore } = useProducts();
  
  return (
    <View style={styles.container}>
      <FlatList
        data={products}
        renderItem={({ item }) => <ProductCard product={item} />}
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        refreshing={loading}
      />
    </View>
  );
};

// src/services/api.native.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

class ApiService {
  private baseURL = 'https://api.dental-ecommerce.com';
  
  async request(endpoint: string, options: RequestOptions = {}) {
    const token = await AsyncStorage.getItem('authToken');
    
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });
    
    return response.json();
  }
}
```

---

## 🔧 Outils de Développement

### Tests E2E avec Cypress
```typescript
// cypress/integration/checkout.spec.ts
describe('Checkout Process', () => {
  beforeEach(() => {
    cy.login('client@example.com', 'password');
    cy.addProductToCart(1, 2);
  });
  
  it('should complete checkout with promo code', () => {
    cy.visit('/cart');
    cy.get('[data-cy=promo-code-input]').type('NOEL2024');
    cy.get('[data-cy=apply-promo]').click();
    cy.get('[data-cy=discount-amount]').should('contain', '20%');
    
    cy.get('[data-cy=checkout-button]').click();
    cy.fillShippingForm();
    cy.selectPaymentMethod('stripe');
    cy.fillPaymentForm();
    cy.get('[data-cy=place-order]').click();
    
    cy.url().should('include', '/order-confirmation');
    cy.get('[data-cy=order-number]').should('be.visible');
  });
});
```

### Monitoring avec Prometheus
```typescript
// src/monitoring/metrics.service.ts
import { Injectable } from '@nestjs/common';
import { Counter, Histogram, register } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly httpRequestsTotal = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
  });
  
  private readonly httpRequestDuration = new Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route'],
  });
  
  recordHttpRequest(method: string, route: string, status: number, duration: number) {
    this.httpRequestsTotal.inc({ method, route, status: status.toString() });
    this.httpRequestDuration.observe({ method, route }, duration);
  }
  
  getMetrics() {
    return register.metrics();
  }
}
```

---

## 📈 Optimisations Avancées

### Cache Redis
```typescript
// src/cache/redis.service.ts
@Injectable()
export class RedisService {
  constructor(@InjectRedis() private readonly redis: Redis) {}
  
  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);
    return value ? JSON.parse(value) : null;
  }
  
  async set(key: string, value: any, ttl: number = 3600): Promise<void> {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }
  
  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
```

### Elasticsearch pour Recherche
```typescript
// src/search/elasticsearch.service.ts
@Injectable()
export class ElasticsearchService {
  constructor(@InjectElasticsearch() private readonly client: Client) {}
  
  async indexProduct(product: Product): Promise<void> {
    await this.client.index({
      index: 'products',
      id: product.id.toString(),
      body: {
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category.name,
        tags: product.tags,
        inStock: product.stock > 0,
      },
    });
  }
  
  async searchProducts(query: string, filters: SearchFilters): Promise<SearchResult> {
    const searchBody = {
      query: {
        bool: {
          must: [
            {
              multi_match: {
                query,
                fields: ['name^2', 'description', 'tags'],
              },
            },
          ],
          filter: this.buildFilters(filters),
        },
      },
      sort: this.buildSort(filters.sortBy),
      from: (filters.page - 1) * filters.limit,
      size: filters.limit,
    };
    
    const response = await this.client.search({
      index: 'products',
      body: searchBody,
    });
    
    return this.formatSearchResults(response);
  }
}
```

---

## 🚀 Déploiement Avancé

### Kubernetes
```yaml
# k8s/deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: dental-ecommerce-backend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: dental-ecommerce-backend
  template:
    metadata:
      labels:
        app: dental-ecommerce-backend
    spec:
      containers:
      - name: backend
        image: dental-ecommerce/backend:latest
        ports:
        - containerPort: 3000
        env:
        - name: DB_HOST
          valueFrom:
            secretKeyRef:
              name: db-secret
              key: host
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
```

### CI/CD avec GitHub Actions
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Run tests
        run: |
          npm ci
          npm run test
          npm run test:e2e
  
  build-and-deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build Docker images
        run: |
          docker build -t dental-ecommerce/backend:${{ github.sha }} ./backend
          docker build -t dental-ecommerce/frontend:${{ github.sha }} ./frontend
      
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/backend backend=dental-ecommerce/backend:${{ github.sha }}
          kubectl set image deployment/frontend frontend=dental-ecommerce/frontend:${{ github.sha }}
```

---

Cette roadmap fournit une base solide pour étendre l'application avec des fonctionnalités avancées. Chaque phase peut être développée indépendamment selon les priorités business.

