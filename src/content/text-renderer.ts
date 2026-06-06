/*
 * Writes translations into the DOM and can restore the originals.
 * Keeps the original text per node so the user can toggle translation off.
 */
export class TextRenderer {
  private readonly originals = new WeakMap<Text, string>()
  private readonly touched = new Set<Text>()

  apply(node: Text, translated: string): void {
    if (!this.originals.has(node)) this.originals.set(node, node.nodeValue ?? '')
    node.nodeValue = translated
    this.touched.add(node)
  }

  restoreAll(): void {
    for (const node of this.touched) {
      const original = this.originals.get(node)
      if (original !== undefined) node.nodeValue = original
    }
    this.touched.clear()
  }
}
