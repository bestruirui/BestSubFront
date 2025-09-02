import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Plus } from "lucide-react"
import { SubForm } from "./sub-form"
import { SubDetail } from "./sub-detail"
import { SubList } from "./sub-list"
import type { SubResponse } from "@/src/types/sub"

export function SubPage() {
    const [detailSubscription, setDetailSubscription] = useState<SubResponse | null>(null)
    const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
    const [isFormDialogOpen, setIsFormDialogOpen] = useState(false)
    const [editingSubscription, setEditingSubscription] = useState<SubResponse | null>(null)


    const handleEdit = (subscription: SubResponse) => {
        setEditingSubscription(subscription)
        setIsFormDialogOpen(true)
    }

    const handleCreate = () => {
        setEditingSubscription(null)
        setIsFormDialogOpen(true)
    }

    const handleFormSuccess = () => {
        setIsFormDialogOpen(false)
        setEditingSubscription(null)
    }


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

                <Button onClick={handleCreate}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加订阅
                </Button>
            </div>

            <SubForm
                initialData={editingSubscription ? {
                    name: editingSubscription.name,
                    enable: editingSubscription.enable,
                    cron_expr: editingSubscription.cron_expr,
                    config: {
                        url: editingSubscription.config.url || '',
                        proxy: editingSubscription.config.proxy || false,
                        timeout: editingSubscription.config.timeout || 10,
                    }
                } : undefined}
                formTitle={editingSubscription ? "编辑订阅" : "添加订阅"}
                isOpen={isFormDialogOpen}
                onClose={handleFormSuccess}
                editingSubId={editingSubscription?.id}
            />

            <div className="px-4 lg:px-6">
                <SubList
                    onEdit={(sub) => handleEdit(sub)}
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