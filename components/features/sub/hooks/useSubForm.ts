import { useState, useCallback } from 'react'
import { dashboardApi } from '@/lib/api/client'
import { validateUrl, validateCronExpr } from '@/lib/utils'
import { useFormUpdate } from '@/lib/hooks'
import type { SubResponse, SubRequest } from '@/lib/types/sub'

interface UseSubscriptionFormProps {
    onSuccess: () => void
}

const DEFAULT_FORM_DATA: SubRequest = {
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

function validateSubscriptionForm(data: SubRequest): { isValid: boolean; errors: string[] } {
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
    const [formData, setFormData] = useState<SubRequest>(DEFAULT_FORM_DATA)
    const [editingSubscription, setEditingSubscription] = useState<SubResponse | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isLoadingEdit, setIsLoadingEdit] = useState(false)

    const { updateFormField, updateConfigField } = useFormUpdate(setFormData)

    const getToken = useCallback(() => localStorage.getItem('access_token'), [])



    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()

        const validation = validateSubscriptionForm(formData)
        if (!validation.isValid) {
            return
        }

        const token = getToken()
        if (!token) {
            return
        }

        try {
            const submitData: SubRequest = {
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
        }
    }, [formData, editingSubscription, getToken, onSuccess])

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
        updateFormField,
        updateConfigField,
        handleSubmit,
        handleEdit,
        openCreateDialog,
        closeDialog,
    }
} 