"use client"

import { useRef } from "react";

export default function MusicPlayer() {
  const audioRef = useRef(null);
  const hasPlayed = useRef(false);

  const handleClick = () => {
    if (!hasPlayed.current && audioRef.current) {
      audioRef.current.play();
      hasPlayed.current = true;
    }
  };

  return (
    <div onClick={handleClick}>
      <audio ref={audioRef} loop>
        <source 
          src="/images/NAZAR-KE-TEER-SLOWED-REVERB-Teri-Surat-Dil-Ne-Bhagi-Vikram-S.m4a" 
          type="audio/mp4" 
        />
      </audio>
    </div>
  );
}