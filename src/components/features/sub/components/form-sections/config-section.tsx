import { Controller, Control } from 'react-hook-form'
import { Label } from '@/src/components/ui/label'
import { Input } from '@/src/components/ui/input'
import { Switch } from '@/src/components/ui/switch'
import type { SubRequest } from '@/src/types/sub'

export function ConfigSection({ control }: { control: Control<SubRequest> }) {
    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="cron_expr" className="mb-2 block">更新频率</Label>
                    <Controller
                        name="cron_expr"
                        control={control}
                        rules={{ required: '请输入有效的Cron表达式' }}
                        render={({ field, fieldState }) => (
                            <>
                                <Input
                                    {...field}
                                    value={field.value || ''}
                                    id="cron_expr"
                                    placeholder="0 */6 * * *"
                                />
                                {fieldState.error && (
                                    <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                                )}
                            </>
                        )}
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="timeout" className="mb-2 block">超时时间（秒）</Label>
                    <Controller
                        name="config.timeout"
                        control={control}
                        rules={{
                            required: '请输入超时时间',
                            min: { value: 1, message: '超时时间必须大于0' },
                            max: { value: 300, message: '超时时间不能超过300秒' }
                        }}
                        render={({ field, fieldState }) => (
                            <>
                                <Input
                                    {...field}
                                    value={field.value || ''}
                                    id="timeout"
                                    type="number"
                                    placeholder="10"
                                    min="1"
                                    max="300"
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                                {fieldState.error && (
                                    <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                                )}
                            </>
                        )}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between">
                <Label htmlFor="proxy">启用代理</Label>
                <Controller
                    name="config.proxy"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            id="proxy"
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                        />
                    )}
                />
            </div>

            <div className="flex items-center justify-between">
                <Label htmlFor="enable">启用订阅</Label>
                <Controller
                    name="enable"
                    control={control}
                    render={({ field }) => (
                        <Switch
                            id="enable"
                            checked={field.value || false}
                            onCheckedChange={field.onChange}
                        />
                    )}
                />
            </div>
        </div>
    )
}