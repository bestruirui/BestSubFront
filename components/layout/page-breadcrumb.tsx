"use client"

import { useRouter } from "@/lib/router"
import { Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

interface PageBreadcrumbProps {
  className?: string
}

export function PageBreadcrumb({ className = "" }: PageBreadcrumbProps) {
  const { currentPath, navigate } = useRouter()

  const getPageTitle = (path: string): string => {
    const pathMap: Record<string, string> = {
      '/dashboard': '仪表盘',
      '/subscriptions': '订阅管理',
      '/checks': '检测任务',
      '/shares': '分享管理',
      '/storage': '存储配置',
      '/notifications': '通知配置',
      '/settings': '系统设置',
      '/system': '系统状态',
      '/logs': '日志查看',
      '/help': '帮助文档',
    }
    return pathMap[path] || '未知页面'
  }

  if (!currentPath || currentPath === '/dashboard') {
    return null
  }

  const currentPageTitle = getPageTitle(currentPath)

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-muted-foreground hover:text-foreground"
              onClick={() => navigate('/dashboard')}
            >
              <Home className="h-4 w-4 mr-1" />
              首页
            </Button>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>{currentPageTitle}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
