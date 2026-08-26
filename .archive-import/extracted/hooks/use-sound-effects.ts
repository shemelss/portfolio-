"use client"

import { useState, useEffect, useCallback } from "react"

// Define the types of sounds we'll use
type SoundType = "cardDeal" | "cardFlip" | "win" | "bigWin" | "lose" | "bet" | "buttonClick" | "firstWin"

// Create a mapping of sound types to their file paths
const soundFiles: Record<SoundType, string> = {
  cardDeal: "/sounds/card-deal.mp3",
  cardFlip: "/sounds/card-flip.mp3",
  win: "/sounds/win.mp3",
  bigWin: "/sounds/big-win.mp3",
  lose: "/sounds/lose.mp3",
  bet: "/sounds/chip.mp3",
  buttonClick: "/sounds/button-click.mp3",
  firstWin: "/sounds/first-win.mp3",
}

export function useSoundEffects() {
  const [muted, setMuted] = useState(false)
  const [soundsLoaded, setSoundsLoaded] = useState(false)
  const [audioElements, setAudioElements] = useState<Record<SoundType, HTMLAudioElement | null>>({
    cardDeal: null,
    cardFlip: null,
    win: null,
    bigWin: null,
    lose: null,
    bet: null,
    buttonClick: null,
    firstWin: null,
  })
  const [soundsAvailable, setSoundsAvailable] = useState<Record<SoundType, boolean>>({
    cardDeal: false,
    cardFlip: false,
    win: false,
    bigWin: false,
    lose: false,
    bet: false,
    buttonClick: false,
    firstWin: false,
  })

  // Initialize audio elements on component mount
  useEffect(() => {
    // Only run in browser environment
    if (typeof window === "undefined") return

    // Create audio elements for each sound
    const elements: Record<SoundType, HTMLAudioElement> = {} as Record<SoundType, HTMLAudioElement>
    const available: Record<SoundType, boolean> = {} as Record<SoundType, boolean>

    // Function to check if a sound file exists
    const checkSoundAvailability = async (path: string): Promise<boolean> => {
      try {
        const response = await fetch(path, { method: "HEAD" })
        return response.ok
      } catch (error) {
        console.warn(`Sound file not available: ${path}`)
        return false
      }
    }

    // Load all sounds and check their availability
    const loadSounds = async () => {
      for (const [key, path] of Object.entries(soundFiles)) {
        const soundType = key as SoundType
        const isAvailable = await checkSoundAvailability(path)
        available[soundType] = isAvailable

        // Create audio element regardless of availability
        const audio = new Audio()

        if (isAvailable) {
          audio.src = path
          audio.preload = "auto"

          // Add error handling
          audio.onerror = () => {
            console.warn(`Error loading sound: ${path}`)
            available[soundType] = false
          }
        }

        elements[soundType] = audio
      }

      setAudioElements(elements)
      setSoundsAvailable(available)
      setSoundsLoaded(true)
    }

    loadSounds()

    // Clean up audio elements on unmount
    return () => {
      Object.values(elements).forEach((audio) => {
        if (audio) {
          audio.pause()
          audio.src = ""
        }
      })
    }
  }, [])

  // Function to play a sound
  const playSound = useCallback(
    (sound: SoundType) => {
      if (muted || !soundsLoaded) return

      // Check if sound is available
      if (!soundsAvailable[sound]) {
        console.log(`Sound ${sound} is not available, skipping playback`)
        return
      }

      const audio = audioElements[sound]
      if (!audio) return

      // Reset the audio to the beginning if it's already playing
      audio.currentTime = 0

      // Play the sound with error handling
      audio.play().catch((error) => {
        console.warn(`Error playing sound ${sound}:`, error)
        // Mark sound as unavailable if there's a playback error
        setSoundsAvailable((prev) => ({
          ...prev,
          [sound]: false,
        }))
      })
    },
    [muted, soundsLoaded, audioElements, soundsAvailable],
  )

  // Toggle mute state
  const toggleMute = useCallback(() => {
    setMuted((prev) => !prev)
  }, [])

  return {
    playSound,
    muted,
    toggleMute,
    soundsLoaded,
    soundsAvailable,
  }
}
