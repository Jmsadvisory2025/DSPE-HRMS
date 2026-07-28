import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { PositionState, Job, JobDetail } from "@/types/position.types";

const initialState: PositionState = {
  jobs: [],
  selectedJob: null,
  loading: false,
  detailLoading: false,
  error: null,
};

const positionSlice = createSlice({
  name: "positions",
  initialState,
  reducers: {
    setJobs(state, action: PayloadAction<Job[]>) {
      state.jobs = action.payload;
    },
    addJob(state, action: PayloadAction<Job>) {
      state.jobs.unshift(action.payload);
    },
    updateJob(state, action: PayloadAction<Job>) {
      const index = state.jobs.findIndex(j => j.id === action.payload.id);
      if (index !== -1) {
        state.jobs[index] = action.payload;
      }
      if (state.selectedJob?.id === action.payload.id) {
        state.selectedJob = { ...state.selectedJob, ...action.payload };
      }
    },
    setSelectedJob(state, action: PayloadAction<JobDetail | null>) {
      state.selectedJob = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setDetailLoading(state, action: PayloadAction<boolean>) {
      state.detailLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const { setJobs, addJob, updateJob, setSelectedJob, setLoading, setDetailLoading, setError } = positionSlice.actions;
export default positionSlice.reducer;
