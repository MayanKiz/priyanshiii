"use client"

import { motion, AnimatePresence } from "motion/react"
import { Gift, Sparkles, Heart, Music, Star, PartyPopper, Cake, Balloon, Camera, Volume2, VolumeX } from "lucide-react"
import confetti from "canvas-confetti"
import { useEffect, useState, useRef } from "react"

export default function Celebration({ onNext }) {
    const [showSurprise, setShowSurprise] = useState(false)
    const [clickCount, setClickCount] = useState(0)
    const [isMuted, setIsMuted] = useState(true)
    const [floatingHearts, setFloatingHearts] = useState([])
    const audioRef = useRef(null)

    const colors = ["#ff69b4", "#ff1493", "#9370db", "#00bfff", "#ffd700", "#ff4500"]

    // Continuous confetti from both sides
    useEffect(() => {
        const duration = 4000
        const end = Date.now() + duration

        const frame = () => {
            const randomColor = () => colors[Math.floor(Math.random() * colors.length)]

            for (let i = 0; i < 3; i++) {
                confetti({
                    particleCount: 2,
                    angle: i === 0 ? 55 : i === 1 ? 125 : 90,
                    spread: 60,
                    origin: { x: i === 0 ? 0 : i === 1 ? 1 : 0.5, y: i === 2 ? 0.2 : 0.5 },
                    colors: [randomColor(), randomColor()],
                    startVelocity: i === 2 ? 15 : 20,
                })
            }

            if (Date.now() < end) {
                requestAnimationFrame(frame)
            }
        }

        frame()

        // Add floating hearts periodically
        const heartInterval = setInterval(() => {
            const id = Date.now() + Math.random()
            setFloatingHearts(prev => [...prev, { id, x: Math.random() * 100, delay: 0 }])
            setTimeout(() => {
                setFloatingHearts(prev => prev.filter(h => h.id !== id))
            }, 4000)
        }, 800)

        return () => clearInterval(heartInterval)
    }, [])

    const handleCelebrateClick = () => {
        setClickCount(prev => prev + 1)
        
        // Massive confetti burst
        confetti({
            particleCount: 200,
            spread: 100,
            origin: { y: 0.6 },
            colors: colors,
            startVelocity: 25,
        })
        
        confetti({
            particleCount: 100,
            angle: 60,
            spread: 80,
            origin: { x: 0 },
            colors: ["#ff69b4", "#9370db"],
        })
        
        confetti({
            particleCount: 100,
            angle: 120,
            spread: 80,
            origin: { x: 1 },
            colors: ["#ffd700", "#00bfff"],
        })

        // Show surprise after 3 clicks
        if (clickCount + 1 >= 3) {
            setShowSurprise(true)
            setTimeout(() => setShowSurprise(false), 3000)
            
            // Mega confetti for surprise
            setTimeout(() => {
                confetti({
                    particleCount: 300,
                    spread: 120,
                    origin: { y: 0.5 },
                    colors: colors,
                })
            }, 100)
        }

        // Play celebration sound if unmuted
        if (!isMuted && audioRef.current) {
            audioRef.current.currentTime = 0
            audioRef.current.play()
        }
    }

    const toggleMute = () => {
        setIsMuted(!isMuted)
    }

    return (
        <>
            {/* Audio element for celebration sound */}
            <audio ref={audioRef} src="/celebration.mp3" preload="auto" />
            
            {/* Floating hearts animation */}
            {floatingHearts.map((heart) => (
                <motion.div
                    key={heart.id}
                    className="fixed pointer-events-none z-50"
                    style={{ left: `${heart.x}%`, bottom: 0 }}
                    initial={{ y: 0, opacity: 1, scale: 0.5 }}
                    animate={{ y: -window.innerHeight, opacity: 0, scale: 1.5 }}
                    transition={{ duration: 4, ease: "easeOut" }}
                >
                    <Heart className="w-6 h-6 text-pink-500 fill-pink-500" />
                </motion.div>
            ))}

            <motion.div
                className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -100 }}
            >
                {/* Animated background particles */}
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(30)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-white/20 rounded-full"
                            initial={{ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight }}
                            animate={{
                                y: [null, -100, -200],
                                opacity: [0, 1, 0],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 4,
                                repeat: Infinity,
                                delay: Math.random() * 5,
                            }}
                        />
                    ))}
                </div>

                {/* Mute button */}
                <motion.button
                    onClick={toggleMute}
                    className="absolute top-4 right-4 z-20 bg-white/10 backdrop-blur-sm p-2 rounded-full hover:bg-white/20 transition-all"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileTap={{ scale: 0.9 }}
                >
                    {isMuted ? <VolumeX className="w-5 h-5 text-white" /> : <Volume2 className="w-5 h-5 text-white" />}
                </motion.button>

                <motion.div
                    className="text-center mb-8 z-10"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    {/* Animated Gift Box with multiple effects */}
                    <motion.div
                        className="relative mb-8 cursor-pointer group"
                        animate={{
                            rotate: [0, 5, -5, 5, 0],
                            scale: [1, 1.05, 1],
                            y: [0, -10, 0],
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        whileHover={{ scale: 1.1 }}
                        onClick={handleCelebrateClick}
                    >
                        <div className="w-36 h-36 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto shadow-2xl relative overflow-hidden">
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                animate={{ x: ["-150%", "150%"] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                            <div className="absolute inset-0 rounded-full ring-4 ring-white/30 animate-ping" />
                            <Gift className="w-16 h-16 text-white relative z-10" />
                        </div>
                        
                        {/* Click me badge */}
                        <motion.div
                            className="absolute -top-2 -right-2 bg-yellow-400 text-purple-900 text-xs font-bold px-2 py-1 rounded-full"
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 0.8, repeat: Infinity }}
                        >
                            Click Me!
                        </motion.div>
                    </motion.div>

                    {/* Main Title with typing effect */}
                    <motion.h1
                        className="text-5xl md:text-8xl font-black mb-4"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2, type: "spring" }}
                    >
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400">
                            Time to
                        </span>
                        <br />
                        <motion.span
                            className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-400 inline-block"
                            animate={{ 
                                textShadow: [
                                    "0 0 20px rgba(255,105,180,0.5)",
                                    "0 0 40px rgba(255,105,180,0.8)",
                                    "0 0 20px rgba(255,105,180,0.5)"
                                ]
                            }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            Celebrate!
                        </motion.span>
                    </motion.h1>

                    {/* Subtitle with counter */}
                    <motion.p
                        className="text-xl text-purple-300 mb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        The countdown is over... Let's party! 🎉
                    </motion.p>
                    
                    {clickCount > 0 && (
                        <motion.p
                            className="text-sm text-purple-400"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            You've celebrated {clickCount} time{clickCount !== 1 ? 's' : ''}! 🎊
                        </motion.p>
                    )}
                </motion.div>

                {/* Main Action Buttons */}
                <motion.div
                    className="flex flex-col sm:flex-row gap-4 mb-8 z-10"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                        delay: 1,
                        type: "spring",
                        stiffness: 200,
                        damping: 10,
                    }}
                >
                    <motion.button
                        onClick={handleCelebrateClick}
                        className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white text-lg px-8 py-4 rounded-full shadow-xl border-2 border-white/70 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <motion.div className="flex items-center space-x-3">
                            <PartyPopper className="w-5 h-5" />
                            <span className="font-semibold">POP Confetti!</span>
                            <Sparkles className="w-5 h-5" />
                        </motion.div>
                    </motion.button>

                    <motion.button
                        onClick={onNext}
                        className="relative bg-white/10 backdrop-blur-md border border-white/30 hover:bg-white/20 text-white text-lg px-8 py-4 rounded-full shadow-xl transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <motion.div className="flex items-center space-x-3">
                            <Cake className="w-5 h-5" />
                            <span className="font-semibold">Continue to Party</span>
                            <Balloon className="w-5 h-5" />
                        </motion.div>
                    </motion.button>
                </motion.div>

                {/* Surprise Element */}
                <AnimatePresence>
                    {showSurprise && (
                        <motion.div
                            className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0 }}
                            transition={{ type: "spring" }}
                        >
                            <div className="bg-gradient-to-r from-pink-500/90 to-purple-500/90 backdrop-blur-md rounded-2xl p-8 text-center shadow-2xl">
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 0.5 }}
                                >
                                    <Star className="w-16 h-16 text-yellow-300 mx-auto mb-4 fill-yellow-300" />
                                </motion.div>
                                <h2 className="text-3xl font-bold text-white mb-2">SURPRISE! 🎁</h2>
                                <p className="text-white/90">You found the secret celebration!</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Decorative elements - Floating icons */}
                <motion.div
                    className="absolute bottom-8 left-8 opacity-50"
                    animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                >
                    <Music className="w-8 h-8 text-purple-300" />
                </motion.div>
                
                <motion.div
                    className="absolute top-20 right-8 opacity-50"
                    animate={{ y: [0, -15, 0], rotate: [0, -10, 0] }}
                    transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                >
                    <Heart className="w-6 h-6 text-pink-400 fill-pink-400/50" />
                </motion.div>

                <motion.div
                    className="absolute bottom-20 right-12 opacity-40"
                    animate={{ scale: [1, 1.2, 1], rotate: [0, 20, 0] }}
                    transition={{ duration: 4, repeat: Infinity, delay: 1 }}
                >
                    <Sparkles className="w-5 h-5 text-yellow-300" />
                </motion.div>

                {/* Hint text */}
                <motion.p
                    className="mt-8 text-purple-400/60 text-sm z-10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                >
                    💡 Tip: Click the gift box or "POP Confetti!" multiple times!
                </motion.p>
            </motion.div>
        </>
    )
}