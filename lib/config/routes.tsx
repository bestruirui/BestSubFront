import { Route } from '@/lib/router/router'

import { DashboardPage } from '@/components/pages/dashboard'
import { SubscriptionsPage } from '@/components/pages/sub'
import { ChecksPage } from '@/components/pages/check'
import { SharesPage } from '@/components/pages/share'
import { StoragePage } from '@/components/pages/storage'
import { NotificationsPage } from '@/components/pages/notifiy'
import { LoginPage } from '@/components/pages/login'

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
    component: SubscriptionsPage,
    title: '订阅管理',
    protected: true,
  },
  {
    path: '/checks',
    component: ChecksPage,
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
    component: NotificationsPage,
    title: '通知配置',
    protected: true,
  },
]
