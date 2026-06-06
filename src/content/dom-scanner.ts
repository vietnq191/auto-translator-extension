/*
 * Walks the DOM and collects visible text nodes worth translating.
 * Skips script/style/code and whitespace-only nodes.
 */

export interface ScannedNode {
  id: string
  node: Text
  text: string
}

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA'])

export function scanTextNodes(root: Node): ScannedNode[] {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      const text = node.nodeValue?.trim() ?? ''
      if (!text) return NodeFilter.FILTER_REJECT
      const parent = node.parentElement
      if (!parent || SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT
      return NodeFilter.FILTER_ACCEPT
    },
  })

  const result: ScannedNode[] = []
  let index = 0
  for (let current = walker.nextNode(); current; current = walker.nextNode()) {
    result.push({ id: String(index++), node: current as Text, text: current.nodeValue!.trim() })
  }
  return result
}
