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
}));
