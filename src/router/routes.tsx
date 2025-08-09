import { Route } from './core/context'

import { DashboardPage } from '@/src/components/features/home/dashboard'
import { SubPage, CheckPage, SharePage, StoragePage, NotifyPage, LoginPage } from '@/src/components/features'

export const routes: Route[] = [
  {
    path: '/login',
    component: LoginPage,
    title: '登录',
    protected: false,
    preloadImport: () => import('@/src/components/features/login'),
    priority: 'normal',
  },
  {
    path: '/dashboard',
    component: DashboardPage,
    title: '仪表盘',
    protected: true,
    preloadImport: () => import('@/src/components/features/home/dashboard'),
    priority: 'critical',
  },
  {
    path: '/sub',
    component: SubPage,
    title: '订阅管理',
    protected: true,
    preloadImport: () => import('@/src/components/features/sub'),
    priority: 'critical',
  },
  {
    path: '/check',
    component: CheckPage,
    title: '检测任务',
    protected: true,
    preloadImport: () => import('@/src/components/features/check'),
    priority: 'normal',
  },
  {
    path: '/share',
    component: SharePage,
    title: '分享管理',
    protected: true,
    preloadImport: () => import('@/src/components/features/share'),
    priority: 'normal',
  },
  {
    path: '/storage',
    component: StoragePage,
    title: '存储配置',
    protected: true,
    preloadImport: () => import('@/src/components/features/storage/storage'),
    priority: 'low',
  },
  {
    path: '/notify',
    component: NotifyPage,
    title: '通知配置',
    protected: true,
    preloadImport: () => import('@/src/components/features/notify'),
    priority: 'normal',
  },
]
