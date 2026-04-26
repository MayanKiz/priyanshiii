"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ArrowRight, ArrowLeft, Star, Sparkles, Heart } from "lucide-react"
import confetti from "canvas-confetti"

const wishes = [
    {
        emoji: "🌸",
        title: "You Are Loved",
        text: "More than words can say, more than stars in the sky — you are surrounded by love today and always. Never forget how much you mean to the people lucky enough to have you.",
        color: "from-pink-500 to-rose-500",
        bg: "from-pink-950/60 to-rose-950/60",
        border: "border-pink-500/40",
    },
    {
        emoji: "✨",
        title: "You Are Magic",
        text: "The way you smile, the way you care, the way you show up — it's all pure magic. The world is genuinely better because you exist in it, Madam Jii.",
        color: "from-purple-500 to-violet-500",
        bg: "from-purple-950/60 to-violet-950/60",
        border: "border-purple-500/40",
    },
    {
        emoji: "🌟",
        title: "Your Year Ahead",
        text: "May this year bring you everything your heart has been quietly wishing for. New adventures, deep joy, unexpected blessings, and every dream arriving right on time.",
        color: "from-amber-500 to-yellow-500",
        bg: "from-amber-950/60 to-yellow-950/60",
        border: "border-amber-500/40",
    },
    {
        emoji: "💫",
        title: "Keep Shining",
        text: "You have this rare gift of making everyone around you feel seen and special. Keep being exactly who you are — the world needs more of your light.",
        color: "from-cyan-500 to-blue-500",
        bg: "from-cyan-950/60 to-blue-950/60",
        border: "border-cyan-500/40",
    },
    {
        emoji: "🎀",
        title: "Happy Birthday!",
        text: "Here's to cake, laughter, and celebrating YOU! You deserve every single good thing coming your way. Happy Birthday, beautiful soul — this one's all for you! 🎂🥳",
        color: "from-pink-500 via-purple-500 to-indigo-500",
        bg: "from-pink-950/60 via-purple-950/60 to-indigo-950/60",
        border: "border-purple-400/40",
    },
]

export default function Wishes({ onNext, onBack }) {
    const [current, setCurrent] = useState(0)
    const [direction, setDirection] = useState(1)

    const goNext = () => {
        if (current < wishes.length - 1) {
            setDirection(1)
            setCurrent(c => c + 1)
            if (current === wishes.length - 2) {
                confetti({ particleCount: 60, spread: 80, origin: { y: 0.5 }, colors: ["#f9a8d4", "#c084fc", "#fbbf24"] })
            }
        }
    }

    const goPrev = () => {
        if (current > 0) {
            setDirection(-1)
            setCurrent(c => c - 1)
        }
    }

    const w = wishes[current]

    return (
        <motion.div
            className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
        >
            {/* Background orbs */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute w-96 h-96 rounded-full blur-3xl"
                    style={{ background: "radial-gradient(circle, rgba(236,72,153,0.15), transparent)", top: "10%", left: "20%" }}
                    animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.8, 0.4] }}
                    transition={{ duration: 6, repeat: Infinity }}
                />
                <motion.div
                    className="absolute w-80 h-80 rounded-full blur-3xl"
                    style={{ background: "radial-gradient(circle, rgba(139,92,246,0.15), transparent)", bottom: "15%", right: "15%" }}
                    animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.7, 0.3] }}
                    transition={{ duration: 7, repeat: Infinity, delay: 1 }}
                />
            </div>

            {/* Header */}
            <motion.div
                className="text-center mb-8 relative z-10"
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                <motion.div
                    className="text-5xl mb-3 select-none"
                    animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    🎁
                </motion.div>
                <h1
                    className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 mb-2"
                    style={{ fontFamily: "'Nunito', sans-serif", filter: "drop-shadow(0 0 20px rgba(168,85,247,0.4))" }}
                >
                    Birthday Wishes
                </h1>
                <p className="text-purple-300 text-base" style={{ fontFamily: "'Nunito', sans-serif" }}>
                    Just for you, Madam Jii 💜
                </p>
            </motion.div>

            {/* Card */}
            <div className="relative z-10 w-full max-w-sm mx-auto">
                <AnimatePresence mode="wait" custom={direction}>
                    <motion.div
                        key={current}
                        custom={direction}
                        initial={{ x: direction * 300, opacity: 0, scale: 0.9 }}
                        animate={{ x: 0, opacity: 1, scale: 1 }}
                        exit={{ x: direction * -300, opacity: 0, scale: 0.9 }}
                        transition={{ type: "spring", stiffness: 260, damping: 22 }}
                        className={`rounded-3xl border-2 ${w.border} p-7 shadow-2xl relative overflow-hidden`}
                        style={{ background: "rgba(15,5,30,0.85)", backdropFilter: "blur(16px)" }}
                    >
                        {/* Gradient accent top */}
                        <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${w.color} rounded-t-3xl`} />

                        {/* Emoji */}
                        <motion.div
                            className="text-6xl text-center mb-4 select-none"
                            animate={{ scale: [1, 1.12, 1], rotate: [0, 5, -5, 0] }}
                            transition={{ duration: 3, repeat: Infinity }}
                        >
                            {w.emoji}
                        </motion.div>

                        {/* Title */}
                        <h2
                            className={`text-2xl font-bold text-center mb-4 text-transparent bg-clip-text bg-gradient-to-r ${w.color}`}
                            style={{ fontFamily: "'Nunito', sans-serif" }}
                        >
                            {w.title}
                        </h2>

                        {/* Text */}
                        <p
                            className="text-gray-300 text-center leading-relaxed text-base"
                            style={{ fontFamily: "'Nunito', sans-serif", lineHeight: "1.85" }}
                        >
                            {w.text}
                        </p>

                        {/* Decorative corners */}
                        <div className="absolute top-4 right-4 opacity-40"><Sparkles className="w-4 h-4 text-purple-300" /></div>
                        <div className="absolute bottom-4 left-4 opacity-40"><Heart className="w-4 h-4 text-pink-400 fill-current" /></div>
                    </motion.div>
                </AnimatePresence>

                {/* Dot indicators */}
                <div className="flex justify-center gap-2 mt-5">
                    {wishes.map((_, i) => (
                        <motion.button
                            key={i}
                            onClick={() => { setDirection(i > current ? 1 : -1); setCurrent(i) }}
                            className="rounded-full transition-all"
                            animate={{
                                width: i === current ? 24 : 8,
                                background: i === current ? "#ec4899" : "rgba(255,255,255,0.2)",
                            }}
                            style={{ height: 8 }}
                        />
                    ))}
                </div>

                {/* Nav buttons */}
                <div className="flex justify-between items-center mt-5 gap-3">
                    <button
                        onClick={goPrev}
                        disabled={current === 0}
                        className="flex items-center gap-2 px-4 py-2 rounded-full border border-pink-500/40 text-pink-300 text-sm font-medium disabled:opacity-30 transition-all hover:bg-pink-500/10"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                    >
                        <ArrowLeft className="w-4 h-4" /> Prev
                    </button>

                    {current < wishes.length - 1 ? (
                        <button
                            onClick={goNext}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 text-white text-sm font-semibold shadow-lg hover:scale-105 transition-all"
                            style={{ fontFamily: "'Nunito', sans-serif" }}
                        >
                            Next <ArrowRight className="w-4 h-4" />
                        </button>
                    ) : (
                        <button
                            onClick={onNext}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-semibold shadow-lg hover:scale-105 transition-all"
                            style={{ fontFamily: "'Nunito', sans-serif" }}
                        >
                            Leave a Message <ArrowRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
