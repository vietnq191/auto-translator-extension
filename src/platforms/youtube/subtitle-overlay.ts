/*
 * Draws a Vietnamese subtitle box over the YouTube player. Purely presentational —
 * the orchestrator decides which line to show via setText(). Hiding the native
 * captions is handled separately so it applies even before the first line.
 */
export class SubtitleOverlay {
  private box: HTMLDivElement | null = null

  mount(): void {
    if (this.box) return
    const player = document.querySelector<HTMLElement>('#movie_player')
    if (!player) return

    this.box = document.createElement('div')
    Object.assign(this.box.style, {
      position: 'absolute',
      bottom: '8%',
      left: '50%',
      transform: 'translateX(-50%)',
      maxWidth: '80%',
      padding: '4px 10px',
      background: 'rgba(0,0,0,0.75)',
      color: '#fff',
      font: '500 22px/1.4 system-ui, sans-serif',
      textAlign: 'center',
      borderRadius: '4px',
      pointerEvents: 'none',
      zIndex: '60',
      display: 'none',
    } satisfies Partial<CSSStyleDeclaration>)
    player.appendChild(this.box)
  }

  setText(text: string): void {
    if (!this.box) return
    this.box.textContent = text
    this.box.style.display = text ? 'block' : 'none'
  }

  destroy(): void {
    this.box?.remove()
    this.box = null
  }
}
