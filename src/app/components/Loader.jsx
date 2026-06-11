"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Heart, ArrowRight } from "lucide-react"

// Premium Sparkles Data
const sparkles = [
  { top: "10%", left: "15%", size: 14, color: "#f472b6", delay: 0 },
  { top: "8%", left: "80%", size: 18, color: "#a855f7", delay: 0.3 },
  { top: "25%", left: "88%", size: 12, color: "#ffffff", delay: 0.6 },
  { top: "40%", left: "8%", size: 16, color: "#f472b6", delay: 0.2 },
  { top: "45%", left: "90%", size: 20, color: "#a855f7", delay: 0.8 },
  { top: "60%", left: "10%", size: 12, color: "#ffffff", delay: 1.0 },
  { top: "70%", left: "85%", size: 18, color: "#f472b6", delay: 0.4 },
  { top: "85%", left: "20%", size: 14, color: "#a855f7", delay: 1.2 },
  { top: "30%", left: "75%", size: 10, color: "#ffffff", delay: 0.5 },
]

export default function Loader({ onComplete }) {
  const [showButton, setShowButton] = useState(false)
  const [progress, setProgress] = useState(0)

  // 4 Second Progress & Button Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(interval)
          return 100
        }
        return p + 1
      })
    }, 40) // 40ms * 100 = 4000ms (4 seconds)

    const timer = setTimeout(() => {
      setShowButton(true)
    }, 4000)

    return () => {
      clearInterval(interval)
      clearTimeout(timer)
    }
  }, [])

  return (
    <div className="min-h-screen relative w-full flex flex-col items-center overflow-hidden bg-aesthetic font-sans pt-12 pb-8">
      
      {/* Elegant Background Glows */}
      <div className="absolute inset-0 pointer-events-none z-0">
          <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[60%] h-[40%] bg-pink-300/20 blur-[100px] rounded-full" />
          <div className="absolute bottom-[20%] left-[20%] w-[40%] h-[30%] bg-purple-300/15 blur-[80px] rounded-full" />
      </div>

      {/* Animated Sparkles */}
      <div className="absolute inset-0 pointer-events-none z-10">
        {sparkles.map((s, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{ top: s.top, left: s.left }}
            animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.3, 0.8], rotate: [0, 20, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, delay: s.delay, ease: "easeInOut" }}
          >
            <svg width={s.size} height={s.size} viewBox="0 0 24 24" fill={s.color}>
              <path d="M12 2 L13.5 10.5 L22 12 L13.5 13.5 L12 22 L10.5 13.5 L2 12 L10.5 10.5 Z" />
            </svg>
          </motion.div>
        ))}
      </div>

      {/* Premium Card Container */}
      <div className="relative z-20 flex flex-col items-center text-center w-full px-6">
        <motion.div animate={{ scale: [1, 1.2, 0.95, 1] }} transition={{ duration: 1.6, repeat: Infinity }} className="mb-4">
          <Heart className="w-8 h-8 text-[#973b88] fill-[#973b88] drop-shadow-[0_0_10px_rgba(151,59,136,0.6)]" />
        </motion.div>

        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} 
            className="text-4xl md:text-5xl text-[#973b88] leading-tight tracking-tight drop-shadow-md font-bold">
            Preparing
        </motion.h1>
        <motion.h1 initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} 
            className="text-4xl md:text-5xl text-[#973b88] leading-tight tracking-tight drop-shadow-md font-bold">
            Something
        </motion.h1>
        
        {/* Cursive Special Text */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-1">
          <span className="text-5xl md:text-6xl text-[#973b88] tracking-wide drop-shadow-lg font-bold italic">
            Special
          </span>
        </motion.div>

        <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: "40px" }} transition={{ delay: 0.6 }} 
            className="h-[2px] bg-[#973b88]/20 rounded-full mt-6 mb-4" />
      </div>

      {/* Center Section (Photo Blob) */}
      <motion.div 
        className="relative z-20 w-full flex justify-center mt-6 flex-1 max-h-[400px]"
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5, type: "spring" }}
      >
        <motion.div 
            className="neu-image-frame w-[280px] h-[360px] md:w-[340px] md:h-[420px] overflow-hidden"
            animate={{ 
                borderRadius: [
                    "60% 40% 55% 45% / 50% 55% 45% 50%", 
                    "40% 60% 45% 55% / 45% 50% 55% 50%", 
                    "60% 40% 55% 45% / 50% 55% 45% 50%"
                ],
                y: [0, -12, 0]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
        >
          <img
            src="/images/10.jpg"
            alt="Special person"
            className="w-full h-full object-cover object-center"
          />
          {/* Subtle inner shadow overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-pink-100/30 to-transparent pointer-events-none" />
        </motion.div>
      </motion.div>

      {/* Bottom Section (Progress / Button) */}
      <div className="relative z-20 w-full flex flex-col items-center mt-8 px-6 min-h-[80px]">
        <AnimatePresence mode="wait">
          {!showButton ? (
            <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }}
                className="w-full max-w-[260px] flex flex-col items-center"
            >
              {/* Wait text */}
              <div className="flex items-center gap-2 text-[#77537e] text-[13px] font-bold tracking-[0.15em] uppercase mb-4">
                Please wait
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>.</motion.span>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, delay: 0.2, repeat: Infinity }}>.</motion.span>
                <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, delay: 0.4, repeat: Infinity }}>.</motion.span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-[#fff]/50 rounded-full overflow-hidden shadow-inner">
                <div 
                    className="h-full rounded-full bg-gradient-to-r from-pink-400 to-purple-400"
                    style={{ width: `${progress}%`, transition: "width 0.1s linear" }} 
                />
              </div>
            </motion.div>
          ) : (
            <motion.div 
                key="button"
                initial={{ opacity: 0, y: 20, scale: 0.9 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                className="w-full flex justify-center"
            >
              {/* Premium Continue Button */}
              <button 
                onClick={onComplete} 
                className="neu-button text-[#973b88] px-10 py-4 font-bold flex items-center justify-center gap-3 uppercase tracking-[0.15em] text-[14px]"
              >
                <span>Continue</span>
                <ArrowRight size={18} strokeWidth={3} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  )
}
