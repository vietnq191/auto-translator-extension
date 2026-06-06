/*
 * Bridges the current translated caption to the popup via chrome.storage.
 * The content script writes each line; the popup reads and subscribes to it.
 */

const KEY = 'live_caption'

export interface LiveCaption {
  original: string
  translated: string
}

export async function setLiveCaption(caption: LiveCaption): Promise<void> {
  await chrome.storage.local.set({ [KEY]: caption })
}

export async function getLiveCaption(): Promise<LiveCaption | null> {
  const result = await chrome.storage.local.get(KEY)
  return (result[KEY] as LiveCaption | undefined) ?? null
}

export function onLiveCaptionChange(callback: (caption: LiveCaption | null) => void): void {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && KEY in changes) {
      callback((changes[KEY].newValue as LiveCaption | undefined) ?? null)
    }
  })
}
