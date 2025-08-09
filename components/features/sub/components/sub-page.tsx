import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { dashboardApi } from "@/lib/api/client"
import { useAuth } from "@/components/providers/auth-provider"
import { useSubscriptionForm } from "../hooks/useSubForm"
import { useSubscriptionOperations } from "../hooks/useSubOperations"
import { SubscriptionForm } from "./sub-form"
import { SubscriptionDetail } from "./sub-detail"
import { SubscriptionList } from "./sub-list"
import { DialogContainer } from "@/components/ui/dialog-container"
import type { SubResponse } from "@/lib/types/sub"

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

    const {
        formData,
        editingSubscription,
        isDialogOpen,
        isLoadingEdit,
        updateFormField,
        updateConfigField,
        handleSubmit,
        handleEdit,
        openCreateDialog,
        closeDialog,
    } = useSubscriptionForm({ onSuccess: loadSubscriptions })

    const {
        refreshingId,
        deletingId,
        confirmState,
        handleDelete,
        handleRefresh,
        closeConfirm,
        handleConfirm,
    } = useSubscriptionOperations({ onSuccess: loadSubscriptions })

    const showDetail = (subscription: SubResponse) => {
        setDetailSubscription(subscription)
        setIsDetailDialogOpen(true)
    }

    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex items-center justify-between px-4 lg:px-6">
                <div>
                    <h1 className="text-2xl font-bold">订阅管理</h1>
                </div>

                <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加订阅
                </Button>
            </div>

            <SubscriptionForm
                formData={formData}
                editingSubscription={editingSubscription}
                isDialogOpen={isDialogOpen}
                updateFormField={updateFormField}
                updateConfigField={updateConfigField}
                handleSubmit={handleSubmit}
                onOpenChange={closeDialog}
            />

            <div className="px-4 lg:px-6">
                <SubscriptionList
                    subscriptions={subscriptions}
                    isLoading={isLoading}
                    refreshingId={refreshingId}
                    deletingId={deletingId}
                    isLoadingEdit={isLoadingEdit}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onRefresh={handleRefresh}
                    onShowDetail={showDetail}
                />
            </div>

            <SubscriptionDetail
                subscription={detailSubscription}
                isOpen={isDetailDialogOpen}
                onOpenChange={setIsDetailDialogOpen}
            />

            <DialogContainer
                confirmState={confirmState}
                onConfirmClose={closeConfirm}
                onConfirmAction={handleConfirm}
            />
        </div>
    )
} 