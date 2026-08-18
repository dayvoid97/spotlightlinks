/**
 * Shared types for the Quasar Probe console.
 *
 * These mirror shapes returned by xsl-backend — specifically
 * `xsl-backend/src/db/schema.ts` (row shapes) and the various
 * `xsl-backend/src/server/routes/*.routes.ts` files (response envelopes).
 * Kept hand-written and read-only on purpose: the backend is off-limits to
 * edit from this project, so there is no shared-package codegen step. If a
 * backend response shape changes, update it here to match.
 */

export type EngineName = 'gemini' | 'perplexity' | 'anthropic'

export type PlanTier = 'none' | 'starter_49' | 'growth_199' | 'scale_299' | 'enterprise_599'

export interface SafeUser {
  id: string
  email: string
  name: string | null
  role: 'user' | 'admin' | string
  planTier: PlanTier
  assetLimit: number
  company?: string | null
  verified: boolean
  disclaimerAcceptedAt: string | null
  createdAt: string
  lastLoginAt?: string | null
}

export interface EngineHealthEntry {
  ok: number
  failed: number
  status: 'ok' | 'failed' | 'missing'
  lastProbedAt: string | null
  lastError?: string | null
}

export interface EngineCoverage {
  gemini: 'ok' | 'failed' | 'missing'
  anthropic: 'ok' | 'failed' | 'missing'
  perplexity: 'ok' | 'failed' | 'missing'
  isComplete: boolean
  completeCount: number
  totalKnown: number
}

export interface CycleHistoryEntry {
  cycleId: string
  startedAt: string
  totalRuns: number
  validRuns: number
  failedRuns: number
  engines: Record<string, { ok: number; failed: number; status: 'ok' | 'failed' | 'missing' }>
  allEnginesCovered: boolean
}

/** GET /api/clients list item — a `clients` row enriched with computed fields. */
export interface ClientSummary {
  id: string
  slug: string
  name: string
  legalName: string | null
  domain: string | null
  aliases: string[]
  competitors: string[]
  city: string | null
  state: string | null
  active: boolean
  ownerEmail: string | null
  ownerUserId: string | null
  isPublic: boolean
  deletedAt: string | null
  subduedUntil: string | null
  subscriptionStatus: string
  reminderEnabled?: boolean
  reminderPhone?: string | null
  reminderDay?: number | null
  reminderHour?: number | null
  reminderTimezone?: string | null
  createdAt: string
  isOwner: boolean
  promptCount: number
  totalRuns: number
  validRuns: number
  lastProbedAt: string | null
  lastProbedByEngine: Record<string, string | null>
  probesToday: number
  engineHealth: Record<string, EngineHealthEntry>
  engineCoverage: EngineCoverage
  missingEngines: string[]
  cycleHistory: CycleHistoryEntry[]
  logoUrl: string | null
  mediaCount: number
  hasConfig: boolean
  publicReportUrl: string
}

export interface SubduedClient extends ClientSummary {
  daysRemaining: number
  canRecover: boolean
}

export interface Prompt {
  id: string
  clientId: string
  text: string
  intent: string
  locale: string
  source?: 'generative_suggest' | 'customer_suggest' | string
  runs: number | null
  active: boolean
  createdAt: string
}

export interface ClientFile {
  slug: string
  businessName?: string
  name?: string
  description?: string
  zip?: string
  categories?: string[]
  competitors?: string[]
  aliases?: string[]
  locales?: string[]
  prompts?: Partial<Prompt>[]
  radiusMiles?: number
  foundingYear?: number
  highlights?: string[]
  ownerEmail?: string
  ownerUserId?: string
  isPublic?: boolean
  [key: string]: unknown
}

export interface Intake {
  businessName: string
  description: string
  zip: string
  categories?: string[]
  competitors?: string[]
  radiusMiles?: number
  foundingYear?: number
  highlights?: string[]
  allowDuplicate?: boolean
  ownerEmail?: string
}

export interface SynthesizedIntake {
  businessName: string
  zip: string
  categories: string[]
  competitors: string[]
  description: string
  foundingYear?: number
  highlights: string[]
}

export interface ClientMedia {
  id: string
  clientId: string
  kind: string
  filename: string
  url: string
  mimeType: string
  sizeBytes: number | null
  caption: string | null
  description: string | null
  metadata: Record<string, unknown>
  aiAnalysis: {
    summary?: string
    detectedObjects?: string[]
    extractedFacts?: string[]
    brandColors?: string[]
    confidence?: number
  } | null
  createdAt: string
}

