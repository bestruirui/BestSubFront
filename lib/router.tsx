"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { Loading } from '@/components/ui/loading'
import { NotFound } from '@/components/app/not-found'

export interface Route {
  path: string
  component: React.ComponentType
  title: string
  protected?: boolean
}

export interface RouteParams {
  [key: string]: string | undefined
}

export interface QueryParams {
  [key: string]: string | string[] | undefined
}

function parseRoute(hash: string): { path: string; params: RouteParams; query: QueryParams } {
  if (!hash) return { path: '', params: {}, query: {} }

  const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash

  const [pathWithParams, queryString] = cleanHash.split('?')

  const query: QueryParams = {}
  if (queryString) {
    const searchParams = new URLSearchParams(queryString)
    for (const [key, value] of searchParams) {
      const existing = query[key]
      if (existing === undefined) {
        query[key] = value
      } else if (Array.isArray(existing)) {
        existing.push(value)
      } else {
        query[key] = [existing, value]
      }
    }
  }

  const path = pathWithParams || ''
  const params: RouteParams = {}

  return { path, params, query }
}

function buildRoute(path: string, query?: QueryParams): string {
  if (!query || Object.keys(query).length === 0) {
    return path
  }

  const searchParams = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach(v => searchParams.append(key, v))
    } else if (value !== undefined) {
      searchParams.set(key, value)
    }
  })

  const queryString = searchParams.toString()
  return queryString ? `${path}?${queryString}` : path
}

interface RouterContextType {
  currentPath: string
  params: RouteParams
  query: QueryParams
  navigate: (path: string, query?: QueryParams, options?: NavigateOptions) => void
  goBack: () => void
  goForward: () => void
  routes: Route[]
  setRoutes: (routes: Route[]) => void
  isNavigating: boolean
  visitedPaths: Set<string>
  isFirstVisit: (path: string) => boolean
}

interface NavigateOptions {
  replace?: boolean
  state?: unknown
}

const RouterContext = createContext<RouterContextType | undefined>(undefined)

export function useRouter() {
  const context = useContext(RouterContext)
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider')
  }
  return context
}

interface RouterProviderProps {
  children: ReactNode
  routes: Route[]
}

export function RouterProvider({ children, routes: initialRoutes }: RouterProviderProps) {
  const [routes, setRoutes] = useState<Route[]>(initialRoutes)
  const [isNavigating, setIsNavigating] = useState(false)
  const [visitedPaths, setVisitedPaths] = useState<Set<string>>(new Set())

  const [routeState, setRouteState] = useState(() => {
    if (typeof window !== 'undefined') {
      return parseRoute(window.location.hash)
    }
    return { path: '', params: {}, query: {} }
  })
  const markPathAsVisited = useCallback((path: string) => {
    if (path && !visitedPaths.has(path)) {
      setVisitedPaths(prev => new Set(prev).add(path))
    }
  }, [visitedPaths])

  useEffect(() => {
    const handleHashChange = () => {
      const newState = parseRoute(window.location.hash)

      if (newState.path !== routeState.path ||
        JSON.stringify(newState.query) !== JSON.stringify(routeState.query)) {
        setRouteState(newState)
        setIsNavigating(false)
        markPathAsVisited(newState.path)
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [routeState.path, routeState.query, markPathAsVisited])

  useEffect(() => {
    markPathAsVisited(routeState.path)
  }, [routeState.path, markPathAsVisited])

  const navigate = useCallback((
    path: string,
    query?: QueryParams,
    options: NavigateOptions = {}
  ) => {
    setIsNavigating(true)
    const route = buildRoute(path, query)

    if (options.replace) {
      window.location.replace(`#${route}`)
    } else {
      window.location.hash = route
    }

    const matchedRoute = routes.find(r => r.path === path)
    if (matchedRoute) {
      document.title = `${matchedRoute.title} - BestSub`
    }
  }, [routes])

  const goBack = useCallback(() => {
    setIsNavigating(true)
    window.history.back()
  }, [])

  const goForward = useCallback(() => {
    setIsNavigating(true)
    window.history.forward()
  }, [])

  const isFirstVisit = useCallback((path: string) => {
    return !visitedPaths.has(path)
  }, [visitedPaths])

  const contextValue: RouterContextType = {
    currentPath: routeState.path,
    params: routeState.params,
    query: routeState.query,
    navigate,
    goBack,
    goForward,
    routes,
    setRoutes,
    isNavigating,
    visitedPaths,
    isFirstVisit
  }

  return (
    <RouterContext.Provider value={contextValue}>
      {children}
    </RouterContext.Provider>
  )
}

interface RouterOutletProps {
  fallback?: React.ComponentType
}

export function RouterOutlet({ fallback: Fallback }: RouterOutletProps) {
  const { currentPath, routes } = useRouter()

  if (routes.length === 0) {
    return <Loading variant="fullscreen" message="初始化应用..." />
  }

  const currentRoute = routes.find(route => route.path === currentPath)

  if (currentRoute) {
    const Component = currentRoute.component
    return <Component />
  }

  if (!currentPath || currentPath === '' || currentPath === '/') {
    return <Loading variant="fullscreen" message="正在跳转..." />
  }

  if (Fallback) {
    return <Fallback />
  }

  return <NotFound path={currentPath} />
}


