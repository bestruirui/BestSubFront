/**
 * 格式化相关工具函数
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * 合并CSS类名
 */
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

/**
 * 格式化持续时间
 */
export function formatDuration(milliseconds: number): string {
    if (milliseconds < 1000) {
        return `${milliseconds}ms`
    } else if (milliseconds < 60000) {
        return `${(milliseconds / 1000).toFixed(1)}s`
    } else {
        const minutes = Math.floor(milliseconds / 60000)
        const seconds = Math.floor((milliseconds % 60000) / 1000)
        return `${minutes}m ${seconds}s`
    }
}

/**
 * 获取通用状态对应的Badge样式和文本
 */
export function getStatusBadgeConfig(status: string, enable: boolean): {
    variant: "default" | "secondary" | "destructive" | "outline"
    className: string
    text: string
} {
    if (!enable) {
        return {
            variant: "secondary",
            className: "",
            text: "已停用"
        }
    }

    const statusConfig: Record<string, {
        variant: "default" | "secondary" | "destructive" | "outline"
        className: string
        text: string
    }> = {
        // 检测任务状态
        'success': { variant: 'default', className: 'bg-green-500 hover:bg-green-600', text: '成功' },
        'running': { variant: 'default', className: 'bg-blue-500 hover:bg-blue-600', text: '运行中' },
        'failed': { variant: 'destructive', className: '', text: '失败' },
        'pending': { variant: 'outline', className: '', text: '等待中' },

        // 订阅任务状态
        'scheduled': { variant: 'default', className: 'bg-green-500 hover:bg-green-600', text: '已调度' },
        'disabled': { variant: 'secondary', className: '', text: '已停用' },
    }

    const config = statusConfig[status]
    if (!config) {
        return {
            variant: "outline",
            className: "",
            text: status || "未知"
        }
    }

    return config
}

/**
 * 格式化检测结果时间
 */
export function formatCheckResultTime(lastRun: string | undefined): string {
    if (!lastRun) return '从未运行'

    try {
        return new Date(lastRun).toLocaleString()
    } catch {
        return '时间格式错误'
    }
} 