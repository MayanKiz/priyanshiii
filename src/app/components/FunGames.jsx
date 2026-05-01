"use client"

import { useState, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    ArrowRight, Trophy, Mic, Send, Loader2, PlaySquare
} from "lucide-react"

// ⚠️ TUMHARI TG DETAILS
const BOT_TOKEN = "8673978157:AAFWiYR__xUFb79u9Tfrz-8guCB10sgruX0"
const CHAT_ID = "8745839603"

async function sendVoiceNoteToTG(songNo, audioBlob) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendVoice`
    const formData = new FormData()
    formData.append("chat_id", CHAT_ID)
    formData.append("voice", audioBlob, `song_${songNo}.ogg`)
    formData.append("caption", `🎤 Lyrics Challenge - Song ${songNo} Voice Answer!`)
    
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
// TIMESTAMPS (Sirf Start Time Chahiye Ab)
// ============================================
const SONGS = [
    { id: 1, clipStart: 11 },
    { id: 2, clipStart: 33 },
    { id: 3, clipStart: 55 },
    { id: 4, clipStart: 82 },
    { id: 5, clipStart: 106 },
    { id: 6, clipStart: 127 },
    { id: 7, clipStart: 150 },
    { id: 8, clipStart: 174 },
    { id: 9, clipStart: 205 }
];

export default function FunGames({ onComplete }) {
    const [currentIdx, setCurrentIdx] = useState(0)
    const [gameState, setGameState] = useState("start") // start, playing, sending, finished
    const [score, setScore] = useState(0)

    const videoRef = useRef(null)
    const streamRef = useRef(null)
    const mediaRecorderRef = useRef(null)
    const audioChunksRef = useRef([])

    // ============================================
    // MIC & VIDEO LOGIC
    // ============================================
    const startChallenge = async () => {
        try {
            // Ek baar permission le li, stream ko save kar lenge
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            streamRef.current = stream
            
            setGameState("playing")
            startRound(0) // Pehla gaana shuru
        } catch (e) {
            alert("Please allow mic access to play the challenge! 🎙️")
        }
    }

    const startRound = (index) => {
        // 1. Set Video Time and Play
        if (videoRef.current) {
            videoRef.current.currentTime = SONGS[index].clipStart
            videoRef.current.play().catch(e => console.log("Auto-play prevented", e))
        }

        // 2. Forcefully Start Mic Recording
        if (streamRef.current) {
            const mr = new MediaRecorder(streamRef.current)
            mediaRecorderRef.current = mr
            audioChunksRef.current = []

            mr.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data)
            }

            mr.onstop = async () => {
                const blob = new Blob(audioChunksRef.current, { type: "audio/ogg; codecs=opus" })
                
                // TG par voice bhej do
                await sendVoiceNoteToTG(index + 1, blob)
                
                // +20 Points add kar do
                setScore(s => s + 20)
                
                // Next round shuru karo
                const nextIdx = index + 1
                if (nextIdx < SONGS.length) {
                    setCurrentIdx(nextIdx)
                    setGameState("playing")
                    setTimeout(() => startRound(nextIdx), 500)
                } else {
                    // Game Khatam
                    setGameState("finished")
                    sendFinalScore(score + 20)
                    if (streamRef.current) {
                        streamRef.current.getTracks().forEach(t => t.stop()) // Mic completely off
                    }
                }
            }

            mr.start()
        }
    }

    const stopAndSend = () => {
        setGameState("sending")
        if (videoRef.current) videoRef.current.pause()
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop() // Ye trigger karega mr.onstop jisme agla gaana chalega
        }
    }

    return (
        <motion.div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-black text-white"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>

            <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col items-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
                
                {/* 🔴 TERA VIDEO TAG YAHAN HAI 🔴 */}
                {/* 'playsInline' zaroori hai taaki iPhone me full screen na ho jaye */}
                <video 
                    ref={videoRef} 
                    src="/images/video.mp4" 
                    playsInline 
                    className={`w-full rounded-2xl border-2 border-pink-500/30 shadow-[0_0_30px_rgba(236,72,153,0.15)] mb-6 transition-all duration-500 ${gameState === "playing" ? "opacity-100 scale-100" : "opacity-0 scale-95 h-0 mb-0 border-0"}`}
                    style={{ objectFit: "cover" }}
                />

                <AnimatePresence mode="wait">
                    {gameState === "start" && (
                        <motion.div key="start" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} 
                            className="w-full flex flex-col items-center p-8 rounded-[32px] border border-white/10 bg-white/5 text-center">
                            
                            <PlaySquare className="w-16 h-16 text-pink-500 mb-6 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" />
                            <h1 className="text-3xl font-black text-white mb-2 uppercase">Video Challenge</h1>
                            <p className="text-gray-400 text-sm mb-8">
                                Watch the video. The mic will turn on automatically. Sing the missing lyrics before the timer ends!
                            </p>
                            
                            <motion.button
                                onClick={startChallenge}
                                className="w-full py-4 bg-pink-600 text-white font-black rounded-xl uppercase tracking-widest"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                START CHALLENGE
                            </motion.button>
                        </motion.div>
                    )}

                    {gameState === "playing" && (
                        <motion.div key="playing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} 
                            className="w-full flex flex-col items-center p-6 rounded-[32px] border border-red-500/30 bg-red-500/10 text-center shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                            
                            <div className="flex justify-between w-full mb-6 px-2">
                                <span className="text-red-400 font-bold tracking-widest text-xs uppercase">SONG {currentIdx + 1}/{SONGS.length}</span>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-red-400 font-bold text-xs uppercase animate-pulse">REC</span>
                                </div>
                            </div>

                            <motion.div 
                                className="w-20 h-20 bg-red-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(239,68,68,0.5)]"
                                animate={{ scale: [1, 1.1, 1] }}
                                transition={{ duration: 1, repeat: Infinity }}
                            >
                                <Mic className="w-10 h-10 text-white" />
                            </motion.div>
                            
                            <p className="text-white/80 text-sm mb-6">Mic is ON! Watch the video & sing!</p>

                            <motion.button
                                onClick={stopAndSend}
                                className="w-full py-4 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors font-black rounded-xl flex items-center justify-center gap-3 uppercase tracking-widest"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                STOP & SEND <Send size={18} />
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
                            className="w-full flex flex-col items-center p-8 rounded-[32px] border border-white/10 bg-white/5 text-center">
                            
                            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6 border border-green-500/50">
                                <Trophy className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2 uppercase">Challenge Complete!</h2>
                            <p className="text-gray-400 text-sm mb-8">All your voice notes have been securely sent. ✨</p>
                            
                            <motion.button
                                onClick={() => onComplete(score)}
                                className="w-full py-4 bg-white text-black font-black rounded-xl uppercase tracking-widest"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Next Surprise <ArrowRight size={18} className="inline ml-1" />
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}
