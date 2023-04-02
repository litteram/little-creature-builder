import { createMonster, BusinessCardStats } from "./monster"

console.log("giff:", createMonster({
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
