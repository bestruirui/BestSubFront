import { create } from 'zustand'
import { api } from '@/src/lib/api/client'
import type { GroupSettingAdvance, Setting } from '@/src/types/setting'

interface SettingStore {
    settings: GroupSettingAdvance[]
    isLoading: boolean
    error: string | null
    initialized: boolean

    loadSettings: () => Promise<GroupSettingAdvance[]>
    updateSettings: (data: Setting[]) => Promise<void>
    clearCache: () => void
}

export const useSettingStore = create<SettingStore>((set, get) => ({
    settings: [],
    isLoading: false,
    error: null,
    initialized: false,

    loadSettings: async () => {
        const state = get()

        if (state.initialized && !state.isLoading) {
            return state.settings
        }

        if (state.isLoading) {
            while (get().isLoading) {
                await new Promise(resolve => setTimeout(resolve, 100))
            }
            return get().settings
        }

        set({ isLoading: true, error: null })

        try {
            const settings = await api.getSettings()

            set({
                settings: Array.isArray(settings) ? settings : [],
                isLoading: false,
                error: null,
                initialized: true
            })

            return settings
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to load settings'
            set({
                error: errorMessage,
                isLoading: false,
                initialized: true
            })
            console.error('Failed to load settings:', error)
            return []
        }
    },

    updateSettings: async (data: Setting[]) => {
        set({ isLoading: true, error: null })

        try {
            await api.updateSettings(data)

            set(state => ({
                settings: state.settings.map(group => ({
                    ...group,
                    data: group.data.map(setting => {
                        const update = data.find(d => d.key === setting.key)
                        return update ? { ...setting, value: update.value } : setting
                    })
                })),
                isLoading: false,
                error: null
            }))
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update settings'
            set({
                error: errorMessage,
                isLoading: false
            })
            throw error
        }
    },

    clearCache: () => {
        set({
            settings: [],
            error: null,
            initialized: false
        })
    }
}))