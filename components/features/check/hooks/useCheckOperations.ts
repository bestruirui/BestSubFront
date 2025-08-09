import { useState, useCallback } from 'react'
import { dashboardApi } from '@/lib/api/client'
import { useConfirmDialog } from '@/lib/hooks'
import { toast } from 'sonner'

interface UseCheckOperationsProps {
    onSuccess: () => void
}

export function useCheckOperations({ onSuccess }: UseCheckOperationsProps) {
    const [runningId, setRunningId] = useState<number | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const { confirmState, showDeleteConfirm, closeConfirm, handleConfirm } = useConfirmDialog()

    const getToken = useCallback(() => localStorage.getItem('access_token'), [])

    const handleDelete = useCallback((id: number, name: string) => {
        showDeleteConfirm(name, async () => {
            const token = getToken()
            if (!token) return

            try {
                setDeletingId(id)
                await dashboardApi.deleteCheck(id, token)
                toast.success('检测任务删除成功')
                onSuccess()
            } catch (error) {
                console.error('Failed to delete check:', error)
                toast.error('删除检测任务失败')
            } finally {
                setDeletingId(null)
            }
        })
    }, [getToken, onSuccess, showDeleteConfirm])

    const handleRun = useCallback(async (id: number) => {
        const token = getToken()
        if (!token) return

        try {
            setRunningId(id)
            await dashboardApi.runCheck(id, token)
            toast.success('检测任务运行成功')
            onSuccess()
        } catch (error) {
            console.error('Failed to run check:', error)
            toast.error('检测任务运行失败')
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