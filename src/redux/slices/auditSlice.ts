import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  // TODO: Define state shape
};

const auditSlice = createSlice({
  name: "audit",
  initialState,
  reducers: {
    // TODO: Add reducers as needed
  },
});

// Export actions here as they are added
// export const {} = auditSlice.actions;
export default auditSlice.reducer;
