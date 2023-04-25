import { el, style } from "./elements.js"
import m from "mithril"

export const Permalink: m.Component<{ link: string }> = {
  view({ attrs: { link } }) {
    return m(m.route.Link, {
      class: style.permalink,
      href: "/" + link
    }, "Permalink")
  }
}
