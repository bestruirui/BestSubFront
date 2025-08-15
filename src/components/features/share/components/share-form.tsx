import { Button } from "@/src/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { useShareForm } from "../hooks"
import { UI_TEXT } from "../constants"
import {
    BasicInfoSection,
    ConfigSection,
    FilterSection
} from "./form-sections"
import { SubscriptionSection } from "@/src/components/shared/subscription-section"
import type { ShareRequest } from "@/src/types"

interface ShareFormProps {
    initialData?: ShareRequest
    formTitle: string
    isOpen: boolean
    onClose: () => void
    editingShareId?: number | undefined
}

export function ShareForm({
    initialData,
    formTitle,
    isOpen,
    onClose,
    editingShareId,
}: ShareFormProps) {
    const { form, onSubmit, watch, isEditing } = useShareForm({
        initialData,
        editingShareId,
        onSuccess: onClose,
        isOpen,
    })

    const { control, reset } = form

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent
                className="max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-hide"
                aria-describedby={undefined}
            >
                <DialogHeader>
                    <DialogTitle>{formTitle}</DialogTitle>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-6">
                    {/* 基础信息 */}
                    <BasicInfoSection control={control} />

                    {/* 配置设置 */}
                    <ConfigSection control={control} watch={watch} reset={reset} />

                    {/* 订阅选择 */}
                    <SubscriptionSection control={control} fieldName="gen.filter.sub_id" />

                    {/* 过滤条件 */}
                    <FilterSection control={control} />

                    {/* 操作按钮 */}
                    <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1">
                            {isEditing ? UI_TEXT.UPDATE : UI_TEXT.CREATE}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            {UI_TEXT.CANCEL}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}

