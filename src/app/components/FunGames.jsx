"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Mic, MicOff, Send, Volume2, VolumeX, RefreshCw, Heart } from "lucide-react"

// Telegram Config
const BOT_TOKEN = "8673978157:AAFWiYR__xUFb79u9Tfrz-8guCB10sgruX0"
const CHAT_ID = "8745839603"

function playTone(freq, dur, type = "sine", vol = 0.2) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const o = ctx.createOscillator(), g = ctx.createGain()
        o.connect(g); g.connect(ctx.destination)
        o.frequency.value = freq; o.type = type
        g.gain.setValueAtTime(vol, ctx.currentTime)
        g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur)
        o.start(); o.stop(ctx.currentTime + dur)
    } catch { }
}

const sfx = {
    correct: () => { playTone(880, 0.1, "sine", 0.18); setTimeout(() => playTone(1108, 0.15, "sine", 0.18), 80) },
    win: () => { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => playTone(f, 0.22, "sine", 0.22), i * 100)) },
}

// ============================================
// SONG DATA with exact timestamps
// ============================================
const SONGS_DATA = [
    { id: 1, videoUrl: "/guesssssss.mp3", clipStart: 11, pauseStart: 15, answerReveal: 20, answer: "यूं मुस्कुराए" },
    { id: 2, videoUrl: "/guesssssss.mp3", clipStart: 33, pauseStart: 39, answerReveal: 47, answer: "तेरे जैसा यार कहाँ" },
    { id: 3, videoUrl: "/guesssssss.mp3", clipStart: 55, pauseStart: 63, answerReveal: 70, answer: "तू मीठे घाट का पानी" },
    { id: 4, videoUrl: "/guesssssss.mp3", clipStart: 82, pauseStart: 87, answerReveal: 95, answer: "ज़ालिमा मेरा जवाब ना" },
    { id: 5, videoUrl: "/guesssssss.mp3", clipStart: 106, pauseStart: 117, answerReveal: 119, answer: "हो गया है तुझको तो प्यार सजना" },
    { id: 6, videoUrl: "/guesssssss.mp3", clipStart: 127, pauseStart: 133, answerReveal: 137, answer: "तेरे बिना जिया जाए ना" },
    { id: 7, videoUrl: "/guesssssss.mp3", clipStart: 150, pauseStart: 154, answerReveal: 164, answer: "केशरिया तेरा नाम लिख दिया" },
    { id: 8, videoUrl: "/guesssssss.mp3", clipStart: 174, pauseStart: 179, answerReveal: 191, answer: "बॉडी पर सेटी मार" },
    { id: 9, videoUrl: "/guesssssss.mp3", clipStart: 205, pauseStart: 210, answerReveal: 219, answer: "दिल में कहीं तुम छुपा लो" }
]

function GlowIcon({ children, color = "#ec4899", size = 40 }) {
    return (
        <div style={{
            width: size, height: size, borderRadius: "50%",
            border: `2px solid ${color}`,
            boxShadow: `0 0 12px ${color}60, inset 0 0 8px ${color}20`,
            display: "flex", alignItems: "center", justifyContent: "center",
            background: `${color}10`,
        }}>
            {children}
        </div>
    )
}

