import { create } from 'zustand'
import { api } from '@/src/lib/api/client'
import type { ShareResponse, ShareRequest } from '@/src/types'

interface ShareStore {
  shares: ShareResponse[]
  isLoading: boolean
  error: string | null
  initialized: boolean

  loadShares: () => Promise<ShareResponse[]>
  createShare: (data: ShareRequest) => Promise<ShareResponse>
  updateShare: (id: number, data: ShareRequest) => Promise<ShareResponse>
  deleteShare: (id: number) => Promise<void>
  getShareById: (id: number) => ShareResponse | undefined
  clearCache: () => void
}

export const useShareStore = create<ShareStore>((set, get) => ({
  shares: [],
  isLoading: false,
  error: null,
  initialized: false,

  loadShares: async () => {
    const state = get()

    if (state.initialized && !state.isLoading) {
      return state.shares
    }

    if (state.isLoading) {
      while (get().isLoading) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
      return get().shares
    }

    set({ isLoading: true, error: null })

    try {
      const shares = await api.getShares()

      set({
        shares: Array.isArray(shares) ? shares : [],
        isLoading: false,
        error: null,
        initialized: true
      })

      return shares
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load shares'
      set({
        error: errorMessage,
        isLoading: false,
        initialized: true
      })
      console.error('Failed to load shares:', error)
      return []
    }
  },

  createShare: async (data: ShareRequest) => {
    set({ isLoading: true, error: null })

    try {
      const newShare = await api.createShare(data)

      set(state => ({
        shares: [...state.shares, newShare],
        isLoading: false,
        error: null
      }))

      return newShare
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create share'
      set({
        error: errorMessage,
        isLoading: false
      })
      throw error
    }
  },

  updateShare: async (id: number, data: ShareRequest) => {
    set({ isLoading: true, error: null })

    try {
      const updatedShare = await api.updateShare(id, data)

      set(state => ({
        shares: state.shares.map(share => share.id === id ? updatedShare : share),
        isLoading: false,
        error: null
      }))

      return updatedShare
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update share'
      set({
        error: errorMessage,
        isLoading: false
      })
      throw error
    }
  },

  deleteShare: async (id: number) => {
    set({ isLoading: true, error: null })

    try {
      await api.deleteShare(id)

      set(state => ({
        shares: state.shares.filter(share => share.id !== id),
        isLoading: false,
        error: null
      }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete share'
      set({
        error: errorMessage,
        isLoading: false
      })
      throw error
    }
  },

  getShareById: (id: number) => {
    const state = get()
    return state.shares.find(share => share.id === id)
  },

  clearCache: () => {
    set({
      shares: [],
      error: null,
      initialized: false
    })
  }
}))
