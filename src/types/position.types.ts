/* ── Position Module — Type Definitions ───────────────────────── */

export interface Job {
  id: string;
  code: string;
  title: string;
  status: string;
  priority: string;
  job_mode: string;
  job_type: string;
  location: string;
  openings: number;
  min_experience: number;
  max_experience: number;
  hiring_for: string;
  client_name: string | null;
  candidate_count: number;
  target_closing_date: string;
  created_by_name: string;
  created_at: string;
}

export interface JobResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Job[];
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
  stages: any[];
  assigned_recruiters: JobAssignedRecruiter[];
  candidate_count: number;
  client_name: string | null;
  created_by: JobCreator;
  target_closing_date: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  is_deleted: boolean;
  title: string;
  description: string;
  code: string;
  skills: string[];
  education: string;
  min_experience: number;
  max_experience: number;
  location: string;
  openings: number;
  priority: string;
  budget: string;
  job_mode: string;
  job_type: string;
  hiring_for: string;
  status: string;
  notice_period_preference: string;
  skill_criteria: string;
  organization: string;
  client: string | null;
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
  description: string;
  skills?: string[];
  education?: string;
  min_experience: number;
  max_experience: number;
  location: string;
  openings?: number;
  priority?: "high" | "medium" | "low";
  budget?: number;
  job_type?: "permanent" | "contractual";
  job_mode?: "remote" | "hybrid" | "office";
  hiring_for?: "self" | "client";
  client?: string | null;
  status?: "open" | "closed" | "on-hold";
  assigned_recruiter_ids?: string[];
  target_closing_date?: string;
  notice_period_preference?: string;
  skill_criteria?: number;
}
