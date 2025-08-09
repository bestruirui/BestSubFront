import { useState, useCallback } from 'react'
import { api } from '@/src/lib/api/client'
import { useConfirmDialog } from '@/src/lib/hooks'

interface UseShareOperationsProps {
    onSuccess: () => void
}

export function useShareOperations({ onSuccess }: UseShareOperationsProps) {
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const { confirmState, showDeleteConfirm, closeConfirm, handleConfirm } = useConfirmDialog()


    const handleDelete = useCallback((id: number, name: string) => {
        showDeleteConfirm(name, async () => {

            setDeletingId(id)
            try {
                await api.deleteShare(id)
                onSuccess()
            } catch (error) {
                console.error('Failed to delete share:', error)
            } finally {
                setDeletingId(null)
            }
        })
    }, [onSuccess, showDeleteConfirm])

    return {
        deletingId,
        confirmState,
        handleDelete,
        closeConfirm,
        handleConfirm,
    }
}
