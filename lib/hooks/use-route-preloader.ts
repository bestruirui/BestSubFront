import { useEffect, useCallback, useRef } from 'react'

const preloadCache = new Map<string, Promise<unknown>>()
const preloadingPaths = new Set<string>()

async function preloadComponent(path: string): Promise<unknown> {
    if (preloadCache.has(path)) {
        return preloadCache.get(path)
    }

    if (preloadingPaths.has(path)) {
        return Promise.resolve(null)
    }

    preloadingPaths.add(path)

    let importPromise: Promise<unknown>

    try {
        switch (path) {
            case '/dashboard':
                importPromise = import('@/components/pages/home/dashboard')
                break
            case '/subscriptions':
                importPromise = import('@/components/features/subscription')
                break
            case '/checks':
                importPromise = import('@/components/features/check')
                break
            case '/shares':
                importPromise = import('@/components/pages/share/share')
                break
            case '/storage':
                importPromise = import('@/components/pages/storage/storage')
                break
            case '/notifications':
                importPromise = import('@/components/features/notify')
                break
            case '/login':
                importPromise = import('@/components/pages/login/login')
                break
            default:
                preloadingPaths.delete(path)
                return Promise.resolve(null)
        }

        preloadCache.set(path, importPromise)

        importPromise.finally(() => {
            preloadingPaths.delete(path)
        })

        return importPromise
    } catch (error) {
        preloadingPaths.delete(path)
        throw error
    }
}

export function useRoutePreloader() {
    const preloadedCritical = useRef(false)

    const preloadRoute = useCallback(async (path: string) => {
        try {
            await preloadComponent(path)
        } catch (error) {
            console.warn(`Failed to preload route: ${path}`, error)
        }
    }, [])

    const preloadCriticalRoutes = useCallback(async () => {
        if (preloadedCritical.current) return
        preloadedCritical.current = true

        const criticalRoutes = ['/dashboard', '/subscriptions']

        const schedulePreload = () => {
            criticalRoutes.forEach(route => preloadRoute(route))
        }

        if ('requestIdleCallback' in window) {
            (window as typeof window & {
                requestIdleCallback: (callback: () => void, options?: { timeout: number }) => void
            }).requestIdleCallback(schedulePreload, { timeout: 2000 })
        } else {
            setTimeout(schedulePreload, 1000)
        }
    }, [preloadRoute])

    useEffect(() => {
        preloadCriticalRoutes()
    }, [preloadCriticalRoutes])

    return { preloadRoute }
}

export function useLinkPreloader() {
    const { preloadRoute } = useRoutePreloader()
    const timeoutRef = useRef<NodeJS.Timeout | null>(null)

    const handleMouseEnter = useCallback((path: string) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
        }

        timeoutRef.current = setTimeout(() => {
            preloadRoute(path)
        }, 100)
    }, [preloadRoute])

    return { handleMouseEnter }
} 