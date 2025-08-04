import { useEffect } from 'react'
import { useSubscriptionStore, useSubscriptionStats } from '@/lib/stores/subscription-store'
import { useCheckStore, useCheckStats } from '@/lib/stores/check-store'

export function useDashboardData() {
  const [subscriptionState, subscriptionActions] = useSubscriptionStore()
  const [checkState, checkActions] = useCheckStore()

  const subscriptionStats = useSubscriptionStats(subscriptionState.data)
  const checkStats = useCheckStats(checkState.data)

  useEffect(() => {
    if (!subscriptionState.initialized) {
      subscriptionActions.load()
    }
  }, [subscriptionState.initialized, subscriptionActions])

  useEffect(() => {
    if (!checkState.initialized) {
      checkActions.load()
    }
  }, [checkState.initialized, checkActions])

  return {
    subscriptionState,
    checkState,

    subscriptionStats,
    checkStats,

    isLoading: subscriptionState.loading || checkState.loading,

    error: subscriptionState.error || checkState.error,

    actions: {
      subscription: subscriptionActions,
      check: checkActions,
    }
  }
}
