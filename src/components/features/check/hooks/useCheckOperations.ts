import { useState, useCallback } from 'react'
import { api } from '@/src/lib/api/client'
import { useConfirmDialog } from '@/src/lib/hooks'
import { toast } from 'sonner'

interface UseCheckOperationsProps {
    onSuccess: () => void
}

export function useCheckOperations({ onSuccess }: UseCheckOperationsProps) {
    const [runningId, setRunningId] = useState<number | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const { confirmState, showDeleteConfirm, closeConfirm, handleConfirm } = useConfirmDialog()


    const handleDelete = useCallback((id: number, name: string) => {
        showDeleteConfirm(name, async () => {
            try {
                setDeletingId(id)
                await api.deleteCheck(id)
                toast.success('检测任务删除成功')
                onSuccess()
            } catch (error) {
                console.error('Failed to delete check:', error)
                toast.error('删除检测任务失败')
            } finally {
                setDeletingId(null)
            }
        })
    }, [onSuccess, showDeleteConfirm])

    const handleRun = useCallback(async (id: number) => {
        try {
            setRunningId(id)
            await api.runCheck(id)
            toast.success('检测任务运行成功')
            onSuccess()
        } catch (error) {
            console.error('Failed to run check:', error)
            toast.error('检测任务运行失败')
        } finally {
            setRunningId(null)
        }
    }, [onSuccess])

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