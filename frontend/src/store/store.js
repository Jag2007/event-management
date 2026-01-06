import { create } from "zustand";
import {
  getUsers,
  createUser,
  getEvents,
  createEvent,
  updateEvent as updateEventAPI,
} from "../api/api";

const useStore = create((set, get) => ({
  /* ---------- USERS ---------- */
  users: [],
  selectedUser: null,

  fetchUsers: async () => {
    try {
      const res = await getUsers();
      set({
        users: res.data,
        selectedUser: res.data[0]?.name || null,
      });
    } catch (error) {
      console.error("Failed to fetch users:", error);
      throw error;
    }
  },

  setSelectedUser: (user) => set({ selectedUser: user }),

  addUser: async (name, timezone) => {
    try {
      await createUser(name, timezone);
      const res = await getUsers();
      set({
        users: res.data,
        selectedUser: name,
      });
    } catch (error) {
      console.error("Failed to add user:", error);
      throw error;
    }
  },

  /* ---------- EVENTS ---------- */
  events: [],

  fetchEvents: async () => {
    try {
      const { users, selectedUser } = get();
      const currentUser = users.find((u) => u.name === selectedUser);
      if (!currentUser) return;

      const res = await getEvents(currentUser._id);
      set({ events: res.data });
    } catch (error) {
      console.error("Failed to fetch events:", error);
      throw error;
    }
  },

  addEvent: async (eventData) => {
    try {
      await createEvent(eventData);
      await get().fetchEvents(); // refresh list
    } catch (error) {
      console.error("Failed to add event:", error);
      throw error;
    }
  },

  updateEvent: async (eventId, eventData) => {
    try {
      await updateEventAPI(eventId, eventData);
      await get().fetchEvents(); // refresh list
    } catch (error) {
      console.error("Failed to update event:", error);
      throw error;
    }
  },
}));

export default useStore;
