import { apiConfig, defaultRequestConfig } from '../config/config'
import type {
  LoginResponse,
  UserInfo,
  ApiResponse,
  SubResponse,
  CheckResponse,
  CheckRequest,
  HealthResponse,
  SubCreateRequest,
  SubUpdateRequest,
  DynamicConfigItem,
  SubNameAndID,
  NotifyResponse,
  NotifyRequest,
  NotifyTemplate,
  NotifyChannel,
  NotifyChannelConfigResponse,
} from '../types'

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
export class ApiClient {
  constructor() {
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = apiConfig.buildUrl(endpoint)

    const config: RequestInit = {
      ...defaultRequestConfig,
      ...options,
      headers: {
        ...defaultRequestConfig.headers,
        ...options.headers,
      },
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

  async get<T>(endpoint: string, token?: string): Promise<T> {
    const headers: Record<string, string> = { ...defaultRequestConfig.headers }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return this.request<T>(endpoint, {
      method: 'GET',
      headers
    })
  }

  async post<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
    const headers: Record<string, string> = { ...defaultRequestConfig.headers }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : null,
    })
  }

  async delete<T>(endpoint: string, token?: string): Promise<T> {
    const headers: Record<string, string> = { ...defaultRequestConfig.headers }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return this.request<T>(endpoint, {
      method: 'DELETE',
      headers
    })
  }

  async put<T>(endpoint: string, data?: unknown, token?: string): Promise<T> {
    const headers: Record<string, string> = { ...defaultRequestConfig.headers }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return this.request<T>(endpoint, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : null,
    })
  }
}

export const apiClient = new ApiClient()
export const authApi = {
  async login(username: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      apiConfig.endpoints.auth.login,
      { username, password }
    )
    return response.data
  },

  async logout(token: string): Promise<void> {
    await apiClient.post<ApiResponse<void>>(apiConfig.endpoints.auth.logout, {}, token)
  },

  async refreshToken(refreshToken: string): Promise<LoginResponse> {
    const response = await apiClient.post<ApiResponse<LoginResponse>>(
      apiConfig.endpoints.auth.refresh,
      { refresh_token: refreshToken }
    )
    return response.data
  },

  async getUserInfo(token: string): Promise<UserInfo> {
    const response = await apiClient.get<ApiResponse<UserInfo>>(apiConfig.endpoints.auth.user, token)
    return response.data
  },
}

