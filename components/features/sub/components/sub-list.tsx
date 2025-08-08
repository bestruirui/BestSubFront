import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { InlineLoading } from "@/components/ui/loading"
import { RefreshCw, Edit, Trash2 } from "lucide-react"
import { formatLastRunTime } from "@/lib/utils"
import StatusBadge from "@/components/shared/status-badge"
import type { SubResponse } from "@/lib/types/sub"

interface SubscriptionListProps {
    subscriptions: SubResponse[]
    isLoading: boolean
    refreshingId: number | null
    deletingId: number | null
    isLoadingEdit?: boolean
    onEdit: (subscription: SubResponse) => void
    onDelete: (id: number, name: string) => void
    onRefresh: (id: number) => void
    onShowDetail: (subscription: SubResponse) => void
}

export function SubscriptionList({
    subscriptions,
    isLoading,
    refreshingId,
    deletingId,
    isLoadingEdit = false,
    onEdit,
    onDelete,
    onRefresh,
    onShowDetail,
}: SubscriptionListProps) {


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
                            .sort((a, b) => a.id - b.id)
                            .map((sub) => (
                                <TableRow key={sub.id}>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="font-medium" onClick={() => onShowDetail(sub)}>
                                                {sub.name}
                                            </div>
                                            <div className="text-sm text-muted-foreground">{sub?.cron_expr || 'N/A'}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            <StatusBadge status={sub.status} enable={sub.enable} />
                                            <div className="flex flex-col gap-1">
                                                <Badge variant="outline" className="text-xs w-fit">
                                                    {sub.config.type?.toUpperCase() || 'AUTO'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="text-xs">
                                                平均延迟: <span className="text-muted-foreground">{sub.info?.delay || 0}ms</span>
                                            </div>
                                            <div className="text-xs">
                                                平均风险: <span className="text-muted-foreground">{sub.info?.risk || 0}</span>
                                            </div>
                                            <div className="text-xs">
                                                ↑{formatSpeed(sub.info?.speed_up)}MB/s ↓{formatSpeed(sub.info?.speed_down)}MB/s
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="text-xs">
                                                最后运行: <span className="text-muted-foreground">{formatLastRunTime(sub.result?.last_run)}</span>
                                            </div>
                                            <div className="text-xs">
                                                执行时长: <span className="text-muted-foreground">{sub.result?.duration || 0}ms</span>
                                            </div>
                                            <div className="text-xs">
                                                状态消息: <span className="text-muted-foreground">{sub.result?.msg || '无'}</span>
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
                                                disabled={isLoadingEdit}
                                                className={isLoadingEdit ? 'opacity-50' : ''}
                                            >
                                                {isLoadingEdit ? (
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                                ) : (
                                                    <Edit className="h-4 w-4" />
                                                )}
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onDelete(sub.id, sub.name)}
                                                disabled={deletingId === sub.id}
                                                className={deletingId === sub.id ? 'opacity-50' : ''}
                                            >
                                                {deletingId === sub.id ? (
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
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