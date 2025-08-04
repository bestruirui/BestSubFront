import { useState, useCallback } from 'react'
import { dashboardApi } from '@/lib/api/client'
import type { CheckResponse, CheckTypeConfig } from '@/lib/types/check'
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    config: any // 动态配置，类型在运行时确定
}

interface UseCheckFormReturn {
    formData: FormData
    checkTypes: string[]
    checkTypeConfigs: Record<string, CheckTypeConfig[]>
    subList: SubNameAndID[]
    isLoadingTypes: boolean
    isLoadingConfigs: boolean
    isLoadingSubs: boolean
    editingCheck: CheckResponse | null
    isDialogOpen: boolean
    setFormData: React.Dispatch<React.SetStateAction<FormData>>
    setEditingCheck: React.Dispatch<React.SetStateAction<CheckResponse | null>>
    setIsDialogOpen: React.Dispatch<React.SetStateAction<boolean>>
    loadCheckTypes: () => Promise<void>
    loadCheckTypeConfig: (type: string) => Promise<void>
    loadSubList: () => Promise<void>
    handleTypeChange: (type: string) => Promise<void>
    handleSubmit: (e: React.FormEvent) => Promise<void>
    handleEdit: (check: CheckResponse) => Promise<void>
    resetForm: () => void
    openCreateDialog: () => Promise<void>
}

