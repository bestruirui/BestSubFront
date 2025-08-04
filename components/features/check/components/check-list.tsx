/**
 * 检测列表组件
 */

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { InlineLoading } from "@/components/ui/loading"
import { Play, Edit, Trash2 } from "lucide-react"
import { getStatusBadgeConfig, formatCheckResultTime } from "@/lib/utils"
import type { CheckResponse } from "@/lib/types/check"

interface CheckListProps {
    checks: CheckResponse[]
    isLoading: boolean
    runningId: number | null
    deletingId: number | null
    onEdit: (check: CheckResponse) => void
    onDelete: (id: number) => void
    onRun: (id: number) => void
}

export function CheckList({
    checks,
    isLoading,
    runningId,
    deletingId,
    onEdit,
    onDelete,
    onRun,
}: CheckListProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>检测任务列表</CardTitle>
                </CardHeader>
                <CardContent>
                    <InlineLoading message="加载检测任务..." />
                </CardContent>
            </Card>
        )
    }

    if (checks.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>检测任务列表</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        暂无检测任务，点击上方按钮添加第一个任务
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>检测任务列表</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableBody>
                        {checks
                            .sort((a, b) => a.id - b.id) // 根据ID升序排序
                            .map((check) => (
                                <TableRow key={check.id}>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="font-medium">
                                                {check.name}
                                            </div>
                                            <div className="text-sm text-muted-foreground">{check.task?.cron_expr || 'N/A'}</div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-2">
                                            {(() => {
                                                const config = getStatusBadgeConfig(check.status, check.enable)
                                                return <Badge variant={config.variant} className={config.className}>{config.text}</Badge>
                                            })()}
                                            <div className="flex flex-col gap-1">
                                                <Badge variant="outline" className="text-xs w-fit">
                                                    {check.task?.type?.toUpperCase() || 'N/A'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="text-xs">
                                                超时时间: <span className="text-muted-foreground">{check.task?.timeout || 0}秒</span>
                                            </div>
                                            <div className="text-xs">
                                                通知: <span className="text-muted-foreground">{check.task?.notify ? '启用' : '禁用'}</span>
                                            </div>
                                            <div className="text-xs">
                                                日志: <span className="text-muted-foreground">{check.task?.log_write_file ? '启用' : '禁用'}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1">
                                            <div className="text-xs">
                                                最后运行: <span className="text-muted-foreground">{formatCheckResultTime(check.result?.last_run)}</span>
                                            </div>
                                            <div className="text-xs">
                                                执行时长: <span className="text-muted-foreground">{check.result?.duration || 0}ms</span>
                                            </div>
                                            <div className="text-xs">
                                                状态消息: <span className="text-muted-foreground">{check.result?.msg || '无'}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex gap-1 justify-end">
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onRun(check.id)}
                                                disabled={!check.enable || check.status === 'running' || runningId === check.id}
                                                className={runningId === check.id ? 'opacity-50' : ''}
                                            >
                                                <Play className={`h-4 w-4 ${runningId === check.id ? 'animate-spin' : ''}`} />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onEdit(check)}
                                            >
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => onDelete(check.id)}
                                                disabled={deletingId === check.id}
                                                className={deletingId === check.id ? 'opacity-50' : ''}
                                            >
                                                {deletingId === check.id ? (
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