import { Controller, Control } from 'react-hook-form'
import { Label } from '@/src/components/ui/label'
import { Switch } from '@/src/components/ui/switch'
import type { SubRequest } from '@/src/types/sub'

export function ConfigSection({ control }: { control: Control<SubRequest> }) {
    return (
        <div className="space-y-4">
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