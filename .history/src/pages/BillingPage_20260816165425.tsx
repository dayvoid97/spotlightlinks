import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Check, Zap } from 'lucide-react'
import clsx from 'clsx'
import { api, ApiError } from '../lib/api'
import type { PlanConfig, SafeUser } from '../lib/types'
import { useAuth } from '../context/auth-context'
import { Card, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
import { FullPageSpinner } from '../components/ui/Spinner'
import { useToast } from '../context/toast-context'

/**
 * GET /api/checkout/plans, POST /api/checkout/create-session,
 * GET /api/checkout/session-status, POST /api/checkout/mock-activate.
 * See docs/08-billing-and-plans.md for the full checkout state machine,
 * including why there are two different "upgrade" endpoints.
 */
export default function BillingPage() {
  const { user, refresh } = useAuth()
  const toast = useToast()
  const [params, setParams] = useSearchParams()
  const [checkingOut, setCheckingOut] = useState<string | null>(null)
  const [activating, setActivating] = useState<string | null>(null)
  const [confirmed, setConfirmed] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: ['plans'],
    queryFn: () => api.get<{ plans: PlanConfig[] }>('/api/checkout/plans'),
  })

  const sessionId = params.get('session_id')
  const checkoutSuccess = params.get('checkout_success')
  const checkoutCanceled = params.get('checkout_canceled')
  const tier = params.get('tier')

  useEffect(() => {
    if (checkoutSuccess === 'true' && sessionId) {
      api
        .get<{ status: string; user?: SafeUser }>(
          `/api/checkout/session-status?session_id=${encodeURIComponent(sessionId)}&tier=${tier ?? ''}`
        )
        .then(() => {
          setConfirmed(true)
          refresh()
        })
        .catch(() => {
          toast.push('Could not confirm checkout status.', 'error')
        })
        .finally(() => {
          params.delete('checkout_success')
          params.delete('session_id')
          params.delete('tier')
          setParams(params, { replace: true })
        })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutSuccess, sessionId])

  async function startCheckout(planTier: string) {
    setCheckingOut(planTier)
    try {
      const data = await api.post<{ isMock: boolean; checkoutUrl: string }>('/api/checkout/create-session', {
        planTier,
      })
      window.location.href = data.checkoutUrl
    } catch (err) {
      toast.push(err instanceof ApiError ? err.message : 'Could not start checkout.', 'error')
      setCheckingOut(null)
    }
  }

  async function instantActivate(planTier: string) {
    setActivating(planTier)
    try {
      const data = await api.post<{ message: string }>('/api/checkout/mock-activate', { planTier })
      toast.push(data.message)
      refresh()
    } catch (err) {
      toast.push(err instanceof ApiError ? err.message : 'Activation failed.', 'error')
    } finally {
      setActivating(null)
    }
  }

  if (isLoading) return <FullPageSpinner label="Loading plans…" />

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Billing & plans</h1>
        <p className="text-sm text-ink-50">
          Current plan: <span className="text-ink-70">{user?.planTier ?? 'none'}</span> · asset
          limit {user?.assetLimit ?? 3}
        </p>
      </div>

      {confirmed && <Alert tone="success">Checkout confirmed — your plan has been updated.</Alert>}
      {checkoutCanceled === 'true' && <Alert tone="warning">Checkout was canceled.</Alert>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {data?.plans.map((plan) => {
          const isCurrent = user?.planTier === plan.id
          return (
            <Card key={plan.id} className={clsx(isCurrent && 'border-brand ring-1 ring-brand/30')}>
              <CardBody className="flex h-full flex-col gap-3 pt-5">
                {plan.allowsContentGeneration && (
                  <span className="flex w-fit items-center gap-1 rounded-full bg-brand-tint px-2 py-0.5 text-[10px] font-medium text-brand">
                    <Zap className="size-3" /> Content generator
                  </span>
                )}
                <div>
                  <p className="text-sm font-semibold text-ink">{plan.name}</p>
                  <p className="mt-1">
                    <span className="text-2xl font-bold text-ink">${plan.priceDollars}</span>
                    <span className="text-xs text-ink-50">/mo</span>
                  </p>
                </div>
                <p className="flex-1 text-xs text-ink-50">{plan.description}</p>
                <p className="text-xs text-ink-50">
                  {plan.assetLimit >= 999999 ? 'Unlimited' : plan.assetLimit} managed assets
                </p>

                {isCurrent ? (
                  <span className="flex items-center justify-center gap-1.5 rounded-lg border border-brand bg-brand-tint py-2 text-sm text-brand">
                    <Check className="size-3.5" /> Current plan
                  </span>
                ) : (
                  <div className="space-y-1.5">
                    <Button className="w-full" onClick={() => startCheckout(plan.id)} loading={checkingOut === plan.id}>
                      Upgrade
                    </Button>
                    <Button
                      className="w-full"
                      variant="ghost"
                      size="sm"
                      onClick={() => instantActivate(plan.id)}
                      loading={activating === plan.id}
                    >
                      Instant test activation
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
