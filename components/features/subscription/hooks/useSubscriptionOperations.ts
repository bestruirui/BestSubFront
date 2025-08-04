/**
 * 订阅操作相关的自定义Hook
 */

import { useState, useCallback } from 'react'
import { dashboardApi } from '@/lib/api/client'
interface UseSubscriptionOperationsProps {
    onSuccess: () => void
    _user: unknown
}

export function useSubscriptionOperations({ onSuccess, _user }: UseSubscriptionOperationsProps) {
    const [refreshingId, setRefreshingId] = useState<number | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const getToken = useCallback(() => localStorage.getItem('access_token'), [])

    const handleDelete = useCallback(async (id: number) => {
        if (!confirm('确定要删除这个订阅吗？')) return

        const token = getToken()
        if (!token) return

        setDeletingId(id)
        try {
            await dashboardApi.deleteSubscription(id, token)
            onSuccess()
        } catch (error) {
            console.error('Failed to delete subscription:', error)
        } finally {
            setDeletingId(null)
        }
    }, [getToken, onSuccess])

    const handleRefresh = useCallback(async (id: number) => {
        const token = getToken()
        if (!token) return

        setRefreshingId(id)
        try {
            await dashboardApi.refreshSubscription(id, token)
            onSuccess()
        } catch (error) {
            console.error('Failed to refresh subscription:', error)
        } finally {
            setRefreshingId(null)
        }
    }, [getToken, onSuccess])

    return {
        refreshingId,
        deletingId,
        handleDelete,
        handleRefresh,
    }
} 