/**
 * 登录请求类型
 */
export interface LoginRequest {
  username: string
  password: string
}

/**
 * 登录响应类型
 */
export interface LoginResponse {
  access_token: string
  refresh_token: string
  access_expires_at: string
  refresh_expires_at: string
}

/**
 * 用户信息类型
 */
export interface UserInfo {
  username: string
  created_at?: string
  updated_at?: string
}
export interface SessionInfo {
  id: number
  is_active: boolean
  client_ip: string
  user_agent: string
  expires_at: string
  created_at: string
  last_access_at: string
}

export interface SessionListResponse {
  sessions: SessionInfo[]
  total: number
}

export interface ChangePasswordRequest {
  username: string
  old_password: string
  new_password: string
}

export interface UpdateUserInfoRequest {
  username: string
}

export interface RefreshTokenRequest {
  refresh_token: string
}

export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

export interface SubConfig {
  url: string
  proxy?: boolean
  timeout?: number
  type?: 'clash' | 'singbox' | 'base64' | 'v2ray' | 'auto'
}

export interface SubCreateRequest {
  name: string
  enable: boolean
  cron_expr: string
  config: SubConfig
}

export interface SubUpdateRequest {
  name: string
  enable: boolean
  cron_expr: string
  config: SubConfig
}

export interface SubResult {
  success: number
  fail: number
  msg: string
  raw_count: number
  count: number
  last_run: string
  duration: number
}

export interface SubNodeInfo {
  raw_count: number
  alive_count: number
  speed_up: number
  speed_down: number
  delay: number
  risk: number
}

export interface SubResponse {
  id: number
  name: string
  enable: boolean
  status: string
  cron_expr: string
  created_at: string
  updated_at: string
  result: SubResult
  node_info: SubNodeInfo
  config: SubConfig
}

export interface CheckResult {
  duration: number
  extra: Record<string, unknown>
  last_run: string
  msg: string
}

export interface CheckTask {
  cron_expr: string
  log_level: string
  log_write_file: boolean
  notify: boolean
  notify_channel: number
  timeout: number
  type: string
  sub_id: number[]
}

export interface CheckResponse {
  id: number
  name: string
  enable: boolean
  config: Record<string, unknown>
  result: CheckResult
  task: CheckTask
  status: string
}

export interface HealthResponse {
  status: string
  database: string
  timestamp: string
}

/**
 * 错误响应类型
 */
export interface ErrorResponse {
  error: string
  message?: string
  status?: number
}

/**
 * 订阅名称和ID
 */
export interface SubNameAndID {
  id: number
  name: string
}

/**
 * 检测类型配置项
 */
export interface CheckTypeConfig {
  name: string
  key: string
  type: string
  default: string
  options: string
  require: boolean
  desc: string
}

/**
 * 检测类型响应
 */
export interface CheckTypeResponse {
  types: string[]
  configs: Record<string, CheckTypeConfig[]>
}

/**
 * 动态配置值类型
 */
export type ConfigValue = string | number | boolean

/**
 * 动态配置对象类型
 */
export interface DynamicConfig {
  [key: string]: ConfigValue
}
