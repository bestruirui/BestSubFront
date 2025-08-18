import { useForm } from 'react-hook-form'
import { useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { useCheckStore } from '@/src/store/checkStore'
import {
    createDefaultCheckData,
    validateCheckForm
} from '../utils'
import { UI_TEXT } from '../constants'
import type { CheckRequest } from '@/src/types/check'

interface UseCheckFormProps {
    initialData?: CheckRequest | undefined
    editingCheckId?: number | undefined
    onSuccess?: () => void
    isOpen?: boolean
}

export function useCheckForm({
    initialData,
    editingCheckId,
    onSuccess,
    isOpen = true
}: UseCheckFormProps = {}) {
    const checkStore = useCheckStore()

    const defaultData = useMemo(() => createDefaultCheckData(), [])

    const form = useForm<CheckRequest>({
        defaultValues: initialData || defaultData
    })

    const { handleSubmit, reset, watch } = form

    useEffect(() => {
        if (isOpen) {
            reset(initialData || defaultData)
        }
    }, [initialData, reset, defaultData, isOpen])


    const onSubmit = async (data: CheckRequest) => {
        const validation = validateCheckForm(data)
        if (!validation.isValid) {
            validation.errors.forEach(error => toast.error(error))
            return
        }

        try {
            const submitData: CheckRequest = {
                ...data,
            }

            if (editingCheckId) {
                await checkStore.updateCheck(editingCheckId, submitData)
                toast.success(UI_TEXT.UPDATE_SUCCESS)
            } else {
                await checkStore.createCheck(submitData)
                toast.success(UI_TEXT.CREATE_SUCCESS)
            }

            onSuccess?.()
        } catch (error) {
            const errorMessage = editingCheckId ? UI_TEXT.UPDATE_FAILED : UI_TEXT.CREATE_FAILED
            toast.error(errorMessage)
            console.error('Failed to save check:', error)
        }
    }

    useEffect(() => {
        if (isOpen && Object.keys(checkStore.checkTypes).length === 0) {
            checkStore.loadCheckTypes()
        }
    }, [isOpen, checkStore.checkTypes])

    return {
        form,
        onSubmit: handleSubmit(onSubmit),
        watch,
        isEditing: !!editingCheckId,
        checkTypeConfigs: checkStore.checkTypes,
        isLoadingConfigs: checkStore.isLoading,
    }
}
