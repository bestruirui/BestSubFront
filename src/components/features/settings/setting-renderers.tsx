import { Controller, Control } from "react-hook-form"
import { Input } from "@/src/components/ui/input"
import { Label } from "@/src/components/ui/label"
import { Switch } from "@/src/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select"
import type { SettingAdvance, GroupSettingAdvance, FormValues } from "@/src/types/setting"

export const getNavData = (settings: GroupSettingAdvance[]) => {
  if (!settings || settings.length === 0) {
    return []
  }

  return settings.map((group) => ({
    name: group.group_name,
    id: group.group_name.toLowerCase().replace(/\s+/g, '-')
  }))
}

const SettingContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 border rounded-lg bg-card hover:shadow-sm transition-all space-y-3">
    {children}
  </div>
)

const SettingLabel = ({ setting }: { setting: SettingAdvance }) => (
  <>
    <Label className="text-sm font-medium leading-none">
      {setting.name || 'Unnamed Setting'}
    </Label>
    {setting.desc && (
      <p className="text-xs text-muted-foreground leading-relaxed">{setting.desc}</p>
    )}
  </>
)

const renderBooleanSetting = (setting: SettingAdvance, field: any) => {
  const isChecked = field.value === 'true' || field.value === '1'

  return (
    <SettingContainer>
      <div className="flex items-center justify-between">
        <div className="flex-1 pr-4">
          <SettingLabel setting={setting} />
        </div>
        <Switch
          checked={isChecked}
          onCheckedChange={(checked) => {
            field.onChange(checked.toString())
          }}
        />
      </div>
    </SettingContainer>
  )
}

const renderNumberSetting = (setting: SettingAdvance, field: any) => (
  <SettingContainer>
    <SettingLabel setting={setting} />
    <Input
      type="number"
      value={field.value || ''}
      onChange={(e) => {
        const value = e.target.value
        if (value === '' || !isNaN(Number(value))) {
          field.onChange(value)
        }
      }}
      className="h-10 w-full"
    />
  </SettingContainer>
)

const renderSelectSetting = (setting: SettingAdvance, field: any) => {
  const options = setting.options
    ? setting.options.split(',').map(opt => opt.trim()).filter(Boolean)
    : []

  return (
    <SettingContainer>
      <SettingLabel setting={setting} />
      <Select
        value={field.value || ''}
        onValueChange={field.onChange}
      >
        <SelectTrigger className="w-full h-10">
          <SelectValue placeholder="选择选项" />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option} value={option}>{option}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </SettingContainer>
  )
}

const renderTextSetting = (setting: SettingAdvance, field: any) => (
  <SettingContainer>
    <SettingLabel setting={setting} />
    <Input
      value={field.value || ''}
      onChange={(e) => field.onChange(e.target.value)}
      className="h-10 w-full"
    />
  </SettingContainer>
)

export const renderSettingItem = (setting: SettingAdvance, control: Control<FormValues>) => {
  if (!setting || !setting.key) {
    return (
      <div className="text-destructive text-sm p-2">
        Invalid setting configuration
      </div>
    )
  }

  return (
    <Controller
      name={setting.key}
      control={control}
      render={({ field }) => {
        switch (setting.type) {
          case 'boolean':
            return renderBooleanSetting(setting, field)
          case 'number':
            return renderNumberSetting(setting, field)
          case 'select':
            return renderSelectSetting(setting, field)
          default:
            return renderTextSetting(setting, field)
        }
      }}
    />
  )
}

export const renderSettingsGroup = (group: GroupSettingAdvance, control: Control<FormValues>) => {
  if (!group || !group.data) return null

  return (
    <div className="space-y-4">
      {group.data.map((setting: SettingAdvance) => (
        <div key={setting.key}>
          {renderSettingItem(setting, control)}
        </div>
      ))}
    </div>
  )
}

export const renderError = (error: string | null) => (
  <div className="flex flex-col items-center justify-center h-64 space-y-3">
    <div className="flex items-center gap-2 text-destructive">
      <span className="font-medium">加载失败</span>
    </div>
    <p className="text-sm text-muted-foreground text-center max-w-sm">
      {error || '请稍后重试'}
    </p>
  </div>
)