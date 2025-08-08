import { Route } from '@/lib/router/router'

import { DashboardPage } from '@/components/pages/home/dashboard'
import { SubscriptionPage } from '@/components/features/sub'
import { CheckPage } from '@/components/features/check'
import { SharesPage } from '@/components/pages/share/share'
import { StoragePage } from '@/components/pages/storage/storage'
import { NotifyPage } from '@/components/features/notify'
import { LoginPage } from '@/components/pages/login/login'

export const routes: Route[] = [
  {
    path: '/login',
    component: LoginPage,
    title: '登录',
    protected: false,
  },
  {
    path: '/dashboard',
    component: DashboardPage,
    title: '仪表盘',
    protected: true,
  },
  {
    path: '/subscriptions',
    component: SubscriptionPage,
    title: '订阅管理',
    protected: true,
  },
  {
    path: '/checks',
    component: CheckPage,
    title: '检测任务',
    protected: true,
  },
  {
    path: '/shares',
    component: SharesPage,
    title: '分享管理',
    protected: true,
  },
  {
    path: '/storage',
    component: StoragePage,
    title: '存储配置',
    protected: true,
  },
  {
    path: '/notifications',
    component: NotifyPage,
    title: '通知配置',
    protected: true,
  },
]
