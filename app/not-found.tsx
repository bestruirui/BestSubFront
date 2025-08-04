"use client"

import { useEffect } from "react"
import { SPAApp } from "@/components/providers"

export default function NotFound() {
    useEffect(() => {
        const currentPath = window.location.pathname
        if (currentPath !== '/') {
            window.location.href = `/#${currentPath}${window.location.search}${window.location.hash}`
        }
    }, [])
    return <SPAApp />
} 