/**
 * 订阅列表组件
 */

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { InlineLoading } from "@/components/ui/loading"
import { RefreshCw, Edit, Trash2 } from "lucide-react"
import { getStatusBadgeConfig, formatTime } from "@/lib/utils"
import type { SubResponse } from "@/lib/types/subscription"

interface SubscriptionListProps {
    subscriptions: SubResponse[]
    isLoading: boolean
    refreshingId: number | null
    deletingId: number | null
    onEdit: (subscription: SubResponse) => void
    onDelete: (id: number) => void
    onRefresh: (id: number) => void
    onShowDetail: (subscription: SubResponse) => void
}

export function SubscriptionList({
    subscriptions,
    isLoading,
    refreshingId,
    deletingId,
    onEdit,
    onDelete,
    onRefresh,
    onShowDetail,
}: SubscriptionListProps) {
    const formatLastRun = (lastRun: string | undefined) => {
        const formattedTime = formatTime(lastRun)
        if (!formattedTime) {
            return <span className="text-muted-foreground">从未运行</span>
        }
        return <div className="text-sm">{formattedTime}</div>
    }

    const formatSpeed = (speed: number) => ((speed || 0) / 1024 / 1024).toFixed(1)

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>订阅列表</CardTitle>
                </CardHeader>
                <CardContent>
                    <InlineLoading message="加载订阅列表..." />
                </CardContent>
            </Card>
        )
    }

    if (subscriptions.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>订阅列表</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        暂无订阅，点击上方按钮添加第一个订阅
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>订阅列表</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableBody>
                        {subscriptions
                            .sort((a, b) => a.id - b.id) // 根据ID升序排序
                            .map((sub) => (
                                <TableRow key={sub.id}>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div
                                                className="font-medium cursor-pointer hover:text-blue-600 transition-colors"
                                                onClick={() => onShowDetail(sub)}
                                            >
                                                {sub.name}
                                            </div>
                                            <div className="text-sm text-muted-foreground">{sub.cron_expr}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            {(() => {
                                                const config = getStatusBadgeConfig(sub.status, sub.enable)
                                                return <Badge variant={config.variant} className={config.className}>{config.text}</Badge>
                                            })()}
                                            <div className="flex flex-col gap-1">
                                                <Badge variant="outline" className="text-xs w-fit">
                                                    {sub.config.type?.toUpperCase() || 'AUTO'}
                                                </Badge>
                                                {sub.config.proxy && (
                                                    <Badge variant="secondary" className="text-xs w-fit">代理</Badge>
                                                )}
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="text-xs">
                                                原始节点  <span className="text-muted-foreground">{sub.result?.raw_count || 0}</span>
                                            </div>
                                            <div className="text-xs">
                                                去重节点  <span className="text-muted-foreground">{sub.result?.count || 0}</span>
                                            </div>
                                            <div className="text-xs">
                                                存活节点: <span className="text-muted-foreground">{sub.node_info?.alive_count || 0}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="text-xs">
                                                平均延迟: <span className="text-muted-foreground">{sub.node_info?.delay || 0}ms</span>
                                            </div>
                                            <div className="text-xs">
                                                风险等级: <span className="text-muted-foreground">{sub.node_info?.risk || 0}</span>
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                ↑{formatSpeed(sub.node_info?.speed_up)}MB/s
                                                ↓{formatSpeed(sub.node_info?.speed_down)}MB/s
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="text-sm">
                                                {formatLastRun(sub.result?.last_run)}
                                                <div className="text-xs">
                                                    成功次数: <span className="text-muted-foreground">{sub.result?.success || 0}</span>
                                                </div>
                                                <div className="text-xs">
                                                    失败次数: <span className="text-muted-foreground">{sub.result?.fail || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-1 justify-end">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onRefresh(sub.id)}
                                                disabled={refreshingId === sub.id}
                                                className={refreshingId === sub.id ? 'opacity-50' : ''}
                                            >
                                                <RefreshCw className={`h-4 w-4 ${refreshingId === sub.id ? 'animate-spin' : ''}`} />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onEdit(sub)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onDelete(sub.id)}
                                                disabled={deletingId === sub.id}
                                                className={deletingId === sub.id ? 'opacity-50' : ''}
                                            >
                                                {deletingId === sub.id ? (
                                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
} 