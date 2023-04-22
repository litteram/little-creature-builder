
export default function localize(arg: string): string {
  if (window['game']) {
    return window['game'].i18n.localize(arg) as string
  }

  return arg
}
