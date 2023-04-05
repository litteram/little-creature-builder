import m from "mithril"
import { map, keys, range, mergeDeepRight, values } from "rambda"
import { createCreature, StatBlock, Abilities } from "./model.js"
import * as model from "./model.js"
import * as tables from "./tables.js"


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

const state = {
  list: {} as { [key: string]: StatBlock },

  current: createCreature({
    level: 0,
    role: "defender",
    modifier: "normal",
    name: "Naga",
    alignment: "chaotic-evil",
    category: "fiend (demon)",
    size: "medium",
  }),

  setup() {
    const data = JSON.parse(localStorage.getItem("current"))
    if (data) {
      this.current = data
    }
    state.update()
  },

  update() {
    this.current = createCreature(this.current)
    this.save()
  },

  save() {
    localStorage.setItem("current", JSON.stringify({
      level: state.current.level,
      role: state.current.role,
      modifier: state.current.modifier,
      name: state.current.name,
      size: state.current.size,
      alignment: state.current.alignment,
      category: state.current.category,
    }))
  },

  set(data: Partial<StatBlock>) {
    state.current = mergeDeepRight(
      state.current,
      data
    )
    state.update()
  },

  loadCreatureCompendium() {
    const data = JSON.parse(localStorage.getItem("compendium"))
    this.list = data || {}
  },

  saveToCompendium(sb: StatBlock) {
    this.list[sb.uid] = sb
    this.saveCompendium()
  },

  deleteFromCompendium(uid: string) {
    delete this.list[uid]
    this.saveCompendium()
  },

  saveCompendium() {
    localStorage.setItem("compendium", JSON.stringify(this.list))
  },
  resetCompendium() {
    localStorage.setItem("compendium", "{}")
  }
}

const SelectComponent: m.Component<{
  name: string
  current: string
  choices: string[]
  onchange: Function
}> = {
  view({ attrs }) {
    return m("select",
      {
        name: attrs.name,
        onchange(e: any) {
          attrs.onchange(e.target.value)
        },
      },
      ...map((choice: string) => m("option", {
        key: choice,
        value: choice,
        selected: choice == attrs.current
      }, choice), attrs.choices)
    )
  }
}

