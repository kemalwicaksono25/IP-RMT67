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
      state.briefs = state.briefs.map((b) => (b.id === id ? updatedBrief : b));
    },
    deleteBrief: (state, action) => {
      state.briefs = state.briefs.filter((b) => b.id !== action.payload);
    },
  },
});

export const { setBriefs, addBrief, updateBrief, deleteBrief } = briefSlice.actions;
export default briefSlice.reducer;

