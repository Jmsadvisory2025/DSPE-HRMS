import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { UserState, User } from "@/types/user.types";

const initialState: UserState = {
  users: [],
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<User[]>) {
      state.users = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    addUser(state, action: PayloadAction<User>) {
      state.users.unshift(action.payload); // Add new user to top
    },
    updateUser(state, action: PayloadAction<User>) {
      const index = state.users.findIndex((u) => u.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
  },
});

export const { setUsers, setLoading, setError, addUser, updateUser } = userSlice.actions;
export default userSlice.reducer;
