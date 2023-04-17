import m from "mithril"
import Stream from "mithril/stream"
import { el } from "./elements.js"

interface Attrs {
  content: string
}

export function ContentEditable(): m.Component<Attrs> {
  const state = Stream("")

  return {
    view(vnode) {
      return m(el.contentEditable, {
        contenteditable: true,
        onchange(e) {
          state(this.textContent)
        }
      })
    }
  }
}
