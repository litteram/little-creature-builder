import { map } from "rambda"

import m from "mithril"
import { el, style } from "./elements.js"
import { Select } from "./select.js"

interface Attrs {
  label: string
  name: string
  choices: string[] | readonly string[]
  selected: string[]
  onchange(s: string[]): void
}

export const SelectTag: m.Comp<Attrs> = {
  view({ attrs: { label, name, choices, selected, onchange } }) {
    const items = choices
      .filter((i: string) => selected.indexOf(i) < 0)
      .map(i => i.toString())

    return [
      m(Select, {
        style: style.select_tag_component,
        name,
        label,
        current: "",
        choices: [...items],
        onchange(val: string) {
          onchange(selected.concat(val))
        },
        preventDefault: true
      }),

      m(el.tags,
        ...map((tag) =>
          m(el.tag, {
            onclick(e: Event) {
              e.preventDefault()
              const data = selected.filter(x => x !== tag)
              onchange(data)
            }
          }, tag), selected)
      )
    ]
  }
}
