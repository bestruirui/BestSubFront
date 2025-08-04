
import { createStore } from './base-store'
import { dashboardApi } from '@/lib/api/client'
import type { SubResponse, SubCreateRequest, SubUpdateRequest } from '@/lib/types/subscription'

export type SubscriptionCreateData = SubCreateRequest
export type SubscriptionUpdateData = SubUpdateRequest

export const useSubscriptionStore = createStore<
  SubResponse,
  SubscriptionCreateData,
  SubscriptionUpdateData
>({
  name: 'Subscription',
  api: {
    list: dashboardApi.getSubscriptions,
    create: dashboardApi.createSubscription,
    update: dashboardApi.updateSubscription,
    delete: dashboardApi.deleteSubscription,
    refresh: dashboardApi.refreshSubscription,
  },
  getToken: () => localStorage.getItem('access_token'),
})

export function useSubscriptionStats(subscriptions: SubResponse[]) {
  const stats = {
    total: subscriptions.length,
    active: subscriptions.filter(sub => sub.enable).length,
    totalNodes: subscriptions.reduce((sum, sub) => sum + (sub.node_info?.alive_count || 0), 0),
    successfulRuns: subscriptions.reduce((sum, sub) => sum + (sub.result?.success || 0), 0),
    failedRuns: subscriptions.reduce((sum, sub) => sum + (sub.result?.fail || 0), 0),
  }

  return {
    ...stats,
    successRate: stats.successfulRuns + stats.failedRuns > 0
      ? Math.round((stats.successfulRuns / (stats.successfulRuns + stats.failedRuns)) * 100)
      : 0,
  }
}
