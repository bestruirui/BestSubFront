"use client"

import * as React from "react"
import {
  Bell,
  Database,
  Settings,
  Shield,
} from "lucide-react"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/src/components/ui/breadcrumb"
import { Button } from "@/src/components/ui/button"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Switch } from "@/src/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/src/components/ui/dialog"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/src/components/ui/sidebar"

const data = {
  nav: [
    { name: "通用设置", icon: Settings, id: "general" },
    { name: "数据库设置", icon: Database, id: "database" },
    { name: "通知设置", icon: Bell, id: "notification" },
    { name: "安全设置", icon: Shield, id: "security" },
  ],
}

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = React.useState("general")

  React.useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      .hide-scrollbar::-webkit-scrollbar {
        display: none;
      }
      .hide-scrollbar {
        -ms-overflow-style: none;
        scrollbar-width: none;
      }
    `
    document.head.appendChild(style)
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [])

  const [generalSettings, setGeneralSettings] = React.useState({
    siteName: "BestSub",
    siteUrl: "http://localhost:3000",
    timezone: "Asia/Shanghai",
    enableRegistration: false,
    enableGuestAccess: false,
  })

  const [databaseSettings, setDatabaseSettings] = React.useState({
    host: "localhost",
    port: "5432",
    database: "bestsub",
    username: "postgres",
    maxConnections: "10",
    connectionTimeout: "30",
  })

  const [notificationSettings, setNotificationSettings] = React.useState({
    enableEmail: true,
    enableWebhook: false,
    emailHost: "smtp.gmail.com",
    emailPort: "587",
    emailUsername: "",
    webhookUrl: "",
  })

  const [securitySettings, setSecuritySettings] = React.useState({
    sessionTimeout: "24",
    maxLoginAttempts: "5",
    enableTwoFactor: false,
    enableApiRateLimit: true,
    apiRateLimit: "100",
  })

  const handleSave = () => {
    switch (activeTab) {
      case "general":
        break
      case "database":
        break
      case "notification":
        break
      case "security":
        break
    }
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px] max-h-[90vh] h-full md:h-auto">
        <DialogTitle className="sr-only">Settings</DialogTitle>
        <DialogDescription className="sr-only">
          Customize your settings here.
        </DialogDescription>
        <div className="md:hidden flex flex-col h-full max-h-[90vh]">
          <div className="border-b bg-muted/30 flex-shrink-0">
            <div className="p-3">
              <h2 className="text-lg font-semibold mb-3">系统设置</h2>
              <div className="relative">
                <div
                  className="flex overflow-x-auto gap-1 hide-scrollbar"
                  style={{
                    WebkitOverflowScrolling: 'touch'
                  }}
                >
                  {data.nav.map((item) => (
                    <button
                      key={item.name}
                      onClick={() => setActiveTab(item.id)}
                      className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md transition-colors whitespace-nowrap flex-shrink-0 min-w-0 ${activeTab === item.id
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-muted"
                        }`}
                    >
                      <item.icon className="h-3 w-3 flex-shrink-0" />
                      <span className="text-xs truncate max-w-[4rem]">{item.name.replace('设置', '')}</span>
                    </button>
                  ))}
                </div>
                <div className="absolute right-0 top-0 h-full w-3 bg-gradient-to-l from-muted/30 to-transparent pointer-events-none"></div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-4 space-y-6">
              {activeTab === "general" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteName-mobile" className="text-sm font-medium">站点名称</Label>
                      <Input
                        id="siteName-mobile"
                        value={generalSettings.siteName}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone-mobile" className="text-sm font-medium">时区</Label>
                      <Input
                        id="timezone-mobile"
                        value={generalSettings.timezone}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="siteUrl-mobile" className="text-sm font-medium">站点地址</Label>
                      <Input
                        id="siteUrl-mobile"
                        value={generalSettings.siteUrl}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, siteUrl: e.target.value })}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="text-sm font-medium text-muted-foreground">权限设置</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                        <div className="space-y-1">
                          <Label htmlFor="enableRegistration-mobile" className="text-sm font-medium">允许注册</Label>
                          <p className="text-xs text-muted-foreground">允许新用户注册账号</p>
                        </div>
                        <Switch
                          id="enableRegistration-mobile"
                          checked={generalSettings.enableRegistration}
                          onCheckedChange={(checked: boolean) => setGeneralSettings({ ...generalSettings, enableRegistration: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                        <div className="space-y-1">
                          <Label htmlFor="enableGuestAccess-mobile" className="text-sm font-medium">允许访客访问</Label>
                          <p className="text-xs text-muted-foreground">允许未登录用户浏览内容</p>
                        </div>
                        <Switch
                          id="enableGuestAccess-mobile"
                          checked={generalSettings.enableGuestAccess}
                          onCheckedChange={(checked: boolean) => setGeneralSettings({ ...generalSettings, enableGuestAccess: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "database" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">连接配置</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dbHost-mobile" className="text-sm font-medium">主机地址</Label>
                        <Input
                          id="dbHost-mobile"
                          value={databaseSettings.host}
                          onChange={(e) => setDatabaseSettings({ ...databaseSettings, host: e.target.value })}
                          className="h-10"
                          placeholder="localhost"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor="dbPort-mobile" className="text-sm font-medium">端口</Label>
                          <Input
                            id="dbPort-mobile"
                            value={databaseSettings.port}
                            onChange={(e) => setDatabaseSettings({ ...databaseSettings, port: e.target.value })}
                            className="h-10"
                            placeholder="5432"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="dbName-mobile" className="text-sm font-medium">数据库名</Label>
                          <Input
                            id="dbName-mobile"
                            value={databaseSettings.database}
                            onChange={(e) => setDatabaseSettings({ ...databaseSettings, database: e.target.value })}
                            className="h-10"
                            placeholder="bestsub"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dbUsername-mobile" className="text-sm font-medium">用户名</Label>
                        <Input
                          id="dbUsername-mobile"
                          value={databaseSettings.username}
                          onChange={(e) => setDatabaseSettings({ ...databaseSettings, username: e.target.value })}
                          className="h-10"
                          placeholder="postgres"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">连接池设置</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label htmlFor="maxConnections-mobile" className="text-sm font-medium">最大连接数</Label>
                        <Input
                          id="maxConnections-mobile"
                          type="number"
                          value={databaseSettings.maxConnections}
                          onChange={(e) => setDatabaseSettings({ ...databaseSettings, maxConnections: e.target.value })}
                          className="h-10"
                          placeholder="10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="connectionTimeout-mobile" className="text-sm font-medium">连接超时(秒)</Label>
                        <Input
                          id="connectionTimeout-mobile"
                          type="number"
                          value={databaseSettings.connectionTimeout}
                          onChange={(e) => setDatabaseSettings({ ...databaseSettings, connectionTimeout: e.target.value })}
                          className="h-10"
                          placeholder="30"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notification" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                      <div className="space-y-1">
                        <Label htmlFor="enableEmail-mobile" className="text-sm font-medium">启用邮件通知</Label>
                        <p className="text-xs text-muted-foreground">发送系统通知到邮箱</p>
                      </div>
                      <Switch
                        id="enableEmail-mobile"
                        checked={notificationSettings.enableEmail}
                        onCheckedChange={(checked: boolean) => setNotificationSettings({ ...notificationSettings, enableEmail: checked })}
                      />
                    </div>

                    {notificationSettings.enableEmail && (
                      <div className="space-y-4 p-4 bg-muted/20 rounded-lg border-l-4 border-primary">
                        <h4 className="text-sm font-medium">SMTP 配置</h4>
                        <div className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="emailHost-mobile" className="text-sm font-medium">SMTP 主机</Label>
                            <Input
                              id="emailHost-mobile"
                              value={notificationSettings.emailHost}
                              onChange={(e) => setNotificationSettings({ ...notificationSettings, emailHost: e.target.value })}
                              className="h-10"
                              placeholder="smtp.gmail.com"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label htmlFor="emailPort-mobile" className="text-sm font-medium">端口</Label>
                              <Input
                                id="emailPort-mobile"
                                value={notificationSettings.emailPort}
                                onChange={(e) => setNotificationSettings({ ...notificationSettings, emailPort: e.target.value })}
                                className="h-10"
                                placeholder="587"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="emailUsername-mobile" className="text-sm font-medium">用户名</Label>
                              <Input
                                id="emailUsername-mobile"
                                value={notificationSettings.emailUsername}
                                onChange={(e) => setNotificationSettings({ ...notificationSettings, emailUsername: e.target.value })}
                                className="h-10"
                                placeholder="your@email.com"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                      <div className="space-y-1">
                        <Label htmlFor="enableWebhook-mobile" className="text-sm font-medium">启用 Webhook</Label>
                        <p className="text-xs text-muted-foreground">发送通知到指定的 URL</p>
                      </div>
                      <Switch
                        id="enableWebhook-mobile"
                        checked={notificationSettings.enableWebhook}
                        onCheckedChange={(checked: boolean) => setNotificationSettings({ ...notificationSettings, enableWebhook: checked })}
                      />
                    </div>

                    {notificationSettings.enableWebhook && (
                      <div className="space-y-2 p-4 bg-muted/20 rounded-lg border-l-4 border-primary">
                        <Label htmlFor="webhookUrl-mobile" className="text-sm font-medium">Webhook URL</Label>
                        <Input
                          id="webhookUrl-mobile"
                          value={notificationSettings.webhookUrl}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, webhookUrl: e.target.value })}
                          className="h-10"
                          placeholder="https://your-webhook-url.com"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">会话管理</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sessionTimeout-mobile" className="text-sm font-medium">会话超时(小时)</Label>
                        <Input
                          id="sessionTimeout-mobile"
                          type="number"
                          value={securitySettings.sessionTimeout}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                          className="h-10"
                          placeholder="24"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxLoginAttempts-mobile" className="text-sm font-medium">最大登录尝试</Label>
                        <Input
                          id="maxLoginAttempts-mobile"
                          type="number"
                          value={securitySettings.maxLoginAttempts}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: e.target.value })}
                          className="h-10"
                          placeholder="5"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">安全功能</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                        <div className="space-y-1">
                          <Label htmlFor="enableTwoFactor-mobile" className="text-sm font-medium">启用双因子认证</Label>
                          <p className="text-xs text-muted-foreground">为账户添加额外的安全保护</p>
                        </div>
                        <Switch
                          id="enableTwoFactor-mobile"
                          checked={securitySettings.enableTwoFactor}
                          onCheckedChange={(checked: boolean) => setSecuritySettings({ ...securitySettings, enableTwoFactor: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                        <div className="space-y-1">
                          <Label htmlFor="enableApiRateLimit-mobile" className="text-sm font-medium">启用 API 限流</Label>
                          <p className="text-xs text-muted-foreground">限制 API 请求频率</p>
                        </div>
                        <Switch
                          id="enableApiRateLimit-mobile"
                          checked={securitySettings.enableApiRateLimit}
                          onCheckedChange={(checked: boolean) => setSecuritySettings({ ...securitySettings, enableApiRateLimit: checked })}
                        />
                      </div>
                    </div>

                    {securitySettings.enableApiRateLimit && (
                      <div className="space-y-2 p-4 bg-muted/20 rounded-lg border-l-4 border-primary">
                        <Label htmlFor="apiRateLimit-mobile" className="text-sm font-medium">每分钟请求限制</Label>
                        <Input
                          id="apiRateLimit-mobile"
                          type="number"
                          value={securitySettings.apiRateLimit}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, apiRateLimit: e.target.value })}
                          className="h-10"
                          placeholder="100"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 移动端底部操作按钮 */}
          <div className="border-t bg-muted/20 p-4 flex-shrink-0">
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1"
              >
                保存设置
              </Button>
            </div>
          </div>
        </div>

        {/* 桌面端布局 */}
        <SidebarProvider className="items-start hidden md:flex">
          <Sidebar collapsible="none" className="flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {data.nav.map((item) => (
                      <SidebarMenuItem key={item.name}>
                        <SidebarMenuButton
                          isActive={activeTab === item.id}
                          onClick={() => setActiveTab(item.id)}
                        >
                          <item.icon />
                          <span>{item.name}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>

          <main className="flex h-[500px] flex-1 flex-col overflow-hidden">
            <header className="hidden md:flex h-16 shrink-0 items-center gap-2">
              <div className="flex items-center gap-2 px-4">
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink href="#">系统设置</BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage>
                        {data.nav.find(item => item.id === activeTab)?.name || "通用设置"}
                      </BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-4 md:pt-0">
              {activeTab === "general" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="siteName" className="text-sm font-medium">站点名称</Label>
                      <Input
                        id="siteName"
                        value={generalSettings.siteName}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="timezone" className="text-sm font-medium">时区</Label>
                      <Input
                        id="timezone"
                        value={generalSettings.timezone}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                        className="h-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="siteUrl" className="text-sm font-medium">站点地址</Label>
                    <Input
                      id="siteUrl"
                      value={generalSettings.siteUrl}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, siteUrl: e.target.value })}
                      className="h-10"
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">权限设置</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                        <div className="space-y-1">
                          <Label htmlFor="enableRegistration" className="text-sm font-medium">允许注册</Label>
                          <p className="text-xs text-muted-foreground">允许新用户注册账号</p>
                        </div>
                        <Switch
                          id="enableRegistration"
                          checked={generalSettings.enableRegistration}
                          onCheckedChange={(checked: boolean) => setGeneralSettings({ ...generalSettings, enableRegistration: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                        <div className="space-y-1">
                          <Label htmlFor="enableGuestAccess" className="text-sm font-medium">允许访客访问</Label>
                          <p className="text-xs text-muted-foreground">允许未登录用户浏览内容</p>
                        </div>
                        <Switch
                          id="enableGuestAccess"
                          checked={generalSettings.enableGuestAccess}
                          onCheckedChange={(checked: boolean) => setGeneralSettings({ ...generalSettings, enableGuestAccess: checked })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "database" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">连接配置</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dbHost" className="text-sm font-medium">主机地址</Label>
                        <Input
                          id="dbHost"
                          value={databaseSettings.host}
                          onChange={(e) => setDatabaseSettings({ ...databaseSettings, host: e.target.value })}
                          className="h-10"
                          placeholder="localhost"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dbPort" className="text-sm font-medium">端口</Label>
                        <Input
                          id="dbPort"
                          value={databaseSettings.port}
                          onChange={(e) => setDatabaseSettings({ ...databaseSettings, port: e.target.value })}
                          className="h-10"
                          placeholder="5432"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="dbName" className="text-sm font-medium">数据库名</Label>
                        <Input
                          id="dbName"
                          value={databaseSettings.database}
                          onChange={(e) => setDatabaseSettings({ ...databaseSettings, database: e.target.value })}
                          className="h-10"
                          placeholder="bestsub"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dbUsername" className="text-sm font-medium">用户名</Label>
                        <Input
                          id="dbUsername"
                          value={databaseSettings.username}
                          onChange={(e) => setDatabaseSettings({ ...databaseSettings, username: e.target.value })}
                          className="h-10"
                          placeholder="postgres"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">连接池设置</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="maxConnections" className="text-sm font-medium">最大连接数</Label>
                        <Input
                          id="maxConnections"
                          type="number"
                          value={databaseSettings.maxConnections}
                          onChange={(e) => setDatabaseSettings({ ...databaseSettings, maxConnections: e.target.value })}
                          className="h-10"
                          placeholder="10"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="connectionTimeout" className="text-sm font-medium">连接超时(秒)</Label>
                        <Input
                          id="connectionTimeout"
                          type="number"
                          value={databaseSettings.connectionTimeout}
                          onChange={(e) => setDatabaseSettings({ ...databaseSettings, connectionTimeout: e.target.value })}
                          className="h-10"
                          placeholder="30"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notification" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                      <div className="space-y-1">
                        <Label htmlFor="enableEmail" className="text-sm font-medium">启用邮件通知</Label>
                        <p className="text-xs text-muted-foreground">发送系统通知到邮箱</p>
                      </div>
                      <Switch
                        id="enableEmail"
                        checked={notificationSettings.enableEmail}
                        onCheckedChange={(checked: boolean) => setNotificationSettings({ ...notificationSettings, enableEmail: checked })}
                      />
                    </div>

                    {notificationSettings.enableEmail && (
                      <div className="space-y-4 p-4 bg-muted/20 rounded-lg border-l-4 border-primary">
                        <h4 className="text-sm font-medium">SMTP 配置</h4>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="emailHost" className="text-sm font-medium">SMTP 主机</Label>
                              <Input
                                id="emailHost"
                                value={notificationSettings.emailHost}
                                onChange={(e) => setNotificationSettings({ ...notificationSettings, emailHost: e.target.value })}
                                className="h-10"
                                placeholder="smtp.gmail.com"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="emailPort" className="text-sm font-medium">端口</Label>
                              <Input
                                id="emailPort"
                                value={notificationSettings.emailPort}
                                onChange={(e) => setNotificationSettings({ ...notificationSettings, emailPort: e.target.value })}
                                className="h-10"
                                placeholder="587"
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="emailUsername" className="text-sm font-medium">邮箱用户名</Label>
                            <Input
                              id="emailUsername"
                              value={notificationSettings.emailUsername}
                              onChange={(e) => setNotificationSettings({ ...notificationSettings, emailUsername: e.target.value })}
                              className="h-10"
                              placeholder="your@email.com"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                      <div className="space-y-1">
                        <Label htmlFor="enableWebhookDesktop" className="text-sm font-medium">启用 Webhook</Label>
                        <p className="text-xs text-muted-foreground">发送通知到指定的 URL</p>
                      </div>
                      <Switch
                        id="enableWebhookDesktop"
                        checked={notificationSettings.enableWebhook}
                        onCheckedChange={(checked: boolean) => setNotificationSettings({ ...notificationSettings, enableWebhook: checked })}
                      />
                    </div>

                    {notificationSettings.enableWebhook && (
                      <div className="space-y-2 p-4 bg-muted/20 rounded-lg border-l-4 border-primary">
                        <Label htmlFor="webhookUrlDesktop" className="text-sm font-medium">Webhook URL</Label>
                        <Input
                          id="webhookUrlDesktop"
                          value={notificationSettings.webhookUrl}
                          onChange={(e) => setNotificationSettings({ ...notificationSettings, webhookUrl: e.target.value })}
                          className="h-10"
                          placeholder="https://your-webhook-url.com"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">会话管理</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="sessionTimeout" className="text-sm font-medium">会话超时(小时)</Label>
                        <Input
                          id="sessionTimeout"
                          type="number"
                          value={securitySettings.sessionTimeout}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                          className="h-10"
                          placeholder="24"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="maxLoginAttempts" className="text-sm font-medium">最大登录尝试</Label>
                        <Input
                          id="maxLoginAttempts"
                          type="number"
                          value={securitySettings.maxLoginAttempts}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: e.target.value })}
                          className="h-10"
                          placeholder="5"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-muted-foreground">安全功能</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                        <div className="space-y-1">
                          <Label htmlFor="enableTwoFactor" className="text-sm font-medium">启用双因子认证</Label>
                          <p className="text-xs text-muted-foreground">为账户添加额外的安全保护</p>
                        </div>
                        <Switch
                          id="enableTwoFactor"
                          checked={securitySettings.enableTwoFactor}
                          onCheckedChange={(checked: boolean) => setSecuritySettings({ ...securitySettings, enableTwoFactor: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between p-4 border rounded-lg bg-card">
                        <div className="space-y-1">
                          <Label htmlFor="enableApiRateLimitDesktop" className="text-sm font-medium">启用 API 限流</Label>
                          <p className="text-xs text-muted-foreground">限制 API 请求频率</p>
                        </div>
                        <Switch
                          id="enableApiRateLimitDesktop"
                          checked={securitySettings.enableApiRateLimit}
                          onCheckedChange={(checked: boolean) => setSecuritySettings({ ...securitySettings, enableApiRateLimit: checked })}
                        />
                      </div>
                    </div>

                    {securitySettings.enableApiRateLimit && (
                      <div className="space-y-2 p-4 bg-muted/20 rounded-lg border-l-4 border-primary">
                        <Label htmlFor="apiRateLimitDesktop" className="text-sm font-medium">每分钟请求限制</Label>
                        <Input
                          id="apiRateLimitDesktop"
                          type="number"
                          value={securitySettings.apiRateLimit}
                          onChange={(e) => setSecuritySettings({ ...securitySettings, apiRateLimit: e.target.value })}
                          className="h-10"
                          placeholder="100"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 桌面端底部操作按钮 */}
            <div className="border-t bg-muted/20 p-4 flex-shrink-0">
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  取消
                </Button>
                <Button onClick={handleSave}>
                  保存设置
                </Button>
              </div>
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  )
}
