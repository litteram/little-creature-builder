import m from "mithril"
import b from "bss"
import { map, keys, range, values, slice } from "rambda"
import { state, StatBlock } from "./model.js"
import * as model from "./model.js"
import * as tables from "./tables.js"

const colors = {
  red: "rgb(125, 52, 37)",
  darkGrey: "rgb(32,32,32)",
  grey: "rgb(64,64,64)",
}

const style_base = {
  input: b`
    ff Quattrocento, serif
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
  `,
  button: b`
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

const style = {
  ...style_base,
  select: style_base.select + style_base.input,
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
    font-style italic
  `.$hover`
    b ${colors.grey}
  `,
}

const el: { [key: string]: string } = {
  input: "input" + style.input,
  tags: "span" + style.tags,
  tag: "span" + style.tag,
  select: "select" + style.select,
  button: "button" + style.button,
  hr: "hr" + style.hr,
  table: "table" + style.table,
  table_row: "tr" + style.table_row,
  table_cell: "td" + style.table_cell,
  // Component Elements
  crc: "div" + style.small,
  stat_block: "div",
  compendium: "table" + style.table,
  compendium_header: "thead" + style.table_row + style.light_bg,
  compendium_row: "tr" + style.table_row + style.hilight_bg,
  compendium_cell: "td" + style.table_cell,
  remove: "span" + style.remove,
  property_block: "div.property_block",
  property_line: "div.property_line",
  abilities_block: "div" + style.abilities_block,
  ability_modifiers: "div" + style.ability_modifiers,
  ability_modifier_stat: "span" + style.ability_modifier_stat,
  ability_modifier_score: "span" + style.ability_modifier_score,
  name_editor: "h1"
} as const

function formatModScore(mod: number) {
  if (mod < 0) {
    return " - " + Math.abs(mod)
  } else {
    return " + " + mod
  }
}

function formatAbilityScore(score: number) {
  return model.modToAbilityScore(score) +
    " (" + formatModScore(score) + ") "
}

function formatString(str: string): string {
  return str
    .replace(/[^a-z0-9\-]/ig, " ")
    .split(" ")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ")
}

const SelectComponent: m.Component<{
  name: string
  current: string | number
  choices: string[] | readonly string[]
  onchange: (t: typeof this.choices) => void
  preventDefault?: boolean
  label?: string
}> = {
  view({ attrs: { name, current, choices, onchange, preventDefault, label } }) {
    return m(el.select,
      {
        name,
        onchange(e: any) {
          if (preventDefault) e.preventDefault()
          onchange(e.target.value)
        },
      },
      m("option", { key: -1, disabled: true, selected: current == "" }, label),
      ...choices.map((choice: string) => m("option", {
        key: choice,
        value: choice,
        selected: choice == current
      }, formatString(choice)))
    )
  }
}

