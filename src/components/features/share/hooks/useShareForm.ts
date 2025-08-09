import { useState, useCallback } from 'react'
import { api } from '@/src/lib/api/client'
import { useFormUpdate } from '@/src/lib/hooks'
import type { ShareResponse, ShareRequest } from '@/src/types/share'

interface UseShareFormProps {
    onSuccess: () => void
}

const DEFAULT_FORM_DATA: ShareRequest = {
    name: "",
    enable: true,
    token: "",
    config: {
        template: "clash",
        max_access_count: 0,
        expires: 24,
        sub_id: [],
        filter: {
            sub_id: [],
            speed_up_more: 0,
            speed_down_more: 0,
            country: [],
            delay_less_than: 0,
            alive_status: 0,
            risk_less_than: 0,
        },
    },
}

function validateShareForm(data: ShareRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.name.trim()) {
        errors.push('请输入分享名称')
    }

    if (data.config.sub_id.length === 0) {
        errors.push('请至少选择一个订阅ID')
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

export function useShareForm({ onSuccess }: UseShareFormProps) {
    const [formData, setFormData] = useState<ShareRequest>(DEFAULT_FORM_DATA)
    const [editingShare, setEditingShare] = useState<ShareResponse | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [isLoadingEdit, setIsLoadingEdit] = useState(false)

    const { updateFormField, updateConfigField } = useFormUpdate(setFormData)

    const updateFilterField = useCallback(<K extends keyof ShareRequest['config']['filter']>(
        field: K,
        value: ShareRequest['config']['filter'][K]
    ) => {
        setFormData(prev => ({
            ...prev,
            config: {
                ...prev.config,
                filter: {
                    ...prev.config.filter,
                    [field]: value
                }
            }
        }))
    }, [])


    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()

        const validation = validateShareForm(formData)
        if (!validation.isValid) {
            return
        }

        try {
            const submitData: ShareRequest = {
                name: formData.name,
                enable: formData.enable,
                token: formData.token,
                config: formData.config,
            }

            if (editingShare) {
                await api.updateShare(editingShare.id, submitData)
            } else {
                await api.createShare(submitData)
            }

            setIsDialogOpen(false)
            setEditingShare(null)
            setFormData(DEFAULT_FORM_DATA)
            onSuccess()
        } catch (error) {
            console.error('Failed to save share:', error)
        }
    }, [formData, editingShare, onSuccess])

    const handleEdit = useCallback((share: ShareResponse) => {
        setIsLoadingEdit(true)
        setEditingShare(share)
        setFormData({
            name: share.name,
            enable: share.enable,
            token: share.token,
            config: {
                template: share.config.template || "clash",
                max_access_count: share.config.max_access_count || 0,
                expires: share.config.expires || 24,
                sub_id: share.config.sub_id || [],
                filter: {
                    sub_id: share.config.filter.sub_id || [],
                    speed_up_more: share.config.filter.speed_up_more || 0,
                    speed_down_more: share.config.filter.speed_down_more || 0,
                    country: share.config.filter.country || [],
                    delay_less_than: share.config.filter.delay_less_than || 0,
                    alive_status: share.config.filter.alive_status || 0,
                    risk_less_than: share.config.filter.risk_less_than || 0,
                },
            },
        })
        setIsDialogOpen(true)
        setIsLoadingEdit(false)
    }, [])

    const openCreateDialog = useCallback(() => {
        setEditingShare(null)
        setFormData(DEFAULT_FORM_DATA)
        setIsDialogOpen(true)
    }, [])

    const closeDialog = useCallback(() => {
        setIsDialogOpen(false)
        setEditingShare(null)
        setFormData(DEFAULT_FORM_DATA)
    }, [])

    return {
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
    }
}
