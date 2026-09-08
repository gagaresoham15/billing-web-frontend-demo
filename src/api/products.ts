export interface ApiProductBusiness {
  id: string;
  business_name: string;
  business_type?: string;
  address?: string;
}

export interface ApiProduct {
  id: string;
  business_id: string;
  category_id: string;
  product_name: string;
  barcode_number?: string | null;
  sku?: string | null;
  purchase_price: string | number;
  selling_price: string | number;
  quantity: number;
  product_image?: string | null;
  deleted_at?: string | null;
  createdAt?: string;
  updatedAt?: string;
  business?: ApiProductBusiness;
}

export interface GetProductsResponse {
  success: boolean;
  message?: string;
  data?: ApiProduct[];
}

export interface CreateProductPayload {
  business_id: string;
  category_id: string;
  product_name: string;
  barcode_number?: string;
  purchase_price: number;
  selling_price: number;
  quantity?: number;
  product_image?: string;
}

export interface CreateProductResponse {
  success: boolean;
  message?: string;
  data?: ApiProduct;
}

export {
  type ApiCategory,
  type ApiCategoryBusiness,
  type GetCategoriesResponse,
  type CreateCategoryPayload,
  type CreateCategoryResponse,
  type UpdateCategoryPayload,
  type UpdateCategoryResponse,
  type DeleteCategoryResponse,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from './categories';

const API_BASE_URL = 'https://business-management-zhzy.onrender.com';

function getAuthToken(): string {
  const token = localStorage.getItem('billmaster_access_token');
  if (token) return token;
  return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiNGRhNGM3MGEtYWIzNy00NzZiLWJlMmEtY2QzZWRiYzJhZjI4Iiwicm9sZSI6Ik9XTkVSIiwiaWF0IjoxNzg4NzY3MDMyLCJleHAiOjE3ODkzNzE4MzJ9.bKh4CjWmkiKs6xRZPBJGiDOVreLnUqTj909cWoyQyzk';
}

/**
 * GET /api/products/business/:business_id
 * Fetches real live products for the active business
 */
export async function getProductsByBusiness(
  businessId: string = '66946b56-8be2-41c6-a2a7-fc7388b08c70',
  customToken?: string
): Promise<GetProductsResponse> {
  const token = customToken || getAuthToken();
  const url = `${API_BASE_URL}/api/products/business/${encodeURIComponent(businessId)}`;

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
      message: json.message || 'Products fetched successfully',
      data: Array.isArray(json.data) ? json.data : [],
    };
  } catch (error: any) {
    console.error('Failed to fetch products:', error);
    return {
      success: false,
      message: error?.message || 'Failed to fetch products',
      data: [],
    };
  }
}

/**
 * POST /api/products
 * Creates a new product on the backend
 */
export async function createProduct(
  payload: CreateProductPayload,
  customToken?: string
): Promise<CreateProductResponse> {
  const token = customToken || getAuthToken();
  const url = `${API_BASE_URL}/api/products`;

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
      message: json.message || 'Product created successfully',
      data: json.data,
    };
  } catch (error: any) {
    console.error('Failed to create product:', error);
    return {
      success: false,
      message: error?.message || 'Failed to create product',
    };
  }
}

