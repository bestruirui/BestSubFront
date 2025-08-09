import { useCallback } from 'react'

export function useFormUpdate<TFormData extends { config: Record<string, any> }>(
    setFormData: React.Dispatch<React.SetStateAction<TFormData>>
) {
    const updateFormField = useCallback((
        field: string,
        value: any
    ) => {
        setFormData(prev => {
            if (field.includes('.')) {
                const [parentKey, childKey] = field.split('.')
                return {
                    ...prev,
                    [parentKey as keyof TFormData]: {
                        ...(prev as any)[parentKey as keyof TFormData],
                        [childKey as string]: value
                    }
                } as TFormData
            } else {
                return { ...prev, [field as keyof TFormData]: value } as TFormData
            }
        })
    }, [setFormData])

    const updateConfigField = useCallback((
        field: string,
        value: any
    ) => {
        setFormData(prev => ({
            ...prev,
            config: { ...prev.config, [field]: value }
        }))
    }, [setFormData])

    return {
        updateFormField,
        updateConfigField,
    }
}
