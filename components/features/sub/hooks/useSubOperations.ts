import { useState, useCallback } from 'react'
import { dashboardApi } from '@/lib/api/client'
import { useConfirmDialog } from '@/lib/hooks'
interface UseSubscriptionOperationsProps {
    onSuccess: () => void
}

export function useSubscriptionOperations({ onSuccess }: UseSubscriptionOperationsProps) {
    const [refreshingId, setRefreshingId] = useState<number | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const { confirmState, showDeleteConfirm, closeConfirm, handleConfirm } = useConfirmDialog()

    const getToken = useCallback(() => localStorage.getItem('access_token'), [])

    const handleDelete = useCallback((id: number, name: string) => {
        showDeleteConfirm(name, async () => {
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
        })
    }, [getToken, onSuccess, showDeleteConfirm])

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
        confirmState,
        handleDelete,
        handleRefresh,
        closeConfirm,
        handleConfirm,
    }
} 