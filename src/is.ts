export const is = {
  Number(x: any): boolean {
    return typeof x == "number"
  },
  String(x: any): boolean {
    return typeof x == "string"
  }
} as const
