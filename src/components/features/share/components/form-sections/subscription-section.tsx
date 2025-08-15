import { useEffect, useMemo } from 'react'
import { Controller, Control } from 'react-hook-form'
import { Label } from '@/src/components/ui/label'
import { useSubStore } from '@/src/store/subStore'
import type { ShareRequest, SubNameAndID } from '@/src/types'

interface SubscriptionSectionProps {
    control: Control<ShareRequest>
}

export function SubscriptionSection({ control }: SubscriptionSectionProps) {
    const subStore = useSubStore()

    const subList = useMemo(() =>
        subStore.subs.map(sub => ({ id: sub.id, name: sub.name })),
        [subStore.subs]
    )

    const isLoadingSubs = subStore.isLoading

    useEffect(() => {
        subStore.loadSubs()
    }, [subStore])

    if (isLoadingSubs) {
        return (
            <div className="w-full">
                <Label className="mb-2 block">选择订阅</Label>
                <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">加载订阅中...</p>
                </div>
            </div>
        )
    }

    if (subList.length === 0) {
        return (
            <div className="w-full">
                <Label className="mb-2 block">选择订阅</Label>
                <div className="text-center py-4 text-muted-foreground">
                    <p className="text-sm">暂无可用订阅</p>
                </div>
            </div>
        )
    }

    return (
        <div className="w-full">
            <Label htmlFor="sub_id" className="mb-2 block">
                选择订阅
            </Label>
            <Controller
                name="gen.filter.sub_id"
                control={control}
                render={({ field }) => (
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                            {subList.map((sub: SubNameAndID) => {
                                const selected = (field.value || []).includes(sub.id)
                                return (
                                    <span
                                        key={sub.id}
                                        className={`inline-flex items-center rounded-md border px-2 py-1 text-xs cursor-pointer transition-colors ${selected
                                                ? 'bg-primary text-primary-foreground border-primary hover:bg-red-100 hover:text-red-700'
                                                : 'bg-background text-foreground hover:bg-green-100 hover:text-green-700'
                                            }`}
                                        onClick={() => {
                                            if (selected) {
                                                field.onChange(field.value.filter((id: number) => id !== sub.id))
                                            } else {
                                                field.onChange([...field.value, sub.id])
                                            }
                                        }}
                                    >
                                        {sub.name} {selected ? '×' : '+'}
                                    </span>
                                )
                            })}
                        </div>
                    </div>
                )}
            />
            <p className="text-xs text-muted-foreground mt-2">
                点击订阅进行选择/取消选择，不选择则视为全选
            </p>
        </div>
    )
}