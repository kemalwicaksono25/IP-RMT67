import { create } from 'zustand';

export const useCalendarStore = create((set) => ({
  events: [],
  loading: false,
  setEvents: (events) => set({ events }),
  addEvent: (event) => set((state) => ({ events: [...state.events, event] })),
  updateEvent: (id, updatedEvent) =>
    set((state) => ({
      events: state.events.map((e) => (e.id === id ? updatedEvent : e)),
    })),
  setLoading: (loading) => set({ loading }),
}));

