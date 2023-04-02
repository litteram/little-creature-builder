function fnProperty(fn: (x: number, y: number) => number, base: number, prop: string, objs): number {
  return Math.ceil(objs.map((o) => o[prop]).reduce(fn, base))
}

export function mulp(prop: string, ...objs) {
  return fnProperty((a, b) => a * b, 1, prop, objs)
}

export function sump(prop: string, ...objs): number {
  return fnProperty((a, b) => a + b, 0, prop, objs)
}

export function subp(prop: string, ...objs): number {
  return fnProperty((a, b) => a - b, 0, prop, objs)
}

export function sum(...stats: Array<number>): number {
  return stats.reduce((a, b) => a + b, 0)
}

function rnd(i: number) {
  return Math.floor(Math.random() * i) + 1
}
export const dices = {
  d8() {
    return rnd(8)
  },
  d12() {
    return rnd(20)
  },
  d20() {
    return rnd(20)
  },
  d100() {
    return rnd(100)
  }
}
