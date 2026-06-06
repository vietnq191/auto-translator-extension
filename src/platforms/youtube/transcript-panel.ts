/*
 * Reads YouTube's "Show transcript" panel, which lists the whole video script at
 * once. Returns null when the panel isn't open, so the caller can fall back to
 * the lines collected live while watching.
 */

export interface PanelSegment {
  time: number
  text: string
}

export function readTranscriptPanel(): PanelSegment[] | null {
  const nodes = document.querySelectorAll('ytd-transcript-segment-renderer')
  if (nodes.length === 0) return null

  const segments: PanelSegment[] = []
  for (const node of nodes) {
    const time = parseTimestamp(node.querySelector('.segment-timestamp')?.textContent ?? '')
    const text = node.querySelector('.segment-text')?.textContent?.trim() ?? ''
    if (text) segments.push({ time, text })
  }
  return segments.length > 0 ? segments : null
}

/* "m:ss" or "h:mm:ss" -> seconds. */
function parseTimestamp(label: string): number {
  const parts = label.trim().split(':').map(Number)
  if (parts.some(Number.isNaN)) return 0
  return parts.reduce((total, part) => total * 60 + part, 0)
}
