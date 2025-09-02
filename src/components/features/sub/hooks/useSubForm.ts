import { useForm } from 'react-hook-form'
import { useEffect, useMemo } from 'react'
import { toast } from 'sonner'
import { useCreateSub, useUpdateSub } from '@/src/lib/queries/sub-queries'
import type { SubRequest } from '@/src/types/sub'

interface UseSubFormProps {
  initialData?: SubRequest | undefined
  editingSubId?: number | undefined
  onSuccess?: () => void
  isOpen?: boolean
}

export function useSubForm({
  initialData,
  editingSubId,
  onSuccess,
  isOpen = true
}: UseSubFormProps = {}) {
  const createSubMutation = useCreateSub()
  const updateSubMutation = useUpdateSub()

  const defaultData = useMemo((): SubRequest => ({
    name: '',
    enable: true,
    cron_expr: '0 */6 * * *',
    config: {
      url: '',
      proxy: false,
      timeout: 10,
    },
  }), [])

  const form = useForm<SubRequest>({
    defaultValues: initialData || defaultData
  })

  const { handleSubmit, reset } = form

  useEffect(() => {
    if (isOpen) {
      reset(initialData || defaultData)
    }
  }, [initialData, reset, defaultData, isOpen])

  const onSubmit = async (data: SubRequest) => {
    try {
      if (editingSubId) {
        await updateSubMutation.mutateAsync({ id: editingSubId, data })
        toast.success('订阅更新成功')
      } else {
        await createSubMutation.mutateAsync(data)
        toast.success('订阅创建成功')
      }

      onSuccess?.()
    } catch (error) {
      const errorMessage = editingSubId ? '更新订阅失败' : '创建订阅失败'
      toast.error(errorMessage)
      console.error('Failed to save subscription:', error)
    }
  }

  return {
    form,
    onSubmit: handleSubmit(onSubmit),
    isEditing: !!editingSubId,
  }
}