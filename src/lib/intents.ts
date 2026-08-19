/**
 * The nine commercial intents, written for the business owner rather than for
 * the generator.
 *
 * The canonical definitions live in xsl-backend/src/lib/generate.ts, but those
 * are instructions to a model — long, and phrased from the writer's side. These
 * are the same nine categories phrased from the reader's side: what kind of
 * customer is asking, and why that matters to them. Keep the keys in sync with
 * the backend's INTENTS array; the copy is deliberately not a copy.
 */
export interface IntentInfo {
  /** Human label. Display only — never match on it. */
  label: string
  /** One sentence: who is asking, and what they want. */
  blurb: string
  /**
   * The generator is told to "weight heavily toward high-intent conversion
   * queries: problem_first, urgent, qualification, decision, long_tail". Losing
   * one of those costs more than losing a broad discovery query, so the reader
   * gets told which is which.
   */
  highIntent?: boolean
}

export const INTENTS: Record<string, IntentInfo> = {
  category_geo: {
    label: 'Category & area',
    blurb:
      'Someone looking for this type of business near them, without naming anyone yet. The broadest way in, and the most contested.',
  },
  problem_first: {
    label: 'Problem first',
    blurb:
      'Someone describing their situation rather than the service they need, leaving the assistant to work out who to suggest.',
    highIntent: true,
  },
  urgent: {
    label: 'Urgent',
    blurb:
      'Someone who needs it today — same day, emergency, before an event. They are ready to call the first credible name they get.',
    highIntent: true,
  },
  price: {
    label: 'Price',
    blurb:
      'Someone weighing the cost: rates, estimates, what is worth it, what is cheapest, how people pay.',
  },
  comparison: {
    label: 'Comparison',
    blurb:
      'Someone weighing you against a named rival or a chain, and asking which is the better fit for them.',
  },
  qualification: {
    label: 'Qualification',
    blurb:
      'Someone with a requirement you have to meet before they will consider you — hours, insurance, certification, a specific brand or service.',
    highIntent: true,
  },
  decision: {
    label: 'Decision',
    blurb:
      'Someone asking outright who they should hire, book, or visit. The closest thing to a sale that a question can be.',
    highIntent: true,
  },
  long_tail: {
    label: 'Long tail',
    blurb:
      'A narrow request that rules out most providers. Fewer people ask it, but the ones who do are nearly always buying.',
    highIntent: true,
  },
  brand_direct: {
    label: 'Brand direct',
    blurb:
      'Someone who already knows your name and is checking you out, booking, or hunting for your details. Losing these is the most serious result on the page.',
  },
  custom: {
    label: 'Your own prompt',
    blurb: 'A question you added yourself. Your prompts are probed first every cycle.',
  },
}

/** Falls back to the raw key prettified, so an unknown intent still reads sanely. */
export function intentInfo(key: string): IntentInfo {
  return INTENTS[key] ?? { label: key.replace(/_/g, ' '), blurb: '' }
}
