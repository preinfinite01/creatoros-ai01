import { create } from 'zustand'

export type Plan = 'free' | 'basic' | 'pro'

interface UserData {
  plan: Plan
  credits: number
  xp: number
  level: number
  streak: number
}

interface UserState extends UserData {
  isDeducting: boolean
  addXp: (amount: number) => void
  deductCredits: (amount: number) => boolean
  incrementStreak: () => void
}

export const useUserStore = create<UserState>((set, get) => ({
  plan: 'free',
  credits: 100, // free users start with 100
  xp: 0,
  level: 1,
  streak: 0,
  isDeducting: false,
  
  addXp: (amount) => set((state) => {
    const newXp = state.xp + amount
    const newLevel = Math.floor(newXp / 500) + 1
    return { xp: newXp, level: newLevel }
  }),
  
  deductCredits: (amount) => {
    const state = get()
    if (state.plan === 'pro') return true
    if (state.credits >= amount) {
      set({ credits: state.credits - amount })
      return true
    }
    return false
  },
  
  incrementStreak: () => set((state) => ({ streak: state.streak + 1 }))
}))
