import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // TODO: Define state shape
};

const approvalSlice = createSlice({
  name: "approvals",
  initialState,
  reducers: {
    // TODO: Add reducers as needed
  },
});

// Export actions here as they are added
// export const {} = approvalSlice.actions;
export default approvalSlice.reducer;
