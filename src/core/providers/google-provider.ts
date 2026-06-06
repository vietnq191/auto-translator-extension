import type { TranslationProvider } from './provider'

/*
 * Tier-1 provider: Google's public translate endpoint.
 * Auto-detects the source language and returns text in the requested language.
 */
export class GoogleProvider implements TranslationProvider {
  private readonly endpoint = 'https://translate.googleapis.com/translate_a/single'

  async translate(texts: string[], targetLang: string): Promise<string[]> {
    /* The endpoint translates one string per call; run the batch in parallel. */
    return Promise.all(texts.map((text) => this.translateOne(text, targetLang)))
  }

  private async translateOne(text: string, targetLang: string): Promise<string> {
    const params = new URLSearchParams({
      client: 'gtx',
      sl: 'auto',
      tl: targetLang,
      dt: 't',
      q: text,
    })
    const res = await fetch(`${this.endpoint}?${params.toString()}`)
    if (!res.ok) throw new Error(`Google translate failed: ${res.status}`)

    /* Response shape: [[[ "translated", "source", ... ], ...], ...]. */
    const data = (await res.json()) as [Array<[string]>]
    return data[0].map((segment) => segment[0]).join('')
  }
}
