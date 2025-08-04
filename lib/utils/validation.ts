/**
 * 验证相关工具函数
 */

/**
 * 验证超时时间
 */
export function validateTimeout(value: string | number): number {
    const num = typeof value === 'string' ? parseInt(value, 10) : value
    if (isNaN(num) || num < 1) return 10
    if (num > 300) return 300
    return num
}

/**
 * 验证URL格式
 */
export function validateUrl(url: string): boolean {
    if (!url.trim()) return false
    try {
        new URL(url)
        return url.startsWith('http://') || url.startsWith('https://')
    } catch {
        return false
    }
}

/**
 * 验证Cron表达式格式
 */
export function validateCronExpr(cron: string): boolean {
    if (!cron.trim()) return false
    const parts = cron.trim().split(/\s+/)
    return parts.length === 5 || parts.length === 6
}

/**
 * 验证订阅表单数据
 */
export function validateSubscriptionForm(data: {
    name: string
    config: { url: string }
    cron_expr: string
}): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!data.name.trim()) {
        errors.push('请输入订阅名称')
    }

    if (!validateUrl(data.config.url)) {
        errors.push('请输入有效的订阅链接')
    }

    if (!validateCronExpr(data.cron_expr)) {
        errors.push('请输入有效的Cron表达式')
    }

    return {
        isValid: errors.length === 0,
        errors
    }
}

/**
 * 验证检测表单数据
 */
export function validateCheckForm(formData: {
    name: string
    type: string
    timeout: number
    cron_expr: string
    notify_channel: number
}): { isValid: boolean; errors: string[] } {
    const errors: string[] = []

    if (!formData.name.trim()) {
        errors.push('任务名称不能为空')
    }

    if (!formData.type) {
        errors.push('请选择检测类型')
    }

    if (formData.timeout < 1 || formData.timeout > 300) {
        errors.push('超时时间必须在1-300秒之间')
    }

    if (!validateCronExpr(formData.cron_expr)) {
        errors.push('请输入有效的Cron表达式')
    }

    if (formData.notify_channel < 1) {
        errors.push('通知渠道必须大于0')
    }

    return {
        isValid: errors.length === 0,
        errors
    }
} 