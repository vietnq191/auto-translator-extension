/*
 * In-memory translation cache keyed by source text.
 * Avoids re-translating identical strings within a session (saves cost and latency).
 */
export class TranslationCache {
  private readonly store = new Map<string, string>()

  get(text: string): string | undefined {
    return this.store.get(text)
  }

  set(text: string, translation: string): void {
    this.store.set(text, translation)
  }

  has(text: string): boolean {
    return this.store.has(text)
  }
}
