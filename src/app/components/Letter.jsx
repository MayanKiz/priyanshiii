"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mail, Heart, Sparkles, ArrowRight, ChevronDown } from "lucide-react"
import confetti from "canvas-confetti"

const fullNote = `Tum mere liye sirf ek dost nahi ho.

Tum woh insaan ho jise main hamesha safe, khush aur muskurata dekhna chahta hoon. Tumhari life mein thoda sa sukoon, thodi si warmth aur bahut saari khushiyan rahein — bas yahi wish hai.

Bina kisi shor, bina kisi credit ke, main hamesha tumhari care karunga. Tumhe kuch prove karne ki zaroorat nahi hai — tum jaise ho, waise hi kaafi ho.

Tumhari smile sach mein favourite cheezon mein se ek hai. Happy Birthday, Priyanshi. 💕`

export default function Letter({ onNext }) {
    const [isOpen, setIsOpen] = useState(false)
    const [showText, setShowText] = useState(false)
    const [currentText, setCurrentText] = useState("")
    const [showCursor, setShowCursor] = useState(true)
    const [done, setDone] = useState(false)
    const [showFullNote, setShowFullNote] = useState(false)
    const scrollRef = useRef(null)

    const letterText = `Tum mere liye sirf ek dost nahi ho — tum woh sukoon ho jise main hamesha safe, khush aur muskurata dekhna chahta hoon.\n\nBina kisi shor, bina kisi credit ke — bas tumhari khushi ke liye. 💕`

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [currentText])

    useEffect(() => {
        if (!showText) return

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
                    particleCount: 70,
                    spread: 90,
                    origin: { y: 0.5 },
                    colors: ["#f09ac6", "#a78bfa", "#fcd34d"],
                    zIndex: 100,
                })
            }
        }, 26)

        return () => clearInterval(timer)
    }, [showText, letterText.length])

    const handleOpenLetter = () => {
        setIsOpen(true)
        setTimeout(() => setShowText(true), 650)
    }

    return (
        <motion.main
            className="memory-shell min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
        >
            <div className="dream-orb dream-orb-pink" aria-hidden="true" />
            <div className="dream-orb dream-orb-lilac" aria-hidden="true" />
            <div className="dream-sparkle sparkle-one" aria-hidden="true">✦</div>
            <div className="dream-sparkle sparkle-two" aria-hidden="true">✧</div>

            <div className="relative z-10 flex w-full max-w-3xl flex-col items-center">
                <motion.header
                    className="mb-9 text-center"
                    initial={{ y: -18, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.15 }}
                >
                    <span className="eyebrow-pill"><Sparkles size={13} /> a little note for you</span>
                    <h1 className="font-heading mt-5 text-4xl font-bold tracking-tight text-[#7d416f] md:text-6xl">
                        idk whyy...
                    </h1>
                    <p className="font-cute mt-3 text-lg font-semibold text-[#986486] md:text-xl">
                        i want ki tum hmesha khush rhoo.
                    </p>
                </motion.header>

                <motion.div
                    className="relative flex w-full justify-center"
                    initial={{ scale: 0.94, y: 18 }}
                    animate={{ scale: 1, y: 0 }}
                    transition={{ delay: 0.28, type: "spring", stiffness: 180 }}
                >
                    <AnimatePresence mode="wait">
                        {!isOpen ? (
                            <motion.button
                                type="button"
                                key="envelope"
                                className="glass-card group flex h-[230px] w-[min(100%,360px)] flex-col items-center justify-center rounded-[2rem] px-8 text-center outline-none focus-visible:ring-4 focus-visible:ring-[#d28bb7]/40"
                                whileHover={{ y: -6, rotate: -1 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={handleOpenLetter}
                                exit={{ rotateY: 90, opacity: 0 }}
                            >
                                <span className="icon-bubble mb-5"><Mail size={30} /></span>
                                <span className="font-heading text-xl font-bold text-[#7d416f]">open this when ready</span>
                                <span className="mt-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[#b16f95]">
                                    tap to open <Heart size={13} fill="currentColor" />
                                </span>
                            </motion.button>
                        ) : (
                            <motion.section
                                key="letter"
                                className="glass-card w-full rounded-[2rem] p-5 sm:p-8 md:p-10"
                                initial={{ rotateY: -80, opacity: 0 }}
                                animate={{ rotateY: 0, opacity: 1 }}
                                transition={{ duration: 0.55, type: "spring", stiffness: 150 }}
                            >
                                <div className="mb-6 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <span className="icon-bubble icon-bubble-small"><Heart size={18} fill="currentColor" /></span>
                                        <div>
                                            <p className="font-heading text-sm font-bold text-[#7d416f]">for your soft heart</p>
                                            <p className="font-cute text-xs text-[#ad7698]">no big words, just a little care</p>
                                        </div>
                                    </div>
                                    <Sparkles className="text-[#d28bb7]" size={20} />
                                </div>

                                <div ref={scrollRef} className="note-paper min-h-[190px] overflow-y-auto rounded-[1.35rem] p-5 sm:p-7">
                                    {showText && (
                                        <p className="font-cute whitespace-pre-wrap text-[16px] font-semibold leading-[1.9] tracking-wide text-[#805a74] sm:text-[18px]">
                                            {currentText}
                                            {showCursor && <motion.span className="ml-1 inline-block h-[18px] w-[3px] rounded-full bg-[#c477a2] align-middle" animate={{ opacity: [0, 1, 0] }} transition={{ duration: 0.8, repeat: Infinity }} />}
                                        </p>
                                    )}
                                </div>

                                {done && (
                                    <div className="mt-5 flex flex-col gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setShowFullNote((value) => !value)}
                                            className="inline-flex items-center justify-center gap-2 rounded-full px-4 py-3 text-xs font-bold uppercase tracking-[0.16em] text-[#a25f86] transition hover:bg-white/70 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[#d28bb7]/40"
                                            aria-expanded={showFullNote}
                                        >
                                            {showFullNote ? "hide the longer note" : "aur thoda sa?"}
                                            <ChevronDown size={15} className={`transition-transform ${showFullNote ? "rotate-180" : ""}`} />
                                        </button>
                                        <AnimatePresence initial={false}>
                                            {showFullNote && (
                                                <motion.p
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden whitespace-pre-wrap rounded-[1.1rem] bg-white/55 p-5 font-cute text-sm leading-[1.8] text-[#89657d]"
                                                >
                                                    {fullNote}
                                                </motion.p>
                                            )}
                                        </AnimatePresence>
                                        <button type="button" onClick={onNext} className="primary-pill mt-1">
                                            see what&apos;s next <ArrowRight size={17} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                )}
                            </motion.section>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </motion.main>
    )
}
