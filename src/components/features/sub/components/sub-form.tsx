import { Button } from "@/src/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/src/components/ui/dialog"
import { useSubForm } from "../hooks/useSubForm"
import { BasicInfoSection, ConfigSection } from "./form-sections"
import type { SubRequest } from "@/src/types/sub"

interface SubFormProps {
    initialData?: SubRequest | undefined
    formTitle: string
    isOpen: boolean
    onClose: () => void
    editingSubId?: number | undefined
}

export function SubForm({
    initialData,
    formTitle,
    isOpen,
    onClose,
    editingSubId,
}: SubFormProps) {
    const { form, onSubmit, isEditing } = useSubForm({
        initialData,
        editingSubId,
        onSuccess: onClose,
        isOpen,
    })

    const { control } = form

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto scrollbar-hide">
                <DialogHeader>
                    <DialogTitle>{formTitle}</DialogTitle>
                </DialogHeader>

                <form onSubmit={onSubmit} className="space-y-6">
                    {/* 基础信息 */}
                    <BasicInfoSection control={control} />

                    {/* 配置设置 */}
                    <ConfigSection control={control} />

                    {/* 操作按钮 */}
                    <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1">
                            {isEditing ? "更新" : "创建"}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                        >
                            取消
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}