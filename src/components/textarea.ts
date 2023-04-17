import m from "mithril"
import Stream from "mithril/stream"
import { el } from "./elements.js"

interface Attrs {
  name: string
  value: string
  placeholder: string
  oninput: (x: string) => void
  style?: string
}

interface State {
  value: Stream<string>
}

export function Textarea(): m.Component<Attrs> {
  const text = Stream("")

  return {
    oncreate({ dom }) {
      const d = dom as HTMLElement

      text
        .map(() => {
          d.style.height = ''
          d.style.height = dom.scrollHeight + 'px'
        })
    },
    view({ attrs: { name, placeholder, value, oninput, style } }) {
      const self = this
      return m(el.textarea + (style || ""), {
        name,
        placeholder,
        oninput() {
          text(this.value)
          oninput(this.value)
        }
      }, value)
    },
  }
}
