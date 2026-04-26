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
      audioRef.current.play()
      setIsPlaying(true)
    }
  }

  return (
    <>
      {/* 🎵 RIGHT SIDE BUTTON */}
      <div className="fixed top-1/2 right-4 -translate-y-1/2 z-50">
        <button
          onClick={toggleMusic}
          className="relative p-4 rounded-full 
          bg-black/30 backdrop-blur-md 
          border border-pink-400/40
          shadow-[0_0_25px_rgba(236,72,153,0.8)]
          hover:shadow-[0_0_45px_rgba(236,72,153,1)]
          transition-all duration-300"
        >
          <div className="absolute inset-0 rounded-full bg-pink-500/20 blur-xl animate-pulse" />

          {isPlaying ? (
            <Pause className="relative z-10 text-pink-300 w-6 h-6" />
          ) : (
            <Music className="relative z-10 text-pink-300 w-6 h-6" />
          )}
        </button>
      </div>

      {/* 🎧 AUDIO */}
      <audio ref={audioRef} loop>
        <source src="/images/NAZAR-KE-TEER-SLOWED-REVERB-Teri-Surat-Dil-Ne-Bhagi-Vikram-S.m4a" type="audio/mp4" />
      </audio>
    </>
  )
}