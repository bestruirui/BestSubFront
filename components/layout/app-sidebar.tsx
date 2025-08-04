"use client"

import * as React from "react"
import { useState } from "react"
import {
  IconDashboard,
  IconLink,
  IconSearch,
  IconShare,
  IconDatabase,
  IconBell,
  IconSettings,
  IconHelp,
  IconInnerShadowTop,

  IconFileText,
  IconBrandGithub,
} from "@tabler/icons-react"


import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import { SettingsDialog } from "@/components/features"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)

  const navMain = [
    {
      title: "仪表盘",
      url: "/dashboard",
      icon: IconDashboard,
    },
    {
      title: "订阅管理",
      url: "/subscriptions",
      icon: IconLink,
    },
    {
      title: "检测任务",
      url: "/checks",
      icon: IconSearch,
    },
    {
      title: "分享管理",
      url: "/shares",
      icon: IconShare,
    },
    {
      title: "存储配置",
      url: "/storage",
      icon: IconDatabase,
    },
    {
      title: "通知配置",
      url: "/notifications",
      icon: IconBell,
    },
  ]

  const navSecondary = [
    {
      title: "系统设置",
      url: "/settings",
      icon: IconSettings,
      onClick: () => setIsSettingsOpen(true),
    },
    {
      title: "日志查看",
      url: "/logs",
      icon: IconFileText,
    },
    {
      title: "帮助文档",
      url: "/help",
      icon: IconHelp,
    },
    {
      title: "GitHub",
      url: "https://github.com/bestruirui/BestSub",
      icon: IconBrandGithub,
    },
  ]

  return (
    <>
      <Sidebar collapsible="offcanvas" {...props}>
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                className="data-[slot=sidebar-menu-button]:!p-1.5"
                onClick={() => window.location.hash = '/dashboard'}
              >
                <IconInnerShadowTop className="!size-5" />
                <span className="text-base font-semibold">BestSub</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent>
          <NavMain items={navMain} />
          <NavSecondary items={navSecondary} className="mt-auto" />
        </SidebarContent>
        <SidebarFooter>
          <NavUser />
        </SidebarFooter>
      </Sidebar>

      <SettingsDialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen} />
    </>
  )
}
