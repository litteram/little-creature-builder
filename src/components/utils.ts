import * as model from "../model.js"

export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function formatString(str: string | number): string {
  return String(str)
    .replace(/[^a-z0-9\-\(\)]/ig, " ")
    .replace(/\b([a-zÁ-ú]{3,})/g, capitalize);
}

export function formatModScore(mod: number) {
  if (mod < 0) {
    return " - " + Math.abs(mod)
  } else {
    return " + " + mod
  }
}

export function formatAbilityScore(score: number) {
  return model.modToAbilityScore(score) +
    " (" + formatModScore(score) + ") "
}

export function formatChoice(i: string | number): [string, string] {
  return [String(i), formatString(i)]
}

export function formatChoices(i: Array<string | number> | readonly string[]): [string | number, string][] {
  return i.map(formatChoice)
}
