import { create } from 'zustand'
import { api } from '@/src/lib/api/client'
import type { SubResponse, SubRequest } from '@/src/types'

interface SubStore {
  subs: SubResponse[]

  isLoading: boolean

  error: string | null

  loadSubs: () => Promise<SubResponse[]>
  createSub: (data: SubRequest) => Promise<SubResponse>
  updateSub: (id: number, data: SubRequest) => Promise<SubResponse>
  deleteSub: (id: number) => Promise<void>
  clearCache: () => void
}

export const useSubStore = create<SubStore>((set, get) => ({
  subs: [],
  isLoading: false,
  error: null,

  loadSubs: async () => {
    const state = get()

    if (state.subs.length > 0 && !state.isLoading) {
      return state.subs
    }

    if (state.isLoading) {
      while (get().isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      return get().subs
    }

    set({ isLoading: true, error: null })

    try {
      const subs = await api.getSub()

      set({
        subs,
        isLoading: false,
        error: null
      })

      return subs
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load subscriptions'
      set({
        error: errorMessage,
        isLoading: false
      })
      console.error('Failed to load subscriptions:', error)
      return []
    }
  },

  // 创建订阅
  createSub: async (data: SubRequest) => {
    set({ isLoading: true, error: null })

    try {
      const newSub = await api.createSubscription(data)

      set(state => ({
        subs: [...state.subs, newSub],
        isLoading: false,
        error: null
      }))

      return newSub
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create subscription'
      set({
        error: errorMessage,
        isLoading: false
      })
      throw error
    }
  },

  // 更新订阅
  updateSub: async (id: number, data: SubRequest) => {
    set({ isLoading: true, error: null })

    try {
      const updatedSub = await api.updateSubscription(id, data)

      set(state => ({
        subs: state.subs.map(sub => sub.id === id ? updatedSub : sub),
        isLoading: false,
        error: null
      }))

      return updatedSub
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update subscription'
      set({
        error: errorMessage,
        isLoading: false
      })
      throw error
    }
  },

  // 删除订阅
  deleteSub: async (id: number) => {
    set({ isLoading: true, error: null })

    try {
      await api.deleteSubscription(id)

      set(state => ({
        subs: state.subs.filter(sub => sub.id !== id),
        isLoading: false,
        error: null
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete subscription'
      set({
        error: errorMessage,
        isLoading: false
      })
      throw error
    }
  },

  // 清除缓存
  clearCache: () => {
    set({
      subs: [],
      error: null
    })
  }
}))


