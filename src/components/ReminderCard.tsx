import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { BellRing } from 'lucide-react'
import { api, ApiError } from '../lib/api'
import type { ClientSummary } from '../lib/types'
import { useToast } from '../context/toast-context'
import { Card, CardBody, CardHeader, CardTitle } from './ui/Card'
import { Button } from './ui/Button'
import { Input, Label, Select } from './ui/Input'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

/** "9:00 AM" for an hour 0..23. */
function hourLabel(h: number) {
  const period = h < 12 ? 'AM' : 'PM'
  const display = h % 12 === 0 ? 12 : h % 12
  return `${display}:00 ${period}`
}

const LOCAL_TZ =
  (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone) || 'UTC'

/**
 * Per-asset weekly re-run nudge. The product's value is treating AI visibility
 * as a signal you check on a cadence, so each business gets its own day + time
 * and we email the owner a reminder to run a fresh probe on that asset. Phone
 * is collected now for a future SMS channel.
 */
export function ReminderCard({ client }: { client: ClientSummary }) {
  const toast = useToast()
  const queryClient = useQueryClient()

  const [enabled, setEnabled] = useState(client.reminderEnabled ?? false)
  const [phone, setPhone] = useState(client.reminderPhone ?? '')
  const [day, setDay] = useState<number>(client.reminderDay ?? 1) // default Monday
  const [hour, setHour] = useState<number>(client.reminderHour ?? 9) // default 9 AM
  const [saving, setSaving] = useState(false)

  async function save() {
    setSaving(true)
    try {
      await api.patch(`/api/clients/${client.slug}/reminder`, {
        enabled,
        phone: phone.trim() || null,
        day,
        hour,
        timezone: LOCAL_TZ,
      })
      queryClient.invalidateQueries({ queryKey: ['client', client.slug] })
      queryClient.invalidateQueries({ queryKey: ['clients'] })
      toast.push(
        enabled
          ? `Weekly reminder set for ${DAYS[day]} at ${hourLabel(hour)}.`
          : 'Weekly reminder turned off.',
        'success'
      )
    } catch (err) {
      toast.push(err instanceof ApiError ? err.message : 'Could not save reminder.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-1.5">
          <BellRing className="size-4 text-brand" /> Weekly probe reminder
        </CardTitle>
        <label className="flex cursor-pointer items-center gap-2 text-xs text-ink-50">
          <input
            type="checkbox"
            checked={enabled}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          {enabled ? 'On' : 'Off'}
        </label>
      </CardHeader>
      <CardBody className="space-y-4 pt-3">
        <p className="text-xs text-ink-50">
          AI answers drift week to week. Pick a day and time and we'll email you a nudge to run a
          fresh probe for <span className="text-ink-70">{client.name}</span> so its visibility trend
          stays current.
        </p>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="reminder-day">Day of week</Label>
            <Select
              id="reminder-day"
              value={day}
              onChange={(e) => setDay(Number(e.target.value))}
              disabled={!enabled}
            >
              {DAYS.map((d, i) => (
                <option key={d} value={i}>
                  {d}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="reminder-hour">Time</Label>
            <Select
              id="reminder-hour"
              value={hour}
              onChange={(e) => setHour(Number(e.target.value))}
              disabled={!enabled}
            >
              {Array.from({ length: 24 }, (_, h) => (
                <option key={h} value={h}>
                  {hourLabel(h)}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <Label htmlFor="reminder-phone">
            Phone number <span className="text-ink-30">(optional — for SMS reminders, coming soon)</span>
          </Label>
          <Input
            id="reminder-phone"
            type="tel"
            placeholder="+1 555 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-[11px] text-ink-30">Times are in your local zone ({LOCAL_TZ}).</p>
          <Button size="sm" onClick={save} loading={saving}>
            Save reminder
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
