/*
 * Watches the captions YouTube already renders on screen and reports each new
 * line. This avoids fetching the caption file directly (which YouTube blocks
 * without a player-generated token). Requires the user to have CC enabled.
 */
export class CaptionObserver {
  private observer: MutationObserver | null = null
  private timer = 0
  private last = ''

  constructor(private readonly onLine: (text: string, rollup: boolean) => void) {}

  start(): void {
    const target = document.querySelector('#movie_player') ?? document.body
    this.observer = new MutationObserver(() => this.schedule())
    this.observer.observe(target, { childList: true, subtree: true, characterData: true })
  }

  stop(): void {
    this.observer?.disconnect()
    this.observer = null
    window.clearTimeout(this.timer)
    this.last = ''
  }

  /* Captions can mutate word-by-word; debounce before reading the full line. */
  private schedule(): void {
    window.clearTimeout(this.timer)
    this.timer = window.setTimeout(() => this.read(), 150)
  }

  private read(): void {
    const windows = document.querySelectorAll<HTMLElement>('.caption-window')
    const win = windows[windows.length - 1]
    const rollup = win?.classList.contains('ytp-caption-window-rollup') ?? false
    const text = win ? this.readWindow(win, rollup) : ''
    if (text !== this.last) {
      this.last = text
      this.onLine(text, rollup)
    }
  }

  /*
   * Rollup captions (auto-generated / auto-translated) keep many past lines in
   * the DOM, so joining every segment grows without bound. For those, read only
   * the last visual line — the one currently being spoken. Pop-on captions hold
   * a single line, so joining their segments is correct.
   */
  private readWindow(win: HTMLElement, rollup: boolean): string {
    if (rollup) {
      const lines = win.querySelectorAll('.caption-visual-line')
      const lastLine = lines[lines.length - 1]
      if (lastLine) return (lastLine.textContent ?? '').trim()
    }
    return Array.from(win.querySelectorAll('.ytp-caption-segment'))
      .map((s) => s.textContent ?? '')
      .join(' ')
      .trim()
  }
}
