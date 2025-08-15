import { useState, useCallback } from 'react'
import { api } from '@/src/lib/api/client'
interface UseSubOperationsProps {
    onSuccess: () => void
}

export function useSubOperations({ onSuccess }: UseSubOperationsProps) {
    const [refreshingId, setRefreshingId] = useState<number | null>(null)

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
        handleRefresh,
    }
} 