import type { TranslationProvider } from './providers/provider'
import type { TranslationItem, TranslationResult } from './types'
import { TranslationCache } from './cache'

/*
 * Orchestrates translation: cache first, fetch only the misses, then merge.
 * Single entry point for the background, so a future tier-2 LLM plugs in here.
 */
export class Translator {
  constructor(
    private readonly provider: TranslationProvider,
    private readonly cache = new TranslationCache(),
  ) {}

  async translateBatch(items: TranslationItem[], targetLang: string): Promise<TranslationResult[]> {
    /* Cache per language, so switching target never returns a stale translation. */
    const key = (text: string) => `${targetLang} ${text}`

    const misses = [...new Set(items.map((item) => item.text))].filter((text) => !this.cache.has(key(text)))
    if (misses.length > 0) {
      const translations = await this.provider.translate(misses, targetLang)
      misses.forEach((text, i) => this.cache.set(key(text), translations[i]))
    }

    return items.map((item) => ({ id: item.id, text: this.cache.get(key(item.text)) ?? item.text }))
  }
}
