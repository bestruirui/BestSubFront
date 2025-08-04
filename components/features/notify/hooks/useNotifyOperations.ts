import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { dashboardApi } from '@/lib/api/client'
import type { NotifyRequest } from '@/lib/types'

interface UseNotifyOperationsProps {
    onSuccess: () => void
    _user: unknown
}

export function useNotifyOperations({ onSuccess, _user }: UseNotifyOperationsProps) {
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [testingId, setTestingId] = useState<number | null>(null)

    const getToken = useCallback(() => localStorage.getItem('access_token'), [])

    const handleDelete = useCallback(async (id: number) => {
        if (!confirm('确定要删除这个通知配置吗？')) {
            return
        }

        try {
            setDeletingId(id)
            await dashboardApi.deleteNotify(id, getToken() || '')
            toast.success('通知配置删除成功')
            onSuccess()
        } catch (error) {
            console.error('Failed to delete notify:', error)
            toast.error('删除通知配置失败')
        } finally {
            setDeletingId(null)
        }
    }, [getToken, onSuccess])

    const handleTest = useCallback(async (notify: NotifyRequest, id?: number) => {
        try {
            setTestingId(id || 0)
            await dashboardApi.testNotify(notify, getToken() || '')
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
        handleDelete,
        handleTest
    }
} 