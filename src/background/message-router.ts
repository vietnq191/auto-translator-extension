import type { RuntimeMessage, RuntimeResponse } from '@/shared/messages'
import type { Translator } from '@/core/translator'
import { getTargetLang } from '@/shared/settings'

/* Listens for TRANSLATE messages and answers with translations in the chosen language. */
export function registerMessageRouter(translator: Translator): void {
  chrome.runtime.onMessage.addListener(
    (message: RuntimeMessage, _sender, sendResponse: (res: RuntimeResponse) => void) => {
      if (message.type !== 'TRANSLATE') return false
      getTargetLang()
        .then((lang) => translator.translateBatch(message.items, lang))
        .then((results) => sendResponse({ type: 'TRANSLATED', results }))
        .catch(() => sendResponse({ type: 'TRANSLATED', results: [] }))
      /* Return true to keep the message channel open for the async response. */
      return true
    },
  )
}
