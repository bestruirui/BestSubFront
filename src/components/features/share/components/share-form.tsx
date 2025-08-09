import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Switch } from "@/src/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { Separator } from "@/src/components/ui/separator"
import type { ShareRequest } from "@/src/types/share"

interface ShareFormProps {
    formData: ShareRequest
    editingShare: unknown
    isDialogOpen: boolean
    updateFormField: (field: keyof ShareRequest, value: string | boolean) => void
    updateConfigField: (field: keyof ShareRequest['config'], value: string | boolean | number | number[]) => void
    updateFilterField: <K extends keyof ShareRequest['config']['filter']>(field: K, value: ShareRequest['config']['filter'][K]) => void
    handleSubmit: (e: React.FormEvent) => void
    onOpenChange: (open: boolean) => void
}

export function ShareForm({
    formData,
    editingShare,
    isDialogOpen,
    updateFormField,
    updateConfigField,
    updateFilterField,
    handleSubmit,
    onOpenChange,
}: ShareFormProps) {
    return (
        <Dialog open={isDialogOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto scrollbar-hide">
                <DialogHeader>
                    <DialogTitle>
                        {editingShare ? "编辑分享" : "创建分享"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* 基本信息 */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">基本信息</h3>

                        <div>
                            <Label htmlFor="name" className="mb-2 block">分享名称</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => updateFormField('name', e.target.value)}
                                placeholder="输入分享名称"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="token" className="mb-2 block">访问Token</Label>
                            <Input
                                id="token"
                                value={formData.token}
                                onChange={(e) => updateFormField('token', e.target.value)}
                                placeholder="自定义token（留空则自动生成）"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                用于访问分享链接的唯一标识符
                            </p>
                        </div>

                        <div className="flex items-center justify-between">
                            <Label htmlFor="enable">启用分享</Label>
                            <Switch
                                id="enable"
                                checked={formData.enable}
                                onCheckedChange={(checked: boolean) => updateFormField('enable', checked)}
                            />
                        </div>
                    </div>

                    <Separator />

                    {/* 分享配置 */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">分享配置</h3>

                        <div>
                            <Label htmlFor="template" className="mb-2 block">订阅模板</Label>
                            <Select
                                onValueChange={(value) => updateConfigField('template', value)}
                                value={formData.config.template || 'clash'}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="选择订阅模板" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="clash">Clash</SelectItem>
                                    <SelectItem value="singbox">SingBox</SelectItem>
                                    <SelectItem value="v2ray">V2Ray</SelectItem>
                                    <SelectItem value="base64">Base64</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="max_access_count" className="mb-2 block">最大访问次数</Label>
                                <Input
                                    id="max_access_count"
                                    type="number"
                                    value={formData.config.max_access_count}
                                    onChange={(e) => updateConfigField('max_access_count', parseInt(e.target.value) || 0)}
                                    placeholder="0"
                                    min="0"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    0 表示无限制
                                </p>
                            </div>
                            <div>
                                <Label htmlFor="expires" className="mb-2 block">过期时间(小时)</Label>
                                <Input
                                    id="expires"
                                    type="number"
                                    value={formData.config.expires}
                                    onChange={(e) => updateConfigField('expires', parseInt(e.target.value) || 0)}
                                    placeholder="24"
                                    min="0"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    0 表示永不过期
                                </p>
                            </div>
                        </div>

                        <div>
                            <Label htmlFor="sub_id" className="mb-2 block">订阅ID</Label>
                            <Input
                                id="sub_id"
                                value={formData.config.sub_id.join(',')}
                                onChange={(e) => updateConfigField('sub_id', e.target.value.split(',').map(id => parseInt(id.trim())).filter(id => !isNaN(id)))}
                                placeholder="1,2,3"
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                逗号分隔的订阅ID列表
                            </p>
                        </div>
                    </div>

                    <Separator />

                    {/* 过滤器配置 */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">过滤器配置</h3>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="speed_up_more" className="mb-2 block">上传速度 &gt; (MB/s)</Label>
                                <Input
                                    id="speed_up_more"
                                    type="number"
                                    step="0.1"
                                    value={formData.config.filter.speed_up_more}
                                    onChange={(e) => updateFilterField('speed_up_more', parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                            <div>
                                <Label htmlFor="speed_down_more" className="mb-2 block">下载速度 &gt; (MB/s)</Label>
                                <Input
                                    id="speed_down_more"
                                    type="number"
                                    step="0.1"
                                    value={formData.config.filter.speed_down_more}
                                    onChange={(e) => updateFilterField('speed_down_more', parseFloat(e.target.value) || 0)}
                                    placeholder="0"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="delay_less_than" className="mb-2 block">延迟 &lt; (ms)</Label>
                                <Input
                                    id="delay_less_than"
                                    type="number"
                                    value={formData.config.filter.delay_less_than}
                                    onChange={(e) => updateFilterField('delay_less_than', parseInt(e.target.value) || 0)}
                                    placeholder="1000"
                                    min="0"
                                />
                            </div>
                            <div>
                                <Label htmlFor="risk_less_than" className="mb-2 block">风险值 &lt;</Label>
                                <Input
                                    id="risk_less_than"
                                    type="number"
                                    value={formData.config.filter.risk_less_than}
                                    onChange={(e) => updateFilterField('risk_less_than', parseInt(e.target.value) || 0)}
                                    placeholder="5"
                                    min="0"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="alive_status" className="mb-2 block">存活状态</Label>
                                <Select
                                    onValueChange={(value) => updateFilterField('alive_status', parseInt(value))}
                                    value={formData.config.filter.alive_status.toString()}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="选择存活状态" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="0">不限制</SelectItem>
                                        <SelectItem value="1">仅存活</SelectItem>
                                        <SelectItem value="2">仅失效</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <Label htmlFor="country" className="mb-2 block">国家代码</Label>
                                <Input
                                    id="country"
                                    value={formData.config.filter.country.join(',')}
                                    onChange={(e) => updateFilterField('country', e.target.value.split(',').map(code => parseInt(code.trim())).filter(code => !isNaN(code)))}
                                    placeholder="86,1,44"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                    逗号分隔的国家代码列表
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1">
                            {editingShare ? "更新" : "创建"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            取消
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
