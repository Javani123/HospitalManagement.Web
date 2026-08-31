/**
 * Type definitions for Authentication & User Session.
 * Matches backend ASP.NET Core DTOs from HospitalManagement.Api.DTOs.Authentication.
 */

export interface LoginRequest {
  usernameOrEmail: string;
  password: string;
}

export interface AuthUser {
  id: number;
  hospitalId: number;
  username: string;
  email: string;
  fullName: string | null;
  staffId: number | null;
  staffName: string | null;
  isActive: boolean;
  lastLoginAt: string | null;
  roles: string[];
}

export interface LoginResponse {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

export interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}
