import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { dashboardApi } from '@/lib/api/client'
import type { NotifyRequest } from '@/lib/types'
import { useConfirmDialog } from '@/lib/hooks'

interface UseNotifyOperationsProps {
    onSuccess: () => void
}

export function useNotifyOperations({ onSuccess }: UseNotifyOperationsProps) {
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [testingId, setTestingId] = useState<number | null>(null)

    const { confirmState, showDeleteConfirm, closeConfirm, handleConfirm } = useConfirmDialog()

    const getToken = useCallback(() => localStorage.getItem('access_token'), [])

    const handleDelete = useCallback((id: number, name: string) => {
        showDeleteConfirm(name, async () => {
            const token = getToken()
            if (!token) return

            try {
                setDeletingId(id)
                await dashboardApi.deleteNotify(id, token)
                toast.success('通知配置删除成功')
                onSuccess()
            } catch (error) {
                console.error('Failed to delete notify:', error)
                toast.error('删除通知配置失败')
            } finally {
                setDeletingId(null)
            }
        })
    }, [getToken, onSuccess, showDeleteConfirm])

    const handleTest = useCallback(async (notify: NotifyRequest, id?: number) => {
        const token = getToken()
        if (!token) return

        try {
            setTestingId(id || 0)
            await dashboardApi.testNotify(notify, token)
            toast.success('通知测试成功')
        } catch (error) {
            console.error('Failed to test notify:', error)
            toast.error('通知测试失败')
        } finally {
            setTestingId(null)
        }
    }, [getToken])

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