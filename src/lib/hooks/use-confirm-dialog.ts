/**
 * 通用Confirm对话框Hook
 */

import { useState, useCallback } from 'react'

export interface ConfirmDialogState {
    isOpen: boolean
    title: string
    message: string
    confirmText?: string
    cancelText?: string
    variant?: 'default' | 'destructive'
    onConfirm: (() => void | Promise<void>) | null
}

const DEFAULT_CONFIRM_STATE: ConfirmDialogState = {
    isOpen: false,
    title: '',
    message: '',
    confirmText: '确定',
    cancelText: '取消',
    variant: 'default',
    onConfirm: null
}

export function useConfirmDialog() {
    const [confirmState, setConfirmState] = useState<ConfirmDialogState>(DEFAULT_CONFIRM_STATE)

    const showConfirm = useCallback((
        title: string,
        message: string,
        onConfirm: () => void | Promise<void>,
        options?: {
            confirmText?: string
            cancelText?: string
            variant?: 'default' | 'destructive'
        }
    ) => {
        setConfirmState({
            isOpen: true,
            title,
            message,
            confirmText: options?.confirmText || '确定',
            cancelText: options?.cancelText || '取消',
            variant: options?.variant || 'default',
            onConfirm
        })
    }, [])

    const closeConfirm = useCallback(() => {
        setConfirmState(prev => ({ ...prev, isOpen: false }))
    }, [])

    const handleConfirm = useCallback(async () => {
        if (confirmState.onConfirm) {
            try {
                await confirmState.onConfirm()
            } catch (error) {
                console.error('Confirm action failed:', error)
            }
        }
        closeConfirm()
    }, [confirmState, closeConfirm])

    // 便捷方法 - 删除确认
    const showDeleteConfirm = useCallback((
        itemName: string,
        onConfirm: () => void | Promise<void>
    ) => {
        showConfirm(
            '删除确认',
            `确定要删除"${itemName}"吗？删除后无法恢复。`,
            onConfirm,
            {
                confirmText: '确定删除',
                variant: 'destructive'
            }
        )
    }, [showConfirm])

    return {
        confirmState,
        showConfirm,
        showDeleteConfirm,
        closeConfirm,
        handleConfirm,
    }
}