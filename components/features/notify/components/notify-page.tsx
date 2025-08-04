import { useState, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useAuth } from "@/components/providers/auth-provider"
import { dashboardApi } from '@/lib/api/client'
import { NotifyForm } from './notify-form'
import { NotifyList } from './notify-list'
import { useNotifyForm } from '../hooks/useNotifyForm'
import { useNotifyOperations } from '../hooks/useNotifyOperations'
import type { NotifyResponse } from '@/lib/types'

export function NotifyPage() {
    const [notifies, setNotifies] = useState<NotifyResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { user } = useAuth()

    const loadNotifies = useCallback(async () => {
        try {
            setIsLoading(true)
            const token = localStorage.getItem('access_token')
            if (!token) return

            const data = await dashboardApi.getNotifyList(token)
            setNotifies(data)
        } catch (error) {
            console.error('Failed to load notifies:', error)
        } finally {
            setIsLoading(false)
        }
    }, [])

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
    } = useNotifyForm({ onSuccess: loadNotifies, _user: user })

    const {
        deletingId,
        testingId,
        handleDelete,
        handleTest
    } = useNotifyOperations({ onSuccess: loadNotifies, _user: user })

    const handleTestNotify = useCallback((notify: NotifyResponse) => {
        handleTest({
            name: notify.name,
            type: notify.type,
            config: notify.config
        }, notify.id)
    }, [handleTest])

    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            {/* 页面标题和操作按钮 */}
            <div className="flex items-center justify-between px-4 lg:px-6">
                <div>
                    <h1 className="text-2xl font-bold">通知管理</h1>
                    <p className="text-muted-foreground">
                        管理通知配置，支持多种通知渠道
                    </p>
                </div>
                <Button onClick={openCreateDialog}>
                    <Plus className="mr-2 h-4 w-4" />
                    创建通知配置
                </Button>
            </div>

            {/* 通知表单 */}
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

            {/* 通知列表 */}
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
        </div>
    )
} 