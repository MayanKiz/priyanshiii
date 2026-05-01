"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    ArrowRight, Trophy, Mic, PlaySquare, Square, Play, Pause, Headphones, RotateCcw, Send, Loader2
} from "lucide-react"

// ⚠️ TUMHARI TG DETAILS
const BOT_TOKEN = "8673978157:AAFWiYR__xUFb79u9Tfrz-8guCB10sgruX0"
const CHAT_ID = "8745839603"

async function sendVoiceNoteToTG(songNo, audioBlob) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendVoice`
    const formData = new FormData()
    formData.append("chat_id", CHAT_ID)
    formData.append("voice", audioBlob, `song_${songNo}.ogg`)
    formData.append("caption", `🎤 Lyrics Challenge - Song ${songNo}\n(Mixed Audio: Phone + Mic)`)
    
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
// TIMESTAMPS (Sirf Start Points)
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
    const [gameState, setGameState] = useState("start") // start, playing, preview, sending, finished
    const [score, setScore] = useState(0)
    const [isVideoPlaying, setIsVideoPlaying] = useState(true)
    
    // Preview States
    const [voiceUrl, setVoiceUrl] = useState(null)
    const [voiceBlob, setVoiceBlob] = useState(null)
    const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)

    // Refs
    const videoRef = useRef(null)
    const previewAudioRef = useRef(null)
    const streamRef = useRef(null)
    const mediaRecorderRef = useRef(null)
    const audioChunksRef = useRef([])
    
    // Web Audio API Refs (For Mixing Audio + Video)
    const audioCtxRef = useRef(null)
    const mixDestRef = useRef(null)
    const micSourceRef = useRef(null)
    const videoSourceRef = useRef(null)
    const analyserRef = useRef(null)
    const reqAnimRef = useRef(null)
    const barRefs = useRef([])

    // ============================================
    // CLEANUP MEMORY (Page Refresh/Close par sab clear)
    // ============================================
    useEffect(() => {
        return () => {
            if (voiceUrl) URL.revokeObjectURL(voiceUrl)
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
            if (reqAnimRef.current) cancelAnimationFrame(reqAnimRef.current)
            if (audioCtxRef.current && audioCtxRef.current.state !== "closed") audioCtxRef.current.close()
        }
    }, [voiceUrl])

    // ============================================
    // AUTO-PAUSE LOGIC (1 Sec pehle)
    // ============================================
    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        const handleTimeUpdate = () => {
            if (gameState !== "playing") return
            const time = video.currentTime
            
            // Agla gaana kab shuru hoga?
            const nextClipStart = currentIdx < SONGS.length - 1 ? SONGS[currentIdx + 1].clipStart : video.duration || 9999
            // Stop time = agle gaane se 1 second pehle
            const stopTime = nextClipStart - 1

            if (time >= stopTime) {
                stopRecording() // Auto stop and go to preview
            }
        }

        video.addEventListener("timeupdate", handleTimeUpdate)
        return () => video.removeEventListener("timeupdate", handleTimeUpdate)
    }, [currentIdx, gameState])

    // ============================================
    // START CHALLENGE & MIXER SETUP
    // ============================================
    const startChallenge = async () => {
        try {
            // Echo cancellation false rakha hai taaki internal audio daba na de
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } 
            })
            streamRef.current = stream

            // Initialize Virtual Audio Mixer (Web Audio API)
            if (!audioCtxRef.current) {
                const AudioContext = window.AudioContext || window.webkitAudioContext
                if (AudioContext) {
                    try {
                        const ctx = new AudioContext()
                        audioCtxRef.current = ctx
                        const dest = ctx.createMediaStreamDestination()
                        mixDestRef.current = dest

                        // 1. Connect Video Audio to Mixer AND Speaker
                        if (videoRef.current) {
                            videoRef.current.crossOrigin = "anonymous"
                            videoSourceRef.current = ctx.createMediaElementSource(videoRef.current)
                            videoSourceRef.current.connect(ctx.destination) // To hear it
                            videoSourceRef.current.connect(dest) // To record it
                        }
                    } catch (e) { console.log("Mixer setup failed, using raw mic", e) }
                }
            }

            // Start AudioContext if suspended
            if (audioCtxRef.current?.state === "suspended") {
                await audioCtxRef.current.resume()
            }

            setScore(0)
            setCurrentIdx(0)
            startRound(0)
        } catch (e) {
            alert("Please allow mic access to play! 🎙️")
        }
    }

    const startRound = (index) => {
        if (voiceUrl) URL.revokeObjectURL(voiceUrl)
        setVoiceUrl(null)
        setVoiceBlob(null)
        setIsPreviewPlaying(false)

        if (videoRef.current) {
            videoRef.current.currentTime = SONGS[index].clipStart
            videoRef.current.play().catch(e => console.log("Play prevented", e))
            setIsVideoPlaying(true)
        }

        // Connect Mic to Mixer for this round
        if (audioCtxRef.current && streamRef.current && mixDestRef.current) {
            if (micSourceRef.current) micSourceRef.current.disconnect()
            micSourceRef.current = audioCtxRef.current.createMediaStreamSource(streamRef.current)
            micSourceRef.current.connect(mixDestRef.current)

            // Setup visualizer
            const analyser = audioCtxRef.current.createAnalyser()
            analyser.fftSize = 64
            micSourceRef.current.connect(analyser)
            analyserRef.current = analyser
            drawVisualizer()
        }

        // Record the Mixed Stream (or raw mic as fallback)
        const finalStreamToRecord = mixDestRef.current ? mixDestRef.current.stream : streamRef.current
        const mr = new MediaRecorder(finalStreamToRecord)
        mediaRecorderRef.current = mr
        audioChunksRef.current = []

        mr.ondataavailable = (e) => {
            if (e.data.size > 0) audioChunksRef.current.push(e.data)
        }

        mr.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: "audio/ogg; codecs=opus" })
            setVoiceBlob(blob)
            setVoiceUrl(URL.createObjectURL(blob))
            setGameState("preview")
            if (reqAnimRef.current) cancelAnimationFrame(reqAnimRef.current)
        }

        mr.start()
        setGameState("playing")
    }

    // ============================================
    // CONTROLS & NAVIGATION
    // ============================================
    const toggleVideoPlay = () => {
        if (!videoRef.current) return
        if (isVideoPlaying) {
            videoRef.current.pause()
            setIsVideoPlaying(false)
        } else {
            videoRef.current.play()
            setIsVideoPlaying(true)
        }
    }

    const stopRecording = () => {
        if (videoRef.current) videoRef.current.pause()
        setIsVideoPlaying(false)
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
            mediaRecorderRef.current.stop() // Triggers go to preview
        }
    }

    const resetGame = () => {
        stopRecording()
        setScore(0)
        setCurrentIdx(0)
        setGameState("start")
    }

    const handleSendAndNext = async () => {
        if (isPreviewPlaying && previewAudioRef.current) previewAudioRef.current.pause()
        
        setGameState("sending")
        await sendVoiceNoteToTG(currentIdx + 1, voiceBlob)
        setScore(s => s + 20)
        
        setTimeout(() => {
            const nextIdx = currentIdx + 1
            if (nextIdx < SONGS.length) {
                setCurrentIdx(nextIdx)
                startRound(nextIdx) // NEXT SONG PAR RECORDER WAPAS AAYEGA
            } else {
                setGameState("finished")
                sendFinalScore(score + 20)
                if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
            }
        }, 1000)
    }

    // WhatsApp Style Visualizer
    const drawVisualizer = () => {
        if (!analyserRef.current) return
        reqAnimRef.current = requestAnimationFrame(drawVisualizer)
        
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)

        for (let i = 0; i < 15; i++) {
            if (barRefs.current[i]) {
                const value = dataArray[i + 2] || 0 
                const percent = Math.max(15, (value / 255) * 100) 
                barRefs.current[i].style.height = `${percent}%`
            }
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

    return (
        <motion.div className="min-h-screen flex flex-col items-center justify-center p-4 relative bg-black text-white"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>

            <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col items-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
                
                {/* 🔴 TERA VIDEO TAG (crossOrigin is important for mixer) 🔴 */}
                <video 
                    ref={videoRef} 
                    src="/images/video.mp4" 
                    playsInline 
                    crossOrigin="anonymous"
                    className={`w-full rounded-3xl border-2 shadow-[0_0_30px_rgba(236,72,153,0.15)] mb-6 transition-all duration-500 ${gameState !== "start" && gameState !== "finished" ? "opacity-100 scale-100 border-pink-500/50" : "opacity-0 scale-95 h-0 mb-0 border-transparent"}`}
                    style={{ objectFit: "cover" }}
                />

                {/* CONTROLS BAR (Play/Pause & Reset) */}
                {gameState === "playing" && (
                    <div className="flex w-full justify-between items-center mb-4 px-2">
                        <button onClick={resetGame} className="flex items-center gap-1 text-[10px] text-gray-400 hover:text-white uppercase font-bold tracking-widest">
                            <RotateCcw size={12} /> Reset Game
                        </button>
                        <button onClick={toggleVideoPlay} className="flex items-center gap-1 text-[10px] bg-white/10 px-3 py-1.5 rounded-full text-white uppercase font-bold tracking-widest border border-white/20">
                            {isVideoPlaying ? <><Pause size={12} /> Pause Video</> : <><Play size={12} /> Play Video</>}
                        </button>
                    </div>
                )}

                <AnimatePresence mode="wait">
                    {gameState === "start" && (
                        <motion.div key="start" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} 
                            className="w-full flex flex-col items-center p-8 rounded-[32px] border border-white/10 bg-white/5 text-center shadow-2xl">
                            
                            <PlaySquare className="w-16 h-16 text-pink-500 mb-6 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]" />
                            <h1 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Sing Along</h1>
                            <p className="text-gray-400 text-sm mb-8">
                                We will mix the video audio with your beautiful voice. Sing the missing lyrics before the timer ends!
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

                            {/* 🌊 REAL-TIME VOICE VISUALIZER 🌊 */}
                            <div className="flex items-end justify-center gap-1.5 h-16 mb-6 w-full">
                                {[...Array(15)].map((_, i) => (
                                    <div
                                        key={i}
                                        ref={el => barRefs.current[i] = el}
                                        className="w-1.5 bg-red-400 rounded-full transition-all duration-75"
                                        style={{ height: '15%' }} 
                                    />
                                ))}
                            </div>
                            
                            <p className="text-white font-bold text-xs mb-6 bg-black/40 px-4 py-2 rounded-lg border border-white/10 uppercase tracking-wider">
                                Wait for the video timer!
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
                            <h2 className="text-xl font-black text-white mb-2 uppercase tracking-widest">Your Masterpiece!</h2>
                            <p className="text-blue-200/70 text-xs mb-6">Listen to your singing. Sounds great, right?</p>
                            
                            {/* HIDDEN AUDIO FOR PREVIEW */}
                            {voiceUrl && <audio ref={previewAudioRef} src={voiceUrl} />}

                            <div className="w-full bg-black/40 rounded-2xl p-4 flex items-center gap-4 border border-white/10 mb-8 shadow-inner">
                                <motion.button
                                    onClick={togglePreviewPlay}
                                    className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center shrink-0 shadow-lg"
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {isPreviewPlaying ? <Pause fill="currentColor" size={20} /> : <Play fill="currentColor" size={20} className="ml-1" />}
                                </motion.button>
                                
                                {/* Static wave for preview UI */}
                                <div className="flex-1 flex items-center gap-1 h-8 opacity-60">
                                    {[...Array(12)].map((_, i) => (
                                        <div key={i} className="w-1.5 bg-blue-300 rounded-full" style={{ height: `${Math.random() * 60 + 20}%` }} />
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-3 w-full">
                                <motion.button
                                    onClick={() => startRound(currentIdx)} // RETAKE
                                    className="flex-1 py-4 bg-white/10 text-white font-black rounded-xl flex items-center justify-center gap-2 uppercase text-xs tracking-wider"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <RotateCcw size={16} /> RETAKE
                                </motion.button>
                                <motion.button
                                    onClick={handleSendAndNext} // SEND & NEXT
                                    className="flex-1 py-4 bg-blue-600 text-white font-black rounded-xl flex items-center justify-center gap-2 uppercase text-xs tracking-wider shadow-lg shadow-blue-500/30"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    SEND <Send size={16} />
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {gameState === "sending" && (
                        <motion.div key="sending" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} 
                            className="w-full flex flex-col items-center py-20 bg-white/5 rounded-[32px] border border-white/10">
                            
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}>
                                <Loader2 className="w-16 h-16 text-indigo-400 mb-6" />
                            </motion.div>
                            <p className="text-indigo-300 font-bold tracking-widest text-lg">PREPARING NEXT SONG...</p>
                        </motion.div>
                    )}

                    {gameState === "finished" && (
                        <motion.div key="finished" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} 
                            className="w-full flex flex-col items-center p-8 rounded-[32px] border border-white/10 bg-white/5 text-center shadow-2xl">
                            
                            <div className="w-24 h-24 rounded-full bg-green-500/20 flex items-center justify-center mb-6 border border-green-500/50">
                                <Trophy className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-3xl font-black text-white mb-2 uppercase">Challenge Complete!</h2>
                            <p className="text-gray-400 text-sm mb-8">All your mixed voice notes have been sent. ✨</p>
                            
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
