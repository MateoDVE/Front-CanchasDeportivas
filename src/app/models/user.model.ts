export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  ci: string;
  role: 'CLIENTE' | 'SECRETARIA' | 'ADMIN' | string;
  status: string;
  createdAt: string | Date;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  phone: string;
  ci: string;
  password: string;
}