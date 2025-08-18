import { create } from 'zustand'
import { api } from '@/src/lib/api/client'
import type { CheckResponse, CheckRequest } from '@/src/types/check'
import type { DynamicConfigItem } from '@/src/types'

interface CheckStore {
    checks: CheckResponse[]
    checkTypes: Record<string, DynamicConfigItem[]>
    isLoading: boolean
    error: string | null
    initialized: boolean

    loadChecks: (id?: number) => Promise<CheckResponse[]>
    loadCheckTypes: () => Promise<Record<string, DynamicConfigItem[]>>
    createCheck: (data: CheckRequest) => Promise<CheckResponse>
    updateCheck: (id: number, data: CheckRequest) => Promise<CheckResponse>
    deleteCheck: (id: number) => Promise<void>
    getCheckById: (id: number) => CheckResponse | undefined
    clearCache: () => void
}

export const useCheckStore = create<CheckStore>((set, get) => ({
    checks: [],
    checkTypes: {},
    isLoading: false,
    error: null,
    initialized: false,

    loadChecks: async (id?: number) => {
        const state = get()

        if (!id && state.initialized && !state.isLoading) {
            return state.checks
        }

        if (state.isLoading) {
            while (get().isLoading) {
                await new Promise(resolve => setTimeout(resolve, 100))
            }
            return get().checks
        }

        set({ isLoading: true, error: null })

        try {
            const checks = await api.getChecks(id)

            set({
                checks: Array.isArray(checks) ? checks : [],
                isLoading: false,
                error: null,
                initialized: true
            })

            return checks
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load checks'
            set({
                error: errorMessage,
                isLoading: false,
                initialized: true
            })
            console.error('Failed to load checks:', error)
            return []
        }
    },

    loadCheckTypes: async () => {
        const state = get()

        if (Object.keys(state.checkTypes).length > 0 && !state.isLoading) {
            return state.checkTypes
        }

        set({ isLoading: true, error: null })

        try {
            const checkTypes = await api.getCheckTypes()

            set({
                checkTypes: checkTypes || {},
                isLoading: false,
                error: null
            })

            return checkTypes
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load check types'
            set({
                error: errorMessage,
                isLoading: false
            })
            console.error('Failed to load check types:', error)
            return {}
        }
    },

    createCheck: async (data: CheckRequest) => {
        set({ isLoading: true, error: null })

        try {
            const newCheck = await api.createCheck(data)

            set(state => ({
                checks: [...state.checks, newCheck],
                isLoading: false,
                error: null
            }))

            return newCheck
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create check'
            set({
                error: errorMessage,
                isLoading: false
            })
            throw error
        }
    },

    updateCheck: async (id: number, data: CheckRequest) => {
        set({ isLoading: true, error: null })

        try {
            const updatedCheck = await api.updateCheck(id, data)

            set(state => ({
                checks: state.checks.map(check => check.id === id ? updatedCheck : check),
                isLoading: false,
                error: null
            }))

            return updatedCheck
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update check'
            set({
                error: errorMessage,
                isLoading: false
            })
            throw error
        }
    },

    deleteCheck: async (id: number) => {
        set({ isLoading: true, error: null })

        try {
            await api.deleteCheck(id)

            set(state => ({
                checks: state.checks.filter(check => check.id !== id),
                isLoading: false,
                error: null
            }))
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete check'
            set({
                error: errorMessage,
                isLoading: false
            })
            throw error
        }
    },

    getCheckById: (id: number) => {
        const state = get()
        return state.checks.find(check => check.id === id)
    },

    clearCache: () => {
        set({
            checks: [],
            checkTypes: {},
            error: null,
            initialized: false
        })
    }
}))