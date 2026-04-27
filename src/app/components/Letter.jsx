"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Mail, Heart, Sparkles, ArrowRight } from "lucide-react"
import confetti from "canvas-confetti"

export default function Letter({ onNext }) {
    const [isOpen, setIsOpen] = useState(false)
    const [showText, setShowText] = useState(false)
    const [currentText, setCurrentText] = useState("")
    const [showCursor, setShowCursor] = useState(true)
    const [done, setDone] = useState(false)
    const scrollRef = useRef(null)

    const letterText = `My Dearest Madam Jii,

Happy Birthday to the most amazing person!! 🎂✨ Honestly, on this super special day, a real life angel was born... and her name is Priyanshiii! 🩵

I really want to thank your parents for bringing you into this world, because now you’re my friend and I feel so, so blessed. I’m incredibly lucky to have you in my life buddyyy..... Today isn't just about you getting a year older—it’s a celebration of all the joy, non-stop laughter, and beautiful memories you bring to everyone around youuu.... 

You have this literal magic power to light up any room and make people smile even when things feel dark. I don’t know about anyone else, but for me, you are everything and I’m just telling you the truthhh. Your heart is pure gold and your energy is just so infectious! Also... can we talk about your voice?? It is literally supercafigtidiliciuoss! 🎶✨

I hope you realize how rare you are and how much everyone around you appreciates you. Thank you for being the wonderful, amazing, and absolutely fantastic person you are. The world is so much brighter just because you’re in ittt!

Happy Birthday to a truly beautiful soul! 🥳💕
With all my love and the warmest wishes everrr,
Forever Yoursss 💖✨`

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

    return (
        <motion.div
            className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8 }}
        >
            {/* Nunito font */}
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');`}</style>

            {/* Floating particles */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {["💌", "✨", "🌸", "💕", "✨️", "🌺"].map((emoji, i) => (
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
                                        className="absolute bottom-3 left-1/2 transform -translate-x-1/2 text-pink-700 text-base font-semibold whitespace-nowrap"
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
                                className="w-full max-w-2xl rounded-2xl shadow-2xl border-2 border-pink-300 p-8 relative flex flex-col"
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

                                <div
                                    ref={scrollRef}
                                    className="min-h-72 max-h-72 overflow-y-auto text-gray-700 leading-relaxed relative z-10"
                                    style={{ scrollBehavior: "smooth" }}
                                >
                                    {showText && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-3 mr-2">
                                            <div
                                                className="whitespace-pre-wrap pb-4"
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

                                {/* YAHAN HAI TERA SOFT BUTTON JO KHATAM HONE KE BAAD AAYEGA */}
                                {done && onNext && (
                                    <motion.div
                                        className="flex items-center justify-center mt-4 relative z-20"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.5, ease: "easeOut" }}
                                    >
                                        <motion.button
                                            onClick={onNext}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className="group flex items-center gap-3 bg-white/60 backdrop-blur-md px-8 py-3 rounded-full border border-pink-200 shadow-[0_8px_30px_rgb(236,72,153,0.15)] transition-all duration-300"
                                        >
                                            <span className="text-pink-600 font-bold text-lg" style={{ fontFamily: "'Nunito', sans-serif" }}>
                                                See what's next...
                                            </span>
                                            <div className="bg-gradient-to-r from-pink-400 to-purple-400 p-2 rounded-full group-hover:translate-x-1 transition-transform">
                                                <ArrowRight className="w-5 h-5 text-white" />
                                            </div>
                                        </motion.button>
                                    </motion.div>
                                )}

                                <div className="absolute top-4 left-4 pointer-events-none"><Sparkles className="w-6 h-6 text-yellow-500" /></div>
                                <div className="absolute top-4 right-4 pointer-events-none"><Heart className="w-6 h-6 text-rose-500 fill-current" /></div>
                                <div className="absolute bottom-4 left-4 pointer-events-none"><Heart className="w-6 h-6 text-pink-500 fill-current" /></div>
                                <div className="absolute bottom-4 right-4 pointer-events-none"><Sparkles className="w-6 h-6 text-purple-500" /></div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </motion.div>
    )
}
