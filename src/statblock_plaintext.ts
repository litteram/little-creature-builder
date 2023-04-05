import { StatBlock, Abilities } from "./model.js"

function formatNumber(n: number): string {
  if (n < 0) {
    return `- ${Math.abs(n)}`
  } else {
    return `+ ${n}`
  }
}

function formatAbilityModifiers(mods: Abilities): string {
  return `${formatNumber(mods.str)} (  )`
}

export function convertToPasteBlock(sb: StatBlock): string {
  let abilities = sb.ability_modifiers

  const textBlock = `${sb.name}
${sb.size} ${sb.category}, ${sb.alignment}
Armor Class ${sb.armor_class}
Hit Points ${sb.hit_points} (15d10 + 75)
Speed ${sb.speed} ft.
STR
DEX
CON
INT
WIS
CHA
${abilities.str} ${abilities.dex} ${abilities.con} ${abilities.int} ${abilities.wis} ${abilities.cha}
Saving Throws Str +9, Con +9, Wis +7, Cha +7
Damage Resistances cold, fire, lightning; bludgeoning,
piercing, and slashing from nonmagical attacks
Damage Immunities poison
Condition Immunities poisoned
Senses truesight 120 ft., passive Perception 13
Languages Abyssal, telepathy 120 ft.
Challenge 9 (5,000 XP)
Innate Spellcasting. The glabrezu’s spellcasting ability
is Intelligence (spell save DC 16). The glabrezu can
innately cast the following spells, requiring no material
components:
At will: darkness, detect magic, dispel magic
1/day each: confusion, fly, power word stun
Magic Resistance. The glabrezu has advantage on
saving throws against spells and other magical effects.
Actions
Multiattack. The glabrezu makes four attacks: two with
its pincers and two with its fists. Alternatively, it makes
two attacks with its pincers and casts one spell.
Pincer. Melee Weapon Attack: +9 to hit, reach 10 ft.,
one target. Hit: 16 (2d10 + 5) bludgeoning damage. If
the target is a Medium or smaller creature, it is
grappled (escape DC 15). The glabrezu has two pincers,
each of which can grapple only one target.
Fist. Melee Weapon Attack: +9 to hit, reach 5 ft., one
target. Hit: 7 (2d4 + 2) bludgeoning damage.`

  return textBlock;
}
