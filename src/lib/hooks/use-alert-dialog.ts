/**
 * 通用Alert对话框Hook
 */

import { useState, useCallback } from 'react'

export interface AlertDialogState {
    isOpen: boolean
    title: string
    message: string
    type: 'error' | 'info' | 'success' | 'warning'
}

const DEFAULT_ALERT_STATE: AlertDialogState = {
    isOpen: false,
    title: '',
    message: '',
    type: 'info'
}

export function useAlertDialog() {
    const [alertState, setAlertState] = useState<AlertDialogState>(DEFAULT_ALERT_STATE)

    const showAlert = useCallback((
        title: string, 
        message: string, 
        type: AlertDialogState['type'] = 'info'
    ) => {
        setAlertState({
            isOpen: true,
            title,
            message,
            type
        })
    }, [])

    const closeAlert = useCallback(() => {
        setAlertState(prev => ({ ...prev, isOpen: false }))
    }, [])

    // 便捷方法
    const showError = useCallback((title: string, message: string) => {
        showAlert(title, message, 'error')
    }, [showAlert])

    const showSuccess = useCallback((title: string, message: string) => {
        showAlert(title, message, 'success')
    }, [showAlert])

    const showWarning = useCallback((title: string, message: string) => {
        showAlert(title, message, 'warning')
    }, [showAlert])

    const showInfo = useCallback((title: string, message: string) => {
        showAlert(title, message, 'info')
    }, [showAlert])

    return {
        alertState,
        showAlert,
        showError,
        showSuccess,
        showWarning,
        showInfo,
        closeAlert,
    }
}