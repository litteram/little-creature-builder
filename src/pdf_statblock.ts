import { keys } from "rambda"
import * as tables from "./tables.js"
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
  for (let i of ["str", "dex", "con", "int", "wis", "cha"]) {
    result += modToAbilityScore(s[i])
    result += ` (${formatModScore(s[i])}) `
  }

  return result
}

function properties(props: Partial<model.Properties>) {
  const results: string[] = []
  for (let key in props) {
    const t = formatString(key)
    results.push(`${t}: ${props[key].map(formatString).join(", ")}`)
  }

  return results.join("\n")
}

function spellcasting(sb: StatBlock): string {
  const role = tables.roles[sb.role]
  const spellcastingAbilities = []
  for (let i in role.stat_priorities) {
    if (["int", "wis", "cha"].indexOf(role.stat_priorities[i]) > -1) {
      spellcastingAbilities.push(role.stat_priorities[i])
    }
    if (spellcastingAbilities.length == 2) {
      break
    }
  }


  let results = `The ${sb.name}'s spellcasting ability is \
${spellcastingAbilities[0]} (spell save DC ${sb.spell_dc[0]}) and \
${spellcastingAbilities[1]} (spell save DC ${sb.spell_dc[1]}).
`

  const spells: string[][] = sb.spells.reduce((res, spell) => {
    if (res[spell.times]) {
      res[spell.times].push(spell.name)
      return res
    }
    res[spell.times] = [spell.name]
    return res
  }, [])

  for (let times in spells) {
    if (!spells[times]) continue

    if (times == "0") {
      results += "At will: "
    } else {
      results += `${times}/day each: `
    }
    results += spells[times].join(", ")
    results += ". "
  }

  return results
}

function attacks(sb: StatBlock): string {
  let results = "Attacks\n"

  let hitModifier = 0
  let bestAbility = "str"
  for (let ability in sb.ability_modifiers) {
    if (sb.ability_modifiers[ability] > hitModifier) {
      hitModifier = sb.ability_modifiers[ability]
      bestAbility = ability
    }
  }

  if (sb.multiattacks) {
    const multiattackNames = sb.attacks.reduce((res, a) => {
      res[a.id] = a.name
      return res
    }, {})
    results += `Multiattack. ${sb.name} attacks `
    results += sb.multiattacks.map((a) => `${a.times} time${a.times > 1 ? "s" : ""} with ${multiattackNames[a.id]}`).join(", ")
    results += ".\n"
  }

  for (let attack of sb.attacks) {
    results += `${attack.name}. ${attack.description} Melee Attack: +${hitModifier} (${bestAbility}) to hit.\
Reach ${attack.reach} ft., one target.\
  Hit: ${model.attackDamage(attack).avg} (${attack.die_num}${attack.die} + ${attack.mod}) \
${formatString(attack.type)} damage.
` // FIXME Melee/Reach, # targets
  }

  return results
}

export function pdfStatblock(sb: StatBlock): string {
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
Saving Throws: ${savingThrows(sb.saving_throws)}
${properties(sb.properties)}
Challenge ${sb.challenge_rating} (${sb.experience} XP)
${spellcasting(sb)}
${attacks(sb)}
  `

  return result
}
