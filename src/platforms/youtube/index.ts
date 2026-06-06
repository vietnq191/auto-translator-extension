import { isEnabled, onEnabledChange, onTargetLangChange } from '@/shared/settings'
import { requestTranslation } from '@/content/translate-client'
import { setLiveCaption } from '@/shared/live-caption'
import { CaptionObserver } from './caption-observer'
import { SubtitleOverlay } from './subtitle-overlay'
import { recordLine, registerTranscriptExport } from './transcript-export'

/*
 * YouTube entry. Reads the captions YouTube renders, translates each line, and
 * shows the result in one overlay over the player (native captions are hidden).
 */

/* Clear the overlay if no new line arrives for this long. */
const STALE_CLEAR_MS = 4000
/* Keep a line up briefly after captions vanish, so it doesn't blink between lines. */
const CLEAR_DELAY_MS = 1000
/* Rollup captions stream word-by-word: translate once the line stops changing... */
const ROLLUP_STABILIZE_MS = 500
/* ...but never wait longer than this during nonstop speech. */
const ROLLUP_MAX_WAIT_MS = 500

const overlay = new SubtitleOverlay()
let observer: CaptionObserver | null = null
let enabled = false
let seq = 0
let clearTimer = 0
let hideStyle: HTMLStyleElement | null = null
let pendingLine = ''
let stabilizeTimer = 0
let firstPendingAt = 0

/* Hide YouTube's own captions while we translate, so they don't stack with ours. */
function updateNativeHidden(): void {
  if (enabled && !hideStyle) {
    hideStyle = document.createElement('style')
    hideStyle.textContent = '.ytp-caption-window-container,.caption-window{display:none!important}'
    document.documentElement.appendChild(hideStyle)
  } else if (!enabled && hideStyle) {
    hideStyle.remove()
    hideStyle = null
  }
}

function show(original: string, translated: string): void {
  overlay.mount()
  overlay.setText(translated)
  void setLiveCaption({ original, translated })
  window.clearTimeout(clearTimer)
  clearTimer = window.setTimeout(() => overlay.setText(''), STALE_CLEAR_MS)
}

/* A caption line. Pop-on lines translate at once; rollup lines wait to settle. */
function onCaptionLine(text: string, rollup: boolean): void {
  if (!text) {
    window.clearTimeout(clearTimer)
    clearTimer = window.setTimeout(() => overlay.setText(''), CLEAR_DELAY_MS)
    return
  }
  if (!rollup) {
    void translateLine(text)
    return
  }
  /* Hold the growing line; translate it whole once it stops changing (or times out). */
  pendingLine = text
  if (!firstPendingAt) firstPendingAt = Date.now()
  window.clearTimeout(stabilizeTimer)
  const delay = Math.min(ROLLUP_STABILIZE_MS, Math.max(0, ROLLUP_MAX_WAIT_MS - (Date.now() - firstPendingAt)))
  stabilizeTimer = window.setTimeout(() => {
    firstPendingAt = 0
    void translateLine(pendingLine)
  }, delay)
}

/* Translate one settled line, show it, and record it for transcript export. */
async function translateLine(text: string): Promise<void> {
  const mine = ++seq
  const [result] = await requestTranslation([{ id: '0', text }])
  if (mine !== seq) return
  const translated = result?.text ?? text
  show(text, translated)
  recordLine({ time: videoTime(), original: text, translated })
}

/* Current playback position in seconds, used to timestamp transcript lines. */
function videoTime(): number {
  return document.querySelector('video')?.currentTime ?? 0
}

function activate(): void {
  if (observer) return
  overlay.mount()
  observer = new CaptionObserver((text, rollup) => onCaptionLine(text, rollup))
  observer.start()
}

function teardown(): void {
  observer?.stop()
  observer = null
  window.clearTimeout(stabilizeTimer)
  pendingLine = ''
  firstPendingAt = 0
  overlay.destroy()
  void setLiveCaption({ original: '', translated: '' })
}

function refresh(): void {
  if (enabled) activate()
  else teardown()
  updateNativeHidden()
}

/* Drop the stale-language line; the next caption will arrive in the new language. */
onTargetLangChange(() => overlay.setText(''))

registerTranscriptExport()

void isEnabled().then((value) => {
  enabled = value
  refresh()
})
onEnabledChange((value) => {
  enabled = value
  refresh()
})
