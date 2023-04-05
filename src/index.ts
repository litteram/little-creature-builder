import { createCreature } from "./model.js"
import { BusinessCardStats } from "./business_card_creature.js"

console.log("giff:", createCreature({
  name: "Sample",
  level: 5,
  role: "defender",
  modifier: "normal",
  size: "medium",
  category: "humanoid",
  alignment: "neutral",
}))
console.log("businesscard:", BusinessCardStats(5))
console.log()
