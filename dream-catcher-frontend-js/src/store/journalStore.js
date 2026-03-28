import { create } from 'zustand';
import { sleepLogApi } from '../api/sleepLogApi';
import { moodLogApi }  from '../api/moodLogApi';
import { dreamLogApi } from '../api/dreamLogApi';

export const useJournalStore = create((set, get) => ({
  sleepLogs:  [],
  moodLogs:   [],
  dreamLogs:  [],
  loading:    false,
  error:      null,

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const [sleepLogs, moodLogs, dreamLogs] = await Promise.all([
        sleepLogApi.getAll(),
        moodLogApi.getAll(),
        dreamLogApi.getAll(),
      ]);
      set({ sleepLogs, moodLogs, dreamLogs, loading: false });
    } catch (err) {
      set({ error: err.message, loading: false });
    }
  },

  addSleepLog: async (request) => {
    const created = await sleepLogApi.create(request);
    set((state) => ({ sleepLogs: [created, ...state.sleepLogs] }));
    return created;
  },

  addMoodLog: async (request) => {
    const created = await moodLogApi.create(request);
    set((state) => ({ moodLogs: [created, ...state.moodLogs] }));
    return created;
  },

  addDreamLog: async (request) => {
    const created = await dreamLogApi.create(request);
    set((state) => ({ dreamLogs: [created, ...state.dreamLogs] }));
    return created;
  },

  deleteSleepLog: async (id) => {
    await sleepLogApi.delete(id);
    set((state) => ({ sleepLogs: state.sleepLogs.filter(l => l.id !== id) }));
  },

  deleteMoodLog: async (id) => {
    await moodLogApi.delete(id);
    set((state) => ({ moodLogs: state.moodLogs.filter(l => l.id !== id) }));
  },

  deleteDreamLog: async (id) => {
    await dreamLogApi.delete(id);
    set((state) => ({ dreamLogs: state.dreamLogs.filter(l => l.id !== id) }));
  },

  updateSleepLog: async (id, request) => {
    const updated = await sleepLogApi.update(id, request);
    set((state) => ({ sleepLogs: state.sleepLogs.map(l => l.id === id ? updated : l) }));
    return updated;
  },

  updateMoodLog: async (id, request) => {
    const updated = await moodLogApi.update(id, request);
    set((state) => ({ moodLogs: state.moodLogs.map(l => l.id === id ? updated : l) }));
    return updated;
  },

  updateDreamLog: async (id, request) => {
    const updated = await dreamLogApi.update(id, request);
    set((state) => ({ dreamLogs: state.dreamLogs.map(l => l.id === id ? updated : l) }));
    return updated;
  },
}));
