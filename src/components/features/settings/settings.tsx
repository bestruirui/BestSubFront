"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useForm } from "react-hook-form"

import {
  Dialog,
  DialogContent,
} from "@/src/components/ui/dialog"
import { useSettings, useUpdateSettings } from "@/src/lib/queries/setting-queries"
import { getNavData, renderSettingsGroup, renderError } from "./setting-renderers"
import { SettingsLayout } from "./SettingsLayout"
import { SettingsActions } from "./SettingsActions"
import { InlineLoading } from "@/src/components/ui/loading"
import type { FormValues, Setting } from "@/src/types/setting"

interface SettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}


export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState("")
  const { data: settings = [], isLoading, error } = useSettings()
  const updateSettingsMutation = useUpdateSettings()

  const form = useForm<FormValues>({
    mode: 'onChange',
    shouldUnregister: false,
    shouldFocusError: true,
  })

  const nav = useMemo(() => getNavData(settings), [settings])

  useEffect(() => {
    if (nav && nav.length > 0 && !activeTab && nav[0]) {
      setActiveTab(nav[0].id)
    }
  }, [nav])

  useEffect(() => {
    if (!isLoading && settings.length > 0) {
      const defaultValues: FormValues = {}

      settings.forEach(group => {
        group.data.forEach(setting => {
          defaultValues[setting.key] = setting.value || ''
        })
      })

      form.reset(defaultValues, {
        keepDirty: false,
        keepDirtyValues: false,
        keepErrors: false,
        keepTouched: false,
        keepSubmitCount: false
      })
    }
  }, [isLoading, settings, form])

  const currentGroup = useMemo(() => {
    if (!nav || !activeTab || !settings.length) return null
    return settings.find(group =>
      group.group_name.toLowerCase().includes(activeTab.toLowerCase())
    ) || settings[0]
  }, [nav, activeTab, settings])

  const { dirtyFields, isDirty } = form.formState
  const hasChanges = settings.length > 0 && isDirty

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()

    if (!hasChanges) {
      onOpenChange(false)
      return
    }

    const changes: Setting[] = []
    const formValues = form.getValues()

    Object.keys(dirtyFields).forEach(key => {
      const value = formValues[key]
      if (value !== undefined) {
        const stringValue = typeof value === 'string' ? value : String(value)
        changes.push({ key, value: stringValue })
      }
    })

    if (changes.length > 0) {
      try {
        await updateSettingsMutation.mutateAsync(changes)
        onOpenChange(false)
      } catch (err) {
        console.error('Failed to save settings:', err)
      }
    } else {
      onOpenChange(false)
    }
  }, [hasChanges, dirtyFields, form.getValues, updateSettingsMutation, onOpenChange])

  const renderContent = useMemo(() => {
    if (error) return renderError(error.message)
    if (currentGroup && currentGroup.data) {
      return renderSettingsGroup(currentGroup, form.control)
    }

    return (
      <div className="text-center text-muted-foreground">
        No settings found
      </div>
    )
  }, [error, currentGroup, form.control])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 md:max-h-[600px] md:max-w-[800px] lg:max-w-[900px] max-h-[90vh] h-full md:h-auto w-[95vw] sm:w-[90vw] md:w-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-[600px] w-full">
            <div className="flex flex-col items-center justify-center space-y-3">
              <InlineLoading message="Loading settings..." size="sm" />
            </div>
          </div>
        ) : (
          <SettingsLayout
            nav={nav}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            onSubmit={handleSubmit}
            renderActions={(isMobile) => (
              <SettingsActions
                onCancel={() => onOpenChange(false)}
                isMobile={!!isMobile}
                hasChanges={hasChanges}
              />
            )}
          >
            {renderContent}
          </SettingsLayout>
        )}
      </DialogContent>
    </Dialog>
  )
}