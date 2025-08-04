"use client"

import { useEffect } from "react"
import { RouterProvider, RouterOutlet, useRouter } from "@/lib/router/router"
import { useAuth } from "@/components/providers/auth-provider"
import { routes } from "@/lib/config/routes"
import { ProtectedRoute } from "@/components/features"
import { AppSidebar, SiteHeader } from "@/components/layout"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { ContentTransition } from "@/components/app/content-transition"
import { useRoutePreloader } from "@/lib/hooks/use-route-preloader"
import { PageLoading } from "@/components/ui/loading"

function AppWithRoutes() {
  const { navigate, currentPath, routes: routerRoutes } = useRouter()
  const { isAuthenticated, isLoading } = useAuth()

  useRoutePreloader()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        if (currentPath === '/login') {
          navigate('/dashboard', undefined, { replace: true })
        }
        else if (!currentPath || currentPath === '' || currentPath === '/') {
          navigate('/dashboard', undefined, { replace: true })
        }
      } else {
        if (currentPath !== '/login') {
          navigate('/login', undefined, { replace: true })
        }
      }
    }
  }, [isAuthenticated, isLoading, currentPath, navigate])

  if (isLoading) {
    return <PageLoading message="应用启动中..." />
  }

  const currentRoute = routerRoutes.find(route => route.path === currentPath)
  const isProtectedRoute = currentRoute?.protected || false

  if (isProtectedRoute) {
    return (
      <ProtectedRoute>
        <SidebarProvider
          style={
            {
              "--sidebar-width": "calc(var(--spacing) * 72)",
              "--header-height": "calc(var(--spacing) * 12)",
            } as React.CSSProperties
          }
        >
          <AppSidebar variant="inset" />
          <SidebarInset>
            <SiteHeader />
            <div className="flex flex-1 flex-col">
              <div className="@container/main flex flex-1 flex-col gap-2">
                <ContentTransition>
                  <RouterOutlet />
                </ContentTransition>
              </div>
            </div>
          </SidebarInset>
        </SidebarProvider>
      </ProtectedRoute>
    )
  }

  return (
    <ContentTransition>
      <RouterOutlet />
    </ContentTransition>
  )
}

export function SPAApp() {
  return (
    <RouterProvider routes={routes}>
      <AppWithRoutes />
    </RouterProvider>
  )
}
