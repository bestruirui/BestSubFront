import { useCallback } from 'react'

export function useFormUpdate<TFormData extends { config: unknown }>(
    setFormData: React.Dispatch<React.SetStateAction<TFormData>>
) {
    const updateFormField = useCallback((
        field: string,
        value: unknown
    ) => {
        setFormData(prev => {
            if (field.includes('.')) {
                const [parentKey, childKey] = field.split('.') as [string, string]
                const parent = (prev as any)[parentKey] ?? {}
                return {
                    ...(prev as any),
                    [parentKey]: {
                        ...(parent as any),
                        [childKey]: value,
                    },
                } as TFormData
            } else {
                return { ...(prev as any), [field]: value } as TFormData
            }
        })
    }, [setFormData])

    const updateConfigField = useCallback((
        field: string,
        value: unknown
    ) => {
        setFormData(prev => ({
            ...(prev as any),
            config: { ...(prev as any).config, [field]: value } as any,
        }))
    }, [setFormData])

    return {
        updateFormField,
        updateConfigField,
    }
}
