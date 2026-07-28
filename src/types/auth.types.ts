/* ── Auth Module — Type Definitions ────────────────────────────── */

export interface Organization {
  id: string;
  name: string;
  created_at: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  role: string;
  organization: Organization;
}

export interface LoginBody {
  email: string;
  password: string;
}

export interface LoginResponse {
  refresh: string;
  access: string;
  user: AuthUser;
}

export interface LoginErrorResponse {
  error: string;
  detail: string;
  field_errors: Record<string, string[]>;
}

export interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  loading: boolean;
  error: string | null;
}
