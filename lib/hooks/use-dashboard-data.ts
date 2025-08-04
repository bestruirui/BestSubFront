import { useEffect, useState, useCallback } from 'react'
import { useSubscriptionStore, useSubscriptionStats } from '@/lib/stores/subscription-store'
import { dashboardApi } from '@/lib/api/client'
import type { CheckResponse } from '@/lib/types/check'

// 检测统计函数（从check-store.ts迁移过来）
function useCheckStats(checks: CheckResponse[]) {
  const stats = {
    total: checks.length,
    active: checks.filter(check => check.enable).length,
    running: checks.filter(check => check.status === 'running').length,
    successful: checks.filter(check => check.status === 'success').length,
    failed: checks.filter(check => check.status === 'failed').length,
  }

  return {
    ...stats,
    healthScore: stats.total > 0
      ? Math.round((stats.successful / stats.total) * 100)
      : 100,
  }
}

export function useDashboardData() {
  const [subscriptionState, subscriptionActions] = useSubscriptionStore()
  const [checkData, setCheckData] = useState<CheckResponse[]>([])
  const [checkLoading, setCheckLoading] = useState(false)
  const [checkError, setCheckError] = useState<string | null>(null)

  const subscriptionStats = useSubscriptionStats(subscriptionState.data)
  const checkStats = useCheckStats(checkData)

  const loadChecks = useCallback(async () => {
    try {
      setCheckLoading(true)
      setCheckError(null)
      const token = localStorage.getItem('access_token')
      if (!token) return

      const data = await dashboardApi.getChecks(token)
      setCheckData(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Failed to load checks for dashboard:', error)
      setCheckError(error instanceof Error ? error.message : 'Failed to load checks')
      setCheckData([])
    } finally {
      setCheckLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!subscriptionState.initialized) {
      subscriptionActions.load()
    }
  }, [subscriptionState.initialized, subscriptionActions])

  useEffect(() => {
    loadChecks()
  }, [loadChecks])

  return {
    subscriptionState,
    checkState: {
      data: checkData,
      loading: checkLoading,
      error: checkError,
      initialized: true
    },

    subscriptionStats,
    checkStats,

    isLoading: subscriptionState.loading || checkLoading,

    error: subscriptionState.error || checkError,

    actions: {
      subscription: subscriptionActions,
      check: { load: loadChecks },
    }
  }
}
