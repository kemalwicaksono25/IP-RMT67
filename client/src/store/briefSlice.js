import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  briefs: [],
};

const briefSlice = createSlice({
  name: 'brief',
  initialState,
  reducers: {
    setBriefs: (state, action) => {
      state.briefs = action.payload;
    },
    addBrief: (state, action) => {
      state.briefs = [action.payload, ...state.briefs];
    },
    updateBrief: (state, action) => {
      const { id, updatedBrief } = action.payload;
      const existingIndex = state.briefs.findIndex((b) => b && b.id === id);
      if (existingIndex >= 0) {
        // Update existing brief
        state.briefs[existingIndex] = updatedBrief;
      } else {
        // Add new brief jika belum ada
        state.briefs.push(updatedBrief);
      }
    },
    deleteBrief: (state, action) => {
      state.briefs = state.briefs.filter((b) => b.id !== action.payload);
    },
  },
});

export const { setBriefs, addBrief, updateBrief, deleteBrief } = briefSlice.actions;
export default briefSlice.reducer;

