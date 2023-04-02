import { map, keys, range } from "rambda"
import { createMonster } from "./monster"
import * as tables from "./tables"
import m from "mithril"

const state = {
  list: [],
  current: {
    level: 0,
    role: "defender",
    modifier: "normal",
    name: "Naga",
    alignment: "chaotic-evil",
    category: "fiend (demon)",
    size: "medium",
  },

  setup() {
    const data = JSON.parse(localStorage.getItem("current"))
    if (data) {
      state.current.level = data.level
      state.current.role = data.role
      state.current.modifier = data.modifier
      state.current.name = data.name
      state.current.size = data.size
      state.current.alignment = data.alignment
      state.current.category = data.category
    } else {
      this.current = createMonster({
        name: "Sample",
        level: 0,
        role: "defender",
        modifier: "normal",

        size: "large",
        category: "aberration",
        alignment: "unaligned",
      })
    }

    this.update()
  },

  update() {
    this.current = createMonster({
      name: this.current.name,
      level: this.current.level,
      role: this.current.role,
      modifier: this.current.modifier,
      size: this.current.size,
      alignment: this.current.alignment,
      category: this.current.category,
    })
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


  set(data) {
    for (let key in data) {
      state.current[key] = data[key]
    }
    state.update()
  },

  // very rough estimate, anything less than level 1 is 0
  challengeRating() {
    let fraction = this.current.level * tables.modifiers[this.current.modifier].experience
    return Math.floor(fraction)
  },

  toAbilityScore(mod) {
    return 10 + Math.floor(
      mod * 2
    )
  },

  loadCreatureCompendium() {
    const data = JSON.parse(localStorage.getItem("compendium"))
    this.list = data || []
  }
}

const SelectComponent = ({ name, onchange, choices, current }: { name: string, onchange: (i: string) => void, choices: string[], current: string }) => {
  return {
    view(el) {
      return m("select", {
        name,
        onchange(e) {
          onchange(e.target.value)
        }
      }, [map((choice: string) => m("option", {
        value: choice,
        selected: choice == current
      }, [choice]),
        choices)]
      )
    }
  }
}

const SelectLevelComponent = () => {
  return SelectComponent({
    name: "level",
    onchange(lvl) {
      state.set({ level: parseInt(lvl) })
    },
    current: state.current.level.toString(),
    choices: map((i) => i.toString(), range(-5, 36)),
  })
}

const NameEditorComponent = {
  view() {
    return m("input[type=text]", {
      name: "name",
      value: state.current.name,
      onkeyup(e) {
        state.set({ name: e.target.value })
      },
    })
  }
}

const StatBlock = {
  oninit() {
    state.setup()
  },

  AbilitiesBlock: {
    view() {
      return m(".abilities-block", [
        this.format("str"),
        this.format("dex"),
        this.format("con"),
        this.format("int"),
        this.format("wis"),
        this.format("cha"),
      ])
    },

    format(mod) {
      let score = state.current["ability_modifiers"][mod]
      return m(`.score.${mod}`, [
        m("span.stat", mod),
        m("span.score", [
          state.toAbilityScore(score),
          " (", this.formatModScore(score), ") ",
        ]),
      ])
    },

    formatModScore(mod) {
      if (mod < 0) {
        return " - " + Math.abs(mod)
      } else {
        return " + " + mod
      }
    },
  },


  ChallengeRating: {
    view() {
      let cr = state.challengeRating()
      return m(".property-line.challenge", [
        m("b", "Challenge"), ": ",
        cr, " ( ", state.current["experience"], " ) "
      ])
    }
  },

  BaseProperties: {
    view() {
      return m(".base-properties", [
        m(".property-line.armor-class", [
          m("b", "Armor Class"), ": ",
          state.current["armor_class"],
        ]),

        m(".property-line.hit_points", [
          m("b", "Hit Points"), ": ",
          state.current["hit_points"],
        ]),

        m(".property-line.speed", [
          m("b", "Speed"), ": ",
          state.current["speed"] + "ft",
        ]),
      ])
    }
  },

  PropertyLines: {
    view() {
      return m(".property-lines", [
        m(".property-line.damage-immunities", [
          m("b", "Damage Immunities"),
          ["poison", "psychic", "#todo"].join(", ")
        ]),

        m(".property-line.condition-immunities", [
          m("b", "Condition Immunities"),
          ["blinded", "charmed", "deafened",
            "exhaustion", "frightened", "paralyzed",
            "petrified", "poisoned"
          ].join(", "),
        ]),

        m(".property-line.senses", [
          m("b", "Senses"), ": ",
          "blindsight 60 ft. (blind beyond this radius), passive Perception 6",
        ]),

        m(".property-line.languages", [
          m("b", "Languages"), ": ",
          "common",
        ]),

        m(StatBlock.ChallengeRating),
      ])
    }
  },

  PropertyBlocks: {
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
  },

  ActionsBlock: {
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
  },

  view() {
    return m(".stat-block", [

      m("hr"),

      m("div.stat-block", [
        m(".creature-heading", [
          m("h1", m(NameEditorComponent)),

          m("p.tags", [
            m("span.level", ["lvl ", m(SelectLevelComponent())]),

            m("span.role", m(SelectComponent({
              name: "role",
              onchange(val) { state.set({ role: val }) },
              current: state.current.role,
              choices: keys(tables.roles),
            }))),

            m("span.modifier", m(SelectComponent({
              name: "modifier",
              onchange(val) { state.set({ modifier: val }) },
              current: state.current.modifier,
              choices: keys(tables.modifiers),
            }))),

            m("span.size", m(SelectComponent({
              name: "size",
              onchange(val) { state.set({ size: val }) },
              current: state.current.size,
              choices: tables.sizes,
            }))),

            m("span.category", m(SelectComponent({
              name: "category",
              onchange(val) { state.set({ category: val }) },
              current: state.current.category,
              choices: tables.categories,
            }))),

            m("span.alignment", m(SelectComponent({
              name: "alignment",
              onchange(val) { state.set({ alignment: val }) },
              current: state.current.alignment,
              choices: tables.alignments,
            }))),
          ]),
        ]),

        m("hr"),

        m(this.BaseProperties),

        m("hr"),

        m(this.AbilitiesBlock),

        m("hr"),

        m(this.PropertyLines),

        m("hr"),

        m(this.PropertyBlocks),

        m(this.ActionsBlock),
      ]),

      m("code", m("pre", JSON.stringify(state.current, null, 2))),
    ])
  },
}
const SimpleMonsterCompendium = {
  oninit() {
    state.loadCreatureCompendium()
  },
  view() {
    return m("div.monster-list", [
      m("h1", "List of creatures"),

      m("ul", map((creature) => {
        m("li", [
          m("span.name", creature.name),
          m("span.level", creature.level),
          m("span.role", creature.role),
          m("span.modifier", creature.modifier),
        ])
      }, state.list))
    ])
  }
}

export const Ui = {
  oninit: state.init,
  view() {
    return m(".little-monster-maker", {
    }, [
      m(StatBlock),
      m(SimpleMonsterCompendium),
    ])
  },
}
