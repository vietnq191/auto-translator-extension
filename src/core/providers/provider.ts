/*
 * Contract every translation backend must implement.
 * Swap providers (Google MT, DeepL, LLM) without touching the rest of the app.
 */
export interface TranslationProvider {
  /* Translate a batch of strings into the target language. Order is preserved. */
  translate(texts: string[], targetLang: string): Promise<string[]>
}
