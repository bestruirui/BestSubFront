export interface ShareConfig {
    template: string
    max_access_count: number
    expires: number
    sub_id: number[]
    filter: ShareFilter
}

export interface ShareRequest {
    enable: boolean
    name: string
    token: string
    config: ShareConfig
}

export interface ShareResponse {
    id: number
    name: string
    token: string
    enable: boolean
    access_count: number
    config: ShareConfig
}

export interface ShareFilter {
    sub_id: number[]
    speed_up_more: number
    speed_down_more: number
    country: number[]
    delay_less_than: number
    alive_status: number
    risk_less_than: number
}