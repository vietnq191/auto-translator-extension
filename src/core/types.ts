/* Shared domain types used across core, background, and content layers. */

/* A unit of text to translate, identified so results map back to the DOM. */
export interface TranslationItem {
  id: string
  text: string
}

/* Result for one item after translation. */
export interface TranslationResult {
  id: string
  text: string
}

/* One captured caption line, kept to export a bilingual transcript. */
export interface TranscriptLine {
  /* Seconds into the video. */
  time: number
  original: string
  translated: string
}

/* Languages the user can translate into; the source is always auto-detected. */
export type TargetLang = 'vi' | 'en'

export const DEFAULT_TARGET_LANG: TargetLang = 'vi'

/* Options shown in the popup language picker. */
export const TARGET_LANGS: ReadonlyArray<{ code: TargetLang; label: string }> = [
  { code: 'vi', label: 'Tiếng Việt' },
  { code: 'en', label: 'Tiếng Anh' },
]
