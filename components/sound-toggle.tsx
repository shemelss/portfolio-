"use client"

import { Volume2, VolumeX } from "lucide-react"
import { useSoundEffects } from "@/hooks/use-sound-effects"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function SoundToggle() {
  const { muted, toggleMute, soundsLoaded } = useSoundEffects()

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={toggleMute}
            disabled={!soundsLoaded}
            aria-label={muted ? "Unmute sound effects" : "Mute sound effects"}
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{muted ? "Unmute sound effects" : "Mute sound effects"}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
