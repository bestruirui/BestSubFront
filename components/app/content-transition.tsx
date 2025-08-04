"use client"

import { useEffect, useState, ReactNode, useRef } from "react"
import { useRouter } from "@/lib/router"
import { Spinner } from "@/components/ui/loading"

interface ContentTransitionProps {
    children: ReactNode
    className?: string
    loadingMessage?: string
}

export function ContentTransition({
    children,
    className = "",
    loadingMessage = "页面加载中..."
}: ContentTransitionProps) {
    const { currentPath, isNavigating, isFirstVisit } = useRouter()
    const [displayChildren, setDisplayChildren] = useState(children)
    const [isTransitioning, setIsTransitioning] = useState(false)
    const childrenRef = useRef(children)

    if (childrenRef.current !== children) {
        childrenRef.current = children
    }

    useEffect(() => {
        if (isNavigating) {
            setIsTransitioning(true)
            return
        } else {
            const timer = setTimeout(() => {
                setDisplayChildren(childrenRef.current)
                setIsTransitioning(false)
            }, 150)
            return () => clearTimeout(timer)
        }
    }, [isNavigating])

    if ((isNavigating || isTransitioning) && isFirstVisit(currentPath)) {
        return (
            <div className={`transition-all duration-200 ease-in-out ${className} flex items-center justify-center min-h-[60vh] w-full`}>
                <div className="text-center">
                    <Spinner size="md" className="mb-4" />
                    <p className="text-muted-foreground text-sm">{loadingMessage}</p>
                </div>
            </div>
        )
    }

    return (
        <div
            className={`animate-in fade-in duration-300 ${className}`}
            key={currentPath}
        >
            {displayChildren}
        </div>
    )
} 