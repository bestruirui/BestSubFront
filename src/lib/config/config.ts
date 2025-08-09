export const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASEURL || ''

export const apiPath = {
  auth: {
    login: '/api/v1/auth/login',
    logout: '/api/v1/auth/logout',
    refresh: '/api/v1/auth/refresh',
    user: '/api/v1/auth/user',
  },
  sub: '/api/v1/sub',
  check: '/api/v1/check',
  notify: '/api/v1/notify',
  share: '/api/v1/share',
  system: {
    health: '/api/v1/system/health',
    info: '/api/v1/system/info',
  },
} as const

export const APP_NAME = 'BestSub'
