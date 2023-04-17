
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function formatString(str: string): string {
  return str
    .replace(/[^a-z0-9\-\(\)]/ig, " ")
    .replace(/\b([a-zÁ-ú]{3,})/g, capitalize);
}
