import { map, times } from "rambda"
import { sum, sump, subp, mulp, dices } from "./utils"
import * as tables from "./tables"

// Using:
// https://songoftheblade.wordpress.com/2018/03/11/dd-5th-edition-monster-stats-on-a-business-card/
export function BusinessCardStats(l) {
  let armour_class = 10 + Math.ceil(l / 2)
  let health_points = dices.d8() * (l + 1)
  let hit_dice = l + 1
  let damage_per_round = 2 * l
  let proficiency_bonus = 0
  let saving_throws = {
    bad: dices.d20() + Math.ceil(l / 2),
    good: dices.d20() + Math.ceil(l / 2) + proficiency_bonus,
  }
  let difficulty_class = 10 + Math.ceil(l / 2) // as maximum

  return {
    armour_class,
    health_points,
    hit_dice,
    damage_per_round,
    proficiency_bonus,
    saving_throws,
    difficulty_class,
  }
}

const Monster = {
  level: 0,
  role: "",
  modifier: "",
  abilities: [],
  spells: [],
}

function templateByLevel(lvl: Number) {
  return tables.levels.filter((i) => lvl == i.level)[0]
}

type CreateMonsterOpts = {
  level: number,
  name: string,
  role: tables.RoleNames,
  modifier: tables.ModifierName,
  size: string,
  category: string,
  alignment: string,
}

export function createMonster(opts: CreateMonsterOpts) {
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

  const ability_modifiers = {} // {int: 2, str: -2 ...}
  for (const key in template.ability_modifiers) {
    ability_modifiers[role.stat_priorities[key]] =
      template.ability_modifiers[key]
  }

  return {
    name: opts.name,
    level: template.level,
    role: opts.role,
    modifier: opts.modifier,
    size: opts.size,
    category: opts.category,
    alignment: opts.alignment,

    armor_class: sump("armor_class", template, role, modifier),
    hit_dice: `${template.level}d8`,
    hit_points: mulp("hit_points", template, role, modifier),
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
    experience: mulp("experience", template, modifier),
    saving_throws,
    ability_modifiers,
  }
}
