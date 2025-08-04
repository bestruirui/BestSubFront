/**
 * 通用类型定义
 */

/**
 * 基础实体类型
 */
export interface BaseEntity {
    id: number
    created_at: string
    updated_at: string
}

/**
 * 分页请求参数
 */
export interface PaginationParams {
    page?: number
    page_size?: number
    sort_by?: string
    sort_order?: 'asc' | 'desc'
}

/**
 * 分页响应类型
 */
export interface PaginatedResponse<T> {
    items: T[]
    total: number
    page: number
    page_size: number
    total_pages: number
}

/**
 * 状态枚举
 */
export type Status = 'active' | 'inactive' | 'pending' | 'error'

/**
 * 通用状态对象
 */
export interface StatusInfo {
    status: Status
    message?: string
    timestamp?: string
} 