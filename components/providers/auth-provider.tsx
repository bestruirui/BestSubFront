"use client"

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { authApi } from '@/lib/api/client'
import type { UserInfo, LoginResponse } from '@/lib/types'

interface AuthContextType {
  user: UserInfo | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (username: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}


const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  ACCESS_EXPIRES: 'access_expires_at',
  REFRESH_EXPIRES: 'refresh_expires_at',
} as const

const tokenStorage = {
  set: (tokens: LoginResponse) => {
    if (typeof window === 'undefined') return
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, tokens.access_token)
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, tokens.refresh_token)
    localStorage.setItem(TOKEN_KEYS.ACCESS_EXPIRES, tokens.access_expires_at)
    localStorage.setItem(TOKEN_KEYS.REFRESH_EXPIRES, tokens.refresh_expires_at)
  },

  get: () => {
    if (typeof window === 'undefined') return null
    const accessToken = localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN)
    const refreshToken = localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN)
    if (!accessToken || !refreshToken) return null

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      access_expires_at: localStorage.getItem(TOKEN_KEYS.ACCESS_EXPIRES) || '',
      refresh_expires_at: localStorage.getItem(TOKEN_KEYS.REFRESH_EXPIRES) || '',
    }
  },

  clear: () => {
    if (typeof window === 'undefined') return
    Object.values(TOKEN_KEYS).forEach(key => localStorage.removeItem(key))
  },

  isExpired: (expiresAt: string) => {
    if (!expiresAt) return true
    return new Date(expiresAt) <= new Date()
  }
}

interface AuthProviderProps {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  const login = useCallback(async (username: string, password: string) => {
    try {
      const response = await authApi.login(username, password)
      tokenStorage.set(response)

      const userInfo = await authApi.getUserInfo(response.access_token)
      setUser(userInfo)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      const tokens = tokenStorage.get()
      if (tokens?.access_token) {
        await authApi.logout(tokens.access_token)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      tokenStorage.clear()
      setUser(null)
    }
  }, [])

  const refreshToken = useCallback(async (): Promise<void> => {
    try {
      const tokens = tokenStorage.get()
      if (!tokens?.refresh_token) {
        throw new Error('No refresh token available')
      }

      if (tokenStorage.isExpired(tokens.refresh_expires_at)) {
        throw new Error('Refresh token expired')
      }

      const response = await authApi.refreshToken(tokens.refresh_token)
      tokenStorage.set(response)

      const userInfo = await authApi.getUserInfo(response.access_token)
      setUser(userInfo)
    } catch (error) {
      console.error('Token refresh failed:', error)
      tokenStorage.clear()
      setUser(null)
      throw error
    }
  }, [])


  useEffect(() => {
    const initAuth = async () => {
      try {
        const tokens = tokenStorage.get()
        if (!tokens) {
          setIsLoading(false)
          return
        }

        if (tokenStorage.isExpired(tokens.refresh_expires_at)) {
          tokenStorage.clear()
          setIsLoading(false)
          return
        }

        if (tokenStorage.isExpired(tokens.access_expires_at)) {
          await refreshToken()
        } else {
          const userInfo = await authApi.getUserInfo(tokens.access_token)
          setUser(userInfo)
        }
      } catch (error) {
        console.error('Auth initialization failed:', error)
        tokenStorage.clear()
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [refreshToken])

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
