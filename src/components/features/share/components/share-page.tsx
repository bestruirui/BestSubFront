import { useEffect, useState, useCallback } from "react"
import { Button } from "@/src/components/ui/button"
import { Plus } from "lucide-react"
import { api } from "@/src/lib/api/client"
import { useShareForm } from "../hooks/useShareForm"
import { useShareOperations } from "../hooks/useShareOperations"
import { ShareForm } from "./share-form"
import { ShareList } from "./share-list"
import { DialogContainer } from "@/src/components/ui/dialog-container"
import type { ShareResponse } from "@/src/types/share"

export function SharePage() {
    const [shares, setShares] = useState<ShareResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const loadShares = useCallback(async () => {
        try {
            const data = await api.getShares()
            setShares(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Failed to load shares:', error)
            setShares([])
        } finally {
            setIsLoading(false)
        }
    }, [])

    useEffect(() => {
        loadShares()
    }, [loadShares])

    const {
        formData,
        editingShare,
        isDialogOpen,
        isLoadingEdit,
        updateFormField,
        updateConfigField,
        updateFilterField,
        handleSubmit,
        handleEdit,
        openCreateDialog,
        closeDialog,
    } = useShareForm({ onSuccess: loadShares })

    const {
        deletingId,
        confirmState,
        handleDelete,
        closeConfirm,
        handleConfirm,
    } = useShareOperations({ onSuccess: loadShares })

    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex items-center justify-between px-4 lg:px-6">
                <div>
                    <h1 className="text-2xl font-bold">分享管理</h1>
                </div>

                <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    创建分享
                </Button>
            </div>

            <ShareForm
                formData={formData}
                editingShare={editingShare}
                isDialogOpen={isDialogOpen}
                updateFormField={updateFormField}
                updateConfigField={updateConfigField}
                updateFilterField={updateFilterField}
                handleSubmit={handleSubmit}
                onOpenChange={closeDialog}
            />

            <div className="px-4 lg:px-6">
                <ShareList
                    shares={shares}
                    isLoading={isLoading}
                    deletingId={deletingId}
                    isLoadingEdit={isLoadingEdit}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
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
