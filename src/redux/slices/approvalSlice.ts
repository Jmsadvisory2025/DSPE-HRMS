import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface Application {
  id: string;
  candidate_name: string;
  candidate_email: string;
  job_title: string;
  status: string;
  stage_name: string | null;
  share_date: string;
  created_at: string;
  current_ctc: string;
  expected_ctc: string;
  notice_period: string;
  submitted_by: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  candidate_cv: string;
  manager_review_status: string;
  manager_review_notes: string;
}

interface ApprovalState {
  applications: Application[];
  loading: boolean;
  error: string | null;
  applicationDetail: any | null;
  detailLoading: boolean;
}

const initialState: ApprovalState = {
  applications: [],
  loading: false,
  error: null,
  applicationDetail: null,
  detailLoading: false,
};

const approvalSlice = createSlice({
  name: "approvals",
  initialState,
  reducers: {
    setApplications: (state, action: PayloadAction<Application[]>) => {
      state.applications = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setApplicationDetail: (state, action: PayloadAction<any>) => {
      state.applicationDetail = action.payload;
    },
    setDetailLoading: (state, action: PayloadAction<boolean>) => {
      state.detailLoading = action.payload;
    },
  },
});

export const { 
  setApplications, 
  setLoading, 
  setError, 
  setApplicationDetail, 
  setDetailLoading 
} = approvalSlice.actions;
export default approvalSlice.reducer;
