import { useState, useCallback } from 'react'
import { api } from '@/src/lib/api/client'
import { useConfirmDialog } from '@/src/lib/hooks'
interface UseSubOperationsProps {
    onSuccess: () => void
}

export function useSubOperations({ onSuccess }: UseSubOperationsProps) {
    const [refreshingId, setRefreshingId] = useState<number | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const { confirmState, showDeleteConfirm, closeConfirm, handleConfirm } = useConfirmDialog()


    const handleDelete = useCallback((id: number, name: string) => {
        showDeleteConfirm(name, async () => {
            setDeletingId(id)
            try {
                await api.deleteSubscription(id)
                onSuccess()
            } catch (error) {
                console.error('Failed to delete subscription:', error)
            } finally {
                setDeletingId(null)
            }
        })
    }, [onSuccess, showDeleteConfirm])

    const handleRefresh = useCallback(async (id: number) => {
        setRefreshingId(id)
        try {
            await api.refreshSubscription(id)
            onSuccess()
        } catch (error) {
            console.error('Failed to refresh subscription:', error)
        } finally {
            setRefreshingId(null)
        }
    }, [onSuccess])

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