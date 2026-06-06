import { TranscriptStore } from '@/core/transcript/transcript-store'
import { buildTranscriptMarkdown } from '@/core/transcript/markdown'
import { requestTranslation } from '@/content/translate-client'
import { getTargetLang } from '@/shared/settings'
import { TARGET_LANGS, type TranscriptLine } from '@/core/types'
import type { GetTranscript, TranscriptResponse } from '@/shared/messages'
import { readTranscriptPanel } from './transcript-panel'

/*
 * Owns the captured transcript and answers the popup's export request. Prefers
 * YouTube's full "Show transcript" panel; falls back to the lines gathered live.
 */

const store = new TranscriptStore()

/* Called for every translated caption line while watching. */
export function recordLine(line: TranscriptLine): void {
  store.add(line)
}

export function registerTranscriptExport(): void {
  /* A new video resets the collected transcript. */
  window.addEventListener('yt-navigate-finish', () => store.clear())
  chrome.runtime.onMessage.addListener(
    (message: GetTranscript, _sender, sendResponse: (res: TranscriptResponse) => void) => {
      if (message.type !== 'GET_TRANSCRIPT') return false
      void buildResponse().then(sendResponse)
      /* Keep the channel open for the async response. */
      return true
    },
  )
}

async function buildResponse(): Promise<TranscriptResponse> {
  const lines = await collectLines()
  if (lines.length === 0) {
    return { ok: false, reason: 'Chưa có transcript — mở "Show transcript" của YouTube, hoặc bật phụ đề và xem một lúc.' }
  }
  const lang = await getTargetLang()
  const langLabel = TARGET_LANGS.find((item) => item.code === lang)?.label ?? lang
  const markdown = buildTranscriptMarkdown(
    { title: videoTitle(), url: location.href, langLabel, date: new Date().toLocaleString('vi-VN') },
    lines,
  )
  return { ok: true, markdown, filename: makeFilename() }
}

/* Full panel transcript if open; otherwise the lines collected while watching. */
async function collectLines(): Promise<TranscriptLine[]> {
  const panel = readTranscriptPanel()
  if (!panel) return store.all()
  const translated = await translateAll(panel.map((segment) => segment.text))
  return panel.map((segment, i) => ({ time: segment.time, original: segment.text, translated: translated[i] }))
}

/* Translate in chunks so a long video doesn't fire hundreds of requests at once. */
async function translateAll(texts: string[]): Promise<string[]> {
  const CHUNK = 40
  const out: string[] = []
  for (let i = 0; i < texts.length; i += CHUNK) {
    const slice = texts.slice(i, i + CHUNK)
    const results = await requestTranslation(slice.map((text, j) => ({ id: String(j), text })))
    const byId = new Map(results.map((result) => [result.id, result.text]))
    for (let j = 0; j < slice.length; j++) out.push(byId.get(String(j)) ?? slice[j])
  }
  return out
}

function videoTitle(): string {
  return document.title.replace(/\s*-\s*YouTube\s*$/, '').trim() || 'YouTube video'
}

function makeFilename(): string {
  const slug =
    videoTitle()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'transcript'
  return `transcript-${slug}.md`
}
