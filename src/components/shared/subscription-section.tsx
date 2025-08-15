import { useEffect, useMemo } from 'react'
import { Controller, Control } from 'react-hook-form'
import { Label } from '@/src/components/ui/label'
import { Badge } from '@/src/components/ui/badge'
import { useSubStore } from '@/src/store/subStore'

export function SubscriptionSection({ control, fieldName }: { control: Control<any>, fieldName: string }) {
    const subStore = useSubStore()

    const subList = useMemo(() =>
        subStore.subs.map(sub => ({ id: sub.id, name: sub.name })),
        [subStore.subs]
    )

    const isLoading = subStore.isLoading

    useEffect(() => {
        subStore.loadSubs()
    }, [subStore])

    if (isLoading) {
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
        <Controller
            name={fieldName}
            control={control}
            render={({ field }) => (
                <div className="w-full">
                    <Label htmlFor="sub_id" className="mb-2 block">
                        选择订阅
                    </Label>
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                            {subList.map(sub => {
                                const selectedSubIds = field.value || []
                                const isSelected = selectedSubIds.includes(sub.id)

                                const handleToggleSelection = (subId: number) => {
                                    if (isSelected) {
                                        field.onChange(selectedSubIds.filter((id: number) => id !== subId))
                                    } else {
                                        field.onChange([...selectedSubIds, subId])
                                    }
                                }

                                return (
                                    <Badge
                                        key={sub.id}
                                        variant={isSelected ? "default" : "outline"}
                                        className={`cursor-pointer transition-colors ${isSelected
                                            ? "hover:bg-red-100 hover:text-red-700"
                                            : "hover:bg-green-100 hover:text-green-700"
                                            }`}
                                        onClick={() => handleToggleSelection(sub.id)}
                                    >
                                        {sub.name} {isSelected ? "×" : "+"}
                                    </Badge>
                                )
                            })}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        点击订阅进行选择/取消选择，不选择则视为全选
                    </p>
                </div>
            )}
        />
    )
}