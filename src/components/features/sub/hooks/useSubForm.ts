import { useState, useCallback } from 'react'
import { api } from '@/src/lib/api/client'
import { validateUrl, validateCronExpr } from '@/src/utils'
import { useFormUpdate } from '@/src/lib/hooks'
import type { SubResponse, SubRequest } from '@/src/types/sub'


const DEFAULT_FORM_DATA: SubRequest = {
    name: "",
    enable: true,
    cron_expr: "0 */6 * * *",
    config: {
        url: "",
        proxy: false,
        timeout: 10,
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

export function useSubForm() {
    const [formData, setFormData] = useState<SubRequest>(DEFAULT_FORM_DATA)
    const [editingSubscription, setEditingSubscription] = useState<SubResponse | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isLoadingEdit, setIsLoadingEdit] = useState(false)

    const { updateFormField, updateConfigField } = useFormUpdate(setFormData)




    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()

        const validation = validateSubscriptionForm(formData)
        if (!validation.isValid) {
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
                await api.updateSubscription(editingSubscription.id, submitData)
            } else {
                await api.createSubscription(submitData)
            }

            setIsDialogOpen(false)
            setEditingSubscription(null)
            setFormData(DEFAULT_FORM_DATA)
        } catch (error) {
            console.error('Failed to save subscription:', error)
        }
    }, [formData, editingSubscription])

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