import m from "mithril"
import { map, keys, range, values, slice } from "rambda"
import { state, StatBlock } from "./model.js"
import * as model from "./model.js"
import * as tables from "./tables.js"

import { el, style, grid } from "./components/elements.js"
import { Select, SelectLabel } from "./components/select.js"
import { SelectTag } from "./components/select_tag.js"
import { Textarea } from "./components/textarea.js"
import { StatHex } from "./components/hexagon.js"
import { formatAbilityScore, formatChoices } from "./components/utils.js"

import { pdfStatblock } from "./pdf_statblock.js"

const Permalink: m.Component<{ sb: StatBlock }> = {
  view({ attrs: { sb } }) {
    return m(m.route.Link, {
      class: style.permalink,
      href: "/" + model.encode(sb)
    }, "Permalink")
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

const MultiAttacks: m.Component<{ sb: StatBlock }> = {
  view({ attrs: { sb } }) {
    const choices = sb.attacks.map((atk) => [atk.id, atk.name]) as [string, string][]


    return m(el.multiattacks,
      m("h3", "Multiattacks",
        m(el.button, {
          onclick() {
            sb.multiattacks.push({
              id: "",
              times: -1,
            })
          }
        }, "new"),
      ),
      sb.multiattacks
        .map((atk, key) => m(el.multiattack,
          m(Select, {
            key,
            name: "times",
            label: "#",
            choices: formatChoices(range(0, 8)),
            current: atk.times,
            onchange(val) {
              atk.times = parseInt(val)
            }
          }),
          m(Select, {
            key,
            name: "attack",
            label: "Attack",
            current: atk.id,
            choices,
            onchange(val) {
              atk.id = val
            }
          }),
          m(el.remove, {
            key,
            onclick() {
              sb.multiattacks = sb.multiattacks.filter(a => a.id !== atk.id)
            }
          }, "Remove")
        )
        ),
    )
  }
}

const AttackComponent: m.Component<{ attack: model.Attack }> = {
  view({ attrs: { attack } }) {
    const dmg = model.attackDamage(attack)
    console.log("attack reach: ", attack.reach)
    return m(el.action_block,
      { key: attack.id },
      m(el.input + style.action_cell_wide, {
        name: "attack",
        placeholder: "name",
        value: attack.name,
        onchange(e: Event) {
          model.attack.set({
            ...attack,
            name: e.target['value'],
          })
        }
      }),

      m(Textarea, {
        style: style.action_cell_wide,
        name: "description",
        placeholder: "description",
        value: attack.description,
        oninput(val: string) {
          model.attack.set({
            ...attack,
            description: val,
          })
        },
      }),

      m(Select, {
        style: style.action_cell,
        name: "die_num",
        current: attack.die_num,
        choices: formatChoices(range(1, 21)),
        onchange(die_num) {
          model.attack.set({
            ...attack,
            die_num: parseInt(die_num),
          })
        }
      }),

      m(Select, {
        style: style.action_cell,
        name: "die",
        current: attack.die,
        choices: formatChoices(tables.dies),
        onchange(die) {
          model.attack.set({
            ...attack,
            die,
          })
        }
      }),

      m(Select, {
        style: style.action_cell,
        name: "mod",
        current: attack.mod.toString(),
        choices: formatChoices(range(0, 61)),
        onchange(mod) {
          model.attack.set({
            ...attack,
            mod: parseInt(mod),
          })
        }
      }),

      m(Select, {
        style: style.action_cell_wide,
        name: "type",
        label: "Damage",
        current: attack.type,
        choices: formatChoices(tables.damage_types),
        onchange(type: model.DamageType) {
          model.attack.set({
            ...attack,
            type,
          })
        }
      }),

      m(Select, {
        style: style.action_cell_wide,
        name: "reach",
        label: "Reach",
        current: attack.reach,
        choices: range(1, 7).map(x => [x * 5, x * 5 + " ft."]) as [number, string][],
        onchange(reach: string) {
          model.attack.set({
            ...attack,
            reach: parseInt(reach),
          })
        }
      }),

      m(el.action_cell, "max: ", m("b", dmg.max)),
      m(el.action_cell, "avg: ", m("b", dmg.avg)),
      m(el.action_cell, "min: ", m("b", dmg.min)),

      m(el.remove + style.action_cell_wide, {
        onclick() {
          model.attack.remove(attack)
        }
      }, "remove")
    )
  }
}

const ActionsBlock: m.Component<{ sb: StatBlock }> = {
  view({ attrs: { sb } }) {
    return m(".actions", [
      m("h3", "Actions",
        m(el.button, {
          onclick() {
            model.attack.new()
          }
        }, "new"),
      ),
      m(el.actions_block,
        sb.attacks.map((attack) => m(AttackComponent, { attack }))),

      sb.attacks.length ? m(MultiAttacks, { sb }) : [],
    ])
  }
}

const SpellComponent: m.Component<{ spell: model.Spell }> = {
  view({ attrs: { spell } }) {
    return m(el.spell_block,
      m(Select, {
        name: spell.name,
        current: spell.times,
        choices: [
          [0, "at will"],
          ...(range(1, 9).map((x) => [x, `${x}/day`]) as [number, string][])
        ],
        onchange(val) {
          spell.times = parseInt(val)
          model.spell.sort()
        },
        label: "Casts",
        id: spell.id,
      }),
      m(el.input, {
        placeholder: "Spell name",
        value: spell.name,
        onchange() {
          spell.name = this.value
        },
        onblur() {
          model.spell.sort()
        },
      }),
      m(el.remove, {
        onclick() {
          model.spell.remove(spell)
        }
      }, "remove"),
    )
  }
}

const SpellsBlock: m.Component<{ sb: StatBlock }> = {
  view({ attrs: { sb } }) {
    return m(el.property_block, [
      m(el.h3, "Spells",
        m(el.button, {
          onclick() {
            model.spell.new()
          }
        }, "new")
      ),
      m(el.spells_block, sb.spells.map((spell) => m(SpellComponent, { spell }))),
    ])
  }
}


const PropertyLines: m.Component = {
  view() {
    return [
      m(el.property_line,
        m(SelectTag, {
          label: "Damage Immunities",
          name: "damage-immunities",
          choices: tables.damage_types,
          selected: state.current.properties.damage_immunities || [],
          onchange(val: string[]) {
            state.set({ properties: { damage_immunities: val } })
          },
        }),
      ),

      m(el.property_line,
        m(SelectTag, {
          label: "Damage Resistances",
          name: "senses",
          choices: tables.damage_types,
          selected: state.current.properties.damage_resistances || [],
          onchange(val: string[]) {
            state.set({ properties: { damage_resistances: val } })
          },
        }),
      ),

      m(el.property_line,
        m(SelectTag, {
          label: "Damage Weaknesses",
          name: "damage-weaknesses",
          choices: tables.damage_types,
          selected: state.current.properties.damage_weaknesses || [],
          onchange(val: string[]) {
            state.set({ properties: { damage_weaknesses: val } })
          },
        })
      ),

      m(el.property_line,
        m(SelectTag, {
          label: "Condition Immunities",
          name: "condition-immunities",
          choices: tables.conditions,
          selected: state.current.properties.condition_immunities || [],
          onchange(val: string[]) {
            state.set({ properties: { condition_immunities: val } })
          },
        })
      ),

      m(el.property_line,
        m(SelectTag, {
          label: "Condition Weaknesses",
          name: "condition-weaknesses",
          choices: tables.conditions,
          selected: state.current.properties.condition_weaknesses || [],
          onchange(val: string[]) {
            state.set({ properties: { condition_weaknesses: val } })
          },
        })
      ),

      m(el.property_line,
        m(SelectTag, {
          label: "Senses",
          name: "senses",
          choices: tables.special_senses,
          selected: state.current.properties.special_senses || [],
          onchange(val: string[]) {
            state.set({ properties: { special_senses: val } })
          },
        })
      ),

      m(el.property_line,
        m(SelectTag, {
          label: "Languages",
          name: "languages",
          choices: tables.languages,
          selected: state.current.properties.languages || [],
          onchange(val: string[]) {
            state.set({ properties: { languages: val } })
          }
        })
      ),
    ]
  }
}

const ExportSimpleCreature: m.Component = {
  view() {
    const currentJson = JSON.stringify(state.current)
    const copyText = JSON.stringify(state.current, null, 2)
    return m(".actions",
      m(el.button, {
        onclick(e: Event) {
          e.preventDefault()
          model.compendium.save(state.current)
        }
      }, "save to compendium"),

      m(el.input, {
        id: "littleCreatureJSON",
        type: "text",
        value: currentJson,
      }),

      m(el.button, {
        onclick(e: Event) {
          navigator.clipboard.writeText(copyText)
        }
      }, "copy json to clipboard"),

      m(el.button, {
        onclick() {
          const val = (document.getElementById("littleCreatureJSON") as HTMLInputElement).value
          state.set(JSON.parse(val))
        }
      }, "import from JSON"),

      m(el.button, {
        onclick() {
          const val = pdfStatblock(state.current)
          navigator.clipboard.writeText(val)
        }
      }, "Copy PDF-like stat block"),

      m(el.button, {
        onclick() {
          return false
        }
      }, "Print stat block"),

      m(Permalink, { sb: state.current }),
    )
  }
}

const StatBlockComponent: m.Component = {
  view() {
    return m(".stat-block",
      m(el.crc, state.current.uid),
      m(el.hr),
      m(el.name_editor, m(NameEditorComponent)),

      m(el.property_line, { class: grid.container(6) },
        m(SelectLabel, {
          name: "level",
          label: "Level",
          current: state.current.level.toString(),
          choices: formatChoices(map((i) => i.toString(), range(-5, 36))),
          onchange(lvl: string) {
            state.set({ level: parseInt(lvl) })
          },
        }),

        m(SelectLabel, {
          name: "role",
          label: "Role",
          onchange(val: string) { state.set({ role: val as tables.Role }) },
          current: state.current.role,
          choices: formatChoices(keys(tables.roles)),
        }),

        m(SelectLabel, {
          name: "modifier",
          label: "Modifier",
          onchange(val: string) { state.set({ modifier: val as tables.Modifier }) },
          current: state.current.modifier,
          choices: formatChoices(keys(tables.modifiers)),
        }),

        m(SelectLabel, {
          name: "size",
          label: "Size",
          onchange(val: string) { state.set({ size: val }) },
          current: state.current.size,
          choices: formatChoices(tables.sizes),
        }),

        m(SelectLabel, {
          name: "category",
          label: "Category",
          onchange(val: string) { state.set({ category: val }) },
          current: state.current.category,
          choices: formatChoices(tables.categories),
        }),

        m(SelectLabel, {
          name: "alignment",
          label: "Alignment",
          onchange(val: string) { state.set({ alignment: val }) },
          current: state.current.alignment,
          choices: formatChoices(tables.alignments),
        }),
      ),

      m(el.hr),

      m(el.base_properties,
        m(el.div,
          m(BaseProperty, "Hit Points", state.current.hit_points, ` (${state.current.hit_die[0]}${state.current.hit_die[1]} + ${state.current.hit_die[2]}) `),
          m(BaseProperty, "Armor Class", state.current.armor_class),
          m(BaseProperty, "Speed", state.current.speed, "ft"),
          m(BaseProperty, "Challenge", state.current.challenge_rating, " ( ", state.current.experience, " ) "),
          m(BaseProperty,
            "Damage per Action",
            state.current.damage_per_action,
          ),
        ),
        m(StatHex, { score: values(model.state.current.ability_modifiers).map(model.modToAbilityScore) }),
      ),

      m(el.hr),
      m(el.abilities_block,
        map((mod) => m(AbilityModifierComponent, { mod }),
          ["str", "dex", "con", "int", "wis", "cha"]),
      ),

      m(el.hr),
      m(PropertyLines),

      m(el.hr),
      m(SpellsBlock, { sb: state.current }),

      m(el.hr),
      m(ActionsBlock, { sb: state.current }),

      m(el.hr),
      m(ExportSimpleCreature),
    )
  },
}

const SimpleCreatureCompendium: m.Comp = {
  oninit() {
    model.compendium.load()
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
              m.route.set("/" + model.encode(creature))
            }
          },
            m(el.compendium_cell, creature.uid),
            m(el.compendium_cell, creature.name),
            m(el.compendium_cell, creature.level),
            m(el.compendium_cell, creature.role),
            m(el.compendium_cell, creature.modifier),
            m(el.compendium_cell, m(Permalink, { sb: creature })),
            m(el.compendium_cell + style.remove, {
              onclick() { model.compendium.remove(creature.uid) }
            }, "x")
          ),
          values(state.list)))
    )
  }
}

const Footer: m.Component = {
  view() {
    return m("footer",
      m(el.hr),
      m("a", {
        href: "https://github.com/litteram/little-creature-builder"
      }, "Source"),
      " license: ",
      m("a", {
        href: "https://github.com/litteram/little-creature-builder/blob/main/LICENSE"
      }, "ISC"),
    )
  }
}

export const Ui: m.Component<{ creature?: string }> = {
  oninit(vnode) {
    if (vnode.attrs.creature) {
      try {
        const creature = model.decode(vnode.attrs.creature)
        return state.init(creature)
      } catch (e) {
        console.error(e)
      }
    }
    state.init()
  },
  view() {
    return m(el.main, [
      m(StatBlockComponent),
      m(SimpleCreatureCompendium),
      m(Footer),
    ])
  },
}
