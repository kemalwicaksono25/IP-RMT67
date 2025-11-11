import { create } from 'zustand';

export const useUIStore = create((set) => ({
  sidebarOpen: true,
  modals: {},
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  openModal: (name, data = {}) =>
    set((state) => ({
      modals: { ...state.modals, [name]: { open: true, data } },
    })),
  closeModal: (name) =>
    set((state) => ({
      modals: { ...state.modals, [name]: { open: false, data: {} } },
    })),
}));

