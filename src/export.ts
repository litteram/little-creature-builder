import { StatBlock, Abilities, SavingThrows, modToAbilityScore } from "./model.js"
import * as model from "./model.js"
import { formatModScore, formatString } from "./components/utils.js"

function savingThrows(s: SavingThrows): string {
  const result = []

  for (let i of s) {
    result.push(`${i[1]} ${formatModScore(i[0])}`)

    if (i[2]) {
      result.push(`${i[2]} ${formatModScore(i[0])}`)
    }
  }

  return result.join(", ")
}

function stats(s: Abilities): string {
  let result = ""

  // str
  for (let i in ["str", "dex", "con", "int", "wis", "cha"]) {
    result += modToAbilityScore(s[i])
    result += ` (${formatModScore(s[i])}) `
  }

  return result
}

function properties(props: Partial<model.Properties>) {
  const results: string[] = []
  for (let key in props) {
    const t = formatString(key)
    results.push(`${t} ${props[key].join(", ")}`)
  }

  return results.join("\n")
}

function spellcasting(sb: StatBlock): string {
  return `The ${sb.name} spellcasting ability is ${sb.spell_dc}`
}

export function statblock(sb: StatBlock): string {
  let result = `
${sb.name}
${sb.size} ${sb.category} ${sb.alignment}
Armor Class ${sb.armor_class}
Hit Points ${sb.hit_points} (${sb.hit_die[0]}${sb.hit_die[1]} + ${sb.hit_die[2]})
Speed ${sb.speed} ft.
STR
DEX
CON
INT
WIS
CHA
${stats(sb.ability_modifiers)}
Saving Throws ${savingThrows(sb.saving_throws)}
${properties(sb.properties)}
Challenge ${sb.challenge_rating} (${sb.experience} XP)
${spellcasting(sb)}
  `

  return result
}
