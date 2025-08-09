import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { validateTimeout, validateUrl, validateCronExpr } from "@/lib/utils"
import type { SubRequest } from "@/lib/types/sub"

interface SubscriptionFormProps {
    formData: SubRequest
    editingSubscription: unknown
    isDialogOpen: boolean
    updateFormField: (field: keyof SubRequest, value: string | boolean) => void
    updateConfigField: (field: keyof SubRequest['config'], value: string | boolean | number) => void
    handleSubmit: (e: React.FormEvent) => void
    onOpenChange: (open: boolean) => void
}

export function SubscriptionForm({
    formData,
    editingSubscription,
    isDialogOpen,
    updateFormField,
    updateConfigField,
    handleSubmit,
    onOpenChange,
}: SubscriptionFormProps) {
    return (
        <Dialog open={isDialogOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-hide">
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
                            <Label htmlFor="timeout" className="mb-2 block">超时时间(秒)</Label>
                            <Input
                                id="timeout"
                                type="number"
                                value={formData.config.timeout}
                                onChange={(e) => updateConfigField('timeout', validateTimeout(e.target.value))}
                                placeholder="10"
                                min="1"
                                max="300"
                            />
                        </div>
                        <div>
                            <Label htmlFor="cron" className="mb-2 block">更新频率</Label>
                            <Input
                                id="cron"
                                value={formData.cron_expr}
                                onChange={(e) => updateFormField('cron_expr', e.target.value)}
                                placeholder="0 */6 * * *"
                                className={!validateCronExpr(formData.cron_expr) ? 'border-red-500' : ''}
                            />
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