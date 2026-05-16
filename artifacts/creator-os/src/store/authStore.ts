import { create } from 'zustand'
import { getReplitUser, type ReplitUser } from '../lib/auth'

interface AuthState {
  user: ReplitUser | null
  isLoading: boolean
  setUser: (user: ReplitUser | null) => void
  signOut: () => Promise<void>
  initialize: () => Promise<void>
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  signOut: async () => {
    await fetch('/__replauth', { method: 'POST' });
    set({ user: null });
    window.location.href = '/';
  },
  initialize: async () => {
    const user = await getReplitUser();
    set({ user, isLoading: false });
  },
}))
