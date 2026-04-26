"use client"

import { useRef, useState } from "react"
import { Music, Pause } from "lucide-react"

export default function MusicPlayer() {
  const audioRef = useRef(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const toggleMusic = () => {
    if (!audioRef.current) return

    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().catch(() => {})
      setIsPlaying(true)
    }
  }

  return (
    <>
      {/* 🎵 TOP RIGHT CAPSULE BUTTON */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={toggleMusic}
          className="flex items-center gap-2 px-4 py-2 rounded-full
          bg-black/30 backdrop-blur-md
          border border-pink-400/40
          text-pink-300 text-sm font-medium
          shadow-[0_0_15px_rgba(236,72,153,0.6)]
          hover:shadow-[0_0_25px_rgba(236,72,153,1)]
          hover:scale-105
          transition-all duration-300"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" />
              Pause
            </>
          ) : (
            <>
              <Music className="w-4 h-4" />
              Play Music
            </>
          )}
        </button>
      </div>

      {/* 🎧 AUDIO */}
      <audio ref={audioRef} loop preload="auto">
        <source src="/images/song.mp3" type="audio/mpeg" />
      </audio>
    </>
  )
}