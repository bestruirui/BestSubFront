import { apiBaseUrl, apiPath } from '../config/config'
import { tokenManager } from './token-manager'
import type { LoginResponse, UserInfo, ApiResponse, SubResponse, CheckResponse, CheckRequest, HealthResponse, SubRequest, DynamicConfigItem, SubNameAndID, NotifyResponse, NotifyRequest, NotifyTemplate, NotifyChannel, NotifyChannelConfigResponse, ShareResponse, ShareRequest } from '../../types'

const NORMALIZED_BASE_URL = apiBaseUrl.endsWith('/') ? apiBaseUrl.slice(0, -1) : apiBaseUrl
const DEFAULT_REQUEST_HEADERS: Record<string, string> = {}

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: Response
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

class ApiClient {
  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    requiresAuth: boolean = true
  ): Promise<T> {
    const url = `${NORMALIZED_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`

    const hasBody = options.body !== undefined && options.body !== null
    const mergedHeaders: Record<string, string> = {
      ...DEFAULT_REQUEST_HEADERS,
      ...(options.headers as Record<string, string> | undefined),
    }

    if (requiresAuth) {
      const token = await tokenManager.getValidToken()
      if (token) {
        mergedHeaders.Authorization = `Bearer ${token}`
      }
    }

    if (hasBody) {
      const existingHeaderKeys = Object.keys(mergedHeaders).map((k) => k.toLowerCase())
      if (!existingHeaderKeys.includes('content-type')) {
        mergedHeaders['Content-Type'] = 'application/json'
      }
    }

    const config: RequestInit = {
      ...options,
      headers: mergedHeaders,
    }

    try {
      const response = await fetch(url, config)

      if (!response.ok) {
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`

        try {
          const errorData = await response.json()
          if (errorData.message) {
            errorMessage = errorData.message
          }
        } catch {
        }

        throw new ApiError(errorMessage, response.status, response)
      }

      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      }

      return response.text() as unknown as T
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Network error occurred'
      )
    }
  }

  async get<T>(endpoint: string, requiresAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' }, requiresAuth)
  }

  async post<T>(endpoint: string, data?: unknown, requiresAuth: boolean = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'POST',
        ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
      },
      requiresAuth
    )
  }

  async delete<T>(endpoint: string, requiresAuth: boolean = true): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' }, requiresAuth)
  }

  async put<T>(endpoint: string, data?: unknown, requiresAuth: boolean = true): Promise<T> {
    return this.request<T>(
      endpoint,
      {
        method: 'PUT',
        ...(data !== undefined ? { body: JSON.stringify(data) } : {}),
      },
      requiresAuth
    )
  }
}

const apiClient = new ApiClient()
export const api = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      apiPath.auth.login,
      { username, password },
      false
    )
    return response.data
  },

  async logout(): Promise<void> {
    await apiClient.post<ApiResponse<void>>(apiPath.auth.logout, {})
  },

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      apiPath.auth.refresh,
      { refresh_token: refreshToken },
      false
    )
    return response.data
  },

  async getUserInfo(): Promise<UserInfo> {
    const response = await apiClient.get<ApiResponse<UserInfo>>(apiPath.auth.user)
    return response.data
  },
  async getSub(id?: number): Promise<SubResponse[]> {
    const url = id ? `${apiPath.sub}?id=${id}` : apiPath.sub
    const response = await apiClient.get<ApiResponse<SubResponse[]>>(url)
    return response.data
  },
  async getChecks(id?: number): Promise<CheckResponse[]> {
    const url = id ? `${apiPath.check}?id=${id}` : apiPath.check
    const response = await apiClient.get<ApiResponse<CheckResponse[]>>(url)
    return response.data
  },
  async getCheckTypes(): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>(`${apiPath.check}/type`)
    return response.data
  },
  async getCheckTypeConfig(type?: string): Promise<Record<string, DynamicConfigItem[]> | DynamicConfigItem[]> {
    const url = type
      ? `${apiPath.check}/type/config?type=${type}`
      : `${apiPath.check}/type/config`

    const response = await apiClient.get<ApiResponse<Record<string, DynamicConfigItem[]>>>(url)
    return response.data
  },
  async getSystemHealth(): Promise<HealthResponse> {
    const response = await apiClient.get<ApiResponse<HealthResponse>>(apiPath.system.health, false) // 系统健康检查不需要认证
    return response.data
  },
  async refreshSubscription(id: number): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`${apiPath.sub}/refresh/${id}`, {})
  },
  async runCheck(id: number): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`${apiPath.check}/${id}/run`, {})
  },
  async createSubscription(data: SubRequest): Promise<SubResponse> {
    const response = await apiClient.post<ApiResponse<SubResponse>>(apiPath.sub, data)
    return response.data
  },
  async updateSubscription(id: number, data: SubRequest): Promise<SubResponse> {
    const response = await apiClient.put<ApiResponse<SubResponse>>(`${apiPath.sub}/${id}`, data)
    return response.data
  },
  async deleteSubscription(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`${apiPath.sub}/${id}`)
  },
  async createCheck(data: CheckRequest): Promise<CheckResponse> {
    const response = await apiClient.post<ApiResponse<CheckResponse>>(apiPath.check, data)
    return response.data
  },
  async updateCheck(id: number, data: CheckRequest): Promise<CheckResponse> {
    const response = await apiClient.put<ApiResponse<CheckResponse>>(`${apiPath.check}/${id}`, data)
    return response.data
  },
  async deleteCheck(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`${apiPath.check}/${id}`)
  },
  async getSubNameAndID(): Promise<SubNameAndID[]> {
    const response = await apiClient.get<ApiResponse<SubNameAndID[]>>(`${apiPath.sub}/name`)
    return response.data
  },
  async getNotifyChannels(): Promise<NotifyChannel[]> {
    const response = await apiClient.get<ApiResponse<NotifyChannel[]>>(`${apiPath.notify}/channel`)
    return response.data
  },
  async getNotifyChannelConfig(channel?: string): Promise<NotifyChannelConfigResponse | DynamicConfigItem[]> {
    const url = channel
      ? `${apiPath.notify}/channel/config?channel=${encodeURIComponent(channel)}`
      : `${apiPath.notify}/channel/config`
    const response = await apiClient.get<ApiResponse<NotifyChannelConfigResponse | DynamicConfigItem[]>>(url)
    return response.data
  },
  async getNotifyList(): Promise<NotifyResponse[]> {
    const response = await apiClient.get<ApiResponse<NotifyResponse[]>>(apiPath.notify)
    return response.data
  },
  async createNotify(data: NotifyRequest): Promise<NotifyResponse> {
    const response = await apiClient.post<ApiResponse<NotifyResponse>>(apiPath.notify, data)
    return response.data
  },
  async updateNotify(id: number, data: NotifyRequest): Promise<NotifyResponse> {
    const response = await apiClient.put<ApiResponse<NotifyResponse>>(`${apiPath.notify}?id=${id}`, data)
    return response.data
  },
  async deleteNotify(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`${apiPath.notify}?id=${id}`)
  },
  async testNotify(data: NotifyRequest): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`${apiPath.notify}/test`, data)
  },
  async getNotifyTemplates(): Promise<NotifyTemplate[]> {
    const response = await apiClient.get<ApiResponse<NotifyTemplate[]>>(`${apiPath.notify}/template`)
    return response.data
  },
  async updateNotifyTemplate(data: NotifyTemplate): Promise<NotifyTemplate> {
    const response = await apiClient.put<ApiResponse<NotifyTemplate>>(`${apiPath.notify}/template`, data)
    return response.data
  },
  async getShares(id?: number): Promise<ShareResponse[]> {
    const url = id ? `${apiPath.share}?id=${id}` : apiPath.share
    const response = await apiClient.get<ApiResponse<ShareResponse[]>>(url)
    return response.data
  },
  async createShare(data: ShareRequest): Promise<ShareResponse> {
    const response = await apiClient.post<ApiResponse<ShareResponse>>(apiPath.share, data)
    return response.data
  },
  async updateShare(id: number, data: ShareRequest): Promise<ShareResponse> {
    const response = await apiClient.put<ApiResponse<ShareResponse>>(`${apiPath.share}/${id}`, data)
    return response.data
  },
  async deleteShare(id: number): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`${apiPath.share}/${id}`)
  },
}
