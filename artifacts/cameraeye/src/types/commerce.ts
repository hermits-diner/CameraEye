export type ProductType = 'print' | 'digital';

export interface PrintSizeOption {
  id: string;
  name: string; // e.g. "A3 (297 x 420 mm)", "A2 (420 x 594 mm)"
  dimensionsCm: { width: number; height: number };
  weightKg: number;
  priceUsd: number;
  priceKrw: number;
}

export interface PrintEdition {
  id: string;
  totalLimit: number;
  remainingStock: number;
  sizeOptions: PrintSizeOption[];
  digitalPriceUsd: number;
  digitalPriceKrw: number;
}

export interface ShippingDetails {
  recipientName: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: 'KR' | 'US' | 'JP' | 'EU' | 'WW';
}

export interface OrderItem {
  id: string;
  projectId: string;
  projectTitle: string;
  coverImageUrl: string;
  type: ProductType;
  selectedSize?: string;
  priceUsd: number;
  priceKrw: number;
  digitalDownloadUrl?: string;
}

export type OrderStatus = 'received' | 'production' | 'shipped' | 'completed';

export interface Order {
  id: string;
  createdAt: string;
  customerEmail: string;
  items: OrderItem[];
  shippingDetails?: ShippingDetails;
  shippingFeeUsd: number;
  shippingFeeKrw: number;
  totalUsd: number;
  totalKrw: number;
  status: OrderStatus;
  trackingNumber?: string;
  paymentMethod: 'Simulated Card' | 'Stripe (Mocked)';
}
