
export interface SettingAdvance {
    name: string
    key: string
    type: string
    value: string
    options: string
    require: boolean
    desc: string
}

export interface GroupSettingAdvance {
    group_name: string
    description: string
    data: SettingAdvance[]
}

export interface Setting {
    key: string
    value: string
}

export interface FormValues {
    [key: string]: string
}