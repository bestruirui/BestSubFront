/**
 * 订阅表单相关的自定义Hook
 */

import { useState, useCallback } from 'react'
import { dashboardApi } from '@/lib/api/client'
import { validateSubscriptionForm } from '@/lib/utils'
import type { SubResponse, SubCreateRequest } from '@/lib/types/subscription'

interface UseSubscriptionFormProps {
    onSuccess: () => void
    _user: unknown
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

export function useSubscriptionForm({ onSuccess, _user }: UseSubscriptionFormProps) {
    const [formData, setFormData] = useState<SubCreateRequest>(DEFAULT_FORM_DATA)
    const [editingSubscription, setEditingSubscription] = useState<SubResponse | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const getToken = useCallback(() => localStorage.getItem('access_token'), [])

    // 优化的表单更新函数
    const updateFormField = useCallback((field: keyof SubCreateRequest, value: string | boolean) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }, [])

    const updateConfigField = useCallback((field: keyof SubCreateRequest['config'], value: string | boolean | number) => {
        setFormData(prev => ({
            ...prev,
            config: { ...prev.config, [field]: value }
        }))
    }, [])

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()

        const validation = validateSubscriptionForm(formData)
        if (!validation.isValid) {
            alert(validation.errors.join('\n'))
            return
        }

        const token = getToken()
        if (!token) {
            alert('请先登录')
            return
        }

        try {
            if (editingSubscription) {
                await dashboardApi.updateSubscription(editingSubscription.id, formData, token)
            } else {
                await dashboardApi.createSubscription(formData, token)
            }

            setIsDialogOpen(false)
            setEditingSubscription(null)
            setFormData(DEFAULT_FORM_DATA)
            onSuccess()
        } catch (error) {
            console.error('Failed to save subscription:', error)
            alert('保存失败，请重试')
        }
    }, [formData, editingSubscription, getToken, onSuccess])

    const handleEdit = useCallback((subscription: SubResponse) => {
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
    }, [])

    // 移除未使用的resetForm函数

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
        updateFormField,
        updateConfigField,
        handleSubmit,
        handleEdit,
        openCreateDialog,
        closeDialog,
    }
} 