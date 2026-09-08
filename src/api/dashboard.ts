export interface DashboardFilters {
  business_id: string;
  start_date: string;
  end_date: string;
}

export interface DashboardRevenue {
  total_revenue: number;
  paid_revenue: number;
  pending_revenue: number;
  cash_revenue: number;
  online_revenue: number;
}

export interface DashboardInventory {
  total_products: number;
  total_categories: number;
  low_stock_products: number;
  out_of_stock_products: number;
  total_stock_value: number;
  total_selling_value: number;
  potential_profit: number;
}

export interface DashboardData {
  filters?: DashboardFilters;
  revenue: DashboardRevenue;
  inventory: DashboardInventory;
}

export interface DashboardResponse {
  success: boolean;
  message?: string;
  data?: DashboardData;
}

const API_BASE_URL = 'https://business-management-zhzy.onrender.com';

function getAuthToken(): string {
  const token = localStorage.getItem('billmaster_access_token');
  if (token) return token;
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNGRhNGM3MGEtYWIzNy00NzZiLWJlMmEtY2QzZWRiYzJhZjI4Iiwicm9sZSI6Ik9XTkVSIiwiaWF0IjoxNzg4NzY3MDMyLCJleHAiOjE3ODkzNzE4MzJ9.bKh4CjWmkiKs6xRZPBJGiDOVreLnUqTj909cWoyQyzk';
}

/**
 * GET /api/dashboard?business_id=:businessId&start_date=:startDate&end_date=:endDate
 * Fetches comprehensive revenue and inventory report metrics for business
 */
export async function getDashboardReports(
  businessId: string,
  startDate?: string,
  endDate?: string,
  customToken?: string
): Promise<DashboardResponse> {
  const token = customToken || getAuthToken();
  const start = startDate || '2026-09-01';
  const end = endDate || '2026-09-07';

  const url = `${API_BASE_URL}/api/dashboard?business_id=${encodeURIComponent(
    businessId
  )}&start_date=${encodeURIComponent(start)}&end_date=${encodeURIComponent(end)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}: ${response.statusText}`);
    }

    const json = await response.json();
    return json;
  } catch (error: any) {
    console.error('Failed to fetch dashboard reports:', error);
    return {
      success: false,
      message: error?.message || 'Failed to fetch dashboard reports',
    };
  }
}
