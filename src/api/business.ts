export interface ApiBusinessOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  profile_photo?: string | null;
}

export interface ApiBusiness {
  id: string;
  business_name: string;
  business_type: string;
  owner_id?: string;
  business_logo?: string | null;
  address: string;
  createdAt?: string;
  updatedAt?: string;
  owner?: ApiBusinessOwner;
}

export interface CreateBusinessPayload {
  business_name: string;
  business_type: string;
  address: string;
}

export interface BusinessesResponse {
  success: boolean;
  message?: string;
  data: ApiBusiness[];
}

export interface CreateBusinessResponse {
  success: boolean;
  message?: string;
  data?: ApiBusiness;
}

const API_BASE_URL = 'https://business-management-zhzy.onrender.com';

function getAuthToken(): string {
  const token = localStorage.getItem('billmaster_access_token');
  if (token) return token;
  // User token provided in curl
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

export async function getBusinesses(customToken?: string): Promise<BusinessesResponse> {
  const token = customToken || getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/businesses`, {
    method: 'GET',
    headers: {
      'accept': 'application/json',
      'authorization': `Bearer ${token}`,
    },
  });

  const result = await response.json();
  return result;
}

export async function createBusiness(
  payload: CreateBusinessPayload,
  customToken?: string
): Promise<CreateBusinessResponse> {
  const token = customToken || getAuthToken();
  const response = await fetch(`${API_BASE_URL}/api/businesses`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
      'authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  return result;
}
