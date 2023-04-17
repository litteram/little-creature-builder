import b from "bss"

const colors = {
  red: "rgb(125, 52, 37)",
  lightred: "#db5f5f",
  darkGrey: "rgb(32,32,32)",
  grey: "rgb(64,64,64)",
  lightgrey: "rgb(92,92,92)",
}

const style_base = {
  input: b`
    ff Arial, sans-serif
    fs 1.2rem
    lh 1.6rem
    p 0.4rem 0.6rem
    m 0.4rem 0.6rem
    border 0
    background-color: ${colors.darkGrey}
    color rgb(230, 230, 230)
    outline 0
    border-bottom 2px dotted ${colors.red}
  `.$hover`
    bc ${colors.grey}
  `,
  label: b`
    display block
    p 0.4rem 0.6rem
    m 0.4rem 0.6rem

    font-variant small-caps
  `,
  tags: b`
    d flex
    flex-grow 3
    padding-left 1rem
    font-variant small-caps
  `,
  tag: b`
    margin-left 1rem
  `.$hover`
    cursor pointer
    color ${colors.red}
  `,
  select: b`
    border-bottom: 2px dotted ${colors.red}
  `.$disabled`
    color: ${colors.lightgrey}
    font-style italic
  `,
  hr: b`
    bc rgba(0,0,0,0)
    bi linear-gradient(90deg, ${colors.red} 0px, rgba(125, 52, 37, 0))
    border 0
    h 2px
    m 1rem 0
  `,
  remove: b`
    c rgb(125,52,37)
    fw bolder
    fs 1.2rem
    p 0.4rem
    cursor pointer
  `.$hover`
    c rgb(225,52,37)
  `,
  table: b`
    d table
    border-collapse collapse
  `,
  table_header: b`
    font-style italic
  `,
  table_row: b`
    d table-row
    cursor pointer
  `,
  table_cell: b`
    d table-cell
    p 0.6rem
  `,
  hilight_bg: b`
  `.$hover`
    background-color ${colors.grey}
  `,
  light_bg: b`
    background-color ${colors.grey}
  `,
  small: b`
    fs 0.8rem
    font-variant small-caps
  `,
} as const

export const style = {
  ...style_base,
  textarea: style_base.input + b`
    resize vertical
  `,
  select: style_base.select + style_base.input,
  select_block: b``,
  button: style_base.input + b`
    border 2px solid ${colors.red}
    font-weight bolder
    font-style italic
    background inherit
    color ${colors.lightgrey}
  `,
  abilities_block: b`
    display flex
    flex-direction row
    justify-content center
    align-items stretch
    align-content center
  `,
  ability_modifiers: b`
    display flex
    flex-direction column
    align-content center
    text-align center
    margin 0 0.8rem
  `,
  ability_modifier_stat: b`
    fs 1.4rem
    fw bolder
    font-variant small-caps
  `,
  ability_modifier_score: b`
    font-size 1.3em
  `.$hover`
    b ${colors.grey}
  `,

  actions_block: b`
    display grid
    grid-template-columns 1fr 1fr 1fr
    grid-template-rows auto
    grid-column-gap 2rem
  `,
  action_block: b`
    align-self start
    display grid
    grid-template-columns 1fr 1fr 1fr
    grid-template-rows auto
    grid-column-gap 0.6rem
    grid-row-gap 0.8rem
  `,
  action_cell: b`
    align-self start
    margin 0
    padding 0.6rem 0
  `,
  action_cell_wide: b`
    align-self start
    grid-column 1 / 4
    margin 0
    padding 0.6rem 0
  `,

  select_tag_component: b`
    min-width 16rem
  `,
  main: b`
    ff Arial, sans-serif
    fs 1.0rem
    lh 1.6rem
  `,
  permalink: b`
    font-weight bold
    font-style italic
    color ${colors.red}
  `.$hover`
    color ${colors.lightred}
  `.$active`
  `.$visited`
    color ${colors.lightred}
  `,

  base_properties: b`
    display grid
    grid-template-columns 1fr 1fr
  `,

  compendium_header: b`
    padding-top: 0.6rem
    padding-bottom: 0.6rem
  `,
  compendium_row: b`
    display grid
    grid-template-columns repeat(6, 1fr) 2rem
  `,
  compendium_cell: b`
    justify-self: stretch
    align-self: center
    padding-left: 0.6rem
  `,
} as const

export const grid = {
  container: (size: number, rest?: string) => b`
    display grid
    grid-template-columns repeat(${size}, 1fr) ${rest}
    grid-template-rows auto
  `,
} as const

export const el: { [key: string]: string } = {
  input: "input" + style.input,
  textarea: "textarea" + style.textarea,
  select: "select" + style.select,
  select_block: "div" + style.select_block,
  button: "button" + style.button,
  option: "option",
  hr: "hr" + style.hr,
  table: "table" + style.table,
  table_row: "tr" + style.table_row,
  table_cell: "td" + style.table_cell,
  label: "label" + style.label,
  div: "div",
  // Component Elements
  //
  //
  main: ".little-creature-maker" + style.main,
  tags: "span" + style.tags,
  tag: "span" + style.tag,

  remove: "span" + style.remove,

  crc: "div" + style.small,

  stat_block: "div",

  base_properties: "div" + style.base_properties,

  compendium: "div",
  compendium_header: style.light_bg + style.compendium_header + style.compendium_row,
  compendium_row: "" + style.hilight_bg + style.compendium_row,
  compendium_cell: "" + style.compendium_cell,

  property_block: "div.property_block",
  property_line: "div.property_line",

  abilities_block: "div" + style.abilities_block,
  ability_modifiers: "div" + style.ability_modifiers,
  ability_modifier_stat: "span" + style.ability_modifier_stat,
  ability_modifier_score: "span" + style.ability_modifier_score,

  actions_block: "div" + style.actions_block,
  action_block: "div" + style.action_block,
  action_cell: "div" + style.action_cell,
  action_cell_wide: "div" + style.action_cell_wide,

  multiattacks: "div",
  multiattack: "div",

  name_editor: "h1"
} as const