export interface Fact {
  id: string
  clientId: string
  key: string
  value: string
  tier: 'self_attested' | 'third_party' | 'registry' | 'operator' | string
  status: 'candidate' | 'corroborated' | 'confirmed' | 'rejected' | string
  sources: { url: string; title?: string; domain: string; engine: string; retrievedAt: string }[]
  sourceCount: number
  confidence: number
  harvestId: string | null
  supersededBy: string | null
  note: string | null
  createdAt: string
}

export interface AssetItem {
  id: string
  batchId: string
  clientId: string
  kind: string
  key: string
  version: number
  title: string
  body: string
  format: 'json' | 'markdown' | 'html' | string
  status: 'draft' | 'approved' | 'published' | 'retired' | string
  trackingId: string
  publishedUrl: string | null
  publishedAt: string | null
  createdAt: string
}

export interface EngineStat {
  total: number
  mentioned: number
  cited: number
}

export interface KeywordMatrixEngineRun {
  runId: string
  engine: string
  model: string
  mentioned: boolean
  cited: boolean
  rank: number | null
  competitors: string[]
  citations: { url: string; title?: string }[]
  answerSnippet: string
  fullAnswer: string
  startedAt: string
}

export interface KeywordMatrixRow {
  promptId: string
  text: string
  intent: string
  locale: string
  totalRuns: number
  mentionedCount: number
  citedCount: number
  mentionedRate: number
  competitors: string[]
  engines: Record<string, KeywordMatrixEngineRun[]>
}

export interface AiSummary {
  headline: string
  executiveSummary: string
  takeaways: string[]
  recommendedActions: string[]
  score: number
  competitorThreat: string
  statusBadge: string
}

export interface ReportData {
  client: ClientSummary
  publicReportUrl: string
  downloadUrls: { html: string; pdf?: string; docx?: string; rtf?: string } | null
  latestReport: unknown
  reportHistory: ReportSnapshot[]
  aiSummary: AiSummary
  metrics: ReportMetrics
  engineStats: Record<string, EngineStat>
  localeStats: Record<string, EngineStat>
  competitorsLeaderboard: { name: string; count: number }[]
  topSources: { domain: string; count: number }[]
  keywordMatrix: KeywordMatrixRow[]
}

export interface ReportMetrics {
  totalRuns: number
  mentionedCount: number
  citedCount: number
  rankOneCount: number
  mentionRate: number
  citationRate: number
}

/** One stored per-cycle report snapshot from GET /api/reports/:slug. */
export interface ReportSnapshot {
  id: string
  cycleId: string
  score: number
  aiSummary: AiSummary | null
  metrics: ReportMetrics | null
  documentUrls: { html: string; pdf?: string; docx?: string; rtf?: string } | null
  createdAt: string
}

export interface SwotResult {
  strengths: string[]
  weaknesses: string[]
  opportunities: string[]
  threats: string[]
  strategicVerdict: string
}

export interface PlanConfig {
  id: 'starter_49' | 'growth_199' | 'scale_299' | 'enterprise_599'
  name: string
  priceDollars: number
  priceCents: number
  assetLimit: number
  allowsContentGeneration: boolean
  description: string
}

export interface StatusResponse {
  status: string
  system: string
  keys: Record<EngineName, boolean>
  availableEngines: string[]
  staleDays: number
}

/** SSE event payloads from POST /api/probe/run and /api/portal/clients/:slug/probe */
export interface ProbeLogEvent {
  message: string
  level?: 'info' | 'warn' | 'error'
}
export interface ProbeProgressEvent {
  done: number
  failed: number
  total: number
  percent: number
}
export interface ProbeCompleteEvent {
  success: boolean
  aborted: boolean
  done: number
  failed: number
  total: number
  benched: string[]
  engineStats: Record<string, { ok: number; failed: number; skipped: number; model?: string; benched?: boolean; lastError?: string | null }>
  engineAudit: Record<string, { ok: number; failed: number; skipped: number; model?: string; status: string; lastError: string | null }>
  errors: unknown[]
  scoredCount: number
  mentionedCount: number
  publicReportUrl: string
  downloadUrls: { html: string; pdf?: string; docx?: string; rtf?: string } | null
}
export interface ProbeErrorEvent {
  message: string
  code?: string
}
