/**
 * 通用对话框容器组件
 * 提供Alert和Confirm对话框的统一显示
 */

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/src/components/ui/alert-dialog"
import { cn } from "@/src/utils"
import type { AlertDialogState } from "@/src/lib/hooks/use-alert-dialog"
import type { ConfirmDialogState } from "@/src/lib/hooks/use-confirm-dialog"

interface DialogContainerProps {
    alertState?: AlertDialogState
    confirmState?: ConfirmDialogState
    onAlertClose?: () => void
    onConfirmClose?: () => void
    onConfirmAction?: () => void
}

export function DialogContainer({
    alertState,
    confirmState,
    onAlertClose,
    onConfirmClose,
    onConfirmAction,
}: DialogContainerProps) {
    // 根据类型获取图标和样式
    const getAlertIcon = (type: AlertDialogState['type']) => {
        switch (type) {
            case 'error':
                return '❌'
            case 'success':
                return '✅'
            case 'warning':
                return '⚠️'
            default:
                return 'ℹ️'
        }
    }

    const getConfirmButtonClass = (variant?: 'default' | 'destructive') => {
        return variant === 'destructive'
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : ''
    }

    return (
        <>
            {/* Alert对话框 */}
            {alertState && (
                <AlertDialog
                    open={alertState.isOpen}
                    onOpenChange={(open) => !open && onAlertClose?.()}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle className="flex items-center gap-2">
                                <span className="text-lg">
                                    {getAlertIcon(alertState.type)}
                                </span>
                                {alertState.title}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="text-left">
                                {alertState.message}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogAction onClick={onAlertClose}>
                                确定
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}

            {/* Confirm对话框 */}
            {confirmState && (
                <AlertDialog
                    open={confirmState.isOpen}
                    onOpenChange={(open) => !open && onConfirmClose?.()}
                >
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>{confirmState.title}</AlertDialogTitle>
                            <AlertDialogDescription className="text-left">
                                {confirmState.message}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel onClick={onConfirmClose}>
                                {confirmState.cancelText}
                            </AlertDialogCancel>
                            <AlertDialogAction
                                onClick={onConfirmAction}
                                className={cn(getConfirmButtonClass(confirmState.variant))}
                            >
                                {confirmState.confirmText}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            )}
        </>
    )
}