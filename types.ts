export interface Product {
  id: string;
  user_id: string;
  name: string;
  category: string;
  quantity: number;
  expiry_date: string | null;
  min_threshold: number;
  created_at?: string;
}

export interface ShoppingItem {
  id: string;
  user_id: string;
  name: string;
  is_checked: boolean;
  quantity: number;
  category?: string;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  transport_mode: 'car' | 'bike' | 'walk';
  email?: string;
}

export interface PurchaseHistory {
  id: string;
  user_id: string;
  product_name: string;
  quantity: number;
  purchase_date: string;
  price?: number;
}

export enum TransportMode {
  CAR = 'car',
  BIKE = 'bike',
  WALK = 'walk'
}