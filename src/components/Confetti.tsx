import { useEffect, useRef } from 'react'

const COLORS = ['#34d399', '#60a5fa', '#f59e0b', '#f472b6', '#a78bfa', '#fb923c', '#fbbf24']

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  gravity: number
  color: string
  width: number
  height: number
  rotation: number
  rotSpeed: number
  opacity: number
}

function makeParticles(count: number, w: number): Particle[] {
  return Array.from({ length: count }, () => ({
    x: Math.random() * w,
    y: -20 - Math.random() * 80,
    vx: (Math.random() - 0.5) * 5,
    vy: Math.random() * 4 + 1,
    gravity: 0.09,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    width: Math.random() * 10 + 5,
    height: Math.random() * 5 + 3,
    rotation: Math.random() * 360,
    rotSpeed: (Math.random() - 0.5) * 8,
    opacity: 1,
  }))
}

interface ConfettiProps {
  active: boolean
}

export function Confetti({ active }: ConfettiProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !active) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const w = (canvas.width = window.innerWidth)
    const h = (canvas.height = window.innerHeight)
    let particles = makeParticles(160, w)

    const loop = () => {
      ctx.clearRect(0, 0, w, h)
      particles = particles.filter((p) => p.y < h + 40 && p.opacity > 0)

      for (const p of particles) {
        p.x += p.vx
        p.y += p.vy
        p.vy += p.gravity
        p.vx *= 0.99
        p.rotation += p.rotSpeed
        if (p.y > h * 0.65) p.opacity -= 0.018

        ctx.save()
        ctx.globalAlpha = Math.max(0, p.opacity)
        ctx.translate(p.x, p.y)
        ctx.rotate((p.rotation * Math.PI) / 180)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height)
        ctx.restore()
      }

      if (particles.length > 0) {
        rafRef.current = requestAnimationFrame(loop)
      }
    }

    rafRef.current = requestAnimationFrame(loop)

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [active])

  if (!active) return null

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 100,
      }}
    />
  )
}
