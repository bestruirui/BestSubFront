import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { useAlert } from '@/src/components/providers'
import { api } from '@/src/lib/api/client'

export function useSubOperations() {
    const { confirm } = useAlert()
    const [refreshingId, setRefreshingId] = useState<number | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)

    const handleRefresh = useCallback(async (id: number) => {
        setRefreshingId(id)
        try {
            await api.refreshSubscription(id)
            toast.success('刷新成功')
        } catch (error) {
            console.error('Failed to refresh subscription:', error)
            toast.error('刷新失败')
        } finally {
            setRefreshingId(null)
        }
    }, [])

    const handleDelete = useCallback(async (id: number, name: string) => {
        const confirmed = await confirm({
            title: '删除订阅',
            description: `确定要删除订阅 "${name}" 吗？`,
            confirmText: '删除',
            cancelText: '取消',
            variant: 'destructive'
        })

        if (confirmed) {
            try {
                setDeletingId(id)
                await api.deleteSubscription(id)
                toast.success('删除成功')
            } catch (error) {
                console.error('Failed to delete subscription:', error)
                toast.error('删除失败')
            } finally {
                setDeletingId(null)
            }
        }
    }, [confirm])

    return {
        refreshingId,
        deletingId,
        handleDelete,
        handleRefresh,
    }
} 