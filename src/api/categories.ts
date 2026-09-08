export interface ApiCategoryBusiness {
  id: string;
  business_name: string;
  business_logo?: string | null;
  business_type?: string;
  address?: string;
}

export interface ApiCategory {
  id: string;
  name: string;
  business_id?: string;
  owner_id?: string;
  createdAt?: string;
  updatedAt?: string;
  business?: ApiCategoryBusiness;
}

export interface GetCategoriesResponse {
  success: boolean;
  message?: string;
  data?: ApiCategory[];
}

export interface CreateCategoryPayload {
  name: string;
  business_id: string;
}

export interface CreateCategoryResponse {
  success: boolean;
  message?: string;
  data?: ApiCategory;
}

export interface UpdateCategoryPayload {
  name: string;
}

export interface UpdateCategoryResponse {
  success: boolean;
  message?: string;
  data?: ApiCategory;
}

export interface DeleteCategoryResponse {
  success: boolean;
  message?: string;
}

const API_BASE_URL = 'https://business-management-zhzy.onrender.com';

export function getAuthToken(): string {
  const token = localStorage.getItem('billmaster_access_token');
  if (token) return token;
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNGRhNGM3MGEtYWIzNy00NzZiLWJlMmEtY2QzZWRiYzJhZjI4Iiwicm9sZSI6Ik9XTkVSIiwiaWF0IjoxNzg4NzY3MDMyLCJleHAiOjE3ODkzNzE4MzJ9.bKh4CjWmkiKs6xRZPBJGiDOVreLnUqTj909cWoyQyzk';
}

export function getUserIdFromToken(token?: string): string | null {
  const authToken = token || getAuthToken();
  if (!authToken) return null;
  try {
    const parts = authToken.split('.');
    if (parts.length < 2) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const parsed = JSON.parse(jsonPayload);
    return parsed.user_id || null;
  } catch {
    return null;
  }
}

/**
 * GET /api/categories or /api/categories?business_id=:businessId
 * Fetches categories from the backend.
 */
export async function getCategories(
  businessId?: string,
  customToken?: string
): Promise<GetCategoriesResponse> {
  const token = customToken || getAuthToken();
  let url = `${API_BASE_URL}/api/categories`;
  if (businessId && businessId !== 'ALL') {
    url += `?business_id=${encodeURIComponent(businessId)}`;
  }

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
      message: json.message || 'Categories fetched successfully',
      data: Array.isArray(json.data) ? json.data : [],
    };
  } catch (error: any) {
    console.error('Failed to fetch categories:', error);
    return {
      success: false,
      message: error?.message || 'Failed to fetch categories',
      data: [],
    };
  }
}

/**
 * POST /api/categories
 * Creates a new category for a business
 */
export async function createCategory(
  payload: CreateCategoryPayload,
  customToken?: string
): Promise<CreateCategoryResponse> {
  const token = customToken || getAuthToken();
  const url = `${API_BASE_URL}/api/categories`;

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
      message: json.message || 'Category created successfully',
      data: json.data,
    };
  } catch (error: any) {
    console.error('Failed to create category:', error);
    return {
      success: false,
      message: error?.message || 'Failed to create category',
    };
  }
}

/**
 * PUT /api/categories/:id
 * Updates an existing category
 */
export async function updateCategory(
  id: string,
  payload: UpdateCategoryPayload,
  customToken?: string
): Promise<UpdateCategoryResponse> {
  const token = customToken || getAuthToken();
  const url = `${API_BASE_URL}/api/categories/${encodeURIComponent(id)}`;

  try {
    const response = await fetch(url, {
      method: 'PUT',
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
      message: json.message || 'Category updated successfully',
      data: json.data,
    };
  } catch (error: any) {
    console.error('Failed to update category:', error);
    return {
      success: false,
      message: error?.message || 'Failed to update category',
    };
  }
}

/**
 * DELETE /api/categories/:id
 * Deletes a category by ID
 */
export async function deleteCategory(
  id: string,
  customToken?: string
): Promise<DeleteCategoryResponse> {
  const token = customToken || getAuthToken();
  const url = `${API_BASE_URL}/api/categories/${encodeURIComponent(id)}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const json = await response.json();

    if (!response.ok) {
      throw new Error(json.message || `HTTP error ${response.status}`);
    }

    return {
      success: true,
      message: json.message || 'Category deleted successfully',
    };
  } catch (error: any) {
    console.error('Failed to delete category:', error);
    return {
      success: false,
      message: error?.message || 'Failed to delete category',
    };
  }
}
