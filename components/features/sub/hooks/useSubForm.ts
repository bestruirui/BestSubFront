import { useState, useCallback } from 'react'
import { dashboardApi } from '@/lib/api/client'
import { validateUrl, validateCronExpr } from '@/lib/utils'
import { useAlertDialog, useFormUpdate } from '@/lib/hooks'
import type { SubResponse, SubCreateRequest } from '@/lib/types/sub'

interface UseSubscriptionFormProps {
    onSuccess: () => void
}

const DEFAULT_FORM_DATA: SubCreateRequest = {
    name: "",
    enable: true,
    cron_expr: "0 */6 * * *",
    config: {
        url: "",
        proxy: false,
        timeout: 10,
        type: 'auto',
    },
}

function validateSubscriptionForm(data: SubCreateRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.name.trim()) {
        errors.push('请输入订阅名称')
    }

    if (!validateUrl(data.config.url)) {
        errors.push('请输入有效的订阅链接')
    }

    if (!validateCronExpr(data.cron_expr)) {
        errors.push('请输入有效的Cron表达式')
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

export function useSubscriptionForm({ onSuccess }: UseSubscriptionFormProps) {
    const [formData, setFormData] = useState<SubCreateRequest>(DEFAULT_FORM_DATA)
    const [editingSubscription, setEditingSubscription] = useState<SubResponse | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isLoadingEdit, setIsLoadingEdit] = useState(false)

    const { alertState, showError, closeAlert } = useAlertDialog()

    const { updateFormField, updateConfigField } = useFormUpdate(setFormData)

    const getToken = useCallback(() => localStorage.getItem('access_token'), [])



    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()

        const validation = validateSubscriptionForm(formData)
        if (!validation.isValid) {
            showError('表单验证失败', validation.errors.join('\n'))
            return
        }

        const token = getToken()
        if (!token) {
            showError('登录状态无效', '请先登录')
            return
        }

        try {
            const submitData: SubCreateRequest = {
                name: formData.name,
                enable: formData.enable,
                cron_expr: formData.cron_expr,
                config: formData.config,
            }

            if (editingSubscription) {
                await dashboardApi.updateSubscription(editingSubscription.id, submitData, token)
            } else {
                await dashboardApi.createSubscription(submitData, token)
            }

            setIsDialogOpen(false)
            setEditingSubscription(null)
            setFormData(DEFAULT_FORM_DATA)
            onSuccess()
        } catch (error) {
            console.error('Failed to save subscription:', error)
            showError('保存失败', '请重试')
        }
    }, [formData, editingSubscription, getToken, onSuccess, showError])

    const handleEdit = useCallback((subscription: SubResponse) => {
        setIsLoadingEdit(true)
        setEditingSubscription(subscription)
        setFormData({
            name: subscription.name,
            enable: subscription.enable,
            cron_expr: subscription.cron_expr,
            config: {
                url: subscription.config.url || "",
                proxy: subscription.config.proxy || false,
                timeout: subscription.config.timeout || 10,
                type: subscription.config.type || 'auto',
            },
        })
        setIsDialogOpen(true)
        setIsLoadingEdit(false)
    }, [])

    const openCreateDialog = useCallback(() => {
        setEditingSubscription(null)
        setFormData(DEFAULT_FORM_DATA)
        setIsDialogOpen(true)
    }, [])

    const closeDialog = useCallback(() => {
        setIsDialogOpen(false)
        setEditingSubscription(null)
        setFormData(DEFAULT_FORM_DATA)
    }, [])

    return {
        formData,
        editingSubscription,
        isDialogOpen,
        isLoadingEdit,
        alertState,
        updateFormField,
        updateConfigField,
        handleSubmit,
        handleEdit,
        openCreateDialog,
        closeDialog,
        closeAlert,
    }
} 