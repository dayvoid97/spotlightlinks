import { useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ImagePlus, Sparkles } from 'lucide-react'
import { api, ApiError, API_BASE_URL } from '../../../lib/api'
import type { ClientMedia, ClientSummary } from '../../../lib/types'
import { Card, CardBody, CardHeader, CardTitle } from '../../../components/ui/Card'
import { Button } from '../../../components/ui/Button'
import { Input, Label } from '../../../components/ui/Input'
import { Alert } from '../../../components/ui/Alert'
import { Badge } from '../../../components/ui/Badge'
import { FullPageSpinner } from '../../../components/ui/Spinner'
import { useToast } from '../../../context/toast-context'

const KINDS = ['storefront', 'logo', 'workbench', 'equipment', 'team', 'product'] as const

/**
 * GET /api/clients/:slug/media + POST /api/clients/media/upload.
 *
 * The upload endpoint does three things in one call: saves the file under
 * xsl-backend's public/uploads/:slug/, runs it through multimodal vision
 * analysis (analyzeImageMedia in engines/model.ts), and writes every
 * extracted fact straight into the `facts` table — so a single storefront
 * photo can seed real, source-backed facts without a human retyping them.
 * See docs/09-media-vision-ai.md.
 */
export default function MediaTab({ client }: { client: ClientSummary }) {
  const toast = useToast()
  const queryClient = useQueryClient()
  const fileRef = useRef<HTMLInputElement>(null)
  const [kind, setKind] = useState<string>('storefront')
  const [caption, setCaption] = useState('')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['client', client.slug, 'media'],
    queryFn: () => api.get<{ media: ClientMedia[] }>(`/api/clients/${client.slug}/media`),
  })

  async function handleUpload() {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setUploading(true)
    setError(null)
    try {
      const base64Data = await fileToBase64(file)
      await api.post(`/api/clients/media/upload`, {
        slug: client.slug,
        kind,
        filename: file.name,
        mimeType: file.type || 'image/png',
        base64Data,
        caption,
        description,
      })
      toast.push('Uploaded — vision AI analysis complete.')
      setCaption('')
      setDescription('')
      if (fileRef.current) fileRef.current.value = ''
      queryClient.invalidateQueries({ queryKey: ['client', client.slug, 'media'] })
      queryClient.invalidateQueries({ queryKey: ['client', client.slug] })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-1.5">
            <ImagePlus className="size-3.5" /> Upload media
          </CardTitle>
        </CardHeader>
        <CardBody className="space-y-3 pt-3">
          {error && <Alert tone="error">{error}</Alert>}
          <div>
            <Label htmlFor="file">Image</Label>
            <Input id="file" ref={fileRef} type="file" accept="image/*" />
          </div>
          <div>
            <Label htmlFor="kind">Kind</Label>
            <select
              id="kind"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-ink outline-none focus:border-brand/60"
            >
              {KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label htmlFor="caption">Caption</Label>
            <Input id="caption" value={caption} onChange={(e) => setCaption(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="mdesc">Description</Label>
            <Input id="mdesc" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <Button className="w-full" onClick={handleUpload} loading={uploading}>
            <Sparkles className="size-3.5" /> Upload & analyze
          </Button>
          <p className="text-[11px] text-ink-30">
            Extracted facts are written straight into the client's fact ledger under key
            <code className="mx-1 rounded bg-surface-2 px-1 py-0.5">media_{kind}</code>.
          </p>
        </CardBody>
      </Card>

      <div className="lg:col-span-2">
        {isLoading ? (
          <FullPageSpinner label="Loading media…" />
        ) : (data?.media?.length ?? 0) === 0 ? (
          <p className="rounded-2xl border border-dashed border-line py-16 text-center text-ink-50">
            No media uploaded yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {data?.media.map((m) => (
              <Card key={m.id} className="overflow-hidden">
                <img src={`${API_BASE_URL}${m.url}`} alt={m.caption ?? ''} className="aspect-square w-full object-cover" />
                <CardBody className="space-y-1.5 p-3">
                  <div className="flex items-center justify-between">
                    <Badge tone="violet">{m.kind}</Badge>
                    {m.aiAnalysis?.confidence != null && (
                      <span className="text-[10px] text-ink-50">
                        {Math.round(m.aiAnalysis.confidence * 100)}% conf.
                      </span>
                    )}
                  </div>
                  {m.caption && <p className="truncate text-xs text-ink-70">{m.caption}</p>}
                  {m.aiAnalysis?.summary && (
                    <p className="line-clamp-3 text-[11px] text-ink-50">{m.aiAnalysis.summary}</p>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}
