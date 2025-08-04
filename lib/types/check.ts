/**
 * 检测相关类型定义
 */

/**
 * 检测结果类型
 */
export interface CheckResult {
    duration: number
    extra: Record<string, unknown>
    last_run: string
    msg: string
}

/**
 * 检测任务类型
 */
export interface CheckTask {
    cron_expr: string
    log_level: string
    log_write_file: boolean
    notify: boolean
    notify_channel: number
    timeout: number
    type: string
    sub_id: number[]
}

/**
 * 检测响应类型
 */
export interface CheckResponse {
    id: number
    name: string
    enable: boolean
    config: Record<string, unknown>
    result: CheckResult
    task: CheckTask
    status: string
}

/**
 * 检测类型配置项
 */
export interface CheckTypeConfig {
    name: string
    key: string
    type: string
    default: string
    options: string
    require: boolean
    desc: string
}

/**
 * 检测类型响应
 */
export interface CheckTypeResponse {
    types: string[]
    configs: Record<string, CheckTypeConfig[]>
}

/**
 * 动态配置值类型
 */
export type ConfigValue = string | number | boolean

/**
 * 动态配置对象类型
 */
export interface DynamicConfig {
    [key: string]: ConfigValue
} 