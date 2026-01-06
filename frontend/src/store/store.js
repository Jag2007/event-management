import { create } from "zustand";
import { getUsers, createUser, getEvents, createEvent } from "../api/api";

const useStore = create((set, get) => ({
  /* ---------- USERS ---------- */
  users: [],
  selectedUser: null,

  fetchUsers: async () => {
    const res = await getUsers();
    set({
      users: res.data,
      selectedUser: res.data[0]?.name || null,
    });
  },

  setSelectedUser: (user) => set({ selectedUser: user }),

  addUser: async (name, timezone) => {
    await createUser(name, timezone);
    const res = await getUsers();
    set({
      users: res.data,
      selectedUser: name,
    });
  },

  /* ---------- EVENTS ---------- */
  events: [],

  fetchEvents: async () => {
    const { users, selectedUser } = get();
    const currentUser = users.find((u) => u.name === selectedUser);
    if (!currentUser) return;

    const res = await getEvents(currentUser._id);
    set({ events: res.data });
  },

  addEvent: async (eventData) => {
    await createEvent(eventData);
    await get().fetchEvents(); // refresh list
  },
}));

export default useStore;
