export interface SubConfig {
    url: string
    proxy?: boolean
    timeout?: number
    type?: 'clash' | 'singbox' | 'base64' | 'v2ray' | 'auto'
}

export interface SubRequest {
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
    last_run: string
    duration: number
}

export interface SubNodeInfo {
    count: number
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
    info: SubNodeInfo
    config: SubConfig
}

export interface SubNameAndID {
    id: number
    name: string
} 