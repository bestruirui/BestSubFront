import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { dashboardApi } from "@/lib/api/client"
import { useCheckForm } from "../hooks/useCheckForm"
import { useCheckOperations } from "../hooks/useCheckOperations"
import { CheckForm } from "./check-form"
import { CheckList } from "./check-list"
import { DialogContainer } from "@/components/ui/dialog-container"
import type { CheckResponse } from "@/lib/types/check"

export function CheckPage() {
    const [checks, setChecks] = useState<CheckResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const getToken = useCallback(() => localStorage.getItem('access_token'), [])

    const loadChecks = useCallback(async () => {
        try {
            setIsLoading(true)
            const token = getToken()
            if (!token) return

            const data = await dashboardApi.getChecks(token)
            setChecks(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Failed to load checks:', error)
            setChecks([])
        } finally {
            setIsLoading(false)
        }
    }, [getToken])

    useEffect(() => {
        loadChecks()
    }, [loadChecks])

    const {
        formData,
        checkTypes,
        checkTypeConfigs,
        subList,
        isLoadingTypes,
        isLoadingConfigs,
        isLoadingSubs,
        isLoadingEdit,
        editingCheck,
        isDialogOpen,
        updateFormField,
        updateConfigField,
        handleTypeChange,
        handleSubmit,
        handleEdit,
        openCreateDialog,
        closeDialog,
    } = useCheckForm({ onSuccess: loadChecks })

    const {
        runningId,
        deletingId,
        confirmState,
        handleDelete,
        handleRun,
        closeConfirm,
        handleConfirm,
    } = useCheckOperations({ onSuccess: loadChecks })

    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex items-center justify-between px-4 lg:px-6">
                <div>
                    <h1 className="text-2xl font-bold">检测任务</h1>
                </div>

                <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加检测
                </Button>
            </div>

            <CheckForm
                formData={formData}
                editingCheck={editingCheck}
                isDialogOpen={isDialogOpen}
                checkTypes={checkTypes}
                checkTypeConfigs={checkTypeConfigs}
                subList={subList}
                isLoadingTypes={isLoadingTypes}
                isLoadingConfigs={isLoadingConfigs}
                isLoadingSubs={isLoadingSubs}
                updateFormField={updateFormField}
                updateConfigField={updateConfigField}
                handleTypeChange={handleTypeChange}
                handleSubmit={handleSubmit}
                onOpenChange={closeDialog}
            />

            <div className="px-4 lg:px-6">
                <CheckList
                    checks={checks}
                    isLoading={isLoading}
                    runningId={runningId}
                    deletingId={deletingId}
                    isLoadingEdit={isLoadingEdit}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onRun={handleRun}
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