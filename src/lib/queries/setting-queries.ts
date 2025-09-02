import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/src/lib/api/client'
import type { GroupSettingAdvance, Setting } from '@/src/types/setting'

const settingKeys = {
    all: ['settings'] as const,
    lists: () => [...settingKeys.all, 'list'] as const,
}

export function useSettings() {
    return useQuery({
        queryKey: settingKeys.lists(),
        queryFn: () => api.getSettings(),
        notifyOnChangeProps: ['data', 'error', 'isLoading'],
        refetchInterval: 5 * 60 * 1000,
    })
}

export function useUpdateSettings() {
    const queryClient = useQueryClient()

    return useMutation({
        mutationFn: (data: Setting[]) => api.updateSettings(data),

        onSuccess: (_, data) => {
            queryClient.setQueryData<GroupSettingAdvance[]>(
                settingKeys.lists(),
                (oldData) => oldData?.map(group => ({
                    ...group,
                    data: group.data.map(setting => {
                        const update = data.find(d => d.key === setting.key)
                        return update ? { ...setting, value: update.value } : setting
                    })
                }))
            )

            queryClient.invalidateQueries({
                queryKey: settingKeys.lists(),
                refetchType: 'active'
            })
        },

        onError: () => {
            queryClient.invalidateQueries({ queryKey: settingKeys.lists() })
        },
    })
} 