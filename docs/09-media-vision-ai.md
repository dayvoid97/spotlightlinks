# Media & Vision AI

Backend source: `xsl-backend/src/server/routes/clients.routes.ts` (the `/media/*` handlers).
Frontend: `src/pages/client/tabs/MediaTab.tsx`.

## One upload, three side effects

`POST /api/clients/media/upload` does more than save a file. In one request it:

1. Writes the image to `xsl-backend/public/uploads/:slug/` on disk, served back at
   `/uploads/:slug/:filename` (static-mounted in `app.ts`).
2. Runs the image through multimodal vision analysis (`analyzeImageMedia` in
   `engines/model.ts`) — a real AI call, not a stub — producing a summary, detected objects,
   brand colors, and a list of extracted facts.
3. **Writes every extracted fact directly into the `facts` table**, under key `media_${kind}`,
   with the upload's own URL as the fact's source and `tier: 'operator'` (the schema's highest-trust
   tier — see [docs/06-facts-harvesting.md](06-facts-harvesting.md) — reasoning that a photo an
   operator personally uploaded and captioned is as trustworthy as an operator typing the fact in
   by hand).

That third step is why `MediaTab.tsx` includes the line *"Extracted facts are written straight
into the client's fact ledger"* right under the upload button — it's not obvious from a plain
upload form that this has consequences beyond the media gallery, and the Facts tab is where those
consequences actually show up.

## Request shape

```ts
{
  slug: string, filename: string, base64Data: string,   // required
  kind?: 'storefront' | 'logo' | 'workbench' | 'equipment' | 'team' | 'product',
  mimeType?: string, caption?: string, description?: string,
}
```

`base64Data` is a full data URL (`data:image/png;base64,...`) — the backend strips the
`data:...;base64,` prefix itself before decoding, so `MediaTab.tsx`'s `fileToBase64()` helper just
does a plain `FileReader.readAsDataURL()` and passes the result through unmodified.

## Ownership gating

`403 { code: 'OWNED_ASSET_REQUIRED' }` if you're not the client's owner (or an admin), or if the
client is a public showcase and you're not an admin — same pattern as facts harvesting and asset
building. Not plan-gated, though: unlike Facts/Assets, media upload doesn't check `planTier`, so
every signed-in owner can use it regardless of plan tier.

## Caption vs. description vs. AI summary

Three different pieces of text end up on a media row, and it's easy to conflate them:

- `caption` / `description` — what the uploader typed. Sent as context *into* the vision prompt
  (`Media item [Kind: storefront] for business 'X'. Caption: '...'. Description: '...'.`), so a
  good caption actually improves what the model extracts.
- `aiAnalysis.summary` — what the model produced, after the fact. `MediaTab.tsx` shows this
  (truncated to 3 lines) on each gallery card, separately from the human-entered caption above it.

## `GET /api/clients/:slug/media`

```ts
{ media: ClientMedia[] }
```

Public, no auth. `MediaTab.tsx` renders these as a responsive image grid, each card tagged with its
`kind` and, where available, the AI's confidence score and summary. Nothing here paginates —
fine for a handful of client photos, worth revisiting if a client accumulates hundreds of uploads.
