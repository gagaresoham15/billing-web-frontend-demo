export type ScreenId =
  | '1-signin-password'
  | '2-signin-otp'
  | '3-select-business'
  | '4-dashboard'
  | '5-side-drawer'
  | '6-sales-invoices'
  | '7-products'
  | '8-reports'
  | '9-profile'
  | '10-choose-plan'
  | '11-payment-method'
  | '12-razorpay-popup'
  | '13-manual-qr'
  | '14-subscription-status'
  | 'signup'
  | 'create-bill'
  | 'categories'
  | 'customers'
  | 'expenses';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  totalBills: number;
  totalSpent: number;
  lastVisit: string;
  creditBalance?: number;
}

export interface CategoryItem {
  id: string;
  name: string;
  description?: string;
  productCount: number;
  color?: string;
}

export interface ExpenseItem {
  id: string;
  title: string;
  category: 'Rent' | 'Electricity' | 'Salary' | 'Inventory' | 'Maintenance' | 'Transport' | 'Other';
  amount: number;
  date: string;
  paymentMethod: 'Cash' | 'Online';
  notes?: string;
}


export interface BillItem {
  id: string;
  name: string;
  qty: number;
  rate: number;
  total: number;
}

export interface Bill {
  id: string;
  billNumber: string; // e.g. MES-5
  customer: string;
  mobile: string;
  dateTime: string; // e.g. 03 Sep 2026 10:24 AM
  amount: number;
  paymentMethod: 'Cash' | 'Online';
  items?: BillItem[];
}

export interface Product {
  id: number;
  name: string;
  category: 'Beauty' | 'Electronics' | 'Snacks' | 'Personal Care' | 'Baby Care' | 'Beverages' | 'Food' | 'Other';
  stock: number;
  cost: number;
  price: number;
}

export interface Workspace {
  id: string;
  name: string;
  category: string;
  address: string;
  tag: string;
  logo?: string | null;
  iconBg?: string;
  isActive?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: 'OWNER' | 'MANAGER' | 'CASHIER' | 'ADMIN';
  isVerified: boolean;
  avatarUrl?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  period: string; // e.g. "/month"
  tagline: string;
  badge?: string;
  features?: string[];
}

export interface ActiveSubscription {
  planName: string;
  status: 'Active' | 'Expired' | 'Pending';
  startDate: string;
  expireDate: string;
  remainingDays: number;
}
