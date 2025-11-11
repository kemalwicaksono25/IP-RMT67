import { create } from 'zustand';

export const useBriefStore = create((set) => ({
  briefs: [],
  selectedBrief: null,
  loading: false,
  setBriefs: (briefs) => set({ briefs }),
  setSelectedBrief: (brief) => set({ selectedBrief: brief }),
  addBrief: (brief) => set((state) => ({ briefs: [brief, ...state.briefs] })),
  updateBrief: (id, updatedBrief) =>
    set((state) => ({
      briefs: state.briefs.map((b) => (b.id === id ? updatedBrief : b)),
    })),
  setLoading: (loading) => set({ loading }),
}));

