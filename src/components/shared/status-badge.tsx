import { Badge } from "@/src/components/ui/badge"
import { cn } from "@/src/utils"
import type { ComponentProps } from "react"

type BadgeVariant = ComponentProps<typeof Badge>["variant"]

interface StatusConfig {
    variant: BadgeVariant
    className: string
    text: string
}

const STATUS_CONFIG: Record<string, StatusConfig> = {
    success: { variant: 'default', className: 'bg-green-500 hover:bg-green-600', text: '成功' },
    running: { variant: 'default', className: 'bg-blue-500 hover:bg-blue-600', text: '运行中' },
    failed: { variant: 'destructive', className: '', text: '失败' },
    pending: { variant: 'outline', className: '', text: '等待中' },

    scheduled: { variant: 'default', className: 'bg-green-500 hover:bg-green-600', text: '已调度' },
    disabled: { variant: 'secondary', className: '', text: '已停用' },
} as const

const DISABLED_CONFIG: StatusConfig = {
    variant: "secondary",
    className: "",
    text: "已停用"
} as const

const getUnknownConfig = (status: string): StatusConfig => ({
    variant: "outline",
    className: "",
    text: status || "未知"
})

export interface StatusBadgeProps {
    status: string
    enable: boolean
    className?: string
}

export function StatusBadge({ status, enable, className }: StatusBadgeProps) {
    if (!enable) {
        return (
            <Badge variant={DISABLED_CONFIG.variant} className={cn(DISABLED_CONFIG.className, className)}>
                {DISABLED_CONFIG.text}
            </Badge>
        )
    }

    const config = STATUS_CONFIG[status] || getUnknownConfig(status)

    return (
        <Badge variant={config.variant} className={cn(config.className, className)}>
            {config.text}
        </Badge>
    )
}

export default StatusBadge
