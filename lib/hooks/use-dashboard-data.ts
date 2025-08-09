import { useEffect, useState, useCallback } from 'react'
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
  const [checkData, setCheckData] = useState<CheckResponse[]>([])
  const [checkLoading, setCheckLoading] = useState(false)
  const [checkError, setCheckError] = useState<string | null>(null)

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
    loadChecks()
  }, [loadChecks])

  return {
    checkState: {
      data: checkData,
      loading: checkLoading,
      error: checkError,
      initialized: true
    },

    checkStats,

    isLoading: checkLoading,

    error: checkError,

    actions: {
      check: { load: loadChecks },
    }
  }
}
