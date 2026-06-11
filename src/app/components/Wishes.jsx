"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, Sparkles, MousePointerClick, Hand } from "lucide-react"

// Vocabulary updated from "Wishes" to "Thoughts/Truths"
const thoughts = [
  {
    emoji: "🌸",
    title: "A Special Day",
    text: "Today is all about celebrating the person you are and the journey you've had so far. Wishing you a day filled with happiness, smiles, and good memories."
  },
  {
    emoji: "✨",
    title: "Stay Amazing",
    text: "Your confidence, determination, and unique personality make you stand out in your own way. Keep moving forward and achieving great things."
  },
  {
    emoji: "🌟",
    title: "New Beginnings",
    text: "May this new chapter bring exciting opportunities, meaningful experiences, and countless moments worth remembering."
  },
  {
    emoji: "💫",
    title: "Keep Growing",
    text: "Every year adds new lessons, new memories, and new achievements. Keep believing in yourself and enjoying the journey ahead."
  },
  {
    emoji: "🎂",
    title: "Happy Birthday!",
    text: "Wishing you a wonderful birthday filled with joy, laughter, and everything that makes you smile. Have an amazing year ahead, Chhota Don! 🎉"
  }
]
export default function LittleTruths({ onNext, onBack }) {
    const [current, setCurrent] = useState(0)
    const [direction, setDirection] = useState(1)
    const [isFlipped, setIsFlipped] = useState(false)
    const [isDragging, setIsDragging] = useState(false) // Swipe ke time flip rokne ke liye

    // Swipe logic
    const handleDragEnd = (event, info) => {
        setTimeout(() => setIsDragging(false), 150) // Drag ke baad thoda delay
        const threshold = 50 // Swipe sensitivity
        
        if (info.offset.x < -threshold && current < thoughts.length - 1) {
            // Swiped left (Next card)
            setIsFlipped(false)
            setDirection(1)
            setCurrent(c => c + 1)
        } else if (info.offset.x > threshold && current > 0) {
            // Swiped right (Prev card)
            setIsFlipped(false)
            setDirection(-1)
            setCurrent(c => c - 1)
        }
    }

    const t = thoughts[current]

    // Premium styles with enhanced visible edges
    const cardBg = "neu-card"
    const btnPrimary = "neu-button text-[#973b88] font-bold flex items-center justify-center gap-2 px-6 py-4 uppercase tracking-[0.12em] text-[13px] w-full"

    return (
        <motion.div
            className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-aesthetic"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
        >
            {/* Elegant Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-pink-300/20 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-purple-300/20 blur-[120px] rounded-full" />
            </div>

            {/* Header & Blinking Instructions */}
            <motion.div className="text-center mb-10 relative z-10" initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <h1 className="text-3xl md:text-4xl font-bold text-[#973b88] mb-4 tracking-widest uppercase drop-shadow-sm">
                    Little Truths
                </h1>
                
                {/* Blinking Animation for Instructions */}
                <motion.div 
                    className="flex flex-col items-center justify-center gap-1 text-[#77537e] text-[11px] font-bold tracking-[0.15em] uppercase"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                >
                    <p className="flex items-center gap-1"><Hand size={12} className="-rotate-45" /> Swipe Left/Right to change</p>
                    <p className="flex items-center gap-1"><MousePointerClick size={12} /> Tap card to reveal</p>
                </motion.div>
            </motion.div>

            {/* 3D Flip Card with Drag (Swipe) */}
            <div className="relative z-10 w-full max-w-sm mx-auto [perspective:1000px]">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={current}
                        custom={direction}
                        initial={{ x: direction * 150, opacity: 0, rotateY: -10 * direction }}
                        animate={{ x: 0, opacity: 1, rotateY: 0 }}
                        exit={{ x: direction * -150, opacity: 0, rotateY: 10 * direction }}
                        transition={{ type: "spring", stiffness: 200, damping: 20 }}
                        className="w-full h-[400px] cursor-grab active:cursor-grabbing"
                        
                        // Framer Motion Drag setup
                        drag="x"
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.6}
                        onDragStart={() => setIsDragging(true)}
                        onDragEnd={handleDragEnd}
                        
                        // Tap (Flip) Logic
                        onClick={() => {
                            if (!isDragging) setIsFlipped(!isFlipped)
                        }}
                    >
                        <motion.div
                            className="w-full h-full relative [transform-style:preserve-3d]"
                            animate={{ rotateY: isFlipped ? 180 : 0 }}
                            transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                        >
                            {/* FRONT OF CARD (Hidden State) - ADDED BORDERS FOR EDGES */}
                            <div className={`absolute w-full h-full rounded-3xl ${cardBg} border-[3px] border-white/60 p-8 flex flex-col items-center justify-center [backface-visibility:hidden]`}>
                                <div className="neu-image-frame w-20 h-20 flex items-center justify-center mb-6">
                                    <Sparkles className="w-8 h-8 text-[#973b88]" />
                                </div>
                                <h3 className="text-xl font-bold text-[#973b88] uppercase tracking-widest mb-2">Truth {current + 1}</h3>
                                <p className="text-[#77537e] text-[12px] font-bold flex items-center gap-2">
                                    <MousePointerClick size={14} /> Tap to open
                                </p>
                            </div>

                            {/* BACK OF CARD (Revealed State) - ADDED BORDERS FOR EDGES */}
                            <div className={`absolute w-full h-full rounded-3xl bg-white shadow-[inset_4px_4px_10px_rgba(151,59,136,0.1),0_10px_30px_rgba(151,59,136,0.15)] border-[3px] border-pink-100 p-8 flex flex-col items-center justify-center text-center [backface-visibility:hidden]`} style={{ transform: 'rotateY(180deg)' }}>
                                <motion.div className="text-5xl mb-6" animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                                    {t.emoji}
                                </motion.div>
                                <h2 className="text-xl font-black text-[#973b88] mb-4 uppercase tracking-widest">
                                    {t.title}
                                </h2>
                                <p className="text-[#77537e] leading-relaxed text-[13px] font-bold">
                                    {t.text}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                </AnimatePresence>

                {/* Dot indicators */}
                <div className="flex justify-center gap-3 mt-10">
                    {thoughts.map((_, i) => (
                        <div
                            key={i}
                            className={`transition-all duration-300 rounded-full h-2 ${i === current ? 'w-8 bg-[#973b88] shadow-[0_0_10px_rgba(151,59,136,0.5)]' : 'w-2 bg-[#eecfeb]'}`}
                        />
                    ))}
                </div>

                {/* Final Continue Button (Shows only on the last card) */}
                <div className="mt-8 h-16 relative">
                    <AnimatePresence>
                        {current === thoughts.length - 1 && (
                            <motion.button
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                                onClick={onNext}
                                className={btnPrimary}
                            >
                                Next Surprise <ArrowRight size={18} strokeWidth={3} />
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    )
}
