"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Mail, Heart, Sparkles, RotateCcw, ArrowRight } from "lucide-react"
import confetti from "canvas-confetti"

export default function Letter({ onNext }) {
    const [isOpen, setIsOpen] = useState(false)
    const [showText, setShowText] = useState(false)
    const [currentText, setCurrentText] = useState("")
    const [showCursor, setShowCursor] = useState(true)
    const [done, setDone] = useState(false)
    const scrollRef = useRef(null)

    const letterText = `My Dearest Madam Jii,

On this very special day, I want you to know how incredibly grateful I am to have you in my life. Your birthday isn't just a celebration of another year — it's a celebration of all the joy, laughter, and beautiful memories you bring to this world.

You have this amazing ability to light up any room you enter, to make people smile even on their darkest days, and to spread kindness wherever you go. Your heart is pure gold, and your spirit is absolutely infectious.

You are someone who makes the world feel softer, warmer, and more magical just by being in it. I hope you know how rare that is — and how deeply it is felt by everyone around you.

Thank you for being the wonderful, amazing, absolutely fantastic person that you are. The world is so much brighter because you're in it.

Happy Birthday, beautiful soul! 🎂✨

With all my love and warmest wishes,
Forever Yours 💕`

    // Auto-scroll as text appears
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [currentText])

    useEffect(() => {
        if (showText) {
            let index = 0
            const timer = setInterval(() => {
                if (index < letterText.length) {
                    setCurrentText(letterText.slice(0, index + 1))
                    index++
                } else {
                    clearInterval(timer)
                    setShowCursor(false)
                    setDone(true)
                    confetti({
                        particleCount: 80,
                        spread: 90,
                        origin: { y: 0.5 },
                        colors: ["#ff69b4", "#ff1493", "#9370db", "#8a2be2", "#ffd700"],
                    })
                    setTimeout(() => {
                        confetti({ particleCount: 40, spread: 60, origin: { x: 0.1, y: 0.6 }, colors: ["#ff69b4", "#ffd700"] })
                        confetti({ particleCount: 40, spread: 60, origin: { x: 0.9, y: 0.6 }, colors: ["#9370db", "#ff1493"] })
                    }, 400)
                }
            }, 28)
            return () => clearInterval(timer)
        }
    }, [showText])

    const handleOpenLetter = () => {
        setIsOpen(true)
        setTimeout(() => setShowText(true), 800)
    }

    const handleReset = () => {
        setIsOpen(false)
        setShowText(false)
        setCurrentText("")
        setShowCursor(true)
        setDone(false)
    }

    return (
        <motion.div
            className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {["💌", "✨", "🌸", "💕", "⭐", "🌺"].map((emoji, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-lg select-none"
                        style={{ left: `${(i * 17 + 5) % 100}%`, top: `${(i * 23 + 10) % 80}%` }}
                        animate={{ y: [0, -20, 0], opacity: [0.2, 0.6, 0.2], rotate: [0, 10, -10, 0] }}
                        transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.5 }}
                    >
                        {emoji}
                    </motion.div>
                ))}
            </div>

            <div className="max-w-4xl w-full relative z-10">
                <motion.div
                    className="text-center mb-8"
                    initial={{ y: -50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h1
                        className="text-4xl md:text-6xl py-1 md:py-2 font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 mb-4"
                        style={{ fontFamily: "'Nunito', sans-serif", filter: "drop-shadow(0 0 20px rgba(168,85,247,0.4))" }}
                    >
                        A Special Letter
                    </h1>
                    <motion.p
                        className="text-lg text-purple-300"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        Just for you, on your special day 💌
                    </motion.p>
                </motion.div>

                <motion.div
                    className="relative w-full h-full flex justify-center"
                    initial={{ scale: 0, rotate: -10 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                >
                    <AnimatePresence mode="wait">
                        {!isOpen ? (
                            <motion.div
                                key="envelope"
                                className="relative cursor-pointer"
                                whileHover={{ scale: 1.05, rotate: 2 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleOpenLetter}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ rotateX: -90, opacity: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                {/* Envelope glow */}
                                <motion.div
                                    className="absolute inset-0 rounded-2xl blur-xl"
                                    style={{ background: "linear-gradient(135deg, #f9a8d4, #c084fc)" }}
                                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                />
                                <div className="w-80 h-52 bg-gradient-to-br from-pink-200 to-purple-200 rounded-2xl shadow-2xl border-2 border-pink-300 relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-full h-26 bg-gradient-to-br from-pink-300 to-purple-300 transform origin-top" />
                                    <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-br from-pink-100 to-purple-100" />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <motion.div
                                            animate={{ scale: [1, 1.08, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <Mail className="w-16 h-16 text-pink-500" />
                                        </motion.div>
                                    </div>
                                    <div className="absolute top-4 right-4">
                                        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                                            <Heart className="w-6 h-6 text-red-500 fill-current" />
                                        </motion.div>
                                    </div>
                                    <div className="absolute bottom-4 left-4">
                                        <Sparkles className="w-6 h-6 text-yellow-500" />
                                    </div>
                                    <motion.div
                                        className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-pink-700 text-base font-semibold"
                                        style={{ fontFamily: "'Nunito', sans-serif" }}
                                        animate={{ opacity: [0.5, 1, 0.5] }}
                                        transition={{ duration: 1.5, repeat: Infinity }}
                                    >
                                        Click to open
                                    </motion.div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="letter"
                                className="w-full max-w-2xl rounded-2xl shadow-2xl border-2 border-pink-300 p-8 relative"
                                initial={{ rotateX: -90, opacity: 0 }}
                                animate={{ rotateX: 0, opacity: 1 }}
                                exit={{ opacity: 0, scale: 0.2 }}
                                transition={{ duration: 0.8, type: "spring" }}
                                style={{
                                    background: "linear-gradient(135deg, #fce7f3 0%, #fae8ff 25%, #e0e7ff 50%, #fdf2f8 75%, #fce7f3 100%)",
                                }}
                            >
                                <div className="text-center mb-6">
                                    <motion.div
                                        className="inline-block"
                                        animate={{ rotate: [0, 5, -5, 0] }}
                                        transition={{ duration: 3, repeat: Infinity }}
                                    >
                                        <Heart className="w-12 h-12 text-red-500 fill-current mx-auto mb-3" />
                                    </motion.div>
                                </div>

                                {/* Auto-scroll text area */}
                                <div
                                    ref={scrollRef}
                                    className="min-h-72 max-h-72 overflow-y-auto text-gray-700 leading-relaxed scroll-smooth"
                                    style={{ scrollBehavior: "smooth" }}
                                >
                                    {showText && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3 mr-2">
                                            <div
                                                className="whitespace-pre-wrap"
                                                style={{ fontFamily: "'Nunito', sans-serif", fontSize: "15px", lineHeight: "1.9" }}
                                            >
                                                {currentText}
                                                {showCursor && (
                                                    <motion.span
                                                        className="inline-block w-0.5 h-4 bg-purple-600 ml-1 align-middle"
                                                        animate={{ opacity: [0, 1, 0] }}
                                                        transition={{ duration: 0.8, repeat: Infinity }}
                                                    />
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </div>

                                {/* Buttons after done */}
                                {done && (
                                    <motion.div
                                        className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        <button
                                            onClick={handleReset}
                                            className="inline-flex items-center gap-2 bg-white/60 text-pink-600 font-medium border border-pink-400 px-5 py-2 rounded-full hover:bg-pink-100 transition-all"
                                            style={{ fontFamily: "'Nunito', sans-serif" }}
                                        >
                                            <RotateCcw className="w-4 h-4" />
                                            Read Again
                                        </button>
                                        {onNext && (
                                            <button
                                                onClick={onNext}
                                                className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold px-6 py-2 rounded-full shadow-lg hover:scale-105 transition-all"
                                                style={{ fontFamily: "'Nunito', sans-serif" }}
                                            >
                                                More Surprises
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        )}
                                    </motion.div>
                                )}

                                <div className="absolute top-4 left-4"><Sparkles className="w-6 h-6 text-yellow-500" /></div>
                                <div className="absolute top-4 right-4"><Heart className="w-6 h-6 text-rose-500 fill-current" /></div>
                                <div className="absolute bottom-4 left-4"><Heart className="w-6 h-6 text-pink-500 fill-current" /></div>
                                <div className="absolute bottom-4 right-4"><Sparkles className="w-6 h-6 text-purple-500" /></div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </motion.div>
    )
}
