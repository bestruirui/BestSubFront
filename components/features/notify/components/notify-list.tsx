import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { formatTime } from "@/lib/utils"
import type { NotifyResponse } from "@/lib/types"

interface NotifyListProps {
    notifies: NotifyResponse[]
    isLoading: boolean
    deletingId: number | null
    testingId: number | null
    onEdit: (notify: NotifyResponse) => void
    onDelete: (id: number) => void
    onTest: (notify: NotifyResponse) => void
}

export function NotifyList({
    notifies,
    isLoading,
    deletingId,
    testingId,
    onEdit,
    onDelete,
    onTest
}: NotifyListProps) {
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>通知配置</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <Skeleton className="h-4 w-[200px]" />
                                <Skeleton className="h-4 w-[100px]" />
                                <Skeleton className="h-4 w-[150px]" />
                                <Skeleton className="h-4 w-[100px]" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (notifies.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>通知配置</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center py-8">
                        <p className="text-muted-foreground">暂无通知配置</p>
                        <p className="text-sm text-muted-foreground mt-2">
                            点击上方&ldquo;创建通知配置&rdquo;按钮开始添加
                        </p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>通知配置</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>名称</TableHead>
                            <TableHead>渠道</TableHead>
                            <TableHead>创建时间</TableHead>
                            <TableHead>更新时间</TableHead>
                            <TableHead className="text-right">操作</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {notifies.map((notify) => (
                            <TableRow key={notify.id}>
                                <TableCell className="font-medium">
                                    {notify.name}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">
                                        {notify.type}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {formatTime(notify.created_at)}
                                </TableCell>
                                <TableCell>
                                    {formatTime(notify.updated_at)}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onTest(notify)}
                                            disabled={testingId === notify.id}
                                        >
                                            {testingId === notify.id ? '测试中...' : '测试'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onEdit(notify)}
                                        >
                                            编辑
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => onDelete(notify.id)}
                                            disabled={deletingId === notify.id}
                                        >
                                            {deletingId === notify.id ? '删除中...' : '删除'}
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