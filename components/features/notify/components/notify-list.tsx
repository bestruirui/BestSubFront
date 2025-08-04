import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import type { NotifyResponse } from "@/lib/types"
import { Play, Edit, Trash2 } from "lucide-react"

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
                    <TableBody>
                        {notifies.map((notify) => (
                            <TableRow key={notify.id}>
                                <TableCell className="font-medium">
                                    {notify.name}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {notify.type}
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex justify-end space-x-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onTest(notify)}
                                            disabled={testingId === notify.id}
                                        >
                                            <Play className={`h-4 w-4 ${testingId === notify.id ? 'animate-spin' : ''}`} />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onEdit(notify)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onDelete(notify.id)}
                                            className={deletingId === notify.id ? 'opacity-50' : ''}
                                        >
                                            {deletingId === notify.id ? (
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