export function useCheckForm(
    onSuccess: () => void,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    user: any
): UseCheckFormReturn {
    const [formData, setFormData] = useState<FormData>({
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
    })

    const [checkTypes, setCheckTypes] = useState<string[]>([])
    const [checkTypeConfigs, setCheckTypeConfigs] = useState<Record<string, CheckTypeConfig[]>>({})
    const [subList, setSubList] = useState<SubNameAndID[]>([])
    const [isLoadingTypes, setIsLoadingTypes] = useState(false)
    const [isLoadingConfigs, setIsLoadingConfigs] = useState(false)
    const [isLoadingSubs, setIsLoadingSubs] = useState(false)
    const [editingCheck, setEditingCheck] = useState<CheckResponse | null>(null)
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    const loadCheckTypes = useCallback(async () => {
        if (!user) return

        try {
            setIsLoadingTypes(true)
            const token = localStorage.getItem('access_token')
            if (!token) return

            const types = await dashboardApi.getCheckTypes(token)
            setCheckTypes(types)
        } catch (error) {
            console.error('Failed to load check types:', error)
            setCheckTypes([])
        } finally {
            setIsLoadingTypes(false)
        }
    }, [user])

    const loadCheckTypeConfig = useCallback(async (type: string) => {
        if (!user || !type) return

        try {
            setIsLoadingConfigs(true)
            const token = localStorage.getItem('access_token')
            if (!token) return

            const configs = await dashboardApi.getCheckTypeConfig(token, type)
            // 如果传了type参数，返回的是该类型的配置数组
            if (Array.isArray(configs)) {
                setCheckTypeConfigs(prev => ({ ...prev, [type]: configs }))
            } else {
                // 如果没有传type参数，返回的是所有配置的map
                setCheckTypeConfigs(configs)
            }
        } catch (error) {
            console.error('Failed to load check type config:', error)
            setCheckTypeConfigs(prev => ({ ...prev, [type]: [] }))
        } finally {
            setIsLoadingConfigs(false)
        }
    }, [user])

    const loadSubList = useCallback(async () => {
        if (!user) return

        try {
            setIsLoadingSubs(true)
            const token = localStorage.getItem('access_token')
            if (!token) return

            const subs = await dashboardApi.getSubNameAndID(token)
            setSubList(subs)
        } catch (error) {
            console.error('Failed to load sub list:', error)
            setSubList([])
        } finally {
            setIsLoadingSubs(false)
        }
    }, [user])

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()

        // 验证是否选择了检测类型
        if (!formData.type) {
            alert('请选择检测类型')
            return
        }

        const token = localStorage.getItem('access_token')
        if (!token) return

        try {
            // 构建动态配置
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const dynamicConfig: Record<string, any> = {}

            const currentTypeConfig = checkTypeConfigs[formData.type] || []
            currentTypeConfig.forEach(config => {
                // 如果用户没有填写值，使用default值
                const userValue = formData.config[config.key]
                let finalValue

                if (userValue !== undefined && userValue !== '') {
                    // 用户有填写值，根据类型转换
                    if (config.type === 'number') {
                        finalValue = parseFloat(userValue) || 0
                    } else if (config.type === 'boolean') {
                        finalValue = Boolean(userValue)
                    } else {
                        finalValue = userValue
                    }
                } else {
                    // 用户没有填写值，使用default值
                    if (config.type === 'number') {
                        finalValue = parseFloat(config.default) || 0
                    } else if (config.type === 'boolean') {
                        finalValue = config.default === 'true'
                    } else {
                        finalValue = config.default || ''
                    }
                }

                dynamicConfig[config.key] = finalValue
            })

            const checkData = {
                name: formData.name,
                enable: formData.enable,
                config: {
                    ...dynamicConfig,
                },
                task: {
                    type: formData.type,
                    timeout: formData.timeout,
                    cron_expr: formData.cron_expr,
                    notify: formData.notify,
                    notify_channel: formData.notify_channel,
                    log_write_file: formData.log_write_file,
                    log_level: formData.log_level,
                    sub_id: formData.sub_id,
                }
            }

            if (editingCheck) {
                await dashboardApi.updateCheck(editingCheck.id, checkData, token)
            } else {
                await dashboardApi.createCheck(checkData, token)
            }

            setIsDialogOpen(false)
            setEditingCheck(null)
            setFormData({
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
            })
            onSuccess()
        } catch (error) {
            console.error('Failed to save check:', error)
        }
    }, [formData, checkTypeConfigs, editingCheck, onSuccess])

    const handleEdit = useCallback(async (check: CheckResponse) => {
        setEditingCheck(check)
        setIsDialogOpen(true)

        // 加载检测类型配置
        await loadCheckTypeConfig(check.task?.type || '')

        // 加载订阅列表
        await loadSubList()

        // 构建配置对象
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const configData: Record<string, any> = {}
        if (check.config) {
            Object.keys(check.config).forEach(key => {
                if (key !== 'description') {
                    configData[key] = check.config[key]
                }
            })
        }

        setFormData({
            name: check.name,
            type: check.task?.type || "",
            url: (check.config?.url as string) || "",
            timeout: check.task?.timeout || 30,
            cron_expr: check.task?.cron_expr || "0 */5 * * *",
            enable: check.enable,
            notify: check.task?.notify || true,
            notify_channel: check.task?.notify_channel || 1,
            log_write_file: check.task?.log_write_file || true,
            log_level: check.task?.log_level || "info",
            sub_id: check.task?.sub_id || [],
            config: configData,
        })
    }, [loadCheckTypeConfig, loadSubList])

    const handleTypeChange = useCallback(async (type: string) => {
        setFormData(prev => ({ ...prev, type, config: {} }))
        setCheckTypeConfigs(prev => ({ ...prev, [type]: [] })) // 清空当前配置

        // 加载该类型的配置
        if (type) {
            await loadCheckTypeConfig(type)
        }
    }, [loadCheckTypeConfig])

    const openCreateDialog = useCallback(async () => {
        setEditingCheck(null)
        setFormData({
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
        })
        setIsDialogOpen(true)

        // 在打开对话框时就开始加载检测类型和订阅列表
        if (checkTypes.length === 0) {
            await loadCheckTypes()
        }
        if (subList.length === 0) {
            await loadSubList()
        }
    }, [checkTypes.length, subList.length, loadCheckTypes, loadSubList, setEditingCheck, setIsDialogOpen])

    const resetForm = useCallback(() => {
        setFormData({
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
        })
        setEditingCheck(null)
        setIsDialogOpen(false)
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
        setEditingCheck,
        setIsDialogOpen,
        loadCheckTypes,
        loadCheckTypeConfig,
        loadSubList,
        handleTypeChange,
        handleSubmit,
        handleEdit,
        resetForm,
        openCreateDialog,
    }
} 