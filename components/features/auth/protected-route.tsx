"use client"

import { useEffect } from "react"
import { useRouter } from "@/lib/router/router"
import { useAuth } from "@/components/providers/auth-provider"
import { Loading } from "@/components/ui/loading"

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const { navigate, currentPath } = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated && currentPath !== '/login') {
      navigate('/login', undefined, { replace: true })
    }
  }, [isAuthenticated, isLoading, currentPath, navigate])

  if (isLoading) {
    return (
      fallback || (
        <Loading
          variant="fullscreen"
          message="验证身份中..."
          size="lg"
        />
      )
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
