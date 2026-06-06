import { scanTextNodes } from './dom-scanner'
import { TextRenderer } from './text-renderer'
import { requestTranslation } from './translate-client'
import { isEnabled, onEnabledChange, onTargetLangChange } from '@/shared/settings'

/*
 * Content-script entry. Translates the page when enabled and restores the
 * originals when disabled; re-translates when the target language changes.
 */

const renderer = new TextRenderer()

/* Scan visible text, translate it, and write the results back into the DOM. */
async function translatePage(): Promise<void> {
  const scanned = scanTextNodes(document.body)
  if (scanned.length === 0) return

  const results = await requestTranslation(scanned.map(({ id, text }) => ({ id, text })))
  const byId = new Map(scanned.map((entry) => [entry.id, entry.node]))
  for (const result of results) {
    const node = byId.get(result.id)
    if (node) renderer.apply(node, result.text)
  }
}

function applyState(enabled: boolean): void {
  if (enabled) void translatePage()
  else renderer.restoreAll()
}

/* On language change, restore originals first so we re-translate clean text. */
onTargetLangChange(async () => {
  if (!(await isEnabled())) return
  renderer.restoreAll()
  void translatePage()
})

/* Apply the saved state on load, then keep reacting to popup toggles. */
void isEnabled().then(applyState)
onEnabledChange(applyState)
