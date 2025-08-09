/**
 * API相关类型定义
 */

/**
 * 通用API响应类型
 */
export interface ApiResponse<T = unknown> {
    code: number
    message: string
    data: T
}

/**
 * 错误响应类型
 */
export interface ErrorResponse {
    error: string
    message?: string
    status?: number
}

/**
 * 健康检查响应类型
 */
export interface HealthResponse {
    status: string
    database: string
    timestamp: string
} 