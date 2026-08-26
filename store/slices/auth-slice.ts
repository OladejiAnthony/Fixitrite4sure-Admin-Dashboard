//store/slices/auth-slice.ts
import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Session, User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

const initialState: AuthState = {
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    loginStart: (state) => {
      state.isLoading = true;
    },
    loginSuccess: (
      state,
      action: PayloadAction<{ user: User; session: Session | null }>
    ) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload.user;
      state.session = action.payload.session;
    },
    loginFailure: (state) => {
      state.isLoading = false;
      state.isAuthenticated = false;
      state.user = null;
      state.session = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.session = null;
    },
  },
});

export const { loginStart, loginSuccess, loginFailure, logout } =
  authSlice.actions;
export default authSlice.reducer;
