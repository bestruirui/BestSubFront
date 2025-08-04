/**
 * 检测表单相关的自定义Hook
 */

import { useState, useCallback } from 'react'
import { dashboardApi } from '@/lib/api/client'
import { validateCheckForm } from '@/lib/utils'
import { useAlertDialog } from '@/lib/hooks'
import type { CheckResponse, CheckRequest } from '@/lib/types/check'
import type { DynamicConfigItem } from '@/lib/types/common'
import type { SubNameAndID } from '@/lib/types/subscription'

// 常量定义
const DEFAULT_TIMEOUT = 30
const DEFAULT_CRON_EXPR = "0 */5 * * *"
const DEFAULT_NOTIFY_CHANNEL = 1
const DEFAULT_LOG_LEVEL = "info"

// 工具函数：处理配置默认值
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

// 扁平化的表单数据类型，用于表单处理
interface CheckFormData {
    name: string
    enable: boolean
    // CheckTask 字段扁平化
    type: string
    timeout: number
    cron_expr: string
    notify: boolean
    notify_channel: number
    log_write_file: boolean
    log_level: string
    sub_id: number[]
    // 配置数据
    config: Record<string, unknown>
}

interface UseCheckFormProps {
    onSuccess: () => void
}

const DEFAULT_FORM_DATA: CheckFormData = {
    name: "",
    enable: true,
    type: "",
    timeout: DEFAULT_TIMEOUT,
    cron_expr: DEFAULT_CRON_EXPR,
    notify: true,
    notify_channel: DEFAULT_NOTIFY_CHANNEL,
    log_write_file: true,
    log_level: DEFAULT_LOG_LEVEL,
    sub_id: [],
    config: {},
}

export function useCheckForm({ onSuccess }: UseCheckFormProps) {
    const [formData, setFormData] = useState<CheckFormData>(DEFAULT_FORM_DATA)
    const [checkTypes, setCheckTypes] = useState<string[]>([])
    const [checkTypeConfigs, setCheckTypeConfigs] = useState<Record<string, DynamicConfigItem[]>>({})
    const [subList, setSubList] = useState<SubNameAndID[]>([])
    const [isLoadingTypes, setIsLoadingTypes] = useState(false)
    const [isLoadingConfigs, setIsLoadingConfigs] = useState(false)
    const [isLoadingSubs, setIsLoadingSubs] = useState(false)
    const [isLoadingEdit, setIsLoadingEdit] = useState(false)
    const [editingCheck, setEditingCheck] = useState<CheckResponse | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // 使用公共的alert dialog hook
    const { alertState, showError, closeAlert } = useAlertDialog()

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
            showError('表单验证失败', validation.errors.join('\n'))
            return
        }

        const token = getToken()
        if (!token) {
            showError('认证失败', '请先登录')
            return
        }

        try {
            // 处理配置数据，将空值替换为 default 值
            const configs = checkTypeConfigs[formData.type] || []
            const processedConfig = processConfigDefaults(formData.config, configs)

            // 构造符合 CheckRequest 格式的数据
            const submitData: CheckRequest = {
                name: formData.name,
                enable: formData.enable,
                task: {
                    type: formData.type,
                    timeout: formData.timeout,
                    cron_expr: formData.cron_expr,
                    notify: formData.notify,
                    notify_channel: formData.notify_channel,
                    log_write_file: formData.log_write_file,
                    log_level: formData.log_level,
                    sub_id: formData.sub_id,
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
            
            // 获取检测类型（项目中已有，无需重新请求type列表）
            const checkType = check.task?.type || ""
            
            // 先设置表单数据（包含已有的type）
            setFormData({
                name: check.name,
                enable: check.enable,
                type: checkType,
                timeout: check.task?.timeout || DEFAULT_TIMEOUT,
                cron_expr: check.task?.cron_expr || DEFAULT_CRON_EXPR,
                notify: check.task?.notify || true,
                notify_channel: check.task?.notify_channel || DEFAULT_NOTIFY_CHANNEL,
                log_write_file: check.task?.log_write_file || true,
                log_level: check.task?.log_level || DEFAULT_LOG_LEVEL,
                sub_id: check.task?.sub_id || [],
                config: check.config || {},
            })
            
            // 并行加载必要数据
            const loadPromises = []
            
            // 加载订阅列表（如果需要）
            if (subList.length === 0) {
                loadPromises.push(loadSubList())
            }
            
            // 加载该检测类型的配置项（如果需要）
            if (checkType && !checkTypeConfigs[checkType]) {
                loadPromises.push(loadCheckTypeConfig(checkType))
            }
            
            // 等待数据加载完成
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
        isLoadingEdit,
        editingCheck,
        isDialogOpen,
        alertState,
        setFormData,
        handleTypeChange,
        handleSubmit,
        handleEdit,
        openCreateDialog,
        closeDialog,
        closeAlert,
    }
}

// 导出类型供其他组件使用
export type { CheckFormData } 