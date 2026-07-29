import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface Candidate {
  id: string;
  candidate_name: string;
  email: string;
  contact: string;
  current_profile: string;
  current_company: string;
  experience: string;
  current_location: string;
  is_duplicate: boolean;
  uploaded_by_name: string | null;
  created_at: string;
}

interface CandidateState {
  candidates: Candidate[];
  loading: boolean;
  error: string | null;
  candidateDetail: any | null; // We can use 'any' or fully type it if desired, but 'any' is flexible for now
  candidateDetailLoading: boolean;
}

const initialState: CandidateState = {
  candidates: [],
  loading: false,
  error: null,
  candidateDetail: null,
  candidateDetailLoading: true,
};

const candidateSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {
    setCandidates: (state, action: PayloadAction<Candidate[]>) => {
      state.candidates = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setCandidateDetail: (state, action: PayloadAction<any>) => {
      state.candidateDetail = action.payload;
    },
    setCandidateDetailLoading: (state, action: PayloadAction<boolean>) => {
      state.candidateDetailLoading = action.payload;
    }
  },
});

export const { setCandidates, setLoading, setError, setCandidateDetail, setCandidateDetailLoading } = candidateSlice.actions;
export default candidateSlice.reducer;
