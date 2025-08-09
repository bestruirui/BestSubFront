import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { DynamicConfigForm } from "@/components/ui/dynamic-config-form"
import { validateTimeout, validateCronExpr } from "@/lib/utils"
import type { CheckResponse, CheckRequest } from "@/lib/types/check"
import type { DynamicConfigItem } from "@/lib/types/common"
import type { SubNameAndID } from "@/lib/types/sub"

interface CheckFormProps {
    formData: CheckRequest
    editingCheck: CheckResponse | null
    isDialogOpen: boolean
    checkTypes: string[]
    checkTypeConfigs: Record<string, DynamicConfigItem[]>
    subList: SubNameAndID[]
    isLoadingTypes: boolean
    isLoadingConfigs: boolean
    isLoadingSubs: boolean
    updateFormField: (field: string, value: any) => void
    updateConfigField: (field: string, value: unknown) => void
    handleTypeChange: (type: string) => Promise<void>
    handleSubmit: (e: React.FormEvent) => void
    onOpenChange: (open: boolean) => void
}

export function CheckForm({
    formData,
    editingCheck,
    isDialogOpen,
    checkTypes,
    checkTypeConfigs,
    subList,
    isLoadingTypes,
    isLoadingConfigs,
    isLoadingSubs,
    updateFormField,
    updateConfigField,
    handleTypeChange,
    handleSubmit,
    onOpenChange,
}: CheckFormProps) {
    return (
        <Dialog open={isDialogOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-hide">
                <DialogHeader>
                    <DialogTitle>
                        {editingCheck ? "编辑检测任务" : "添加检测任务"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <Label htmlFor="name" className="mb-2 block">任务名称</Label>
                        <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => updateFormField('name', e.target.value)}
                            placeholder="请输入检测任务名称"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="timeout" className="mb-2 block">超时时间(秒)</Label>
                            <Input
                                id="timeout"
                                type="number"
                                value={formData.task.timeout}
                                onChange={(e) => updateFormField('task.timeout', validateTimeout(e.target.value))}
                                placeholder="30"
                                min="1"
                                max="300"
                            />
                        </div>
                        <div>
                            <Label htmlFor="cron" className="mb-2 block">检测频率</Label>
                            <Input
                                id="cron"
                                value={formData.task.cron_expr}
                                onChange={(e) => updateFormField('task.cron_expr', e.target.value)}
                                placeholder="0 */5 * * *"
                                className={!validateCronExpr(formData.task.cron_expr) ? 'border-red-500' : ''}
                            />
                            {formData.task.cron_expr && !validateCronExpr(formData.task.cron_expr) && (
                                <p className="text-xs text-red-500 mt-1">请输入有效的Cron表达式</p>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="log_write_file">写入日志文件</Label>
                            <Switch
                                id="log_write_file"
                                checked={formData.task.log_write_file}
                                onCheckedChange={(checked: boolean) => updateFormField('task.log_write_file', checked)}
                            />
                        </div>
                        {formData.task.log_write_file && (
                            <div className="mt-2">
                                <Label htmlFor="log_level" className="mb-2 block">日志级别</Label>
                                <Select value={formData.task.log_level} onValueChange={(value) => updateFormField('task.log_level', value)}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="debug">Debug</SelectItem>
                                        <SelectItem value="info">Info</SelectItem>
                                        <SelectItem value="warn">Warn</SelectItem>
                                        <SelectItem value="error">Error</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <Label htmlFor="notify">启用通知</Label>
                            <Switch
                                id="notify"
                                checked={formData.task.notify}
                                onCheckedChange={(checked: boolean) => updateFormField('task.notify', checked)}
                            />
                        </div>
                        {formData.task.notify && (
                            <div className="mt-2">
                                <Label htmlFor="notify_channel" className="mb-2 block">通知渠道</Label>
                                <Input
                                    id="notify_channel"
                                    type="number"
                                    value={formData.task.notify_channel}
                                    onChange={(e) => updateFormField('task.notify_channel', parseInt(e.target.value) || 1)}
                                    min="1"
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <Label htmlFor="enable">启用任务</Label>
                            <Switch
                                id="enable"
                                checked={formData.enable}
                                onCheckedChange={(checked: boolean) => updateFormField('enable', checked)}
                            />
                        </div>
                    </div>

                    <div className="w-full">
                        <Label htmlFor="sub_id" className="mb-2 block">选择订阅</Label>
                        {isLoadingSubs ? (
                            <div className="text-center py-4 text-muted-foreground">
                                <p className="text-sm">加载订阅中...</p>
                            </div>
                        ) : (subList || []).length > 0 ? (
                            <div className="space-y-2">
                                <div className="flex flex-wrap gap-2">
                                    {(subList || []).map(sub => {
                                        const isSelected = formData.task.sub_id.includes(sub.id)
                                        return (
                                            <Badge
                                                key={sub.id}
                                                variant={isSelected ? "default" : "outline"}
                                                className={`cursor-pointer transition-colors ${isSelected
                                                    ? "hover:bg-red-100 hover:text-red-700"
                                                    : "hover:bg-green-100 hover:text-green-700"
                                                    }`}
                                                onClick={() => {
                                                    if (isSelected) {
                                                        updateFormField('task.sub_id', formData.task.sub_id.filter(id => id !== sub.id))
                                                    } else {
                                                        updateFormField('task.sub_id', [...formData.task.sub_id, sub.id])
                                                    }
                                                }}
                                            >
                                                {sub.name} {isSelected ? "×" : "+"}
                                            </Badge>
                                        )
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-4 text-muted-foreground">
                                <p className="text-sm">暂无可用订阅</p>
                            </div>
                        )}
                        <p className="text-xs text-muted-foreground mt-2">
                            点击订阅进行选择/取消选择，已选择的订阅会高亮显示
                        </p>
                    </div>

                    <div className="w-full">
                        <Label htmlFor="type" className="mb-2 block">检测类型</Label>
                        <Select
                            value={formData.task.type}
                            onValueChange={handleTypeChange}
                            disabled={editingCheck !== null}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={isLoadingTypes ? "加载中..." : "选择检测类型"} />
                            </SelectTrigger>
                            <SelectContent>
                                {editingCheck && formData.task.type && !checkTypes.includes(formData.task.type) && (
                                    <SelectItem value={formData.task.type}>
                                        {formData.task.type.toUpperCase()} 检测
                                    </SelectItem>
                                )}
                                {(checkTypes || []).map(type => (
                                    <SelectItem key={type} value={type}>
                                        {type.toUpperCase()} 检测
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {formData.task.type && (
                        <DynamicConfigForm
                            configs={checkTypeConfigs[formData.task.type] || []}
                            configValues={formData.config}
                            onConfigChange={updateConfigField}
                            isLoading={isLoadingConfigs}
                            typeName="检测类型"
                        />
                    )}

                    <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1">
                            {editingCheck ? "更新" : "创建"}
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