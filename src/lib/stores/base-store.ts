import { useState, useCallback, useRef, useMemo } from 'react'

export interface StoreState<T> {
  data: T[]
  loading: boolean
  error: string | null
  initialized: boolean
}

export interface StoreActions<T, CreateData = Partial<T>, UpdateData = Partial<T>> {
  load: () => Promise<void>
  create: (data: CreateData) => Promise<void>
  update: (id: number, data: UpdateData) => Promise<void>
  remove: (id: number) => Promise<void>
  refresh: (id: number) => Promise<void>
}

export function createStore<T extends { id: number }, CreateData = Partial<T>, UpdateData = Partial<T>>(
  config: {
    name: string
    api: {
      list: (token: string) => Promise<T[]>
      create: (data: CreateData, token: string) => Promise<T>
      update: (id: number, data: UpdateData, token: string) => Promise<T>
      delete: (id: number, token: string) => Promise<void>
      refresh?: (id: number, token: string) => Promise<T | void>
    }
    getToken: () => string | null
  }
) {
  return function useStore(): [StoreState<T>, StoreActions<T, CreateData, UpdateData>] {
    const [state, setState] = useState<StoreState<T>>({
      data: [],
      loading: false,
      error: null,
      initialized: false,
    })

    const abortControllerRef = useRef<AbortController | null>(null)

    const updateState = useCallback((updates: Partial<StoreState<T>>) => {
      setState(prev => ({ ...prev, ...updates }))
    }, [])

    const updateStateWithPrev = useCallback((updater: (prev: StoreState<T>) => Partial<StoreState<T>>) => {
      setState(prev => ({ ...prev, ...updater(prev) }))
    }, [])

    const handleError = useCallback((error: unknown, action: string) => {
      const message = error instanceof Error ? error.message : `${action} 操作失败`
      console.error(`[${config.name}] ${action} error:`, error)
      updateState({ error: message, loading: false })
    }, [updateState])

    const load = useCallback(async () => {
      const token = config.getToken()
      if (!token) {
        updateState({ error: '未找到认证令牌', loading: false })
        return
      }

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      updateState({ loading: true, error: null })

      try {
        const data = await config.api.list(token)
        updateState({
          data: Array.isArray(data) ? data : [],
          loading: false,
          initialized: true
        })
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          return
        }
        handleError(error, '加载')
      }
    }, [updateState, handleError])

    const create = useCallback(async (data: CreateData) => {
      const token = config.getToken()
      if (!token) {
        updateState({ error: '未找到认证令牌' })
        return
      }

      updateState({ loading: true, error: null })

      try {
        const newItem = await config.api.create(data, token)
        updateStateWithPrev((prev: StoreState<T>) => ({
          data: [...prev.data, newItem],
          loading: false,
        }))
      } catch (error) {
        handleError(error, '创建')
      }
    }, [updateState, updateStateWithPrev, handleError])

    const update = useCallback(async (id: number, data: UpdateData) => {
      const token = config.getToken()
      if (!token) {
        updateState({ error: '未找到认证令牌' })
        return
      }

      updateState({ loading: true, error: null })

      try {
        const updatedItem = await config.api.update(id, data, token)
        updateStateWithPrev((prev: StoreState<T>) => ({
          data: prev.data.map((item: T) => item.id === id ? updatedItem : item),
          loading: false,
        }))
      } catch (error) {
        handleError(error, '更新')
      }
    }, [updateState, updateStateWithPrev, handleError])

    const remove = useCallback(async (id: number) => {
      const token = config.getToken()
      if (!token) {
        updateState({ error: '未找到认证令牌' })
        return
      }

      updateState({ loading: true, error: null })

      try {
        await config.api.delete(id, token)
        updateStateWithPrev((prev: StoreState<T>) => ({
          data: prev.data.filter((item: T) => item.id !== id),
          loading: false,
        }))
      } catch (error) {
        handleError(error, '删除')
      }
    }, [updateState, updateStateWithPrev, handleError])

    const refresh = useCallback(async (id: number) => {
      if (!config.api.refresh) return

      const token = config.getToken()
      if (!token) {
        updateState({ error: '未找到认证令牌' })
        return
      }

      try {
        const refreshedItem = await config.api.refresh(id, token)
        if (refreshedItem) {
          updateStateWithPrev((prev: StoreState<T>) => ({
            data: prev.data.map((item: T) => item.id === id ? refreshedItem : item),
          }))
        }
      } catch (error) {
        handleError(error, '刷新')
      }
    }, [updateState, updateStateWithPrev, handleError])

    const actions: StoreActions<T, CreateData, UpdateData> = useMemo(() => ({
      load,
      create,
      update,
      remove,
      refresh,
    }), [load, create, update, remove, refresh])

    return [state, actions]
  }
}
