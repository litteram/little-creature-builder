import { map } from "rambda"
import { sum, sump, mulp } from "./utils.js"
import { crc16 } from "./crc.js"
import * as tables from "./tables.js"

export type Abilities = {
  str: number
  dex: number
  con: number
  int: number
  wis: number
  cha: number
}

export type Properties = { [key: string]: string[] }

export type StatBlock = {
  uid: string

  name: string
  level: number
  role: tables.RoleName
  modifier: tables.ModifierName
  alignment: string
  category: string
  size: string

  armor_class: number
  hit_die: [number, string, number]
  hit_points: number
  attack_bonus: number
  damage_per_action: number
  spell_dc: number[]
  initiative: number
  perception: number
  stealth: number
  speed: number
  experience: number
  saving_throws: number[]
  ability_modifiers: Abilities
  challenge_rating: string

  attacks: string[]
  specials: string[]
  properties: Properties
}

type CreatureCompendium = {
  _storageId: string
  data: StatBlock[]
  load(): void
  filter(fn: (x: StatBlock) => boolean): StatBlock[]
}

function templateByLevel(lvl: Number) {
  return tables.levels.filter((i) => lvl == i.level)[0]
}

function generateUuid(opts: Partial<StatBlock>): string {
  let name = opts.name.toLowerCase()
  let { level, role, modifier, size } = opts
  return crc16(name + level + role + modifier + size)
}

export function createCreature(opts: Partial<StatBlock>): StatBlock {
  const role: tables.Role = tables.roles[opts.role]
  const modifier: tables.Modifier = tables.modifiers[opts.modifier]
  const template: tables.SimpleMonster = templateByLevel(opts.level)

  const saving_throws = map(
    (s) => s + role.saving_throws + modifier.saving_throws,
    template.saving_throws,
  )

  let s = {
    major: {
      stat: saving_throws[0],
      abilities: [role.stat_priorities[0], role.stat_priorities[1]],
    },
    minor: {
      stat: saving_throws[1],
      abilities: [role.stat_priorities[2], role.stat_priorities[3]],
    },
    lower: {
      stat: saving_throws[2],
      abilities: [role.stat_priorities[4], role.stat_priorities[5]],
    },
  }

  const ability_modifiers: Abilities = {
    str: 0,
    dex: 0,
    con: 0,
    int: 0,
    wis: 0,
    cha: 0,
  }
  for (const key in template.ability_modifiers) {
    ability_modifiers[role.stat_priorities[key]] =
      template.ability_modifiers[key]
  }

  const hit_points = mulp("hit_points", template, role, modifier)
  const experience = mulp("experience", template, modifier)
  const challenge_rating = calculateChallengeRating({ experience })

  return {
    uid: generateUuid(opts),

    name: opts.name,
    level: template.level,
    role: opts.role,
    modifier: opts.modifier,
    size: opts.size,
    category: opts.category,
    alignment: opts.alignment,

    armor_class: sump("armor_class", template, role, modifier),
    hit_die: calculateHitDie({
      size: opts.size,
      level: opts.level,
      ability_modifiers,
      hit_points,
    }),
    hit_points,
    attack_bonus: sump("attack_bonus", template, role, modifier),
    damage_per_action: mulp("damage_per_action", template, role, modifier),
    spell_dc: template.spell_dc.map((spell_dc) => spell_dc + modifier.spell_dc),
    initiative: sum(
      template.proficiency_bonus,
      role.initiative,
      modifier.initiative,
    ),
    perception: sum(
      template.proficiency_bonus,
      role.perception,
      modifier.perception,
    ),
    stealth: sum(0, modifier.stealth),
    speed: sum(25, role.speed),
    experience,
    challenge_rating,
    saving_throws,
    ability_modifiers,

    specials: opts.specials,
    attacks: opts.attacks,
    properties: opts.properties || {},
  }
}

export const CreatureCompendium: CreatureCompendium = {
  _storageId: "_creatureCompendium",
  data: [],

  load() {
    const data = JSON.parse(localStorage.get(this._storageId))
    if (data) {
      this.data = data
    }
  },

  filter(fn) {
    return this.data.filter(fn)
  },
}

/**
 * From HP to die + constitution modifier estimates
 */
function calculateHitDie(sb: Partial<StatBlock>): [number, string, number] {
  let die = tables.HitDies[sb.size]
  let estimate = tables.dies2hp[die]
  let base = sb.ability_modifiers.con * sb.level
  let target = sb.hit_points - base

  let result = 0
  let dies = 0
  while (result < (target - 10) && result < (target + 10)) {
    dies += 1
    result = estimate * dies
  }

  return [
    dies,
    die,
    base,
  ]
}

function calculateChallengeRating(sb: Partial<StatBlock>): string {
  let result = "0"
  for (let cr of tables.cr_exp) {
    if (sb.experience >= cr.exp) {
      result = cr.cr
    } else {
      break
    }
  }

  return result
}

export function modToAbilityScore(mod: number): number {
  return 10 + Math.floor(
    mod * 2
  )
}
