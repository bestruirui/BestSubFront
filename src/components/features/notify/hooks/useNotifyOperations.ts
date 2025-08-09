import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { api } from '@/src/lib/api/client'
import type { NotifyRequest } from '@/src/types'
import { useConfirmDialog } from '@/src/lib/hooks'

interface UseNotifyOperationsProps {
    onSuccess: () => void
}

export function useNotifyOperations({ onSuccess }: UseNotifyOperationsProps) {
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [testingId, setTestingId] = useState<number | null>(null)

    const { confirmState, showDeleteConfirm, closeConfirm, handleConfirm } = useConfirmDialog()


    const handleDelete = useCallback((id: number, name: string) => {
        showDeleteConfirm(name, async () => {
            try {
                setDeletingId(id)
                await api.deleteNotify(id)
                toast.success('通知配置删除成功')
                onSuccess()
            } catch (error) {
                console.error('Failed to delete notify:', error)
                toast.error('删除通知配置失败')
            } finally {
                setDeletingId(null)
            }
        })
    }, [onSuccess, showDeleteConfirm])

    const handleTest = useCallback(async (notify: NotifyRequest, id?: number) => {
        try {
            setTestingId(id || 0)
            await api.testNotify(notify)
            toast.success('通知测试成功')
        } catch (error) {
            console.error('Failed to test notify:', error)
            toast.error('通知测试失败')
        } finally {
            setTestingId(null)
        }
    }, [])

    return {
        deletingId,
        testingId,
        confirmState,
        handleDelete,
        closeConfirm,
        handleConfirm,
        handleTest
    }
} 