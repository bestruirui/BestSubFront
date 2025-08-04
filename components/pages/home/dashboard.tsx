"use client"


import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { RefreshCw, Play, TrendingUp, Activity } from "lucide-react"
import { useDashboardData } from "@/lib/hooks"

function StatsSkeleton() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-20" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-1" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </>
  )
}

function StatsCards({
  subscriptionStats,
  checkStats
}: {
  subscriptionStats: any
  checkStats: any
}) {
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">订阅总数</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{subscriptionStats.total}</div>
          <p className="text-xs text-muted-foreground">
            {subscriptionStats.active} 个已启用
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">节点总数</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{subscriptionStats.totalNodes}</div>
          <p className="text-xs text-muted-foreground">
            成功率 {subscriptionStats.successRate}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">检测任务</CardTitle>
          <RefreshCw className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{checkStats.total}</div>
          <p className="text-xs text-muted-foreground">
            {checkStats.active} 个已启用
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">系统健康度</CardTitle>
          <Play className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{checkStats.healthScore}%</div>
          <p className="text-xs text-muted-foreground">
            {checkStats.running} 个运行中
          </p>
        </CardContent>
      </Card>
    </>
  )
}

function QuickActions() {
  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button className="h-20 flex-col gap-2" variant="outline">
              <TrendingUp className="h-6 w-6" />
              <span>添加订阅</span>
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <RefreshCw className="h-6 w-6" />
              <span>创建检测</span>
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <Activity className="h-6 w-6" />
              <span>查看日志</span>
            </Button>
            <Button className="h-20 flex-col gap-2" variant="outline">
              <Play className="h-6 w-6" />
              <span>系统设置</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function RecentActivity({
  isLoading,
  subscriptionStats,
  checkStats
}: {
  isLoading: boolean
  subscriptionStats: any
  checkStats: any
}) {
  return (
    <div className="px-4 lg:px-6">
      <Card>
        <CardHeader>
          <CardTitle>系统概览</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">订阅服务运行正常</p>
                  <p className="text-xs text-muted-foreground">
                    {subscriptionStats.active} 个活跃订阅，成功率 {subscriptionStats.successRate}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium">检测系统健康度良好</p>
                  <p className="text-xs text-muted-foreground">
                    系统健康度 {checkStats.healthScore}%，{checkStats.running} 个任务运行中
                  </p>
                </div>
              </div>

              {subscriptionStats.total === 0 && checkStats.total === 0 && (
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center">
                    <Play className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">开始配置您的服务</p>
                    <p className="text-xs text-muted-foreground">
                      使用侧边栏导航添加订阅和检测任务
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export function DashboardPage() {
  const { subscriptionStats, checkStats, isLoading } = useDashboardData()

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 px-4 lg:px-6">
        {isLoading ? (
          <StatsSkeleton />
        ) : (
          <StatsCards
            subscriptionStats={subscriptionStats}
            checkStats={checkStats}
          />
        )}
      </div>

      <QuickActions />
      <RecentActivity
        isLoading={isLoading}
        subscriptionStats={subscriptionStats}
        checkStats={checkStats}
      />
    </div>
  )
}
