import { Controller, Control, useWatch } from 'react-hook-form'
import { Label } from '@/src/components/ui/label'
import { Switch } from '@/src/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { LOG_LEVELS } from '../../constants'
import type { CheckRequest } from '@/src/types/check'

export function LogConfig({ control }: { control: Control<CheckRequest> }) {
    const logWriteEnabled = useWatch({
        control,
        name: "task.log_write_file",
        defaultValue: false
    })

    return (
        <div className="space-y-4">
            <Controller
                name="task.log_write_file"
                control={control}
                render={({ field }) => (
                    <div className="flex items-center justify-between">
                        <Label htmlFor="log_write_file">写入日志文件</Label>
                        <Switch
                            id="log_write_file"
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                        />
                    </div>
                )}
            />

            {logWriteEnabled && (
                <Controller
                    name="task.log_level"
                    control={control}
                    render={({ field }) => (
                        <div className="mt-2">
                            <Label htmlFor="log_level" className="mb-2 block">
                                日志级别
                            </Label>
                            <Select
                                value={field.value}
                                onValueChange={field.onChange}
                            >
                                <SelectTrigger className="w-full">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {LOG_LEVELS.map((level) => (
                                        <SelectItem key={level.value} value={level.value}>
                                            {level.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                />
            )}
        </div>
    )
}