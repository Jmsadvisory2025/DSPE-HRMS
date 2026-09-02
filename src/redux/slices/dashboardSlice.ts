import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

/* ── Types ─────────────────────────────────────────────────────── */
export interface ActiveJob {
  status: string;
  count: number;
}

export interface UpcomingInterview {
  candidate_name: string;
  job_title: string;
  date: string;
  time: string;
  round: string;
  mode: string;
  interviewer_name: string;
}

export interface ActivityItem {
  title: string;
  message: string;
  type: string;
  created_at: string;
}

export interface HiresByClient {
  client_name: string;
  hires_count: number;
}

export interface FunnelTrend {
  month: string;
  sourced: number;
  interviewed: number;
}

export interface PipelineOverview {
  status: string;
  count: number;
}

export interface TopPerformingJob {
  job_id: string;
  title: string;
  active_candidates: number;
}

export interface DashboardData {
  top_stats: {
    total_candidates: number;
    active_jobs_by_status: ActiveJob[];
    interviews_upcoming_count: number;
    active_clients: number;
  };
  upcoming_interviews: UpcomingInterview[];
  unread_activity: ActivityItem[];
  hires_by_client: HiresByClient[];
  funnel_trend: FunnelTrend[];
  pipeline_overview: PipelineOverview[];
  top_performing_jobs: TopPerformingJob[];
  offer_acceptance_rate: number;
  average_time_to_hire_days: number;
  rejection_rate: number;
}

export interface DashboardState {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  data: null,
  loading: false,
  error: null,
};

/* ── Slice ─────────────────────────────────────────────────────── */
const dashboardSlice = createSlice({
  name: "dashboard",
  initialState,
  reducers: {
    setDashboardData(state, action: PayloadAction<DashboardData>) {
      state.data = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setDashboardData,
  setLoading,
  setError,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
