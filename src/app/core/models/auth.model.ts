export interface AuthResponse {
  token: string;
  email: string;
  fullName: string;
  role: string;
  expiresIn: number;
}

export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password?: string;
  role: string;
}
