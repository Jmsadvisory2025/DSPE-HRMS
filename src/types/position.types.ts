/* ── Position Module — Type Definitions ───────────────────────── */

export interface JobClient {
  id: string;
  name: string;
  team_member: {
    id: string;
    name: string;
    email?: string;
  } | null;
}

export interface Job {
  id: string;
  code: string;
  title: string;
  status: string;
  location: string;
  openings: number;
  min_experience: number | string;
  max_experience: number | string;
  budget: string;
  hiring_for: string;
  candidate_count: number;
  created_by_name: string;
  hiring_manager_name: string | null;
  created_at: string;
  client: JobClient | null;
  approval_stats?: { status: string; count: number }[];
}

export interface JobResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Job[];
  approval_stats?: { status: string; count: number }[];
}

export interface JobAssignedRecruiter {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  role: string;
  organization: {
    id: string;
    name: string;
    created_at: string;
  };
}

export interface JobCreator {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string | null;
  role: string;
  organization: {
    id: string;
    name: string;
    created_at: string;
  };
}

export interface JobDetail {
  id: string;
  code: string;
  title: string;
  description: string;
  description_file: string | null;
  skills: string[];
  education: string;
  min_experience: number | string;
  max_experience: number | string;
  location: string;
  openings: number;
  budget: string;
  hiring_for: string;
  client: JobClient | null;
  status: string;
  assigned_recruiters: JobAssignedRecruiter[];
  created_by: JobCreator;
  hiring_manager: any | null;
  stages: any[];
  candidate_count: number;
  created_at: string;
  updated_at: string;
  organization: string;
  is_deleted: boolean;
  deleted_at: string | null;
}

export interface PositionState {
  jobs: Job[];
  selectedJob: JobDetail | null;
  loading: boolean;
  detailLoading: boolean;
  error: string | null;
}

export interface AddJobPayload {
  title: string;
  location: string;
  client?: string | null;
  team_member_id?: string | null;
  assigned_recruiter_ids?: string[];
  description: string;
  description_file?: File | null;
  skills?: string[];
  education?: string;
  min_experience: number | string;
  max_experience: number | string;
  openings?: number;
  budget?: number | string;
  status?: "open" | "ongoing" | "close" | "hold";
}
