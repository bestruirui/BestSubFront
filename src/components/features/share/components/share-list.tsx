import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent } from "@/src/components/ui/card"
import { Table, TableBody, TableCell, TableRow } from "@/src/components/ui/table"
import { InlineLoading } from "@/src/components/ui/loading"
import { Edit, Trash2, Copy, Eye } from "lucide-react"
import StatusBadge from "@/src/components/shared/status-badge"
import type { ShareResponse } from "@/src/types/share"

interface ShareListProps {
    shares: ShareResponse[]
    isLoading: boolean
    deletingId: number | null
    isLoadingEdit?: boolean
    onEdit: (share: ShareResponse) => void
    onDelete: (id: number, name: string) => void
}

export function ShareList({
    shares,
    isLoading,
    deletingId,
    isLoadingEdit = false,
    onEdit,
    onDelete,
}: ShareListProps) {

    const handleCopyToken = async (token: string) => {
        try {
            await navigator.clipboard.writeText(token)
            // TODO: 添加 toast 提示
        } catch (error) {
            console.error('Failed to copy token:', error)
        }
    }

    const handleCopyShareUrl = async (token: string) => {
        try {
            const shareUrl = `${window.location.origin}/share/${token}`
            await navigator.clipboard.writeText(shareUrl)
            // TODO: 添加 toast 提示
        } catch (error) {
            console.error('Failed to copy share URL:', error)
        }
    }

    const getTemplateDisplay = (template: string) => {
        const templates: Record<string, string> = {
            'clash': 'Clash',
            'singbox': 'SingBox',
            'v2ray': 'V2Ray',
            'base64': 'Base64'
        }
        return templates[template] || template.toUpperCase()
    }

    const getFilterSummary = (filter: ShareResponse['config']['filter']) => {
        const conditions = []

        if (filter.speed_up_more > 0) {
            conditions.push(`上传>${filter.speed_up_more}MB/s`)
        }
        if (filter.speed_down_more > 0) {
            conditions.push(`下载>${filter.speed_down_more}MB/s`)
        }
        if (filter.delay_less_than > 0) {
            conditions.push(`延迟<${filter.delay_less_than}ms`)
        }
        if (filter.risk_less_than > 0) {
            conditions.push(`风险<${filter.risk_less_than}`)
        }
        if (filter.alive_status === 1) {
            conditions.push('仅存活')
        } else if (filter.alive_status === 2) {
            conditions.push('仅失效')
        }
        if (filter.country && filter.country.length > 0) {
            conditions.push(`国家:${filter.country.join(',')}`)
        }
        if (filter.sub_id && filter.sub_id.length > 0) {
            conditions.push(`订阅:${filter.sub_id.join(',')}`)
        }

        return conditions.length > 0 ? conditions.join(' | ') : '无过滤'
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent>
                    <InlineLoading message="加载分享列表..." />
                </CardContent>
            </Card>
        )
    }

    if (shares.length === 0) {
        return (
            <Card>
                <CardContent>
                    <div className="text-center py-8 text-muted-foreground">
                        暂无分享，点击上方按钮创建第一个分享
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
                        {shares.sort((a, b) => a.id - b.id).map((share) => (
                            <TableRow key={share.id}>
                                <TableCell className="space-y-1">
                                    <div className="font-medium">
                                        {share.name}
                                    </div>
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                        <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                                            {share.token}
                                        </span>
                                        <Button
                                            size="sm"
                                            variant="ghost"
                                            className="h-5 w-5 p-0"
                                            onClick={() => handleCopyToken(share.token)}
                                            title="复制Token"
                                        >
                                            <Copy className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </TableCell>

                                <TableCell className="space-y-2">
                                    <div className="flex flex-col gap-1">
                                        <StatusBadge status="normal" enable={share.enable} />
                                        <Badge variant="outline" className="text-xs w-fit">
                                            {getTemplateDisplay(share.config.template)}
                                        </Badge>
                                    </div>
                                </TableCell>

                                <TableCell className="text-xs space-y-1">
                                    <div>访问次数: <span className="text-muted-foreground">{share.access_count}</span></div>
                                    <div>最大访问: <span className="text-muted-foreground">
                                        {share.config.max_access_count === 0 ? '无限制' : share.config.max_access_count}
                                    </span></div>
                                    <div>过期时间: <span className="text-muted-foreground">
                                        {share.config.expires === 0 ? '永不过期' : `${share.config.expires}小时`}
                                    </span></div>
                                </TableCell>

                                <TableCell className="text-xs space-y-1">
                                    <div>订阅ID: <span className="text-muted-foreground">
                                        {share.config.sub_id && share.config.sub_id.length > 0 ? share.config.sub_id.join(', ') : '无'}
                                    </span></div>
                                    <div className="text-muted-foreground max-w-[200px] truncate" title={getFilterSummary(share.config.filter)}>
                                        过滤: {getFilterSummary(share.config.filter)}
                                    </div>
                                </TableCell>

                                <TableCell className="text-right">
                                    <div className="flex gap-1">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleCopyShareUrl(share.token)}
                                            title="复制分享链接"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => onEdit(share)}
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
                                            onClick={() => onDelete(share.id, share.name)}
                                            disabled={deletingId === share.id}
                                            className={deletingId === share.id ? 'opacity-50' : ''}
                                        >
                                            {deletingId === share.id ? (
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
