import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/src/components/ui/table"
import { InlineLoading } from "@/src/components/ui/loading"
import { Play, Edit, Trash2 } from "lucide-react"
import { formatLastRunTime } from "@/src/utils"
import StatusBadge from "@/src/components/shared/status-badge"
import type { CheckResponse } from "@/src/types/check"

interface CheckListProps {
    checks: CheckResponse[]
    isLoading: boolean
    runningId: number | null
    deletingId: number | null
    isLoadingEdit?: boolean
    onEdit: (check: CheckResponse) => void
    onDelete: (id: number, name: string) => void
    onRun: (id: number) => void
}

export function CheckList({
    checks,
    isLoading,
    runningId,
    deletingId,
    isLoadingEdit = false,
    onEdit,
    onDelete,
    onRun,
}: CheckListProps) {
    if (isLoading) {
        return (
            <Card>
                <CardContent>
                    <InlineLoading message="加载检测任务..." />
                </CardContent>
            </Card>
        )
    }

    if (checks.length === 0) {
        return (
            <Card>
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
            <CardContent>
                <Table>
                    <TableBody>
                        {checks.sort((a, b) => a.id - b.id).map((check) => (
                            <TableRow key={check.id}>
                                <TableCell className="space-y-1">
                                    <div className="font-medium">
                                        {check.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground">{check.task?.cron_expr || 'N/A'}</div>
                                </TableCell>
                                <TableCell className="space-y-2 flex flex-col">
                                    <StatusBadge status={check.status} enable={check.enable} />
                                    <Badge variant="outline" className="text-xs w-fit">
                                        {check.task?.type?.toUpperCase() || 'N/A'}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-xs space-y-1">
                                    <div>超时时间: <span className="text-muted-foreground">{check.task?.timeout || 0}秒</span> </div>
                                    <div>通知: <span className="text-muted-foreground">{check.task?.notify ? '启用' : '禁用'}</span></div>
                                    <div>日志: <span className="text-muted-foreground">{check.task?.log_write_file ? '启用' : '禁用'}</span></div>
                                </TableCell>
                                <TableCell className="text-xs space-y-1" >
                                    <div>最后运行: <span className="text-muted-foreground">{formatLastRunTime(check.result?.last_run)}</span></div>
                                    <div>执行时长: <span className="text-muted-foreground">{check.result?.duration || 0}ms</span></div>
                                    <div>状态消息: <span className="text-muted-foreground">{check.result?.msg || '无'}</span></div>
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onRun(check.id)}
                                        disabled={check.status === 'running' || runningId === check.id}
                                        className={runningId === check.id ? 'opacity-50' : ''}
                                    >
                                        <Play className={`h-4 w-4 ${runningId === check.id ? 'animate-spin' : ''}`} />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => onEdit(check)}
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
                                        onClick={() => onDelete(check.id, check.name)}
                                        disabled={deletingId === check.id}
                                        className={deletingId === check.id ? 'opacity-50' : ''}
                                    >
                                        {deletingId === check.id ? (
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