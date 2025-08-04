
export interface AppConfig {
  apiBaseUrl: string
  appName: string
  isDevelopment: boolean
  isProduction: boolean
}

export function getAppConfig(): AppConfig {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASEURL || ''

  return {
    apiBaseUrl: apiBaseUrl.trim() === '' ? getCurrentOrigin() : apiBaseUrl.replace(/\/$/, ''),
    appName: process.env.NEXT_PUBLIC_APP_NAME || 'BestSub',
    isDevelopment: process.env.NODE_ENV === 'development',
    isProduction: process.env.NODE_ENV === 'production',
  }
}

function getCurrentOrigin(): string {
  if (typeof window !== 'undefined') {
    return window.location.origin
  }

  const vercelUrl = process.env.VERCEL_URL
  if (vercelUrl) {
    return `https://${vercelUrl}`
  }

  return ''
}

export const apiConfig = {
  getBaseUrl(): string {
    return getAppConfig().apiBaseUrl
  },
  buildUrl(endpoint: string): string {
    const baseUrl = this.getBaseUrl()
    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
    return `${baseUrl}${normalizedEndpoint}`
  },

  endpoints: {
    auth: {
      login: '/api/v1/auth/login',
      logout: '/api/v1/auth/logout',
      refresh: '/api/v1/auth/refresh',
      user: '/api/v1/auth/user',
    },
    sub: '/api/v1/sub',
    subNameAndID: '/api/v1/sub/name',
    check: '/api/v1/check',
    system: {
      health: '/api/v1/system/health',
      info: '/api/v1/system/info',
    },
  } as const,
}

export const defaultRequestConfig = {
  headers: {
    'Content-Type': 'application/json',
  },
}

export function getAuthRequestConfig(token?: string) {
  return {
    ...defaultRequestConfig,
    headers: {
      ...defaultRequestConfig.headers,
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  }
}
