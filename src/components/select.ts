import m from 'mithril'
import Stream from 'mithril/stream'
import { el } from './elements.js'
import { formatString } from './utils.js'

interface OptionAttrs {
  value: string
  disabled?: boolean
}

const OptionComponent: m.Component<OptionAttrs> = {
  view({ attrs: { value, disabled }, children }) {
    return m(el.option, {
      key: value,
      value,
      disabled,
    }, children)
  },
}


interface Attrs {
  name: string
  current: string | number
  choices: [string | number, string][]
  onchange: (t: string) => void
  preventDefault?: boolean
  label?: string
  style?: string
  id?: string
}

export function Select(): m.Component<Attrs> {
  const selectedIndex = Stream(0)

  return {
    view({ attrs: { name, current, choices, onchange, preventDefault, label, style, id } }) {
      selectedIndex(
        choices.map(i => String(i[0]))
          .indexOf(String(current)) + 1)

      return m(
        el.select + (style || ""),
        {
          id,
          key: id,
          name,
          selectedIndex: selectedIndex(),
          onchange(e: Event) {
            if (preventDefault) e.preventDefault()
            selectedIndex()
            onchange(this.value)
          },
        },
        m(OptionComponent, {
          value: '_label',
          disabled: true,
        }, label),

        ...choices.map(
          (choice) => m(OptionComponent, { value: String(choice[0]) }, choice[1])),
      )
    },
  }
}

export function SelectLabel(): m.Component<Attrs> {
  const id = Math.random().toString(36).slice(6)

  return {
    view(vnode) {
      return m(el.select_block,
        m(el.label, { for: id }, vnode.attrs.label),
        m(Select, { id, ...vnode.attrs }))
    }
  }
}
