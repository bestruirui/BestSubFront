"use client"

import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table"
import { InlineLoading } from "@/components/ui/loading"
import { Plus, RefreshCw, Edit, Trash2 } from "lucide-react"
import { dashboardApi } from "@/lib/api-client"
import { useAuth } from "@/components/providers/auth-provider"
import { formatTime, validateTimeout, validateUrl, validateCronExpr, validateSubscriptionForm, getNextCronRunTime, formatDuration, getStatusBadgeConfig } from "@/lib/utils"
import type { SubResponse, SubCreateRequest } from "@/lib/types"

export function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSubscription, setEditingSubscription] = useState<SubResponse | null>(null)
  const [refreshingId, setRefreshingId] = useState<number | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [detailSubscription, setDetailSubscription] = useState<SubResponse | null>(null)
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false)
  const { user } = useAuth()

  const getToken = () => localStorage.getItem('access_token')

  const [formData, setFormData] = useState<SubCreateRequest>({
    name: "",
    enable: true,
    cron_expr: "0 */6 * * *",
    config: {
      url: "",
      proxy: false,
      timeout: 10,
      type: 'auto',
    },
  })

  // 优化的表单更新函数
  const updateFormField = useCallback((field: keyof SubCreateRequest, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }, [])

  const updateConfigField = useCallback((field: keyof SubCreateRequest['config'], value: string | boolean | number) => {
    setFormData(prev => ({
      ...prev,
      config: { ...prev.config, [field]: value }
    }))
  }, [])

  const loadSubscriptions = useCallback(async () => {
    if (!user) return

    try {
      const token = getToken()
      if (!token) return

      const data = await dashboardApi.getSubscriptions(token)
      setSubscriptions(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load subscriptions:', error)
      setSubscriptions([])
    } finally {
      setIsLoading(false)
    }
  }, [user])

  useEffect(() => {
    loadSubscriptions()
  }, [loadSubscriptions])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validation = validateSubscriptionForm(formData)
    if (!validation.isValid) {
      alert(validation.errors.join('\n'))
      return
    }

    const token = getToken()
    if (!token) {
      alert('请先登录')
      return
    }

    try {
      if (editingSubscription) {
        await dashboardApi.updateSubscription(editingSubscription.id, formData, token)
      } else {
        await dashboardApi.createSubscription(formData, token)
      }

      setIsDialogOpen(false)
      setEditingSubscription(null)
      resetForm()
      await loadSubscriptions()
    } catch (error) {
      console.error('Failed to save subscription:', error)
      alert('保存失败，请重试')
    }
  }

  const handleEdit = (subscription: SubResponse) => {
    setEditingSubscription(subscription)
    setFormData({
      name: subscription.name,
      enable: subscription.enable,
      cron_expr: subscription.cron_expr,
      config: {
        url: subscription.config.url || "",
        proxy: subscription.config.proxy || false,
        timeout: subscription.config.timeout || 10,
        type: subscription.config.type || 'auto',
      },
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这个订阅吗？')) return

    const token = getToken()
    if (!token) return

    setDeletingId(id)
    try {
      await dashboardApi.deleteSubscription(id, token)
      await loadSubscriptions()
    } catch (error) {
      console.error('Failed to delete subscription:', error)
    } finally {
      setDeletingId(null)
    }
  }

  const handleRefresh = async (id: number) => {
    const token = getToken()
    if (!token) return

    setRefreshingId(id)
    try {
      await dashboardApi.refreshSubscription(id, token)
      await loadSubscriptions()
    } catch (error) {
      console.error('Failed to refresh subscription:', error)
    } finally {
      setRefreshingId(null)
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      enable: true,
      cron_expr: "0 */6 * * *",
      config: {
        url: "",
        proxy: false,
        timeout: 10,
        type: 'auto',
      },
    })
  }

  const openCreateDialog = () => {
    setEditingSubscription(null)
    resetForm()
    setIsDialogOpen(true)
  }

  const showDetail = (subscription: SubResponse) => {
    setDetailSubscription(subscription)
    setIsDetailDialogOpen(true)
  }

  const formatLastRun = useCallback((lastRun: string | undefined) => {
    const formattedTime = formatTime(lastRun)
    if (!formattedTime) {
      return <span className="text-muted-foreground">从未运行</span>
    }
    return <div className="text-sm">{formattedTime}</div>
  }, [])

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold">订阅管理</h1>
          <p className="text-muted-foreground">管理您的订阅链接</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              添加订阅
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSubscription ? "编辑订阅" : "添加订阅"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Label htmlFor="name" className="mb-2 block">订阅名称</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => updateFormField('name', e.target.value)}
                  placeholder="输入订阅名称"
                  required
                />
              </div>

              <div>
                <Label htmlFor="url" className="mb-2 block">订阅链接</Label>
                <Input
                  id="url"
                  type="url"
                  value={formData.config.url}
                  onChange={(e) => updateConfigField('url', e.target.value)}
                  placeholder="https://example.com/subscription"
                  required
                  className={!validateUrl(formData.config.url) ? 'border-red-500' : ''}
                />
                {formData.config.url && !validateUrl(formData.config.url) && (
                  <p className="text-xs text-red-500 mt-1">请输入有效的URL (http:// 或 https://)</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cron" className="mb-2 block">更新频率 (Cron)</Label>
                  <Input
                    id="cron"
                    value={formData.cron_expr}
                    onChange={(e) => updateFormField('cron_expr', e.target.value)}
                    placeholder="0 */6 * * *"
                    className={!validateCronExpr(formData.cron_expr) ? 'border-red-500' : ''}
                  />
                  {formData.cron_expr && !validateCronExpr(formData.cron_expr) && (
                    <p className="text-xs text-red-500 mt-1">请输入有效的Cron表达式 (例如: 0 */6 * * *)</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    默认每6小时更新一次
                  </p>
                </div>

                <div>
                  <Label htmlFor="timeout" className="mb-2 block">超时时间 (秒)</Label>
                  <Input
                    id="timeout"
                    type="number"
                    value={formData.config.timeout}
                    onChange={(e) => updateConfigField('timeout', validateTimeout(e.target.value))}
                    placeholder="10"
                    min="1"
                    max="300"
                  />
                  {((formData.config.timeout || 0) < 1 || (formData.config.timeout || 0) > 300) && (
                    <p className="text-xs text-red-500 mt-1">请输入1-300之间的数字</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2">
                    默认10秒
                  </p>
                </div>
              </div>

              <div className="w-full">
                <Label htmlFor="type" className="mb-2 block">订阅类型</Label>
                <Select onValueChange={(value) => updateConfigField('type', value)} value={formData.config.type || 'auto'}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="选择订阅类型" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">自动检测</SelectItem>
                    <SelectItem value="clash">Clash</SelectItem>
                    <SelectItem value="singbox">SingBox</SelectItem>
                    <SelectItem value="base64">Base64</SelectItem>
                    <SelectItem value="v2ray">V2Ray</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  默认自动检测订阅类型
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="proxy">使用代理</Label>
                  <Switch
                    id="proxy"
                    checked={formData.config.proxy || false}
                    onCheckedChange={(checked: boolean) => updateConfigField('proxy', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="enable">启用订阅</Label>
                  <Switch
                    id="enable"
                    checked={formData.enable}
                    onCheckedChange={(checked: boolean) => updateFormField('enable', checked)}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingSubscription ? "更新" : "创建"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  取消
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* 详情弹窗 */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>订阅详情 - {detailSubscription?.name}</DialogTitle>
          </DialogHeader>
          {detailSubscription && (
            <div className="space-y-6">
              {/* 基本信息 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">基本信息</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-muted-foreground">ID:</span> {detailSubscription.id}</div>
                    <div><span className="text-muted-foreground">名称:</span> {detailSubscription.name}</div>
                    <div><span className="text-muted-foreground">启用:</span> {detailSubscription.enable ? '是' : '否'}</div>
                    <div><span className="text-muted-foreground">Cron:</span> {detailSubscription.cron_expr}</div>
                    <div><span className="text-muted-foreground">状态:</span> {
                      (() => {
                        const config = getStatusBadgeConfig(detailSubscription.status, detailSubscription.enable)
                        return <Badge variant={config.variant} className={config.className}>{config.text}</Badge>
                      })()
                    }</div>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">时间信息</h3>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-muted-foreground">创建时间:</span> {formatTime(detailSubscription.created_at) || '未知'}</div>
                    <div><span className="text-muted-foreground">更新时间:</span> {formatTime(detailSubscription.updated_at) || '未知'}</div>
                    <div><span className="text-muted-foreground">最后运行:</span> {formatTime(detailSubscription.result?.last_run) || '从未运行'}</div>
                    <div><span className="text-muted-foreground">下次运行:</span> {getNextCronRunTime(detailSubscription.cron_expr, detailSubscription.enable) || '未启用或无法计算'}</div>
                    {detailSubscription.result?.duration && (
                      <div><span className="text-muted-foreground">运行耗时:</span> {formatDuration(detailSubscription.result.duration)}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* 配置信息 */}
              <div>
                <h3 className="font-semibold mb-2">配置信息</h3>
                <div className="space-y-3 text-sm">
                  <div><span className="text-muted-foreground">订阅链接:</span> {detailSubscription.config.url}</div>
                  <div className="grid grid-cols-2 gap-4">
                    <div><span className="text-muted-foreground">订阅类型:</span> {detailSubscription.config.type?.toUpperCase() || 'AUTO'}</div>
                    <div><span className="text-muted-foreground">使用代理:</span> {detailSubscription.config.proxy ? '是' : '否'}</div>
                    <div><span className="text-muted-foreground">超时时间:</span> {detailSubscription.config.timeout || 10}秒</div>
                  </div>
                </div>
              </div>

              {/* 节点信息 */}
              <div>
                <h3 className="font-semibold mb-2">节点信息</h3>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="space-y-2">
                    <div><span className="text-muted-foreground">原始节点:</span> <span className="font-medium">{detailSubscription.node_info?.raw_count || 0}</span></div>
                    <div><span className="text-muted-foreground">存活节点:</span> <span className="font-medium text-green-600">{detailSubscription.node_info?.alive_count || 0}</span></div>
                  </div>
                  <div className="space-y-2">
                    <div><span className="text-muted-foreground">上行速度:</span> {((detailSubscription.node_info?.speed_up || 0) / 1024 / 1024).toFixed(2)} MB/s</div>
                    <div><span className="text-muted-foreground">下行速度:</span> {((detailSubscription.node_info?.speed_down || 0) / 1024 / 1024).toFixed(2)} MB/s</div>
                  </div>
                  <div className="space-y-2">
                    <div><span className="text-muted-foreground">平均延迟:</span> {detailSubscription.node_info?.delay || 0} ms</div>
                    <div><span className="text-muted-foreground">风险等级:</span>
                      <span className={`font-medium ml-1 ${detailSubscription.node_info?.risk === 0 ? 'text-green-600' : detailSubscription.node_info?.risk && detailSubscription.node_info.risk <= 3 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {detailSubscription.node_info?.risk || 0}/10
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
                    <div><span className="text-muted-foreground">成功次数:</span> <span className="text-green-600 font-medium">{detailSubscription.result?.success || 0}</span></div>
                    <div><span className="text-muted-foreground">失败次数:</span> <span className="text-red-600 font-medium">{detailSubscription.result?.fail || 0}</span></div>
                    <div><span className="text-muted-foreground">原始节点数:</span> {detailSubscription.result?.raw_count || 0}</div>
                    <div><span className="text-muted-foreground">去重节点数:</span> {detailSubscription.result?.count || 0}</div>
                  </div>
                  <div>
                    <div><span className="text-muted-foreground">运行消息:</span></div>
                    <div className="mt-1 p-2 bg-gray-50 rounded text-xs max-h-20 overflow-y-auto">
                      {detailSubscription.result?.msg || '无消息'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>订阅列表</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <InlineLoading message="加载订阅列表..." />
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                暂无订阅，点击上方按钮添加第一个订阅
              </div>
            ) : (
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
                              onClick={() => showDetail(sub)}
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
                              ↑{((sub.node_info?.speed_up || 0) / 1024 / 1024).toFixed(1)}MB/s
                              ↓{((sub.node_info?.speed_down || 0) / 1024 / 1024).toFixed(1)}MB/s
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
                              onClick={() => handleRefresh(sub.id)}
                              disabled={!sub.enable || refreshingId === sub.id}
                              className={refreshingId === sub.id ? 'opacity-50' : ''}
                            >
                              <RefreshCw className={`h-4 w-4 ${refreshingId === sub.id ? 'animate-spin' : ''}`} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(sub)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(sub.id)}
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
