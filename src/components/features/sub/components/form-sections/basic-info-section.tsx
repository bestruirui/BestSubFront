import { Controller, Control, useController } from 'react-hook-form'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import type { SubRequest } from '@/src/types/sub'
import { generateNameFromUrl } from '../../utils'

export function BasicInfoSection({ control }: { control: Control<SubRequest> }) {
    const { field: nameField } = useController({
        name: 'name',
        control
    })

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="url" className="mb-2 block">订阅链接</Label>
                <Controller
                    name="config.url"
                    control={control}
                    rules={{
                        required: '请输入有效的订阅链接',
                        pattern: {
                            value: /^https?:\/\/.+/,
                            message: '请输入有效的URL (http:// 或 https://)'
                        }
                    }}
                    render={({ field, fieldState }) => (
                        <>
                            <Input
                                {...field}
                                value={field.value || ''}
                                id="url"
                                type="url"
                                placeholder="https://example.com/subscription"
                                onChange={(e) => {
                                    const url = e.target.value
                                    field.onChange(url)

                                    if (url && /^https?:\/\/.+/.test(url)) {
                                        if (!nameField.value || nameField.value.trim() === '') {
                                            const generatedName = generateNameFromUrl(url)
                                            if (generatedName) {
                                                nameField.onChange(generatedName)
                                            }
                                        }
                                    }
                                }}
                            />
                            {fieldState.error && (
                                <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                            )}
                        </>
                    )}
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="name" className="mb-2 block">订阅名称</Label>
                <Controller
                    name="name"
                    control={control}
                    rules={{ required: '请输入订阅名称' }}
                    render={({ field, fieldState }) => (
                        <>
                            <Input
                                {...field}
                                value={field.value || ''}
                                id="name"
                                placeholder="输入订阅名称"
                            />
                            {fieldState.error && (
                                <p className="text-xs text-red-500 mt-1">{fieldState.error.message}</p>
                            )}
                        </>
                    )}
                />
            </div>

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
        </div>
    )
} 