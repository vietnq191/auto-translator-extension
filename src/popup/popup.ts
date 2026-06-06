import { isEnabled, setEnabled, getTargetLang, setTargetLang } from '@/shared/settings'
import { getLiveCaption, onLiveCaptionChange, type LiveCaption } from '@/shared/live-caption'
import { TARGET_LANGS, type TargetLang } from '@/core/types'
import type { GetTranscript, TranscriptResponse } from '@/shared/messages'

/* Popup controller: on/off toggle, language picker, live caption, transcript export. */

const toggle = document.getElementById('toggle') as HTMLInputElement
const lang = document.getElementById('lang') as HTMLSelectElement
const dot = document.getElementById('dot') as HTMLElement
const status = document.getElementById('status') as HTMLElement
const vi = document.getElementById('vi') as HTMLElement
const en = document.getElementById('en') as HTMLElement
const exportBtn = document.getElementById('export') as HTMLButtonElement
const exportMsg = document.getElementById('export-msg') as HTMLElement

function renderStatus(enabled: boolean): void {
  dot.classList.toggle('live', enabled)
  status.textContent = enabled ? 'Đang dịch' : 'Đang tắt'
}

function renderCaption(caption: LiveCaption | null): void {
  const text = caption?.translated?.trim() ?? ''
  vi.classList.toggle('empty', !text)
  vi.textContent = text || 'Bản dịch sẽ hiện ở đây…'
  en.textContent = text ? (caption?.original ?? '') : ''
}

/* Fill the language picker from the supported list. */
for (const { code, label } of TARGET_LANGS) {
  const option = document.createElement('option')
  option.value = code
  option.textContent = label
  lang.appendChild(option)
}

/* Initial state. */
void isEnabled().then((enabled) => {
  toggle.checked = enabled
  renderStatus(enabled)
})
void getTargetLang().then((value) => (lang.value = value))
void getLiveCaption().then(renderCaption)

/* Wiring. */
toggle.addEventListener('change', () => {
  void setEnabled(toggle.checked)
  renderStatus(toggle.checked)
})
lang.addEventListener('change', () => void setTargetLang(lang.value as TargetLang))
onLiveCaptionChange(renderCaption)

/* Get the active tab's transcript; throws 'open-yt' when no content script answers. */
async function requestTranscript(): Promise<TranscriptResponse> {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (tab?.id === undefined) throw new Error('open-yt')
  const res = (await chrome.tabs.sendMessage(tab.id, { type: 'GET_TRANSCRIPT' } satisfies GetTranscript)) as
    | TranscriptResponse
    | undefined
  if (!res) throw new Error('open-yt')
  return res
}

/* Export: download the transcript as Markdown. */
exportBtn.addEventListener('click', async () => {
  exportBtn.disabled = true
  exportMsg.textContent = 'Đang tạo transcript…'
  try {
    const res = await requestTranscript()
    if (!res.ok) {
      exportMsg.textContent = res.reason
      return
    }
    downloadText(res.filename, res.markdown)
    exportMsg.textContent = '✓ Đã tải transcript'
  } catch {
    exportMsg.textContent = 'Mở một video YouTube rồi thử lại.'
  } finally {
    exportBtn.disabled = false
  }
})

/* Trigger a file download from the popup. */
function downloadText(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'text/markdown' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
