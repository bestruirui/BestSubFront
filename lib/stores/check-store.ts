
import { createStore } from './base-store'
import { dashboardApi } from '@/lib/api/client'
import type { CheckResponse } from '@/lib/types/check'

export interface CheckCreateData {
  name: string
  enable: boolean
  config: {
    url: string
    description: string
  }
  task: {
    type: string
    timeout: number
    cron_expr: string
    notify: boolean
    log_level: string
    log_write_file: boolean
    notify_channel: number
  }
}

export type CheckUpdateData = Partial<CheckCreateData>
export const useCheckStore = createStore<
  CheckResponse,
  CheckCreateData,
  CheckUpdateData
>({
  name: 'Check',
  api: {
    list: dashboardApi.getChecks,
    create: dashboardApi.createCheck,
    update: dashboardApi.updateCheck,
    delete: dashboardApi.deleteCheck,
    refresh: dashboardApi.runCheck,
  },
  getToken: () => localStorage.getItem('access_token'),
})
export function useCheckStats(checks: CheckResponse[]) {
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
