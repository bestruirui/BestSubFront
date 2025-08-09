import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
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
                <CardContent>
                    <InlineLoading message="加载订阅列表..." />
                </CardContent>
            </Card>
        )
    }

    if (subscriptions.length === 0) {
        return (
            <Card>
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
            <CardContent>
                <Table>
                    <TableBody>
                        {subscriptions.sort((a, b) => a.id - b.id).map((sub) => (
                            <TableRow key={sub.id}>
                                <TableCell className="space-y-1">
                                    <div className="font-medium" onClick={() => onShowDetail(sub)}>
                                        {sub.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">{sub?.cron_expr || 'N/A'}</div>
                                </TableCell>
                                <TableCell className="space-y-2 flex flex-col">
                                    <StatusBadge status={sub.status} enable={sub.enable} />
                                    <Badge variant="outline" className="text-xs w-fit">
                                        {sub.config.type?.toUpperCase() || 'AUTO'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-xs space-y-1">
                                    <div>平均延迟: <span className="text-muted-foreground">{sub.info?.delay || 0}ms</span></div>
                                    <div>平均风险: <span className="text-muted-foreground">{sub.info?.risk || 0}</span></div>
                                    <div>↑{formatSpeed(sub.info?.speed_up)}MB/s ↓{formatSpeed(sub.info?.speed_down)}MB/s</div>
                                </TableCell>
                                <TableCell className="text-xs space-y-1">
                                    <div>最后运行: <span className="text-muted-foreground">{formatLastRunTime(sub.result?.last_run)}</span></div>
                                    <div>执行时长: <span className="text-muted-foreground">{sub.result?.duration || 0}ms</span></div>
                                    <div>状态消息: <span className="text-muted-foreground">{sub.result?.msg || '无'}</span></div>
                                </TableCell>
                                <TableCell className="text-right">
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
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
} 