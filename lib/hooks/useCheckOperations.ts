import { useCallback } from 'react'
import { dashboardApi } from '@/lib/api-client'

interface UseCheckOperationsReturn {
    handleDelete: (id: number) => Promise<void>
    handleRun: (id: number) => Promise<void>
}

export function useCheckOperations(
    onSuccess: () => void
): UseCheckOperationsReturn {
    const handleDelete = useCallback(async (id: number) => {
        if (!confirm('确定要删除这个检测任务吗？')) return

        const token = localStorage.getItem('access_token')
        if (!token) return

        try {
            await dashboardApi.deleteCheck(id, token)
            onSuccess()
        } catch (error) {
            console.error('Failed to delete check:', error)
        }
    }, [onSuccess])

    const handleRun = useCallback(async (id: number) => {
        const token = localStorage.getItem('access_token')
        if (!token) return

        try {
            await dashboardApi.runCheck(id, token)
            onSuccess()
        } catch (error) {
            console.error('Failed to run check:', error)
        }
    }, [onSuccess])

    return {
        handleDelete,
        handleRun,
    }
} 