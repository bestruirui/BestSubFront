import { useState, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { dashboardApi } from '@/lib/api/client'
import { NotifyForm } from './notify-form'
import { NotifyList } from './notify-list'
import { useNotifyForm } from '../hooks/useNotifyForm'
import { useNotifyOperations } from '../hooks/useNotifyOperations'
import type { NotifyResponse } from '@/lib/types'
import { DialogContainer } from "@/components/ui/dialog-container"

export function NotifyPage() {
    const [notifies, setNotifies] = useState<NotifyResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const getToken = useCallback(() => localStorage.getItem('access_token'), [])

    const loadNotifies = useCallback(async () => {
        try {
            setIsLoading(true)
            const token = getToken()
            if (!token) return

            const data = await dashboardApi.getNotifyList(token)
            setNotifies(data)
        } catch (error) {
            console.error('Failed to load notifies:', error)
        } finally {
            setIsLoading(false)
        }
    }, [getToken])

    useEffect(() => {
        loadNotifies()
    }, [loadNotifies])

    const {
        formData,
        notifyChannels,
        channelConfigs,
        isLoadingChannels,
        isLoadingConfigs,
        editingNotify,
        isDialogOpen,
        updateFormField,
        updateConfigField,
        handleChannelChange,
        handleSubmit,
        handleEdit,
        openCreateDialog,
        closeDialog
    } = useNotifyForm({ onSuccess: loadNotifies })

    const {
        deletingId,
        testingId,
        confirmState,
        closeConfirm,
        handleConfirm,
        handleDelete,
        handleTest
    } = useNotifyOperations({ onSuccess: loadNotifies })

    const handleTestNotify = useCallback((notify: NotifyResponse) => {
        handleTest({
            name: notify.name,
            type: notify.type,
            config: notify.config
        }, notify.id)
    }, [handleTest])

    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex items-center justify-between px-4 lg:px-6">
                <div>
                    <h1 className="text-2xl font-bold">通知配置</h1>
                </div>
                <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加通知
                </Button>
            </div>

            <NotifyForm
                formData={formData}
                editingNotify={editingNotify}
                isDialogOpen={isDialogOpen}
                notifyChannels={notifyChannels}
                channelConfigs={channelConfigs}
                isLoadingChannels={isLoadingChannels}
                isLoadingConfigs={isLoadingConfigs}
                updateFormField={updateFormField}
                updateConfigField={updateConfigField}
                handleChannelChange={handleChannelChange}
                handleSubmit={handleSubmit}
                onOpenChange={closeDialog}
            />

            <div className="px-4 lg:px-6">
                <NotifyList
                    notifies={notifies}
                    isLoading={isLoading}
                    deletingId={deletingId}
                    testingId={testingId}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onTest={handleTestNotify}
                />
            </div>
            <DialogContainer
                confirmState={confirmState}
                onConfirmClose={closeConfirm}
                onConfirmAction={handleConfirm}
            />
        </div>
    )
} 