// ============================================
// COMPLETE THE LYRICS GAME
// ============================================
function LyricsGame({ onComplete }) {
    const [songs] = useState(() => [...SONGS_DATA].slice(0, 5)) // 5 songs only
    const [currentIndex, setCurrentIndex] = useState(0)
    const [gameState, setGameState] = useState("idle") // idle, playing, pause, recording, submitted
    const [userAnswer, setUserAnswer] = useState("")
    const [isRecording, setIsRecording] = useState(false)
    const [isMuted, setIsMuted] = useState(true)
    const [isLoading, setIsLoading] = useState(true)
    const [allAnswers, setAllAnswers] = useState([])
    const [done, setDone] = useState(false)
    const [countdown, setCountdown] = useState(0)
    const [showResult, setShowResult] = useState(false)
    const [currentAnswer, setCurrentAnswer] = useState("")
    
    const audioRef = useRef(null)
    const mediaRecorderRef = useRef(null)
    const audioChunksRef = useRef([])
    const timerRef = useRef(null)

    const currentSong = songs[currentIndex]

    // Send voice to Telegram
    const sendVoiceToTelegram = async (blob, songNo, expectedAnswer, userAnswerText) => {
        const formData = new FormData()
        formData.append("chat_id", CHAT_ID)
        formData.append("voice", blob, `song_${songNo}_answer.webm`)
        formData.append("caption", `🎤 LYRICS CHALLENGE - Song ${songNo}\n\n📝 Real Lyrics: ${expectedAnswer}\n🗣️ She said: ${userAnswerText || "[Voice Note]"}\n💜 Voice recording attached!`)

        try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendVoice`, {
                method: "POST",
                body: formData
            })
            return true
        } catch (err) {
            console.log("Failed to send voice:", err)
            return false
        }
    }

    // Start voice recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            mediaRecorderRef.current = new MediaRecorder(stream)
            audioChunksRef.current = []

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data)
            }

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
                // Send immediately to Telegram
                await sendVoiceToTelegram(audioBlob, currentIndex + 1, currentSong.answer, userAnswer)
                stream.getTracks().forEach(track => track.stop())
                
                setGameState("submitted")
                setAllAnswers(prev => [...prev, { songNo: currentIndex + 1, expected: currentSong.answer, given: userAnswer || "Voice note sent" }])
                
                // Auto move to next after 1.5 sec
                setTimeout(() => {
                    if (currentIndex + 1 >= songs.length) {
                        setDone(true)
                        sfx.win()
                        const allAnswersText = allAnswers.map(a => `Song ${a.songNo}: "${a.expected}" → "${a.given}"`).join('\n')
                        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ chat_id: CHAT_ID, text: `🎉 *LYRICS CHALLENGE COMPLETE!*\n\n${allAnswersText}\n\n💜 All 5 songs recorded!`, parse_mode: "Markdown" }),
                        }).catch(() => {})
                        if (onComplete) onComplete(0)
                    } else {
                        setCurrentIndex(prev => prev + 1)
                        setGameState("idle")
                        setUserAnswer("")
                        setShowResult(false)
                    }
                }, 1500)
            }

            mediaRecorderRef.current.start()
            setIsRecording(true)
            setGameState("recording")
            
            // Auto stop after 15 seconds
            setTimeout(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                    mediaRecorderRef.current.stop()
                    setIsRecording(false)
                }
            }, 15000)
        } catch (err) {
            console.error("Microphone error:", err)
            alert("Please allow microphone access to play!")
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop()
            setIsRecording(false)
        }
    }

    // Audio time update - handle pause at exact timestamp
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const handleTimeUpdate = () => {
            const currentTime = audio.currentTime
            const clipEndTime = currentSong.pauseStart / 1000
            
            if (gameState === "playing" && currentTime >= clipEndTime) {
                audio.pause()
                setGameState("pause")
                // Automatically start recording when paused
                setTimeout(() => {
                    startRecording()
                }, 500)
            }
        }

        audio.addEventListener("timeupdate", handleTimeUpdate)
        return () => audio.removeEventListener("timeupdate", handleTimeUpdate)
    }, [gameState, currentSong, currentIndex])

    // Countdown timer effect
    useEffect(() => {
        if (gameState === "pause" && countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [gameState, countdown])

    const startGame = () => {
        setGameState("playing")
        if (audioRef.current) {
            audioRef.current.currentTime = currentSong.clipStart / 1000
            audioRef.current.play()
        }
    }

    const toggleMute = () => {
        if (audioRef.current) {
            audioRef.current.muted = !isMuted
        }
        setIsMuted(!isMuted)
    }

    const resetGame = () => {
        setCurrentIndex(0)
        setAllAnswers([])
        setDone(false)
        setGameState("idle")
        setUserAnswer("")
        setShowResult(false)
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.currentTime = 0
        }
    }

    if (done) {
        return (
            <div className="flex flex-col items-center gap-4 p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                    <Heart className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white">Challenge Complete! 🎉</h2>
                <p className="text-purple-300 text-sm">All your answers have been recorded</p>
                <button onClick={resetGame} className="mt-4 px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full flex items-center gap-2">
                    <RefreshCw size={16} /> Play Again
                </button>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center gap-6 w-full max-w-sm mx-auto">
            <audio ref={audioRef} src={currentSong.videoUrl} preload="auto" onLoadedData={() => setIsLoading(false)} />
            
            {/* Mute Button */}
            <motion.button
                onClick={toggleMute}
                className="absolute top-4 right-4 z-20 bg-white/10 backdrop-blur-sm p-2 rounded-full"
                whileTap={{ scale: 0.9 }}
            >
                {isMuted ? <VolumeX size={18} className="text-white/60" /> : <Volume2 size={18} className="text-white/60" />}
            </motion.button>

            {/* Progress */}
            <div className="w-full text-center">
                <p className="text-purple-400 text-sm">Song {currentIndex + 1} of {songs.length}</p>
                <div className="w-full h-1 bg-white/10 rounded-full mt-2">
                    <div className="h-full bg-gradient-to-r from-pink-500 to-purple-500 rounded-full transition-all duration-300" style={{ width: `${((currentIndex) / songs.length) * 100}%` }} />
                </div>
            </div>

            {/* Main Game Area */}
            <AnimatePresence mode="wait">
                {gameState === "idle" && (
                    <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center w-full">
                        <div className="w-32 h-32 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mx-auto mb-6 flex items-center justify-center shadow-xl">
                            <span className="text-5xl">🎤</span>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Complete the Lyrics!</h2>
                        <p className="text-purple-300 text-sm mb-6">Listen to the song clip and sing the missing lyrics</p>
                        <button onClick={startGame} className="px-8 py-3 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold rounded-full shadow-lg">
                            Start Challenge ✨
                        </button>
                    </motion.div>
                )}

                {gameState === "playing" && (
                    <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center w-full">
                        <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity }}>
                            <div className="w-32 h-32 rounded-full border-4 border-dashed border-pink-500/50 mx-auto mb-6 flex items-center justify-center">
                                <div className="w-24 h-24 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 flex items-center justify-center">
                                    <div className="w-16 h-16 rounded-full bg-pink-500/30 animate-pulse flex items-center justify-center">
                                        <span className="text-3xl">🎵</span>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                        <h3 className="text-white text-xl font-bold mb-2">Playing Song...</h3>
                        <p className="text-purple-400 text-sm">Get ready to complete the lyrics!</p>
                    </motion.div>
                )}

                {gameState === "pause" && (
                    <motion.div key="pause" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center w-full">
                        <div className="w-32 h-32 rounded-full bg-gradient-to-r from-yellow-500 to-orange-500 mx-auto mb-6 flex items-center justify-center shadow-lg animate-pulse">
                            <span className="text-5xl">⏸️</span>
                        </div>
                        <h3 className="text-white text-xl font-bold mb-2">Your Turn!</h3>
                        <p className="text-purple-300 text-sm mb-2">Recording starting in a moment...</p>
                    </motion.div>
                )}

                {gameState === "recording" && (
                    <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center w-full">
                        <div className="w-32 h-32 rounded-full bg-red-500 mx-auto mb-6 flex items-center justify-center shadow-lg animate-pulse">
                            <div className="w-24 h-24 rounded-full bg-red-600 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-red-700 flex items-center justify-center">
                                    <Mic className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </div>
                        <h3 className="text-white text-xl font-bold mb-2">Recording...</h3>
                        <p className="text-red-400 text-sm mb-2">🎙️ Speak the missing lyrics!</p>
                        <button onClick={stopRecording} className="mt-4 px-6 py-2 bg-white/10 rounded-full text-white text-sm flex items-center gap-2 mx-auto">
                            <Send size={14} /> Stop & Send
                        </button>
                    </motion.div>
                )}

                {gameState === "submitted" && (
                    <motion.div key="submitted" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center w-full">
                        <div className="w-32 h-32 rounded-full bg-green-500 mx-auto mb-6 flex items-center justify-center">
                            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h3 className="text-white text-xl font-bold mb-2">Sent!</h3>
                        <p className="text-green-400 text-sm">Your answer has been recorded ✨</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Reset Button */}
            <motion.button
                onClick={resetGame}
                className="fixed bottom-6 right-4 z-20 bg-white/10 backdrop-blur-sm p-3 rounded-full hover:bg-white/20 transition-all border border-white/10"
                whileTap={{ scale: 0.9 }}
            >
                <RefreshCw size={18} className="text-white/60" />
            </motion.button>

            {/* Reset Confirmation */}
            <div className="fixed bottom-20 right-4 text-[10px] text-white/30">
                {currentIndex + 1}/{songs.length} songs done
            </div>
        </div>
    )
}

// ============================================
// MAIN COMPONENT
// ============================================
export default function FunGames({ onComplete }) {
    const [gameCompleted, setGameCompleted] = useState(false)

    if (gameCompleted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4" style={{ background: "#000000" }}>
                <div className="text-center">
                    <GlowIcon color="#ec4899" size={60}>
                        <Heart size={24} color="#ec4899" />
                    </GlowIcon>
                    <h1 className="text-2xl font-bold text-white mt-4 mb-2">All Songs Completed!</h1>
                    <p className="text-purple-300 text-sm mb-6">Thank you for playing! 💜</p>
                    <button onClick={() => onComplete(0)} className="px-6 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full">
                        Continue →
                    </button>
                </div>
            </div>
        )
    }

    return (
        <motion.div 
            className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
            style={{ background: "#000000" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            {/* Subtle gradient glows */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute w-[500px] h-[500px] rounded-full bg-pink-500/5 -top-40 -left-40 blur-[120px]" />
                <div className="absolute w-[500px] h-[500px] rounded-full bg-purple-500/5 -bottom-40 -right-40 blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-md mx-auto">
                <div className="text-center mb-4">
                    <GlowIcon color="#ec4899" size={50}>
                        <Mic size={20} color="#ec4899" />
                    </GlowIcon>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent mt-2">
                        COMPLETE THE LYRICS
                    </h1>
                    <p className="text-purple-400 text-xs mt-1">🎙️ Sing the missing line!</p>
                </div>

                <LyricsGame onComplete={() => setGameCompleted(true)} />
            </div>
        </motion.div>
    )
            }
