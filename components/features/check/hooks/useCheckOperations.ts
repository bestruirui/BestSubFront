/**
 * 检测操作相关的自定义Hook
 */

import { useState, useCallback } from 'react'
import { dashboardApi } from '@/lib/api/client'
import { useConfirmDialog } from '@/lib/hooks'

interface UseCheckOperationsProps {
    onSuccess: () => void
}

export function useCheckOperations({ onSuccess }: UseCheckOperationsProps) {
    const [runningId, setRunningId] = useState<number | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    // 使用公共的confirm dialog hook
    const { confirmState, showDeleteConfirm, closeConfirm, handleConfirm } = useConfirmDialog()

    const getToken = useCallback(() => localStorage.getItem('access_token'), [])

    const handleDelete = useCallback((id: number) => {
        showDeleteConfirm('检测任务', async () => {
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
        })
    }, [getToken, onSuccess, showDeleteConfirm])

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
        confirmState,
        handleDelete,
        handleRun,
        closeConfirm,
        handleConfirm,
    }
} 