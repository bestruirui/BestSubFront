import { useEffect, useState, useCallback } from "react"
import { Button } from "@/src/components/ui/button"
import { Plus } from "lucide-react"
import { api } from "@/src/lib/api/client"
import { useSubForm } from "../hooks/useSubForm"
import { useSubOperations } from "../hooks/useSubOperations"
import { SubForm } from "./sub-form"
import { SubDetail } from "./sub-detail"
import { SubList } from "./sub-list"
import type { SubResponse } from "@/src/types/sub"

export function SubPage() {
    const [sub, setSub] = useState<SubResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [detailSubscription, setDetailSubscription] = useState<SubResponse | null>(null)
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)

    const loadSub = useCallback(async () => {
        try {
            const data = await api.getSub()
            setSub(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Failed to load sub:', error)
            setSub([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadSub()
    }, [loadSub])

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
    } = useSubForm()

    const {
        refreshingId,
        deletingId,
        handleDelete,
        handleRefresh,
    } = useSubOperations()

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

            <SubForm
                formData={formData}
                editingSubscription={editingSubscription}
                isDialogOpen={isDialogOpen}
                updateFormField={updateFormField}
                updateConfigField={updateConfigField}
                handleSubmit={handleSubmit}
                onOpenChange={closeDialog}
            />

            <div className="px-4 lg:px-6">
                <SubList
                    sub={sub}
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

            <SubDetail
                subscription={detailSubscription}
                isOpen={isDetailDialogOpen}
                onOpenChange={setIsDetailDialogOpen}
            />
        </div>
    )
} 