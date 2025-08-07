// store/slices/pagination-slice.ts
import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface PaginationState {
  currentPage: number;
  itemsPerPage: number;
}

const initialState: PaginationState = {
  currentPage: 1,
  itemsPerPage: 10,
};

const paginationSlice = createSlice({
  name: "pagination",
  initialState,
  reducers: {
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    setItemsPerPage: (state, action: PayloadAction<number>) => {
      state.itemsPerPage = action.payload;
      state.currentPage = 1; // Reset to first page when items per page changes
    },
    resetPagination: (state) => {
      state.currentPage = 1;
    },
  },
});

export const { setCurrentPage, setItemsPerPage, resetPagination } =
  paginationSlice.actions;
export default paginationSlice.reducer;
