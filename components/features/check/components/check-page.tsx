/**
 * 检测管理主页面组件
 */

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { dashboardApi } from "@/lib/api/client"
import { useAuth } from "@/components/providers/auth-provider"
import { useCheckForm } from "../hooks/useCheckForm"
import { useCheckOperations } from "../hooks/useCheckOperations"
import { CheckForm } from "./check-form"
import { CheckList } from "./check-list"
import type { CheckResponse } from "@/lib/types/check"

export function CheckPage() {
    const [checks, setChecks] = useState<CheckResponse[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const { user } = useAuth()

    const loadChecks = useCallback(async () => {
        if (!user) return

        try {
            const token = localStorage.getItem('access_token')
            if (!token) return

            const data = await dashboardApi.getChecks(token)
            setChecks(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error('Failed to load checks:', error)
            setChecks([])
        } finally {
            setIsLoading(false)
        }
    }, [user])

    useEffect(() => {
        loadChecks()
    }, [loadChecks])

    // 使用自定义Hooks
    const {
        formData,
        checkTypes,
        checkTypeConfigs,
        subList,
        isLoadingTypes,
        isLoadingConfigs,
        isLoadingSubs,
        editingCheck,
        isDialogOpen,
        setFormData,
        handleTypeChange,
        handleSubmit,
        handleEdit,
        openCreateDialog,
        closeDialog,
    } = useCheckForm({ onSuccess: loadChecks, _user: user })

    const {
        runningId,
        deletingId,
        handleDelete,
        handleRun,
    } = useCheckOperations({ onSuccess: loadChecks, _user: user })

    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
            <div className="flex items-center justify-between px-4 lg:px-6">
                <div>
                    <h1 className="text-2xl font-bold">检测任务</h1>
                    <p className="text-muted-foreground">管理您的检测任务</p>
                </div>

                <Button onClick={openCreateDialog}>
                    <Plus className="h-4 w-4 mr-2" />
                    添加检测
                </Button>
            </div>

            {/* 检测表单 */}
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
                setFormData={setFormData}
                handleTypeChange={handleTypeChange}
                handleSubmit={handleSubmit}
                onOpenChange={closeDialog}
            />

            {/* 检测列表 */}
            <div className="px-4 lg:px-6">
                <CheckList
                    checks={checks}
                    isLoading={isLoading}
                    runningId={runningId}
                    deletingId={deletingId}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onRun={handleRun}
                />
            </div>
        </div>
    )
} 