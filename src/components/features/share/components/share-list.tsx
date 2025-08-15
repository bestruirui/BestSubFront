import { useMemo } from 'react'
import { Card, CardContent } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/src/components/ui/table"
import { InlineLoading } from "@/src/components/ui/loading"
import StatusBadge from "@/src/components/shared/status-badge"
import { Button } from "@/src/components/ui/button"
import { Edit, Trash2, Copy } from "lucide-react"
import { useShareStore } from "@/src/store/shareStore"
import { useShareOperations } from "../hooks"
import { formatAccessCount, formatExpiresTime } from "../utils"
import { UI_TEXT } from "../constants"
import type { ShareResponse } from "@/src/types/share"

interface ShareListProps {
    onEdit: (share: ShareResponse) => void
    openCopyDialog: (fullUrl: string) => void
}

export function ShareList({ onEdit, openCopyDialog }: ShareListProps) {
    const shareStore = useShareStore()
    const { shares, isLoading } = shareStore
    const { handleDelete, handleCopy } = useShareOperations()

    // 按 ID 排序的分享列表
    const sortedShares = useMemo(() =>
        [...shares].sort((a, b) => a.id - b.id),
        [shares]
    )

    const onCopyClick = (token: string) => {
        handleCopy(token, openCopyDialog)
    }

    const onDeleteClick = (id: number, name: string) => {
        handleDelete(id, name)
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent>
                    <InlineLoading message={UI_TEXT.LOADING + '分享列表...'} />
                </CardContent>
            </Card>
        )
    }

    if (shares.length === 0) {
        return (
            <Card>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        {UI_TEXT.NO_DATA}，点击上方按钮创建第一个分享
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
                        {sortedShares.map((share) => (
                            <TableRow key={share.id}>
                                <TableCell className="space-y-1">
                                    <div className="font-medium">
                                        {share.name}
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <StatusBadge
                                        status={share.enable ? 'enable' : 'disable'}
                                        enable={share.enable}
                                    />
                                </TableCell>

                                <TableCell>
                                    <div>
                                        访问: <span className="text-muted-foreground">
                                            {formatAccessCount(share.access_count, share.max_access_count)}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell>
                                    <div>
                                        过期日期: <span className="text-muted-foreground">
                                            {formatExpiresTime(share.expires)}
                                        </span>
                                    </div>
                                </TableCell>

                                <TableCell className="text-right">
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onCopyClick(share.token)}
                                            title={UI_TEXT.COPY}
                                        >
                                            <Copy className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => onEdit(share)}
                                            title="编辑"
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>

                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onDeleteClick(share.id, share.name)}
                                            title={UI_TEXT.DELETE}
                                        >
                                            <Trash2 className="h-4 w-4" />
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
