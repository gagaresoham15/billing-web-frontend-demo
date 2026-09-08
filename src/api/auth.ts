export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message?: string;
  data?: {
    access_token: string;
    refresh_token: string;
  };
}

const API_BASE_URL = 'https://business-management-zhzy.onrender.com';

export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const result = await response.json();
  return result;
}

export interface SignupPayload {
  name: string;
  phone: string;
  email: string;
  password: string;
  role: string;
}

export interface SignupResponse {
  success: boolean;
  message?: string;
  data?: {
    access_token: string;
    refresh_token: string;
  };
}

export async function signupUser(payload: SignupPayload): Promise<SignupResponse> {
  const token = localStorage.getItem('billmaster_access_token');
  const headers: Record<string, string> = {
    'accept': 'application/json',
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/signup`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  return result;
}

export interface SendOtpResponse {
  success: boolean;
  message?: string;
  data?: any;
}

export interface VerifyOtpResponse {
  success: boolean;
  message?: string;
  data?: {
    access_token: string;
    refresh_token: string;
  };
}

export async function sendOtp(email: string): Promise<SendOtpResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/send-otp`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  const result = await response.json();
  return result;
}

export async function verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
    method: 'POST',
    headers: {
      'accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, otp }),
  });

  const result = await response.json();
  return result;
}
