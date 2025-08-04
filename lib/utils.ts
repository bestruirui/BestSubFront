import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getApiBaseUrl(): string {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASEURL

  if (!apiBaseUrl || apiBaseUrl.trim() === '') {
    if (typeof window !== 'undefined') {
      return window.location.origin
    }
    return ''
  }

  return apiBaseUrl.replace(/\/$/, '')
}

export function buildApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl()
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${baseUrl}${normalizedEndpoint}`
}

export function isZeroTime(timeString: string | undefined | null): boolean {
  if (!timeString) return true

  const zeroTimePatterns = [
    '0001-01-01T00:00:00Z',
    '0001-01-01T00:00:00.000Z',
    '1970-01-01T00:00:00Z',
    '1970-01-01T00:00:00.000Z'
  ]

  return zeroTimePatterns.includes(timeString)
}

export function formatTime(
  timeString: string | undefined | null,
  options?: Intl.DateTimeFormatOptions
): string | null {
  if (!timeString || isZeroTime(timeString)) {
    return null
  }

  try {
    return new Date(timeString).toLocaleString('zh-CN', options)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.warn('Invalid date string:', timeString)
    return null
  }
}

export function formatRelativeTime(timeString: string | undefined | null): string | null {
  if (!timeString || isZeroTime(timeString)) {
    return null
  }

  try {
    const now = new Date()
    const time = new Date(timeString)
    const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)

    if (diffInSeconds < 60) return '刚刚'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分钟前`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}小时前`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}天前`

    return formatTime(timeString)
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    console.warn('Invalid date string:', timeString)
    return null
  }
}

export function validateTimeout(value: string | number): number {
  const num = typeof value === 'string' ? parseInt(value, 10) : value
  if (isNaN(num) || num < 1) return 10
  if (num > 300) return 300
  return num
}

export function validateUrl(url: string): boolean {
  if (!url.trim()) return false
  try {
    new URL(url)
    return url.startsWith('http://') || url.startsWith('https://')
  } catch {
    return false
  }
}

export function validateCronExpr(cron: string): boolean {
  if (!cron.trim()) return false
  const parts = cron.trim().split(/\s+/)
  return parts.length === 5 || parts.length === 6
}

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

export function getNextCronRunTime(cronExpr: string, enabled: boolean): string | null {
  if (!enabled || !cronExpr.trim()) {
    return null
  }

  try {
    const parts = cronExpr.trim().split(/\s+/)
    if (parts.length < 5) return null

    const minute = parts[0]
    const hour = parts[1]
    const day = parts[2]
    const month = parts[3]
    const weekday = parts[4]

    if (!minute || !hour || !day || !month || !weekday) return null

    const now = new Date()
    const next = new Date(now)

    // 简单的cron计算逻辑（处理常见模式）
    if (hour.startsWith('*/')) {
      // 每N小时模式: 0 */6 * * * 或 * */6 * * *
      const hourInterval = parseInt(hour.substring(2))
      if (isNaN(hourInterval)) return null

      let targetMinute = 0
      if (minute !== '*') {
        targetMinute = parseInt(minute)
        if (isNaN(targetMinute)) return null
      }

      // 计算下一个时间点
      const currentHour = now.getHours()
      const nextHourSlot = Math.ceil(currentHour / hourInterval) * hourInterval

      next.setHours(nextHourSlot, targetMinute, 0, 0)

      // 如果计算出的时间已经过了，添加一个间隔
      if (next <= now) {
        next.setHours(next.getHours() + hourInterval)
      }

    } else if (minute !== '*' && hour !== '*') {
      // 固定时间模式: 30 14 * * * (每天14:30)
      const targetMinute = parseInt(minute)
      const targetHour = parseInt(hour)
      if (isNaN(targetMinute) || isNaN(targetHour)) return null

      next.setHours(targetHour, targetMinute, 0, 0)
      if (next <= now) {
        next.setDate(next.getDate() + 1)
      }

    } else if (minute.startsWith('*/')) {
      // 每N分钟模式: */30 * * * *
      const minuteInterval = parseInt(minute.substring(2))
      if (isNaN(minuteInterval)) return null

      const nextMinute = Math.ceil(now.getMinutes() / minuteInterval) * minuteInterval
      next.setMinutes(nextMinute, 0, 0)
      if (next <= now) {
        next.setHours(next.getHours() + 1)
        next.setMinutes(0, 0, 0)
      }

    } else {
      // 其他复杂模式，返回估算时间
      next.setHours(next.getHours() + 1)
      next.setMinutes(0, 0, 0)
    }

    return formatTime(next.toISOString())
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return null
  }
}

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
