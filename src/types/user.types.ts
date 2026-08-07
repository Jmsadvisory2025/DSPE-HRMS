/* ── User Module — Type Definitions ───────────────────────────── */

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  date_joined: string;
  role: string;
  organization_name: string;
  jobs_count: number;
  recruiters_count: number;
  created_by_name: string | null;
  is_active: boolean;
}

export interface AddUserPayload {
  role: string;
  name: string;
  email: string;
  phone: string;
}

export interface UserResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: User[];
}

export interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}
