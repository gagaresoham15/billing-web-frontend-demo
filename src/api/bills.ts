export interface DailyIncome {
  total_income: number;
  cash_income: number;
  online_income: number;
}

export interface MonthlyIncome {
  month: string;
  total_income: number;
  cash_income: number;
  online_income: number;
}

export interface BillStatisticsData {
  date: string;
  daily_income: DailyIncome;
  monthly_income: MonthlyIncome;
}

export interface BillStatisticsResponse {
  success: boolean;
  message?: string;
  data?: BillStatisticsData;
}

export interface ApiBillProduct {
  id: string;
  product_name: string;
  quantity: number;
  price: string | number;
  amount: string | number;
  is_paid?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiBill {
  sr_no: string;
  customer_name: string;
  phone: string;
  payment: string; // 'cash' | 'online' | 'pending'
  products: ApiBillProduct[];
}

export interface GetBillsResponse {
  success: boolean;
  message?: string;
  data?: ApiBill[];
}

export interface ApiCustomerPendingBill {
  id?: string;
  sr_no?: string;
  amount?: number;
  date?: string;
  [key: string]: any;
}

export interface ApiCustomer {
  customer_name: string;
  phone: string;
  business_id: string;
  total_amount: number;
  paid_amount: number;
  pending_amount: number;
  pending_bills?: ApiCustomerPendingBill[];
}

export interface GetCustomersResponse {
  success: boolean;
  message?: string;
  data?: ApiCustomer[];
}

const API_BASE_URL = 'https://business-management-zhzy.onrender.com';

function getAuthToken(): string {
  const token = localStorage.getItem('billmaster_access_token');
  if (token) return token;
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNGRhNGM3MGEtYWIzNy00NzZiLWJlMmEtY2QzZWRiYzJhZjI4Iiwicm9sZSI6Ik9XTkVSIiwiaWF0IjoxNzg4NzkxMzk0LCJleHAiOjE3ODkzOTYxOTR9.3Eis8zADHcE58kLthHfQxKH1qT6cIxHTyz7T6VupJkE';
}

export async function getBillStatistics(
  businessId: string,
  dateStr?: string,
  customToken?: string
): Promise<BillStatisticsResponse> {
  const token = customToken || getAuthToken();
  const date = dateStr || new Date().toISOString().split('T')[0];

  const url = `${API_BASE_URL}/api/bills/statistics?business_id=${encodeURIComponent(
    businessId
  )}&date=${encodeURIComponent(date)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();
  return result;
}

export async function getBills(
  businessId: string,
  limit?: number,
  customToken?: string
): Promise<GetBillsResponse> {
  const token = customToken || getAuthToken();
  let url = `${API_BASE_URL}/api/bills?business_id=${encodeURIComponent(businessId)}`;
  if (limit) {
    url += `&limit=${encodeURIComponent(limit)}`;
  }

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();
  return result;
}

export interface CreateBillProductItem {
  product_id?: string;
  product_name: string;
  quantity: number;
  price: number;
  amount: number;
  is_paid?: boolean;
}

export interface CreateBillPayload {
  customer_name: string;
  phone: string;
  business_id: string;
  products: CreateBillProductItem[];
  payment_type: 'cash' | 'online' | string;
}

export interface CreateBillResponse {
  success: boolean;
  message?: string;
  data?: ApiBill[];
}

export async function createBill(
  payload: CreateBillPayload,
  customToken?: string
): Promise<CreateBillResponse> {
  const token = customToken || getAuthToken();
  const url = `${API_BASE_URL}/api/bills`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    return result;
  } catch (error: any) {
    console.error('Failed to create bill:', error);
    return {
      success: false,
      message: error?.message || 'Failed to create bill. Network error.',
    };
  }
}

/**
 * GET /api/bills/customers or /api/bills/customers?business_id=:businessId
 * Fetches customer registry with spending and udhaari/credit totals
 */
export async function getCustomers(
  businessId?: string,
  customToken?: string
): Promise<GetCustomersResponse> {
  const token = customToken || getAuthToken();
  let url = `${API_BASE_URL}/api/bills/customers`;
  if (businessId && businessId !== 'ALL') {
    url += `?business_id=${encodeURIComponent(businessId)}`;
  }

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        accept: 'application/json',
        authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      success: true,
      message: result.message || 'Customers fetched successfully',
      data: Array.isArray(result.data) ? result.data : [],
    };
  } catch (error: any) {
    console.error('Failed to fetch customers:', error);
    return {
      success: false,
      message: error?.message || 'Failed to fetch customers',
      data: [],
    };
  }
}

