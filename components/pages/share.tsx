"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SharesPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="flex items-center justify-between px-4 lg:px-6">
        <div>
          <h1 className="text-2xl font-bold">分享管理</h1>
          <p className="text-muted-foreground">管理您的分享链接</p>
        </div>
      </div>

      <div className="px-4 lg:px-6">
        <Card>
          <CardHeader>
            <CardTitle>分享列表</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              分享管理功能正在开发中...
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
