/**
 * 订阅详情组件
 */

import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatTime, getNextCronRunTime, formatDuration, getStatusBadgeConfig } from "@/lib/utils"
import type { SubResponse } from "@/lib/types/subscription"

interface SubscriptionDetailProps {
    subscription: SubResponse | null
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

export function SubscriptionDetail({
    subscription,
    isOpen,
    onOpenChange,
}: SubscriptionDetailProps) {
    if (!subscription) return null

    const formatSpeed = (speed: number) => ((speed || 0) / 1024 / 1024).toFixed(2)
    const getRiskColor = (risk: number) => {
        if (risk === 0) return 'text-green-600'
        if (risk <= 3) return 'text-yellow-600'
        return 'text-red-600'
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>订阅详情 - {subscription.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                    {/* 基本信息 */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <h3 className="font-semibold mb-2">基本信息</h3>
                            <div className="space-y-2 text-sm">
                                <div><span className="text-muted-foreground">ID:</span> {subscription.id}</div>
                                <div><span className="text-muted-foreground">名称:</span> {subscription.name}</div>
                                <div><span className="text-muted-foreground">启用:</span> {subscription.enable ? '是' : '否'}</div>
                                <div><span className="text-muted-foreground">Cron:</span> {subscription.cron_expr}</div>
                                <div><span className="text-muted-foreground">状态:</span> {
                                    (() => {
                                        const config = getStatusBadgeConfig(subscription.status, subscription.enable)
                                        return <Badge variant={config.variant} className={config.className}>{config.text}</Badge>
                                    })()
                                }</div>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2">时间信息</h3>
                            <div className="space-y-2 text-sm">
                                <div><span className="text-muted-foreground">创建时间:</span> {formatTime(subscription.created_at) || '未知'}</div>
                                <div><span className="text-muted-foreground">更新时间:</span> {formatTime(subscription.updated_at) || '未知'}</div>
                                <div><span className="text-muted-foreground">最后运行:</span> {formatTime(subscription.result?.last_run) || '从未运行'}</div>
                                <div><span className="text-muted-foreground">下次运行:</span> {getNextCronRunTime(subscription.cron_expr, subscription.enable) || '未启用或无法计算'}</div>
                                {subscription.result?.duration && (
                                    <div><span className="text-muted-foreground">运行耗时:</span> {formatDuration(subscription.result.duration)}</div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 配置信息 */}
                    <div>
                        <h3 className="font-semibold mb-2">配置信息</h3>
                        <div className="space-y-3 text-sm">
                            <div><span className="text-muted-foreground">订阅链接:</span> {subscription.config.url}</div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><span className="text-muted-foreground">订阅类型:</span> {subscription.config.type?.toUpperCase() || 'AUTO'}</div>
                                <div><span className="text-muted-foreground">使用代理:</span> {subscription.config.proxy ? '是' : '否'}</div>
                                <div><span className="text-muted-foreground">超时时间:</span> {subscription.config.timeout || 10}秒</div>
                            </div>
                        </div>
                    </div>

                    {/* 节点信息 */}
                    <div>
                        <h3 className="font-semibold mb-2">节点信息</h3>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                            <div className="space-y-2">
                                <div><span className="text-muted-foreground">原始节点:</span> <span className="font-medium">{subscription.node_info?.raw_count || 0}</span></div>
                                <div><span className="text-muted-foreground">存活节点:</span> <span className="font-medium text-green-600">{subscription.node_info?.alive_count || 0}</span></div>
                            </div>
                            <div className="space-y-2">
                                <div><span className="text-muted-foreground">上行速度:</span> {formatSpeed(subscription.node_info?.speed_up)} MB/s</div>
                                <div><span className="text-muted-foreground">下行速度:</span> {formatSpeed(subscription.node_info?.speed_down)} MB/s</div>
                            </div>
                            <div className="space-y-2">
                                <div><span className="text-muted-foreground">平均延迟:</span> {subscription.node_info?.delay || 0} ms</div>
                                <div><span className="text-muted-foreground">风险等级:</span>
                                    <span className={`font-medium ml-1 ${getRiskColor(subscription.node_info?.risk || 0)}`}>
                                        {subscription.node_info?.risk || 0}/10
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 执行结果 */}
                    <div>
                        <h3 className="font-semibold mb-2">执行结果</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="space-y-2">
                                <div><span className="text-muted-foreground">成功次数:</span> <span className="text-green-600 font-medium">{subscription.result?.success || 0}</span></div>
                                <div><span className="text-muted-foreground">失败次数:</span> <span className="text-red-600 font-medium">{subscription.result?.fail || 0}</span></div>
                                <div><span className="text-muted-foreground">原始节点数:</span> {subscription.result?.raw_count || 0}</div>
                                <div><span className="text-muted-foreground">去重节点数:</span> {subscription.result?.count || 0}</div>
                            </div>
                            <div>
                                <div><span className="text-muted-foreground">运行消息:</span></div>
                                <div className="mt-1 p-2 bg-gray-50 rounded text-xs max-h-20 overflow-y-auto">
                                    {subscription.result?.msg || '无消息'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
} 