import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // TODO: Define state shape
};

const candidateSlice = createSlice({
  name: "candidates",
  initialState,
  reducers: {
    // TODO: Add reducers as needed
  },
});

// Export actions here as they are added
// export const {} = candidateSlice.actions;
export default candidateSlice.reducer;
