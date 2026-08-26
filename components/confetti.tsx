"use client"

import { useEffect, useRef } from "react"

interface ConfettiParticle {
  color: string
  x: number
  y: number
  diameter: number
  tilt: number
  tiltAngleIncrement: number
  tiltAngle: number
  particleSpeed: number
  waveAngle: number
}

export default function Confetti() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const confettiRef = useRef<ConfettiParticle[]>([])
  const animationFrameRef = useRef<number | null>(null)

  const colors = [
    "#f44336",
    "#e91e63",
    "#9c27b0",
    "#673ab7",
    "#3f51b5",
    "#2196f3",
    "#03a9f4",
    "#00bcd4",
    "#009688",
    "#4CAF50",
    "#8BC34A",
    "#CDDC39",
    "#FFEB3B",
    "#FFC107",
    "#FF9800",
    "#FF5722",
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const context = canvas.getContext("2d")
    if (!context) return

    const W = window.innerWidth
    const H = window.innerHeight
    canvas.width = W
    canvas.height = H

    // Create confetti particles
    const particles: ConfettiParticle[] = []
    for (let i = 0; i < 150; i++) {
      particles.push({
        color: colors[Math.floor(Math.random() * colors.length)],
        x: Math.random() * W,
        y: Math.random() * H - H,
        diameter: Math.random() * 10 + 5,
        tilt: Math.random() * 10 - 10,
        tiltAngleIncrement: Math.random() * 0.07 + 0.05,
        tiltAngle: 0,
        particleSpeed: Math.random() + 1,
        waveAngle: 0,
      })
    }
    confettiRef.current = particles

    // Animation function
    const draw = () => {
      if (!context || !canvas) return

      context.clearRect(0, 0, W, H)

      confettiRef.current.forEach((p, i) => {
        context.beginPath()
        context.lineWidth = p.diameter
        context.strokeStyle = p.color
        const x = p.x + Math.sin(p.tiltAngle) * 12
        const y = p.y + p.tiltAngle + p.particleSpeed
        context.moveTo(x, y)
        context.lineTo(x + p.tilt, y + p.tilt)
        context.stroke()

        // Update particle position
        p.tiltAngle += p.tiltAngleIncrement
        p.y += p.particleSpeed
        p.x += Math.sin(p.waveAngle) * 2
        p.waveAngle += 0.01

        // Reset particle if it's off screen
        if (p.y > H) {
          confettiRef.current[i] = {
            ...p,
            x: Math.random() * W,
            y: -20,
            tiltAngle: 0,
          }
        }
      })

      animationFrameRef.current = requestAnimationFrame(draw)
    }

    draw()

    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
      style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", pointerEvents: "none" }}
    />
  )
}
