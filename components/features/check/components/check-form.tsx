/**
 * 检测表单组件
 */

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { CheckTypeConfig } from "@/lib/types/check"

interface FormData {
    name: string
    type: string
    url: string
    timeout: number
    cron_expr: string
    enable: boolean
    notify: boolean
    notify_channel: number
    log_write_file: boolean
    log_level: string
    sub_id: number[]
    config: Record<string, unknown>
}

interface CheckFormProps {
    formData: FormData
    editingCheck: unknown
    isDialogOpen: boolean
    checkTypes: string[]
    checkTypeConfigs: Record<string, CheckTypeConfig[]>
    subList: Array<{ id: number; name: string }>
    isLoadingTypes: boolean
    isLoadingConfigs: boolean
    isLoadingSubs: boolean
    setFormData: React.Dispatch<React.SetStateAction<FormData>>
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
    setFormData,
    handleTypeChange,
    handleSubmit,
    onOpenChange,
}: CheckFormProps) {
    // 验证动态配置字段是否为空
    const isConfigFieldEmpty = (configName: string, configType: string, value: unknown): boolean => {
        if (configType === 'boolean') return false // 布尔类型不需要验证
        // 如果值为undefined或空字符串，则认为是空的
        return value === undefined || value === '' || (typeof value === 'string' && value.trim() === '')
    }

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
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="输入检测任务名称"
                            required
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="timeout" className="mb-2 block">超时时间(秒)</Label>
                            <Input
                                id="timeout"
                                type="number"
                                value={formData.timeout}
                                onChange={(e) => setFormData({ ...formData, timeout: parseInt(e.target.value) || 30 })}
                                min="1"
                                max="300"
                            />
                        </div>
                        <div>
                            <Label htmlFor="cron" className="mb-2 block">检测频率</Label>
                            <Input
                                id="cron"
                                value={formData.cron_expr}
                                onChange={(e) => setFormData({ ...formData, cron_expr: e.target.value })}
                                placeholder="0 */5 * * *"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <Label htmlFor="log_write_file">写入日志文件</Label>
                            <Switch
                                id="log_write_file"
                                checked={formData.log_write_file}
                                onCheckedChange={(checked: boolean) => setFormData({ ...formData, log_write_file: checked })}
                            />
                        </div>
                        {formData.log_write_file && (
                            <div className="mt-2">
                                <Label htmlFor="log_level" className="mb-2 block">日志级别</Label>
                                <Select value={formData.log_level} onValueChange={(value) => setFormData({ ...formData, log_level: value })}>
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
                                checked={formData.notify}
                                onCheckedChange={(checked: boolean) => setFormData({ ...formData, notify: checked })}
                            />
                        </div>
                        {formData.notify && (
                            <div className="mt-2">
                                <Label htmlFor="notify_channel" className="mb-2 block">通知渠道</Label>
                                <Input
                                    id="notify_channel"
                                    type="number"
                                    value={formData.notify_channel}
                                    onChange={(e) => setFormData({ ...formData, notify_channel: parseInt(e.target.value) || 1 })}
                                    min="1"
                                />
                            </div>
                        )}

                        <div className="flex items-center justify-between">
                            <Label htmlFor="enable">启用任务</Label>
                            <Switch
                                id="enable"
                                checked={formData.enable}
                                onCheckedChange={(checked: boolean) => setFormData({ ...formData, enable: checked })}
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
                                        const isSelected = formData.sub_id.includes(sub.id)
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
                                                        // 删除订阅
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            sub_id: prev.sub_id.filter(id => id !== sub.id)
                                                        }))
                                                    } else {
                                                        // 添加订阅
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            sub_id: [...prev.sub_id, sub.id]
                                                        }))
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
                            value={formData.type}
                            onValueChange={handleTypeChange}
                            disabled={editingCheck !== null} // 编辑模式下禁用
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder={isLoadingTypes ? "加载中..." : "选择检测类型"} />
                            </SelectTrigger>
                            <SelectContent>
                                {(checkTypes || []).map(type => (
                                    <SelectItem key={type} value={type}>
                                        {type.toUpperCase()} 检测
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* 动态配置字段 */}
                    {formData.type && (
                        <div>
                            {isLoadingConfigs ? (
                                <div className="text-center py-4 text-muted-foreground">
                                    加载配置中...
                                </div>
                            ) : (checkTypeConfigs[formData.type] || []).length > 0 ? (
                                <div className="space-y-4">
                                    {(checkTypeConfigs[formData.type] || []).map((config) => (
                                        <div key={config.key}>
                                            <Label htmlFor={config.key} className="mb-2 block">
                                                {config.name}
                                                {config.require && <span className="text-red-500 ml-1">*</span>}
                                            </Label>
                                            {config.type === 'boolean' ? (
                                                <div className="flex items-center space-x-3">
                                                    <Label htmlFor={config.key}>{config.name}</Label>
                                                    <Switch
                                                        id={config.key}
                                                        checked={formData.config[config.key] as boolean || false}
                                                        onCheckedChange={(checked: boolean) =>
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                config: { ...prev.config, [config.key]: checked }
                                                            }))
                                                        }
                                                    />
                                                </div>
                                            ) : config.type === 'number' ? (
                                                <Input
                                                    id={config.key}
                                                    type="number"
                                                    value={formData.config[config.key] !== undefined ? formData.config[config.key] as string : ''}
                                                    onChange={(e) =>
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            config: { ...prev.config, [config.key]: parseFloat(e.target.value) || 0 }
                                                        }))
                                                    }
                                                    onFocus={(_e) => {
                                                        // 如果当前值是默认值且用户没有手动输入过，则清空输入框
                                                        if (formData.config[config.key] === undefined && config.default) {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                config: { ...prev.config, [config.key]: '' }
                                                            }))
                                                        }
                                                    }}
                                                    placeholder={config.default || ''}
                                                    required={config.require}
                                                    className={config.require && isConfigFieldEmpty(config.key, config.type, formData.config[config.key]) ? 'border-red-500' : ''}
                                                />
                                            ) : config.type === 'select' && config.options ? (
                                                <Select
                                                    value={formData.config[config.key] !== undefined ? formData.config[config.key] as string : ''}
                                                    onValueChange={(value) =>
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            config: { ...prev.config, [config.key]: value }
                                                        }))
                                                    }
                                                >
                                                    <SelectTrigger className={config.require && isConfigFieldEmpty(config.key, config.type, formData.config[config.key]) ? 'border-red-500' : ''}>
                                                        <SelectValue placeholder={config.default || ''} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {config.options.split(',').map(option => (
                                                            <SelectItem key={option.trim()} value={option.trim()}>
                                                                {option.trim()}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            ) : (
                                                <Input
                                                    id={config.key}
                                                    value={formData.config[config.key] !== undefined ? formData.config[config.key] as string : ''}
                                                    onChange={(e) =>
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            config: { ...prev.config, [config.key]: e.target.value }
                                                        }))
                                                    }
                                                    onFocus={(_e) => {
                                                        // 如果当前值是默认值且用户没有手动输入过，则清空输入框
                                                        if (formData.config[config.key] === undefined && config.default) {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                config: { ...prev.config, [config.key]: '' }
                                                            }))
                                                        }
                                                    }}
                                                    placeholder={config.default || ''}
                                                    required={config.require}
                                                    className={config.require && isConfigFieldEmpty(config.key, config.type, formData.config[config.key]) ? 'border-red-500' : ''}
                                                />
                                            )}
                                            {config.desc && (
                                                <p className="text-xs text-muted-foreground mt-1">{config.desc}</p>
                                            )}
                                            {config.require && isConfigFieldEmpty(config.key, config.type, formData.config[config.key]) && (
                                                <p className="text-xs text-red-500 mt-1">此字段为必填项</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-4 text-muted-foreground">
                                    选择检测类型后将显示相关配置项
                                </div>
                            )}
                        </div>
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