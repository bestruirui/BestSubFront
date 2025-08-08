import { useState, useCallback } from 'react'
import { dashboardApi } from '@/lib/api/client'
import { validateCronExpr } from '@/lib/utils'
import { useAlertDialog, useFormUpdate } from '@/lib/hooks'
import type { CheckResponse, CheckRequest } from '@/lib/types/check'
import type { DynamicConfigItem } from '@/lib/types/common'
import type { SubNameAndID } from '@/lib/types/sub'

const processConfigDefaults = (config: Record<string, unknown>, configs: DynamicConfigItem[]): Record<string, unknown> => {
    const processedConfig = { ...config }
    configs.forEach(configItem => {
        const value = processedConfig[configItem.key]
        if ((value === undefined || value === '' || value === null) && configItem.default) {
            processedConfig[configItem.key] = configItem.default
        }
    })
    return processedConfig
}



interface UseCheckFormProps {
    onSuccess: () => void
}

const DEFAULT_FORM_DATA: CheckRequest = {
    name: "",
    enable: true,
    task: {
        type: "",
        timeout: 30,
        cron_expr: "0 */5 * * *",
        notify: true,
        notify_channel: 1,
        log_write_file: true,
        log_level: "info",
        sub_id: [],
    },
    config: {},
}

function validateCheckForm(formData: CheckRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!formData.name.trim()) {
        errors.push('任务名称不能为空')
    }

    if (!formData.task.type) {
        errors.push('请选择检测类型')
    }

    if (formData.task.timeout < 1 || formData.task.timeout > 300) {
        errors.push('超时时间必须在1-300秒之间')
    }

    if (!validateCronExpr(formData.task.cron_expr)) {
        errors.push('请输入有效的Cron表达式')
    }

    if (formData.task.notify_channel < 1) {
        errors.push('通知渠道必须大于0')
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

export function useCheckForm({ onSuccess }: UseCheckFormProps) {
    const [formData, setFormData] = useState<CheckRequest>(DEFAULT_FORM_DATA)
    const [checkTypes, setCheckTypes] = useState<string[]>([])
    const [checkTypeConfigs, setCheckTypeConfigs] = useState<Record<string, DynamicConfigItem[]>>({})
    const [subList, setSubList] = useState<SubNameAndID[]>([])
    const [isLoadingTypes, setIsLoadingTypes] = useState(false)
    const [isLoadingConfigs, setIsLoadingConfigs] = useState(false)
    const [isLoadingSubs, setIsLoadingSubs] = useState(false)
    const [isLoadingEdit, setIsLoadingEdit] = useState(false)
    const [editingCheck, setEditingCheck] = useState<CheckResponse | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const { alertState, showError, closeAlert } = useAlertDialog()

    const { updateFormField, updateConfigField } = useFormUpdate(setFormData)

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
        setFormData(prev => ({ ...prev, task: { ...prev.task, type }, config: {} }))
        if (type && !checkTypeConfigs[type]) {
            await loadCheckTypeConfig(type)
        }
    }, [checkTypeConfigs, loadCheckTypeConfig])

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()

        const validation = validateCheckForm(formData)
        if (!validation.isValid) {
            showError('表单验证失败', validation.errors.join('\n'))
            return
        }

        const token = getToken()
        if (!token) {
            showError('认证失败', '请先登录')
            return
        }

        try {
            const configs = checkTypeConfigs[formData.task.type] || []
            const processedConfig = processConfigDefaults(formData.config, configs)

            const submitData: CheckRequest = {
                name: formData.name,
                enable: formData.enable,
                task: {
                    type: formData.task.type,
                    timeout: formData.task.timeout,
                    cron_expr: formData.task.cron_expr,
                    notify: formData.task.notify,
                    notify_channel: formData.task.notify_channel,
                    log_write_file: formData.task.log_write_file,
                    log_level: formData.task.log_level,
                    sub_id: formData.task.sub_id,
                },
                config: processedConfig,
            }

            if (editingCheck) {
                await dashboardApi.updateCheck(editingCheck.id, submitData, token)
            } else {
                await dashboardApi.createCheck(submitData, token)
            }

            setIsDialogOpen(false)
            setEditingCheck(null)
            setFormData(DEFAULT_FORM_DATA)
            onSuccess()
        } catch (error) {
            console.error('Failed to save check:', error)
            showError('保存失败', '请检查网络连接后重试')
        }
    }, [formData, editingCheck, getToken, onSuccess, checkTypeConfigs, showError])

    const handleEdit = useCallback(async (check: CheckResponse) => {
        try {
            setIsLoadingEdit(true)
            setEditingCheck(check)

            const checkType = check.task?.type || ""

            setFormData({
                name: check.name,
                enable: check.enable,
                task: {
                    type: checkType,
                    timeout: check.task?.timeout || 30,
                    cron_expr: check.task?.cron_expr || "0 */5 * * *",
                    notify: check.task?.notify || true,
                    notify_channel: check.task?.notify_channel || 1,
                    log_write_file: check.task?.log_write_file || true,
                    log_level: check.task?.log_level || "info",
                    sub_id: check.task?.sub_id || [],
                },
                config: check.config || {},
            })

            const loadPromises = []

            if (subList.length === 0) {
                loadPromises.push(loadSubList())
            }
            if (checkType && !checkTypeConfigs[checkType]) {
                loadPromises.push(loadCheckTypeConfig(checkType))
            }
            await Promise.all(loadPromises)

            setIsDialogOpen(true)
        } catch (error) {
            console.error('Failed to load edit data:', error)
            showError('加载编辑数据失败', '请重试或刷新页面')
        } finally {
            setIsLoadingEdit(false)
        }
    }, [subList.length, checkTypeConfigs, loadSubList, loadCheckTypeConfig, showError])

    const openCreateDialog = useCallback(async () => {
        setEditingCheck(null)
        setFormData(DEFAULT_FORM_DATA)
        setIsDialogOpen(true)

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
        isLoadingEdit,
        editingCheck,
        isDialogOpen,
        alertState,
        setFormData,
        updateFormField,
        updateConfigField,
        handleTypeChange,
        handleSubmit,
        handleEdit,
        openCreateDialog,
        closeDialog,
        closeAlert,
    }
}

