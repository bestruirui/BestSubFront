/**
 * 检测表单相关的自定义Hook
 */

import { useState, useCallback } from 'react'
import { dashboardApi } from '@/lib/api/client'
import { validateCheckForm } from '@/lib/utils'
import type { CheckResponse } from '@/lib/types/check'
import type { DynamicConfigItem } from '@/lib/types/common'
import type { SubNameAndID } from '@/lib/types/subscription'

interface FormData {
    name: string
    type: string
    url: string
    timeout: number
    cron_expr: string
    enable: boolean
    notify: boolean
    notify_channel: number
    log_write_file: boolean
    log_level: string
    sub_id: number[]
    config: Record<string, unknown>
}

interface UseCheckFormProps {
    onSuccess: () => void
    _user: unknown
}

const DEFAULT_FORM_DATA: FormData = {
    name: "",
    type: "",
    url: "",
    timeout: 30,
    cron_expr: "0 */5 * * *",
    enable: true,
    notify: true,
    notify_channel: 1,
    log_write_file: true,
    log_level: "info",
    sub_id: [],
    config: {},
}

export function useCheckForm({ onSuccess, _user }: UseCheckFormProps) {
    const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA)
    const [checkTypes, setCheckTypes] = useState<string[]>([])
    const [checkTypeConfigs, setCheckTypeConfigs] = useState<Record<string, DynamicConfigItem[]>>({})
    const [subList, setSubList] = useState<SubNameAndID[]>([])
    const [isLoadingTypes, setIsLoadingTypes] = useState(false)
    const [isLoadingConfigs, setIsLoadingConfigs] = useState(false)
    const [isLoadingSubs, setIsLoadingSubs] = useState(false)
    const [editingCheck, setEditingCheck] = useState<CheckResponse | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const getToken = useCallback(() => localStorage.getItem('access_token'), [])

    const loadCheckTypes = useCallback(async () => {
        try {
            setIsLoadingTypes(true)
            const token = getToken()
            if (!token) return

            const types = await dashboardApi.getCheckTypes(token)
            setCheckTypes(types)
        } catch (error) {
            console.error('Failed to load check types:', error)
            setCheckTypes([])
        } finally {
            setIsLoadingTypes(false)
        }
    }, [getToken])

    const loadCheckTypeConfig = useCallback(async (type: string) => {
        if (!type) return

        try {
            setIsLoadingConfigs(true)
            const token = getToken()
            if (!token) return

            const configs = await dashboardApi.getCheckTypeConfig(token, type)
            if (Array.isArray(configs)) {
                setCheckTypeConfigs(prev => ({ ...prev, [type]: configs }))
            }
        } catch (error) {
            console.error('Failed to load check type config:', error)
            setCheckTypeConfigs(prev => ({ ...prev, [type]: [] }))
        } finally {
            setIsLoadingConfigs(false)
        }
    }, [getToken])

    const loadSubList = useCallback(async () => {
        try {
            setIsLoadingSubs(true)
            const token = getToken()
            if (!token) return

            const subs = await dashboardApi.getSubNameAndID(token)
            setSubList(subs)
        } catch (error) {
            console.error('Failed to load sub list:', error)
            setSubList([])
        } finally {
            setIsLoadingSubs(false)
        }
    }, [getToken])

    const handleTypeChange = useCallback(async (type: string) => {
        setFormData(prev => ({ ...prev, type, config: {} }))
        if (type && !checkTypeConfigs[type]) {
            await loadCheckTypeConfig(type)
        }
    }, [checkTypeConfigs, loadCheckTypeConfig])

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()

        const validation = validateCheckForm(formData)
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
            if (editingCheck) {
                await dashboardApi.updateCheck(editingCheck.id, formData, token)
            } else {
                await dashboardApi.createCheck(formData, token)
            }

            setIsDialogOpen(false)
            setEditingCheck(null)
            setFormData(DEFAULT_FORM_DATA)
            onSuccess()
        } catch (error) {
            console.error('Failed to save check:', error)
            alert('保存失败，请重试')
        }
    }, [formData, editingCheck, getToken, onSuccess])

    const handleEdit = useCallback((check: CheckResponse) => {
        setEditingCheck(check)
        setFormData({
            name: check.name,
            type: check.task?.type || "",
            url: "",
            timeout: check.task?.timeout || 30,
            cron_expr: check.task?.cron_expr || "0 */5 * * *",
            enable: check.enable,
            notify: check.task?.notify || true,
            notify_channel: check.task?.notify_channel || 1,
            log_write_file: check.task?.log_write_file || true,
            log_level: check.task?.log_level || "info",
            sub_id: check.task?.sub_id || [],
            config: check.config || {},
        })
        setIsDialogOpen(true)
    }, [])

    const openCreateDialog = useCallback(async () => {
        setEditingCheck(null)
        setFormData(DEFAULT_FORM_DATA)
        setIsDialogOpen(true)

        // 预加载数据
        if (checkTypes.length === 0) {
            await loadCheckTypes()
        }
        if (subList.length === 0) {
            await loadSubList()
        }
    }, [checkTypes.length, subList.length, loadCheckTypes, loadSubList])

    const closeDialog = useCallback(() => {
        setIsDialogOpen(false)
        setEditingCheck(null)
        setFormData(DEFAULT_FORM_DATA)
    }, [])

    return {
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
    }
} 