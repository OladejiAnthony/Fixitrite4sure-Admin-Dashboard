//store/store.ts
// store/store.ts
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth-slice";
import paginationReducer from "./slices/pagination-slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    pagination: paginationReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
