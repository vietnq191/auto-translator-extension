import type { TranscriptLine } from '@/core/types'

/* Metadata shown in the transcript header. */
export interface TranscriptMeta {
  title: string
  url: string
  langLabel: string
  date: string
}

/*
 * Renders a bilingual transcript as Markdown. The file opens with a ready-made
 * prompt block so the user can paste the whole thing into an AI to summarize or
 * clean up the full script — no API key needed.
 */
export function buildTranscriptMarkdown(meta: TranscriptMeta, lines: TranscriptLine[]): string {
  const header = [
    `# Transcript — ${meta.title}`,
    '',
    `- Nguồn: ${meta.url}`,
    `- Dịch sang: ${meta.langLabel}`,
    `- Số dòng: ${lines.length}`,
    `- Xuất lúc: ${meta.date}`,
  ].join('\n')

  const prompt = [
    '## Prompt cho AI',
    '',
    '> Dưới đây là transcript song ngữ của một video. Hãy:',
    '> 1. Tóm tắt nội dung thành 5–7 ý chính.',
    '> 2. Liệt kê các thuật ngữ/khái niệm quan trọng kèm giải thích ngắn.',
    '> 3. Nêu các điểm hành động hoặc kết luận (nếu có).',
    '>',
    '> Trả lời bằng tiếng Việt, rõ ràng và có cấu trúc.',
  ].join('\n')

  const body = ['## Nội dung', '', ...lines.map(renderLine)].join('\n')

  return [header, '', prompt, '', body, ''].join('\n')
}

/* One line: timestamp + original, with the translation underneath. */
function renderLine(line: TranscriptLine): string {
  return `**[${formatTime(line.time)}]** ${line.original}\n↳ ${line.translated}\n`
}

/* Seconds -> "m:ss" (or "h:mm:ss" for long videos). */
function formatTime(seconds: number): string {
  const total = Math.max(0, Math.floor(seconds))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  const pad = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`
}
