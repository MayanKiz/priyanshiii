"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    ArrowRight, Music2, Play, Mic, Send, Loader2, Disc
} from "lucide-react"

// ⚠️ TUMHARI TG DETAILS
const BOT_TOKEN = "8673978157:AAFWiYR__xUFb79u9Tfrz-8guCB10sgruX0"
const CHAT_ID = "8745839603"

async function sendVoiceNoteToTG(songNo, audioBlob) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendVoice`
    const formData = new FormData()
    formData.append("chat_id", CHAT_ID)
    formData.append("voice", audioBlob, `song_${songNo}.ogg`)
    formData.append("caption", `🎤 Lyrics Challenge - Song ${songNo} Guess!`)
    
    try {
        await fetch(url, { method: "POST", body: formData })
    } catch (e) { console.error("Voice send error:", e) }
}

async function sendFinalScore(score) {
    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: CHAT_ID, text: `🏆 <b>Lyrics Challenge Finished!</b>\nPoints Earned: ${score}`, parse_mode: "HTML" }),
        })
    } catch { }
}

// ============================================
// TIMESTAMPS BASED ON YOUR DATA
// ============================================
const SONGS = [
    { id: 1, clipStart: 11, pauseStart: 15 },
    { id: 2, clipStart: 33, pauseStart: 39 },
    { id: 3, clipStart: 55, pauseStart: 63 },
    { id: 4, clipStart: 82, pauseStart: 87 },
    { id: 5, clipStart: 106, pauseStart: 117 },
    { id: 6, clipStart: 127, pauseStart: 133 },
    { id: 7, clipStart: 150, pauseStart: 154 },
    { id: 8, clipStart: 174, pauseStart: 179 },
    { id: 9, clipStart: 205, pauseStart: 210 }
];

export default function FunGames({ onComplete }) {
    const [currentIdx, setCurrentIdx] = useState(0)
    const [gameState, setGameState] = useState("start") // start, ready, playing, recording, sending, finished
    const [score, setScore] = useState(0)
    const [progress, setProgress] = useState(0)

    const audioRef = useRef(null)
    const mediaRecorderRef = useRef(null)
    const audioChunksRef = useRef([])

    // ============================================
    // AUDIO TRACKING LOGIC
    // ============================================
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const handleTimeUpdate = () => {
            const time = audio.currentTime
            const currentSong = SONGS[currentIdx]
            
            if (gameState === "playing") {
                // Calculate progress bar
                const totalDur = currentSong.pauseStart - currentSong.clipStart
                const currentDur = time - currentSong.clipStart
                setProgress(Math.min((currentDur / totalDur) * 100, 100))

                // Auto Pause when it reaches pauseStart
                if (time >= currentSong.pauseStart) {
                    audio.pause()
                    startAutoRecording()
                }
            }
        }

        audio.addEventListener("timeupdate", handleTimeUpdate)
        return () => audio.removeEventListener("timeupdate", handleTimeUpdate)
    }, [currentIdx, gameState])

    // ============================================
    // MIC & RECORDING LOGIC
    // ============================================
    const requestMicAccess = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            stream.getTracks().forEach(t => t.stop())
            setGameState("ready")
        } catch (e) {
            alert("Please allow mic access to play the challenge! 🎙️")
        }
    }

    const playCurrentClip = () => {
        if (!audioRef.current) return
        setProgress(0)
        setGameState("playing")
        audioRef.current.currentTime = SONGS[currentIdx].clipStart
        audioRef.current.play().catch(e => {
            console.log("Play blocked", e)
            alert("Please tap play again.")
            setGameState("ready")
        })
    }

    const startAutoRecording = async () => {
        setGameState("recording")
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mr = new MediaRecorder(stream)
            mediaRecorderRef.current = mr
            audioChunksRef.current = []

            mr.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data)
            }

            mr.onstop = async () => {
                const blob = new Blob(audioChunksRef.current, { type: "audio/ogg; codecs=opus" })
                stream.getTracks().forEach(t => t.stop())
                
                await sendVoiceNoteToTG(currentIdx + 1, blob)
                setScore(s => s + 20)
                moveToNextSong()
            }

            mr.start()
        } catch (err) {
            console.error("Mic failed auto-start", err)
            setGameState("sending")
            setTimeout(() => moveToNextSong(), 2000)
        }
    }

    const stopAndSend = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            setGameState("sending")
            mediaRecorderRef.current.stop() 
        }
    }

    const moveToNextSong = () => {
        if (currentIdx < SONGS.length - 1) {
            setCurrentIdx(c => c + 1)
            setGameState("ready") // Wapas "Play" button wali state me bhej diya
            setProgress(0)
        } else {
            setGameState("finished")
            sendFinalScore(score + 20)
        }
    }

    return (
        // BACKGROUND BLACK SET KIYA HAI
        <motion.div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-black text-white"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>

            {/* AUDIO TAG (Hidden standard UI, but custom UI shown on screen) */}
            <audio ref={audioRef} src="/images/guesssssss.mp3" preload="auto" />

            <div className="relative z-10 w-full max-w-sm mx-auto" style={{ fontFamily: "'Nunito', sans-serif" }}>
                
                {gameState !== "start" && gameState !== "finished" && (
                    <div className="flex justify-between items-center mb-10 px-2">
                        <span className="text-gray-400 font-bold tracking-widest text-xs uppercase">SONG {currentIdx + 1} OF {SONGS.length}</span>
                        <span className="text-pink-500 font-black text-sm">{score} PTS</span>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {gameState === "start" && (
                        <motion.div key="start" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                            className="w-full flex flex-col items-center text-center">
                            
                            <div className="w-24 h-24 rounded-full bg-pink-500/20 flex items-center justify-center mb-8 border border-pink-500/50">
                                <Music2 className="w-10 h-10 text-pink-500" />
                            </div>
                            <h1 className="text-3xl font-black text-white mb-4 uppercase tracking-wider">Lyrics Challenge</h1>
                            <p className="text-gray-400 text-sm mb-10 px-4">
                                Click start to grant mic access. We'll play a clip, and you sing the missing lyrics when it stops!
                            </p>
                            
                            <motion.button
                                onClick={requestMicAccess}
                                className="w-full py-4 bg-pink-600 hover:bg-pink-500 text-white font-black rounded-xl uppercase tracking-widest"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Let's Go 🎙️
                            </motion.button>
                        </motion.div>
                    )}

                    {gameState === "ready" && (
                        <motion.div key="ready" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} 
                            className="w-full flex flex-col items-center">
                            
                            <div className="w-48 h-48 rounded-full border-4 border-gray-800 flex items-center justify-center bg-gray-900 mb-8 shadow-[0_0_50px_rgba(255,255,255,0.05)]">
                                <Disc className="w-20 h-20 text-gray-700" />
                            </div>
                            
                            <h2 className="text-xl font-bold text-white mb-8">Ready for Song {currentIdx + 1}?</h2>
                            
                            <motion.button
                                onClick={playCurrentClip}
                                className="w-full py-4 bg-white text-black font-black rounded-xl uppercase tracking-widest flex items-center justify-center gap-3"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Play className="fill-current w-5 h-5" /> Play Clip
                            </motion.button>
                        </motion.div>
                    )}

                    {gameState === "playing" && (
                        <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                            className="w-full flex flex-col items-center">
                            
                            <motion.div 
                                className="w-48 h-48 rounded-full border-4 border-pink-500 flex items-center justify-center bg-gray-900 mb-10 shadow-[0_0_50px_rgba(236,72,153,0.3)]"
                                animate={{ rotate: 360 }}
                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            >
                                <Disc className="w-20 h-20 text-pink-500" />
                            </motion.div>
                            
                            <div className="w-full px-4 mb-4">
                                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div className="h-full bg-pink-500" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                            <p className="text-pink-500 font-bold tracking-widest animate-pulse uppercase">Playing...</p>
                        </motion.div>
                    )}

                    {gameState === "recording" && (
                        <motion.div key="recording" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} 
                            className="w-full flex flex-col items-center">
                            
                            <motion.div 
                                className="w-48 h-48 bg-red-600 rounded-full flex items-center justify-center mb-8 shadow-[0_0_60px_rgba(220,38,38,0.5)] border-4 border-red-400"
                                animate={{ scale: [1, 1.05, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                <Mic className="w-20 h-20 text-white" />
                            </motion.div>
                            
                            <h2 className="text-red-500 text-2xl font-black mb-2 uppercase animate-pulse">Sing Now!</h2>
                            <p className="text-gray-400 text-xs mb-10">Recording your voice...</p>

                            <motion.button
                                onClick={stopAndSend}
                                className="w-full py-4 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors font-black rounded-xl flex items-center justify-center gap-3 uppercase tracking-widest"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Stop & Send <Send size={18} />
                            </motion.button>
                        </motion.div>
                    )}

                    {gameState === "sending" && (
                        <motion.div key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                            className="w-full flex flex-col items-center py-20">
                            
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }}>
                                <Loader2 className="w-16 h-16 text-gray-500 mb-6" />
                            </motion.div>
                            <p className="text-gray-500 font-bold tracking-widest uppercase">Sending Audio...</p>
                        </motion.div>
                    )}

                    {gameState === "finished" && (
                        <motion.div key="finished" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} 
                            className="w-full flex flex-col items-center text-center">
                            
                            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6 border border-green-500/50">
                                <Trophy className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2 uppercase">Awesome!</h2>
                            <p className="text-gray-400 text-sm mb-10">You've completed the Lyrics Challenge.</p>
                            
                            <motion.button
                                onClick={() => onComplete(score)}
                                className="w-full py-4 bg-white text-black font-black rounded-xl uppercase tracking-widest"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                See Next Surprise <ArrowRight size={18} className="inline ml-1" />
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}
