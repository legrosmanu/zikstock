import { create } from 'zustand';
import { getNetwork } from '../infra/network.api';

interface NetworkState {
  incomingCount: number;
  isLoading: boolean;
  error: string | null;
  fetchIncomingCount: () => Promise<number>;
  setIncomingCount: (count: number) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  incomingCount: 0,
  isLoading: false,
  error: null,
  fetchIncomingCount: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await getNetwork();
      const count = data.incoming ? data.incoming.length : 0;
      set({ incomingCount: count, isLoading: false });
      return count;
    } catch (err) {
      console.error('Failed to fetch network incoming count:', err);
      set({ isLoading: false, error: 'Failed to fetch' });
      return 0;
    }
  },
  setIncomingCount: (count: number) => set({ incomingCount: count }),
}));