const SelectTagComponent: m.Component<{
  label: string
  name: string
  choices: string[] | readonly string[]
  selected: string[]
  onchange(s: string[]): void
}> = {
  view({ attrs: { label, name, choices, selected, onchange } }) {
    const items = choices
      .filter((i: string) => selected.indexOf(i) < 0)

    return [
      m(SelectComponent, {
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
        ...map((i) =>
          m(el.tag, {
            onclick(e: Event) {
              e.preventDefault()
              const data = selected.filter(x => x !== i)
              onchange(data)
            }
          }, i), selected)
      )
    ]
  }
}

const SelectLevelComponent: m.Component = {
  view() {
    return m(SelectComponent, {
      name: "level",
      current: state.current.level.toString(),
      choices: map((i) => i.toString(), range(-5, 36)),
      onchange(lvl: string) {
        state.set({ level: parseInt(lvl) })
      },
    })
  }
}

const NameEditorComponent: m.Component = {
  view() {
    return m(el.input, {
      type: "text",
      name: "name",
      value: state.current.name,
      onkeyup(e: any) {
        state.set({ name: e.target.value })
      },
    })
  }
}

const AbilityModifierComponent: m.Component<{ mod: string }> = {
  view({ attrs: { mod } }) {
    const score = model.state.current.ability_modifiers[mod]

    return m(el.ability_modifiers,
      { key: mod },
      m(el.ability_modifier_stat, mod),
      m(el.ability_modifier_score, formatAbilityScore(score)),
    )
  }
}

const BaseProperty: m.Component = {
  view({ children }) {
    const title = children[0]
    const value = slice(1, Infinity, children as Array<string>)
    return m(el.property_line,
      m("b", title),
      ": ",
      ...value
    )
  }
}

const AttackComponent: m.Component<{ attack: model.Attack }> = {
  view({ attrs: { attack } }) {
    const dmg = model.attackDamage(attack)
    return m(".attack-form", { key: attack.id },
      m(el.input, {
        name: "attack",
        placeholder: "name",
        value: attack.name,
        onchange(e: Event) {
          model.state.setAttack({
            ...attack,
            name: e.target['value'],
          })
        }
      }),
      m(el.input, {
        name: "description",
        placeholder: "description",
        value: attack.description,
        onchange(e: Event) {
          model.state.setAttack({
            ...attack,
            description: e.target['value'],
          })
        },
      }),
      m(SelectComponent, {
        name: "die_num",
        current: attack.die_num,
        choices: range(1, 21).map(String),
        onchange(die_num) {
          model.state.setAttack({
            ...attack,
            die_num: parseInt(die_num),
          })
        }
      }),
      m(SelectComponent, {
        name: "die",
        current: attack.die,
        choices: tables.dies,
        onchange(die) {
          model.state.setAttack({
            ...attack,
            die,
          })
        }
      }),
      m(SelectComponent, {
        name: "mod",
        current: attack.mod.toString(),
        choices: range(0, 61).map(String),
        onchange(mod) {
          model.state.setAttack({
            ...attack,
            mod: parseInt(mod),
          })
        }
      }),
      m(SelectComponent, {
        name: "type",
        current: attack.type,
        choices: tables.damage_types,
        onchange(type) {
          model.state.setAttack({
            ...attack,
            type,
          })
        }
      }),
      m(el.table,
        m(el.table_row, m(el.table_cell, "max: "), m(el.table_cell, dmg.max)),
        m(el.table_row, m(el.table_cell, "avg: "), m(el.table_cell, dmg.avg)),
        m(el.table_row, m(el.table_cell, "min: "), m(el.table_cell, dmg.min)),
      ),
      m(el.remove, {
        onclick() {
          model.state.removeAttack(attack)
        }
      }, "x")
    )
  }
}

const PropertyLines: m.Component = {
  view() {
    return [
      m(el.property_line,
        m(SelectTagComponent, {
          label: "Damage Immunities",
          name: "damage-immunities",
          choices: tables.damage_types,
          selected: state.current.properties.damage_immunities || [],
          onchange(val) {
            state.set({ properties: { damage_immunities: val } })
          },
        }),
      ),

      m(el.property_line,
        m(SelectTagComponent, {
          label: "Damage Resistances",
          name: "senses",
          choices: tables.damage_types,
          selected: state.current.properties.damage_resistances || [],
          onchange(val) {
            state.set({ properties: { damage_resistances: val } })
          },
        }),
      ),

      m(el.property_line,
        m(SelectTagComponent, {
          label: "Damage Weaknesses",
          name: "damage-weaknesses",
          choices: tables.damage_types,
          selected: state.current.properties.damage_weaknesses || [],
          onchange(val) {
            state.set({ properties: { damage_weaknesses: val } })
          },
        })
      ),

      m(el.property_line,
        m(SelectTagComponent, {
          label: "Condition Immunities",
          name: "condition-immunities",
          choices: tables.conditions,
          selected: state.current.properties.condition_immunities || [],
          onchange(val) {
            state.set({ properties: { condition_immunities: val } })
          },
        })
      ),

      m(el.property_line,
        m(SelectTagComponent, {
          label: "Condition Weaknesses",
          name: "condition-weaknesses",
          choices: tables.conditions,
          selected: state.current.properties.condition_weaknesses || [],
          onchange(val) {
            state.set({ properties: { condition_weaknesses: val } })
          },
        })
      ),

      m(el.property_line,
        m(SelectTagComponent, {
          label: "Senses",
          name: "senses",
          choices: tables.special_senses,
          selected: state.current.properties.special_senses || [],
          onchange(val) {
            state.set({ properties: { special_senses: val } })
          },
        })
      ),

      m(el.property_line,
        m(SelectTagComponent, {
          label: "Languages",
          name: "languages",
          choices: tables.languages,
          selected: state.current.properties.languages || [],
          onchange(val) {
            state.current.properties.languages = val
          }
        })
      ),
    ]
  }
}

const ActionsBlock: m.Component<{ sb: StatBlock }> = {
  view({ attrs: { sb } }) {
    return m(".actions", [
      m("h3", "Actions"),

      m(el.hr),

      sb.attacks.map((attack) => {
        return m(AttackComponent, { attack })
      }),

      m("button[name=new-attack]", {
        onclick() {
          model.state.newAttack()
        }
      }, "+"),
    ])
  }
}

const SimpleCreatureJSON: m.Component = {
  view() {
    const currentJson = JSON.stringify(state.current)
    const copyText = JSON.stringify(state.current, null, 2)
    return m(".actions",
      m(el.button, {
        onclick(e: Event) {
          e.preventDefault()
          state.saveToCompendium(state.current)
        }
      }, "save to compendium"),

      m(el.input, {
        id: "littleCreatureJSON",
        type: "text",
        value: currentJson,
      }),

      m(el.button, {
        onclick(e: Event) {
          e.preventDefault()
          navigator.clipboard.writeText(copyText)
        }
      }, "copy json to clipboard"),
      m(el.button, {
        onclick() {
          const val = (document.getElementById("littleCreatureJSON") as HTMLInputElement).value
          state.set(JSON.parse(val))
        }
      }, "import from JSON"),

      m(m.route.Link, {
        href: "/" + btoa(currentJson)
      }, "Permalink")
    )
  }
}

const StatBlockComponent: m.Component = {
  view() {
    return m(".stat-block",
      m(el.crc, state.current.uid),
      m(el.hr),
      m(el.name_editor, m(NameEditorComponent)),

      m(el.property_line,
        m("span.level", "lvl ", m(SelectLevelComponent)),

        m(SelectComponent, {
          name: "role",
          label: "Role",
          onchange(val: string) { state.set({ role: val as tables.Role }) },
          current: state.current.role,
          choices: keys(tables.roles),
        }),

        m(SelectComponent, {
          name: "modifier",
          label: "Modifier",
          onchange(val: string) { state.set({ modifier: val as tables.Modifier }) },
          current: state.current.modifier,
          choices: keys(tables.modifiers),
        }),

        m(SelectComponent, {
          name: "size",
          label: "Size",
          onchange(val: string) { state.set({ size: val }) },
          current: state.current.size,
          choices: tables.sizes,
        }),

        m(SelectComponent, {
          name: "category",
          label: "Category",
          onchange(val: string) { state.set({ category: val }) },
          current: state.current.category,
          choices: tables.categories,
        }),

        m(SelectComponent, {
          name: "alignment",
          label: "Alignment",
          onchange(val: string) { state.set({ alignment: val }) },
          current: state.current.alignment,
          choices: tables.alignments,
        }),
      ),

      m(el.hr),

      m(BaseProperty, "Hit Points", state.current.hit_points, ` (${state.current.hit_die[0]}${state.current.hit_die[1]} + ${state.current.hit_die[2]}) `),
      m(BaseProperty, "Armor Class", state.current.armor_class),
      m(BaseProperty, "Speed", state.current.speed, "ft"),
      m(BaseProperty, "Challenge", state.current.challenge_rating, " ( ", state.current.experience, " ) "),

      m(BaseProperty,
        "Damage per Action",
        state.current.damage_per_action,
      ),
      m(el.hr),
      m(el.abilities_block,
        map((mod) => m(AbilityModifierComponent, { mod }),
          ["str", "dex", "con", "int", "wis", "cha"]),
      ),

      m(el.hr),
      m(PropertyLines),

      m(el.hr),
      m(ActionsBlock, { sb: state.current }),

      m(el.hr),
      m(SimpleCreatureJSON),
    )
  },
}

const SimpleCreatureCompendium: m.Comp = {
  oninit() {
    state.loadCreatureCompendium()
  },
  view() {
    return m(el.compendium,
      m("h1", "List of creatures"),

      m(el.compendium,
        m(el.compendium_header + style.light_bg,
          m(el.compendium_cell, "uid"),
          m(el.compendium_cell, "name"),
          m(el.compendium_cell, "level"),
          m(el.compendium_cell, "role"),
          m(el.compendium_cell, "modifier"),
        ),
        map((creature: StatBlock) =>
          m(el.compendium_row + style.hilight_bg, {
            key: creature.uid,
            onclick() {
              state.current = creature
            }
          },
            m(el.compendium_cell, creature.uid),
            m(el.compendium_cell, creature.name),
            m(el.compendium_cell, creature.level),
            m(el.compendium_cell, creature.role),
            m(el.compendium_cell, creature.modifier),
            m(el.compendium_cell, m(m.route.Link, {
              href: "/" + btoa(JSON.stringify(creature))
            }, "Permalink")),
            m(el.compendium_cell + style.remove, { onclick() { state.deleteFromCompendium(creature.uid) } }, "x")
          ),
          values(state.list)))
    )
  }
}

export const Ui: m.Component<{ creature?: string }> = {
  oninit(vnode) {
    if (vnode.attrs.creature) {
      try {
        const creature = JSON.parse(atob(vnode.attrs.creature))
        return state.init(creature)
      } catch (e) {
        console.error(e)
      }
    }
    state.init()
  },
  view() {
    return m(".little-creature-maker" + b`
      ff Quattrocento, sans-serif
      fs 1.0rem
      lh 1.6rem
    `, [
      m(StatBlockComponent),
      m(SimpleCreatureCompendium),
    ])
  },
}
