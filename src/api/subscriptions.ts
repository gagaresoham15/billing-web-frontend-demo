export interface ApiSubscriptionPlan {
  id: string;
  name: string;
  code: string;
  description: string;
  duration_days: number;
  price: string;
  currency: string;
}

export interface ApiCurrentSubscriptionData {
  id: string;
  plan: ApiSubscriptionPlan;
  status: 'ACTIVE' | 'EXPIRED' | 'PENDING' | string;
  start_at: string;
  expires_at: string;
  remaining_days: number;
  can_renew: boolean;
}

export interface CurrentSubscriptionResponse {
  success: boolean;
  message?: string;
  data?: ApiCurrentSubscriptionData | null;
}

export interface SubscriptionPlansResponse {
  success: boolean;
  message?: string;
  data?: ApiSubscriptionPlan[];
}

export interface ApiSubscriptionHistoryItem {
  id: string;
  business_id: string;
  subscription_id: string;
  plan_id: string;
  payment_id: string;
  action: 'RENEW' | 'NEW' | string;
  previous_start_at: string | null;
  previous_expires_at: string | null;
  new_start_at: string;
  new_expires_at: string;
  reason: string | null;
  performed_by: string;
  createdAt: string;
  plan?: {
    id: string;
    name: string;
    code: string;
  };
}

export interface SubscriptionHistoryResponse {
  success: boolean;
  message?: string;
  data?: {
    data: ApiSubscriptionHistoryItem[];
    pagination: {
      total: number;
      page: number;
      limit: number;
      pages: number;
    };
  };
}

const API_BASE_URL = 'https://business-management-zhzy.onrender.com';

function getAuthToken(): string {
  const token = localStorage.getItem('billmaster_access_token');
  if (token) return token;
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNGRhNGM3MGEtYWIzNy00NzZiLWJlMmEtY2QzZWRiYzJhZjI4Iiwicm9sZSI6Ik9XTkVSIiwiaWF0IjoxNzg4NzkxMzk0LCJleHAiOjE3ODkzOTYxOTR9.3Eis8zADHcE58kLthHfQxKH1qT6cIxHTyz7T6VupJkE';
}

/**
 * GET /api/subscriptions/current/:business_id
 * Fetches the current active subscription for a specific business/store
 */
export async function getCurrentSubscription(
  businessId: string,
  customToken?: string
): Promise<CurrentSubscriptionResponse> {
  const token = customToken || getAuthToken();
  const url = `${API_BASE_URL}/api/subscriptions/current/${encodeURIComponent(businessId)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to fetch current subscription:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error fetching subscription',
    };
  }
}

/**
 * GET /api/subscriptions/plans
 * Fetches all available subscription plans
 */
export async function getSubscriptionPlans(
  customToken?: string
): Promise<SubscriptionPlansResponse> {
  const token = customToken || getAuthToken();
  const url = `${API_BASE_URL}/api/subscriptions/plans`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to fetch subscription plans:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error fetching plans',
    };
  }
}

/**
 * GET /api/subscriptions/history/:business_id
 * Fetches subscription and payment transaction history
 */
export async function getSubscriptionHistory(
  businessId: string,
  customToken?: string
): Promise<SubscriptionHistoryResponse> {
  const token = customToken || getAuthToken();
  const url = `${API_BASE_URL}/api/subscriptions/history/${encodeURIComponent(businessId)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Failed to fetch subscription history:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error fetching history',
    };
  }
}
