export interface ExpenseSummaryData {
  total_expenses: number;
  monthly_expenses: number;
  today_expenses: number;
  pending_expenses: number;
  partial_expenses: number;
  expense_count: number;
}

export interface ExpenseSummaryResponse {
  success: boolean;
  message?: string;
  data: ExpenseSummaryData;
}

export interface ExpenseCategorySummaryItem {
  category: string;
  amount: number;
  count: number;
}

export interface ExpenseCategorySummaryResponse {
  success: boolean;
  message?: string;
  data: ExpenseCategorySummaryItem[];
}

export interface ApiExpenseUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
}

export interface ApiExpense {
  id: string;
  business_id: string;
  title: string;
  category: string;
  amount: number | string;
  paid_amount: number | string;
  remaining_amount?: number | string;
  expense_date: string;
  payment_method: string;
  payment_status: string;
  paid_to?: string | null;
  reference_number?: string | null;
  description?: string | null;
  notes?: string | null;
  receipt_url?: string | null;
  receipt_original_name?: string | null;
  createdAt?: string;
  updatedAt?: string;
  creator?: ApiExpenseUser;
}

export interface ExpensePagination {
  page: number;
  limit: number;
  totalRecords: number;
  totalPages: number;
}

export interface GetExpensesResponse {
  success: boolean;
  message?: string;
  data: ApiExpense[];
  pagination?: ExpensePagination;
}

export interface CreateExpensePayload {
  title: string;
  category: string;
  amount: number;
  paid_amount?: number;
  expense_date: string; // YYYY-MM-DD
  payment_method: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | string;
  payment_status?: 'Paid' | 'Pending' | 'Partial' | string;
  paid_to?: string;
  reference_number?: string;
  description?: string;
  notes?: string;
}

export interface CreateExpenseResponse {
  success: boolean;
  message?: string;
  data?: ApiExpense;
}

export interface DeleteExpenseResponse {
  success: boolean;
  message?: string;
}

const API_BASE_URL = 'https://business-management-zhzy.onrender.com';

function getAuthToken(): string {
  const token = localStorage.getItem('billmaster_access_token');
  if (token) return token;
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNGRhNGM3MGEtYWIzNy00NzZiLWJlMmEtY2QzZWRiYzJhZjI4Iiwicm9sZSI6Ik9XTkVSIiwiaWF0IjoxNzg4NzY3MDMyLCJleHAiOjE3ODkzNzE4MzJ9.bKh4CjWmkiKs6xRZPBJGiDOVreLnUqTj909cWoyQyzk';
}

/**
 * GET /api/expenses/business/:business_id/summary
 * Fetches overall expense totals (monthly, today, pending, total count)
 */
export async function getExpenseSummary(
  businessId: string,
  customToken?: string
): Promise<ExpenseSummaryResponse> {
  const token = customToken || getAuthToken();
  const url = `${API_BASE_URL}/api/expenses/business/${encodeURIComponent(businessId)}/summary`;

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
    return {
      success: true,
      message: json.message || 'Expense summary fetched successfully',
      data: json.data || {
        total_expenses: 0,
        monthly_expenses: 0,
        today_expenses: 0,
        pending_expenses: 0,
        partial_expenses: 0,
        expense_count: 0,
      },
    };
  } catch (error: any) {
    console.error('Failed to fetch expense summary:', error);
    return {
      success: false,
      message: error?.message || 'Failed to fetch expense summary',
      data: {
        total_expenses: 0,
        monthly_expenses: 0,
        today_expenses: 0,
        pending_expenses: 0,
        partial_expenses: 0,
        expense_count: 0,
      },
    };
  }
}

/**
 * GET /api/expenses/business/:business_id/summary/by-category
 * Fetches category breakdown of expenses
 */
export async function getExpensesByCategory(
  businessId: string,
  customToken?: string
): Promise<ExpenseCategorySummaryResponse> {
  const token = customToken || getAuthToken();
  const url = `${API_BASE_URL}/api/expenses/business/${encodeURIComponent(businessId)}/summary/by-category`;

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
    return {
      success: true,
      message: json.message || 'Category summary fetched successfully',
      data: Array.isArray(json.data) ? json.data : [],
    };
  } catch (error: any) {
    console.error('Failed to fetch category expense summary:', error);
    return {
      success: false,
      message: error?.message || 'Failed to fetch category expense summary',
      data: [],
    };
  }
}

/**
 * GET /api/expenses/business/:business_id?page=1&limit=10&sort_by=expense_date&sort_order=DESC
 * Fetches paginated expenses list
 */
export async function getExpenses(
  businessId: string,
  params?: {
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: 'ASC' | 'DESC';
  },
  customToken?: string
): Promise<GetExpensesResponse> {
  const token = customToken || getAuthToken();
  const page = params?.page || 1;
  const limit = params?.limit || 20;
  const sortBy = params?.sort_by || 'expense_date';
  const sortOrder = params?.sort_order || 'DESC';

  const url = `${API_BASE_URL}/api/expenses/business/${encodeURIComponent(
    businessId
  )}?page=${page}&limit=${limit}&sort_by=${sortBy}&sort_order=${sortOrder}`;

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
    return {
      success: true,
      message: json.message || 'Expenses fetched successfully',
      data: Array.isArray(json.data) ? json.data : [],
      pagination: json.pagination,
    };
  } catch (error: any) {
    console.error('Failed to fetch expenses list:', error);
    return {
      success: false,
      message: error?.message || 'Failed to fetch expenses list',
      data: [],
    };
  }
}

/**
 * POST /api/expenses/business/:business_id
 * Creates a new expense record
 */
export async function createExpense(
  businessId: string,
  payload: CreateExpensePayload,
  customToken?: string
): Promise<CreateExpenseResponse> {
  const token = customToken || getAuthToken();
  const url = `${API_BASE_URL}/api/expenses/business/${encodeURIComponent(businessId)}`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.message || `HTTP error ${response.status}`);
    }

    return {
      success: true,
      message: json.message || 'Expense created successfully',
      data: json.data,
    };
  } catch (error: any) {
    console.error('Failed to create expense:', error);
    return {
      success: false,
      message: error?.message || 'Failed to create expense',
    };
  }
}

/**
 * DELETE /api/expenses/:id
 * Deletes an expense with x-business-id header and body
 */
export async function deleteExpense(
  expenseId: string,
  businessId: string,
  customToken?: string
): Promise<DeleteExpenseResponse> {
  const token = customToken || getAuthToken();
  const url = `${API_BASE_URL}/api/expenses/${encodeURIComponent(expenseId)}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        'x-business-id': businessId,
      },
      body: JSON.stringify({ business_id: businessId }),
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.message || `HTTP error ${response.status}`);
    }

    return {
      success: true,
      message: json.message || 'Expense deleted successfully',
    };
  } catch (error: any) {
    console.error('Failed to delete expense:', error);
    return {
      success: false,
      message: error?.message || 'Failed to delete expense',
    };
  }
}
