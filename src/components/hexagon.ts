import m from 'mithril'
import Stream from 'mithril/stream'
import b from 'bss'

interface Attrs {
  points: number[][]
  style: string
}

export function StatHex(): m.Component<{ score: number[] }> {
  const radius = 50
  const size = {
    width: radius * 2,
    height: radius * 2,
  }
  const maxScore = 30
  const unit = Math.floor(radius / maxScore)
  const sin = Math.sin(Math.PI / 6)
  const cos = Math.cos(Math.PI / 6)

  const points: Stream<number[][]> = Stream([])
  const style = b`
    fill rgb(90,90,90)
    stroke-width 1
    stroke rgb(90,45,45)
  `.style
  const hud_style = b`
    stroke rgba(100, 100, 100, 0.5)
    stroke-width 2
  `.style

  function score2points(score: number[]): number[][] {
    return score.map((s: number, key: number) => {
      const p = unit * s
      let y = 0
      let x = 0

      if (key === 0) {
        x = radius + 0
        y = radius - p
      }
      if (key === 1) {
        x = radius + Math.ceil(p * cos)
        y = radius - Math.ceil(p * sin)
      }
      if (key === 2) {
        x = radius + Math.ceil(p * cos)
        y = radius + Math.ceil(p * sin)
      }
      if (key === 3) {
        x = radius + 0
        y = radius + p
      }
      if (key === 4) {
        x = radius - Math.ceil(p * cos)
        y = radius + Math.ceil(p * sin)
      }
      if (key === 5) {
        x = radius - Math.ceil(p * cos)
        y = radius - Math.ceil(p * sin)
      }

      console.log(s, unit, p, [x, y])

      return [x, y]
    })
  }

  return {
    view({ attrs: { score } }) {
      points(score2points(score))
      return m("svg",
        { ...size },
        m("polygon", {
          points: points().map((s) => s.join(',')).join(' '),
          style,
        }),
      )
    }
  }
}