export const dashboardApi = {
  async getSubscriptions(token: string, id?: number): Promise<SubResponse[]> {
    const url = id ? `${apiConfig.endpoints.sub}?id=${id}` : apiConfig.endpoints.sub
    const response = await apiClient.get<ApiResponse<SubResponse[]>>(url, token)
    return response.data
  },
  async getChecks(token: string, id?: number): Promise<CheckResponse[]> {
    const url = id ? `${apiConfig.endpoints.check}?id=${id}` : apiConfig.endpoints.check
    const response = await apiClient.get<ApiResponse<CheckResponse[]>>(url, token)
    return response.data
  },
  async getCheckTypes(token: string): Promise<string[]> {
    const response = await apiClient.get<ApiResponse<string[]>>('/api/v1/check/type', token)
    return response.data
  },
  async getCheckTypeConfig(token: string, type?: string): Promise<Record<string, DynamicConfigItem[]> | DynamicConfigItem[]> {
    const url = type
      ? `/api/v1/check/type/config?type=${type}`
      : '/api/v1/check/type/config'

    const response = await apiClient.get<ApiResponse<Record<string, DynamicConfigItem[]>>>(url, token)
    return response.data
  },
  async getSystemHealth(): Promise<HealthResponse> {
    const response = await apiClient.get<ApiResponse<HealthResponse>>(apiConfig.endpoints.system.health)
    return response.data
  },
  async refreshSubscription(id: number, token: string): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`/api/v1/sub/refresh/${id}`, {}, token)
  },

  async runCheck(id: number, token: string): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`/api/v1/check/${id}/run`, {}, token)
  },
  async createSubscription(data: SubCreateRequest, token: string): Promise<SubResponse> {
    const response = await apiClient.post<ApiResponse<SubResponse>>(apiConfig.endpoints.sub, data, token)
    return response.data
  },

  async updateSubscription(id: number, data: SubUpdateRequest, token: string): Promise<SubResponse> {
    const response = await apiClient.put<ApiResponse<SubResponse>>(`${apiConfig.endpoints.sub}/${id}`, data, token)
    return response.data
  },
  async deleteSubscription(id: number, token: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`${apiConfig.endpoints.sub}/${id}`, token)
  },
  async createCheck(data: CheckRequest, token: string): Promise<CheckResponse> {
    const response = await apiClient.post<ApiResponse<CheckResponse>>(apiConfig.endpoints.check, data, token)
    return response.data
  },
  async updateCheck(id: number, data: CheckRequest, token: string): Promise<CheckResponse> {
    const response = await apiClient.put<ApiResponse<CheckResponse>>(`${apiConfig.endpoints.check}/${id}`, data, token)
    return response.data
  },
  async deleteCheck(id: number, token: string): Promise<void> {
    await apiClient.delete<ApiResponse<void>>(`${apiConfig.endpoints.check}/${id}`, token)
  },
  async getSubNameAndID(token: string): Promise<SubNameAndID[]> {
    const response = await apiClient.get<ApiResponse<SubNameAndID[]>>(apiConfig.endpoints.subNameAndID, token)
    return response.data
  },

  // Notify API methods
  async getNotifyChannels(token: string): Promise<NotifyChannel[]> {
    const response = await apiClient.get<ApiResponse<NotifyChannel[]>>(`${apiConfig.endpoints.notify}/channel`, token)
    return response.data
  },

  async getNotifyChannelConfig(token: string, channel?: string): Promise<NotifyChannelConfigResponse | DynamicConfigItem[]> {
    const url = channel
      ? `${apiConfig.endpoints.notify}/channel/config?channel=${encodeURIComponent(channel)}`
      : `${apiConfig.endpoints.notify}/channel/config`
    const response = await apiClient.get<ApiResponse<NotifyChannelConfigResponse | DynamicConfigItem[]>>(url, token)
    return response.data
  },

  async getNotifyList(token: string): Promise<NotifyResponse[]> {
    const response = await apiClient.get<ApiResponse<NotifyResponse[]>>(apiConfig.endpoints.notify, token)
    return response.data
  },

  async createNotify(data: NotifyRequest, token: string): Promise<NotifyResponse> {
    const response = await apiClient.post<ApiResponse<NotifyResponse>>(apiConfig.endpoints.notify, data, token)
    return response.data
  },

  async updateNotify(id: number, data: NotifyRequest, token: string): Promise<NotifyResponse> {
    const response = await apiClient.put<ApiResponse<NotifyResponse>>(`${apiConfig.endpoints.notify}?id=${id}`, data, token)
    return response.data
  },

  async deleteNotify(id: number, token: string): Promise<void> {
    try {
      await apiClient.delete<ApiResponse<void>>(`${apiConfig.endpoints.notify}?id=${id}`, token)
    } catch (error) {
      // If deletion is successful but returns an empty response, do not throw an error
      if (error instanceof ApiError && (error.status === 204 || error.status === 205)) {
        return
      }
      throw error
    }
  },

  async testNotify(data: NotifyRequest, token: string): Promise<void> {
    await apiClient.post<ApiResponse<void>>(`${apiConfig.endpoints.notify}/test`, data, token)
  },

  async getNotifyTemplates(token: string): Promise<NotifyTemplate[]> {
    const response = await apiClient.get<ApiResponse<NotifyTemplate[]>>(`${apiConfig.endpoints.notify}/template`, token)
    return response.data
  },

  async updateNotifyTemplate(data: NotifyTemplate, token: string): Promise<NotifyTemplate> {
    const response = await apiClient.put<ApiResponse<NotifyTemplate>>(`${apiConfig.endpoints.notify}/template`, data, token)
    return response.data
  },
}
