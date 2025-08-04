/**
 * 检测操作相关的自定义Hook
 */

import { useState, useCallback } from 'react'
import { dashboardApi } from '@/lib/api/client'

interface UseCheckOperationsProps {
    onSuccess: () => void
    _user: unknown
}

export function useCheckOperations({ onSuccess, _user }: UseCheckOperationsProps) {
    const [runningId, setRunningId] = useState<number | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const getToken = useCallback(() => localStorage.getItem('access_token'), [])

    const handleDelete = useCallback(async (id: number) => {
        if (!confirm('确定要删除这个检测任务吗？')) return

        const token = getToken()
        if (!token) return

        setDeletingId(id)
        try {
            await dashboardApi.deleteCheck(id, token)
            onSuccess()
        } catch (error) {
            console.error('Failed to delete check:', error)
        } finally {
            setDeletingId(null)
        }
    }, [getToken, onSuccess])

    const handleRun = useCallback(async (id: number) => {
        const token = getToken()
        if (!token) return

        setRunningId(id)
        try {
            await dashboardApi.runCheck(id, token)
            onSuccess()
        } catch (error) {
            console.error('Failed to run check:', error)
        } finally {
            setRunningId(null)
        }
    }, [getToken, onSuccess])

    return {
        runningId,
        deletingId,
        handleDelete,
        handleRun,
    }
} 