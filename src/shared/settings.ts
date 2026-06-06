/* Persisted user settings (chrome.storage.local), read live by every context. */

import { DEFAULT_TARGET_LANG, type TargetLang } from '@/core/types'

const ENABLED_KEY = 'enabled'
const TARGET_LANG_KEY = 'target_lang'

/* Global on/off flag. */
export async function isEnabled(): Promise<boolean> {
  const result = await chrome.storage.local.get(ENABLED_KEY)
  return Boolean(result[ENABLED_KEY])
}

export async function setEnabled(value: boolean): Promise<void> {
  await chrome.storage.local.set({ [ENABLED_KEY]: value })
}

export function onEnabledChange(callback: (value: boolean) => void): void {
  onKeyChange(ENABLED_KEY, (value) => callback(Boolean(value)))
}

/* Language to translate into. */
export async function getTargetLang(): Promise<TargetLang> {
  const result = await chrome.storage.local.get(TARGET_LANG_KEY)
  return (result[TARGET_LANG_KEY] as TargetLang) ?? DEFAULT_TARGET_LANG
}

export async function setTargetLang(value: TargetLang): Promise<void> {
  await chrome.storage.local.set({ [TARGET_LANG_KEY]: value })
}

export function onTargetLangChange(callback: (value: TargetLang) => void): void {
  onKeyChange(TARGET_LANG_KEY, (value) => callback((value as TargetLang) ?? DEFAULT_TARGET_LANG))
}

/* Fire callback whenever one local storage key changes. */
function onKeyChange(key: string, callback: (newValue: unknown) => void): void {
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && key in changes) callback(changes[key].newValue)
  })
}
