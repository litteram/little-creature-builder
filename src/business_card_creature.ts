import { dices } from "./utils.js"

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
