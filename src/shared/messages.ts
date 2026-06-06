import type { TranslationItem, TranslationResult } from '@/core/types'

/*
 * Typed message contract for content <-> background communication.
 * A discriminated union keeps both sides in sync at compile time.
 */

export type ContentToBackground = {
  type: 'TRANSLATE'
  items: TranslationItem[]
}

export type BackgroundToContent = {
  type: 'TRANSLATED'
  results: TranslationResult[]
}

export type RuntimeMessage = ContentToBackground
export type RuntimeResponse = BackgroundToContent

/*
 * Popup -> content (active tab): ask for the video transcript as Markdown.
 * The content side builds it (it owns the captions + translation) and replies.
 */
export type GetTranscript = { type: 'GET_TRANSCRIPT' }

export type TranscriptResponse =
  | { ok: true; markdown: string; filename: string }
  | { ok: false; reason: string }
