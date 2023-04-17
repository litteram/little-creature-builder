import m from "mithril"
import Stream from "mithril/stream"
import { el } from "./elements.js"

interface Attrs {
  creature?: string
}

export function Ui(): m.Component<Attrs> {
  const state = Stream("")
  return {
    view() {
      return m(el.stat_block, state)
    }
  }
}
