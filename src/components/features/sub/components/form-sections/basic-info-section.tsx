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
        </div>
    )
} 