const SelectTagComponent: m.Component<{
  title: string
  name: string
  choices: string[]
  selected: string[]
  onchange(s: string[]): void
}> = {
  view(vnode) {
    const { selected } = vnode.attrs
    const items = vnode.attrs.choices
      .filter((i: string) => selected.indexOf(i) < 0)

    return [
      m("label", vnode.attrs.title,
        m(SelectComponent, {
          name: vnode.attrs.name,
          current: "",
          choices: ["", ...items],
          onchange(val: string) {
            vnode.attrs.onchange(selected.concat(val))
          },
        }),
      ),
      m(".tags",
        ...map((i) =>
          m("span.tag", i,
            m("span.delete", {
              onclick(e: Event) {
                e.preventDefault()
                const data = selected.filter(x => x !== i)
                vnode.attrs.onchange(data)
              }
            }, "x")
          ), selected)
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
    return m("input[type=text]", {
      name: "name",
      value: state.current.name,
      onkeyup(e: any) {
        state.set({ name: e.target.value })
      },
    })
  }
}

function AbilitiesBlockComponent(): m.Component<{ ability_modifiers: any }> {
  function format(abilities: Abilities, mod: string) {
    let score = abilities[mod]
    return m(`.score.${mod}`,
      m("span.stat", mod),
      m("span.score", formatAbilityScore(score)),
    )
  }

  return {
    view({ attrs }) {
      return m(".abilities-block",
        format(attrs.ability_modifiers, "str"),
        format(attrs.ability_modifiers, "dex"),
        format(attrs.ability_modifiers, "con"),
        format(attrs.ability_modifiers, "int"),
        format(attrs.ability_modifiers, "wis"),
        format(attrs.ability_modifiers, "cha"),
      )
    }
  }
}

const HitPointComponent: m.Component<{ sb: StatBlock }> = {
  view({ attrs }) {
    const { hit_points, hit_die } = attrs.sb

    return m(".property-line.hit-points", [
      m("b", "Hit Points"), ": ",
      `${hit_points} (${hit_die[0]}${hit_die[1]} + ${hit_die[2]})`
    ])
  }
}


const ChallengeRatingComponent: m.Component<{ sb: StatBlock }> = {
  view({ attrs }) {
    return m(".property-line.challenge",
      m("b", "Challenge"), ": ",
      attrs.sb.challenge_rating, " ( ", attrs.sb.experience, " ) "
    )
  }
}

const SpeedComponent: m.Component<{ sb: StatBlock }> = {
  view({ attrs }) {
    return m(".property-line.speed",
      m("b", "Speed"), ": ",
      attrs.sb.speed + "ft",
    )
  }
}

const ArmorClassComponent: m.Component<{ sb: StatBlock }> = {
  view({ attrs }) {
    return m(".base-property",
      m("b", "Armor Class"),
      ": ",
      attrs.sb.armor_class,
    )
  }
}

const PropertyLines: m.Component = {
  view() {
    return m(".property-lines", [
      m(".property-line.damage-immunities", [
        m(SelectTagComponent, {
          title: "Damage Immunities",
          name: "senses",
          choices: tables.damage_types,
          selected: state.current.properties.damage_immunities || [],
          onchange(val) {
            state.set({ properties: { damage_immunities: val } })
          },
        }),
      ]),

      m(".property-line.damage-resistances", [
        m(SelectTagComponent, {
          title: "Damage Resistances",
          name: "senses",
          choices: tables.damage_types,
          selected: state.current.properties.damage_resistances || [],
          onchange(val) {
            state.set({ properties: { damage_resistances: val } })
          },
        }),
      ]),

      m(".property-line.condition-immunities",
        m(SelectTagComponent, {
          title: "Condition Immunities",
          name: "senses",
          choices: tables.conditions,
          selected: state.current.properties.condition_immunities || [],
          onchange(val) {
            state.set({ properties: { condition_immunities: val } })
          },
        })
      ),

      m(".property-line.senses", [
        m(SelectTagComponent, {
          title: "Senses",
          name: "senses",
          choices: tables.special_senses,
          selected: state.current.properties.special_senses || [],
          onchange(val) {
            state.set({ properties: { special_senses: val } })
          },
        })
      ]),

      m(".property-line.languages", [
        m(SelectTagComponent, {
          title: "Languages",
          name: "languages",
          choices: tables.languages,
          selected: state.current.properties.languages || [],
          onchange(val) {
            state.current.properties.languages = val
          }
        })
      ]),
    ])
  }
}

const PropertyBlocks: m.Component = {
  view() {
    return m(".properties", [
      m(".property-block.properties", [
        m("h4", "Antimagic Susceptibility"),
        "Some kind of description",
      ]),

      m(".property-block.properties", [
        m("h4", "False appearance"),
        "Some other kind of description",
      ]),
    ])
  }
}

const ActionsBlock: m.Component = {
  view() {
    return m(".actions", [
      m("h3", "Actions"),

      m("hr"),

      m(".property-block.attack", [
        m("b", "Multiattack"),
        "Describe multiattack?",
      ]),

      m("hr"),

      m(".property-block.attack", [
        m("b", "Slam"),
        m("p", [
          m("i", "Slams the ground with his fists"),
          "+4 to hit, reach 5ft, one target.",
          m("i", "Hit:"),
          "5 (1d6 + 2) bludgeoning damage.",
        ]),
      ]),
    ])
  }
}

const SimpleCreatureJSON: m.Component = {
  view() {
    return m(".actions",
      m("button", {
        onclick(e: Event) {
          e.preventDefault()
          const copyText = JSON.stringify(state.current, null, 2)
          navigator.clipboard.writeText(copyText)
        }
      }, "copy json to clipboard"),
      m("button", {
        onclick(e: Event) {
          e.preventDefault()
          state.saveToCompendium(state.current)
        }
      }, "save to compendium"),
      m("textarea", { value: JSON.stringify(state.current) })
    )
  }
}

const StatBlockComponent: m.Component = {
  oninit() {
    state.setup()
  },

  view() {
    return m(".stat-block", [
      m(".crc", state.current.uid),
      m("hr"),
      m("div.stat-block", [
        m(".creature-heading", [
          m("h1", m(NameEditorComponent)),

          m("p.tags", [
            m("span.level", ["lvl ", m(SelectLevelComponent)]),

            m("span.role", m(SelectComponent, {
              name: "role",
              onchange(val: string) { state.set({ role: val as tables.RoleName }) },
              current: state.current.role,
              choices: keys(tables.roles),
            })),

            m("span.modifier", m(SelectComponent, {
              name: "modifier",
              onchange(val: string) { state.set({ modifier: val as tables.ModifierName }) },
              current: state.current.modifier,
              choices: keys(tables.modifiers),
            })),

            m("span.size", m(SelectComponent, {
              name: "size",
              onchange(val: string) { state.set({ size: val }) },
              current: state.current.size,
              choices: tables.sizes,
            })),

            m("span.category", m(SelectComponent, {
              name: "category",
              onchange(val: string) { state.set({ category: val }) },
              current: state.current.category,
              choices: tables.categories,
            })),

            m("span.alignment", m(SelectComponent, {
              name: "alignment",
              onchange(val: string) { state.set({ alignment: val }) },
              current: state.current.alignment,
              choices: tables.alignments,
            })),
          ]),
        ]),
        m("hr"),
        m(".base-properties", [
          m(ArmorClassComponent, { sb: state.current }),
          m(HitPointComponent, { sb: state.current }),
          m(SpeedComponent, { sb: state.current }),
          m(ChallengeRatingComponent, { sb: state.current }),
        ]),
        m("hr"),
        m(AbilitiesBlockComponent(), { ability_modifiers: state.current.ability_modifiers }),
        m("hr"),
        m(PropertyLines),
        m("hr"),
        m(PropertyBlocks),
        m(ActionsBlock),
      ]),

      m(SimpleCreatureJSON),
    ])
  },
}

const SimpleMonsterCompendium: m.Comp = {
  oninit() {
    state.loadCreatureCompendium()
  },
  view() {
    return m("div.monster-list",
      m("h1", "List of creatures"),

      m(".compendium",
        m(".header",
          m("span.label", "uid"),
          m("span.label", "name"),
          m("span.label", "level"),
          m("span.label", "role"),
          m("span.label", "modifier"),
        ),
        map((creature: StatBlock) => m(".creature", {
          key: creature.uid,
          onclick() {
            state.current = creature
          }
        },
          m("span.uid", creature.uid),
          m("span.name", creature.name),
          m("span.level", creature.level),
          m("span.role", creature.role),
          m("span.modifier", creature.modifier),
          m("span.delete", { onclick() { state.deleteFromCompendium(creature.uid) } }, "x")
        ), values(state.list)))
    )
  }
}

export const Ui = {
  oninit: state.setup,
  view() {
    return m(".little-monster-maker", [
      m(StatBlockComponent),
      m(SimpleMonsterCompendium),
    ])
  },
}
