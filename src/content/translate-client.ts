import type { RuntimeMessage, RuntimeResponse } from '@/shared/messages'
import type { TranslationItem, TranslationResult } from '@/core/types'

/*
 * Thin wrapper around chrome.runtime messaging.
 * Sends text to the background worker and resolves with the translations.
 */
export async function requestTranslation(items: TranslationItem[]): Promise<TranslationResult[]> {
  const message: RuntimeMessage = { type: 'TRANSLATE', items }
  const response = (await chrome.runtime.sendMessage(message)) as RuntimeResponse | undefined
  return response?.results ?? []
}
