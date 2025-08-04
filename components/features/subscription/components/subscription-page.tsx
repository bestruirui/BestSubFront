/**
 * 订阅管理主页面组件
 */

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { dashboardApi } from "@/lib/api/client"
import { useAuth } from "@/components/providers/auth-provider"
import { useSubscriptionForm } from "../hooks/useSubscriptionForm"
import { useSubscriptionOperations } from "../hooks/useSubscriptionOperations"
import { SubscriptionForm } from "./subscription-form"
import { SubscriptionDetail } from "./subscription-detail"
import { SubscriptionList } from "./subscription-list"
import type { SubResponse } from "@/lib/types/subscription"

export function SubscriptionPage() {
    const [subscriptions, setSubscriptions] = useState<SubResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [detailSubscription, setDetailSubscription] = useState<SubResponse | null>(null)
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
    const { user } = useAuth()

    const loadSubscriptions = useCallback(async () => {
        if (!user) return

        try {
            const token = localStorage.getItem('access_token')
            if (!token) return

            const data = await dashboardApi.getSubscriptions(token)
            setSubscriptions(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Failed to load subscriptions:', error)
            setSubscriptions([])
        } finally {
            setIsLoading(false)
        }
    }, [user])

    useEffect(() => {
        loadSubscriptions()
    }, [loadSubscriptions])

    // 使用自定义Hooks
    const {
        formData,
        editingSubscription,
        isDialogOpen,
        updateFormField,
        updateConfigField,
        handleSubmit,
        handleEdit,
        openCreateDialog,
        closeDialog,
    } = useSubscriptionForm({ onSuccess: loadSubscriptions, _user: user })

    const {
        refreshingId,
        deletingId,
        handleDelete,
        handleRefresh,
    } = useSubscriptionOperations({ onSuccess: loadSubscriptions, _user: user })

    const showDetail = (subscription: SubResponse) => {
        setDetailSubscription(subscription)
        setIsDetailDialogOpen(true)
    }

    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex items-center justify-between px-4 lg:px-6">
                <div>
                    <h1 className="text-2xl font-bold">订阅管理</h1>
                    <p className="text-muted-foreground">管理您的订阅链接</p>
                </div>

                <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加订阅
                </Button>
            </div>

            {/* 订阅表单 */}
            <SubscriptionForm
                formData={formData}
                editingSubscription={editingSubscription}
                isDialogOpen={isDialogOpen}
                updateFormField={updateFormField}
                updateConfigField={updateConfigField}
                handleSubmit={handleSubmit}
                onOpenChange={closeDialog}
            />

            {/* 订阅详情 */}
            <SubscriptionDetail
                subscription={detailSubscription}
                isOpen={isDetailDialogOpen}
                onOpenChange={setIsDetailDialogOpen}
            />

            {/* 订阅列表 */}
            <div className="px-4 lg:px-6">
                <SubscriptionList
                    subscriptions={subscriptions}
                    isLoading={isLoading}
                    refreshingId={refreshingId}
                    deletingId={deletingId}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onRefresh={handleRefresh}
                    onShowDetail={showDetail}
                />
            </div>
        </div>
    )
} 