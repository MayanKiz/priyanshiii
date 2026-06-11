"use client"

import { motion } from "framer-motion"
import { Gift, Sparkles, Heart, ArrowRight } from "lucide-react"
import confetti from "canvas-confetti"
import { useEffect } from "react"

export default function Celebration({ onNext }) {

    // Original Pinkish Accents (from your sample)
    const primaryColor = "#973b88"; // Bold Purple/Pink for titles
    const secondaryColor = "#f472b6"; // Accent Pink for glows/confetti
    const textColor = "#77537e"; // Text Gray-Purple

    // Confetti Colors matching the original theme
    const confettiColors = ["#f472b6", "#a855f7", "#fcd34d", "#ffffff"];

    useEffect(() => {
        const duration = 2500
        const end = Date.now() + duration

        const frame = () => {
            const randomColor = () => confettiColors[Math.floor(Math.random() * confettiColors.length)]

            for (let i = 0; i < 2; i++) {
                confetti({
                    particleCount: 2,
                    angle: i === 0 ? 60 : 120,
                    spread: 60,
                    origin: { x: i === 0 ? -0.1 : 1.1 },
                    colors: [randomColor()],
                    zIndex: 100
                })
            }

            if (Date.now() < end) {
                requestAnimationFrame(frame)
            }
        }

        frame()
    }, [])

    return (
        <motion.div
            className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#fdf7ff] font-sans relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.8 }}
        >
            {/* Elegant Original Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-pink-100/30 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-purple-100/30 blur-[120px] rounded-full" />
                <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-rose-100/40 blur-[100px] rounded-full" />
            </div>

            <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center text-center">

                {/* ORIGINAL PINKISH NEU-CARD Container */}
                <motion.div
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-[#fdf7ff] rounded-[32px] shadow-[10px_10px_20px_rgba(151,59,136,0.1),-10px_-10px_20px_rgba(255,255,255,1)] p-10 md:p-12 w-full max-w-[460px]"
                >
                    {/* Gift Icon Frame (Neu-Image-Frame style) */}
                    <motion.div
                        animate={{
                            rotate: [0, 8, -8, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="w-28 h-28 mx-auto mb-8 bg-[#fdf7ff] rounded-[24px] shadow-[inset_6px_6px_12px_rgba(151,59,136,0.1),inset_-6px_-6px_12px_rgba(255,255,255,1)] p-4 flex items-center justify-center"
                    >
                        <Gift className="w-14 h-14" style={{ color: primaryColor }} strokeWidth={1.5} />
                    </motion.div>

                    {/* Original Celebration Text Styles */}
                    <motion.h1
                        className="text-3xl md:text-4xl font-bold mb-4 drop-shadow"
                        style={{ color: primaryColor, filter: `drop-shadow(0 0 20px rgba(151,59,136,0.4))` }}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        Time to Celebrate
                    </motion.h1>

                    <motion.p
                        className="text-[14px] font-medium tracking-[0.15em] uppercase mb-8 flex items-center justify-center gap-2"
                        style={{ color: textColor }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Sparkles className="w-4 h-4" style={{ color: secondaryColor }} />
                        The countdown is over
                        <Sparkles className="w-4 h-4" style={{ color: secondaryColor }} />
                    </motion.p>

                    {/* Final Button (Neu-Button Style) */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.8, type: "spring", stiffness: 200 }}
                        className="w-full"
                    >
                        <button
                            onClick={onNext}
                            className="w-full bg-[#fdf7ff] text-[14px] px-8 py-5 font-bold rounded-[20px] flex items-center justify-center gap-3 uppercase tracking-[0.12em] transition-all
                                       shadow-[6px_6px_12px_rgba(151,59,136,0.1),-6px_-6px_12px_rgba(255,255,255,1)]
                                       hover:shadow-[4px_4px_8px_rgba(151,59,136,0.1),-4px_-4px_8px_rgba(255,255,255,1)]
                                       active:shadow-[inset_4px_4px_8px_rgba(151,59,136,0.1),inset_-4px_-4px_8px_rgba(255,255,255,1)]"
                             style={{ color: primaryColor }}
                        >
                            Let's Celebrate <Heart className="w-5 h-5 ml-1" style={{ color: primaryColor, fill: `${primaryColor}4D` }} /> <ArrowRight size={16} />
                        </button>
                    </motion.div>
                </motion.div>

                <motion.p
                    className="mt-8 text-[11px] font-medium uppercase tracking-[0.2em]"
                    style={{ color: `${textColor}99` }} // Slightly faded textColor
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                >
                    Click to start the magic
                </motion.p>
            </div>
        </motion.div>
    )
}
