/**
 * 订阅相关类型定义
 */

/**
 * 订阅配置类型
 */
export interface SubConfig {
    url: string
    proxy?: boolean
    timeout?: number
    type?: 'clash' | 'singbox' | 'base64' | 'v2ray' | 'auto'
}

/**
 * 创建订阅请求类型
 */
export interface SubCreateRequest {
    name: string
    enable: boolean
    cron_expr: string
    config: SubConfig
}

/**
 * 更新订阅请求类型
 */
export interface SubUpdateRequest {
    name: string
    enable: boolean
    cron_expr: string
    config: SubConfig
}

/**
 * 订阅结果类型
 */
export interface SubResult {
    success: number
    fail: number
    msg: string
    raw_count: number
    last_run: string
    duration: number
}

/**
 * 订阅节点信息类型
 */
export interface SubNodeInfo {
    count: number
    speed_up: number
    speed_down: number
    delay: number
    risk: number
}

/**
 * 订阅响应类型
 */
export interface SubResponse {
    id: number
    name: string
    enable: boolean
    status: string
    cron_expr: string
    created_at: string
    updated_at: string
    result: SubResult
    info: SubNodeInfo
    config: SubConfig
}

/**
 * 订阅名称和ID类型
 */
export interface SubNameAndID {
    id: number
    name: string
} 