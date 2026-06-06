import type { TranscriptLine } from '@/core/types'

/*
 * Accumulates caption lines as a video plays, so the user can export the full
 * bilingual transcript later. Skips consecutive duplicates (rollup captions
 * repeat the same line) and resets when the video changes.
 */
export class TranscriptStore {
  private lines: TranscriptLine[] = []

  add(line: TranscriptLine): void {
    const last = this.lines[this.lines.length - 1]
    if (last && last.original === line.original) return
    this.lines.push(line)
  }

  all(): TranscriptLine[] {
    return this.lines
  }

  clear(): void {
    this.lines = []
  }
}
