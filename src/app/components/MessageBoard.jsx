"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Send, Mic, Square, Play, Pause, Trash2, CheckCircle, Heart, Sparkles, MessageSquare } from "lucide-react"

// TG BOT DETAILS
const BOT_TOKEN = "8673978157:AAFWiYR__xUFb79u9Tfrz-8guCB10sgruX0"
const CHAT_ID = "8745839603"

async function sendTextToTelegram(text) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text: `💌 *Message from Priyanshi:*\n\n"${text}"`, parse_mode: "Markdown" }),
    })
    if (!res.ok) throw new Error("Failed to send message")
}

async function sendAudioToTelegram(audioBlob) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendVoice`
    const formData = new FormData()
    formData.append("chat_id", CHAT_ID)
    formData.append("voice", audioBlob, "priyanshi_voice_note.ogg")
    formData.append("caption", "🎙️ Voice Note from Priyanshi!")
    const res = await fetch(url, { method: "POST", body: formData })
    if (!res.ok) throw new Error("Failed to send audio")
}

export default function MessageBoard() {
    // Text state
    const [message, setMessage] = useState("")
    const [textSent, setTextSent] = useState(false)
    const [textLoading, setTextLoading] = useState(false)
    const [textError, setTextError] = useState("")

    // Audio state
    const [recording, setRecording] = useState(false)
    const [audioBlob, setAudioBlob] = useState(null)
    const [audioUrl, setAudioUrl] = useState(null)
    const [playing, setPlaying] = useState(false)
    const [audioSent, setAudioSent] = useState(false)
    const [audioLoading, setAudioLoading] = useState(false)
    const [audioError, setAudioError] = useState("")
    const [recordTime, setRecordTime] = useState(0)

    const mediaRecorderRef = useRef(null)
    const chunksRef = useRef([])
    const audioRef = useRef(null)
    const timerRef = useRef(null)

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
            if (audioUrl) URL.revokeObjectURL(audioUrl)
        }
    }, [audioUrl])

    const handleSendText = async () => {
        if (!message.trim()) return
        setTextLoading(true)
        setTextError("")
        try {
            await sendTextToTelegram(message.trim())
            setTextSent(true)
            setMessage("")
        } catch {
            setTextError("Oops! Couldn't send. Try again")
        } finally {
            setTextLoading(false)
        }
    }

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const mr = new MediaRecorder(stream)
            mediaRecorderRef.current = mr
            chunksRef.current = []
            mr.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
            mr.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: "audio/ogg; codecs=opus" })
                setAudioBlob(blob)
                setAudioUrl(URL.createObjectURL(blob))
                stream.getTracks().forEach(t => t.stop())
            }
            mr.start()
            setRecording(true)
            setRecordTime(0)
            timerRef.current = setInterval(() => setRecordTime(t => t + 1), 1000)
        } catch {
            setAudioError("Microphone access denied. Please allow mic access.")
        }
    }

    const stopRecording = () => {
        mediaRecorderRef.current?.stop()
        setRecording(false)
        clearInterval(timerRef.current)
    }

    const handlePlayPause = () => {
        if (!audioRef.current) return
        if (playing) {
            audioRef.current.pause()
            setPlaying(false)
        } else {
            audioRef.current.play()
            setPlaying(true)
            audioRef.current.onended = () => setPlaying(false)
        }
    }

    const handleDiscardAudio = () => {
        setAudioBlob(null)
        setAudioUrl(null)
        setPlaying(false)
        setAudioSent(false)
        setAudioError("")
        setRecordTime(0)
    }

    const handleSendAudio = async () => {
        if (!audioBlob) return
        setAudioLoading(true)
        setAudioError("")
        try {
            await sendAudioToTelegram(audioBlob)
            setAudioSent(true)
        } catch {
            setAudioError("Oops! Couldn't send. Try again")
        } finally {
            setAudioLoading(false)
        }
    }

    const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

    // Premium styles
    const cardBg = "neu-card"
    const inputBox = "neu-card-pressed p-4"
    const btnDefault = "neu-button text-[#77537e] font-bold"
    const btnPrimary = "neu-button text-[#973b88] font-bold"
    const circleBtn = "w-14 h-14 neu-image-frame flex items-center justify-center transition-all"

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-aesthetic text-[#77537e] font-sans relative overflow-hidden">
            
            {/* Elegant Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-pink-300/20 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-purple-300/20 blur-[120px] rounded-full" />
                <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-rose-200/30 blur-[100px] rounded-full" />
            </div>

            <div className="relative z-10 w-full max-w-[380px] mx-auto flex flex-col gap-6">

                {/* Header */}
                <motion.div className="text-center mb-2" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                    <h1 className="text-3xl font-bold text-[#973b88] mb-2 tracking-wide drop-shadow"
                        style={{ filter: "drop-shadow(0 0 20px rgba(151,59,136,0.4))" }}>
                        Leave a Note
                    </h1>
                    <p className="text-[#77537e] text-[13px] font-medium tracking-widest uppercase">
                        I&apos;d love to hear from you ✨
                    </p>
                </motion.div>

                {/* TEXT MESSAGE CARD */}
                <motion.div className={`p-6 ${cardBg}`} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
                    <div className="flex items-center gap-3 mb-5">
                        <MessageSquare className="w-5 h-5 text-[#973b88]" />
                        <h2 className="font-bold text-[#973b88] text-[15px] uppercase tracking-widest">
                            Write Something
                        </h2>
                    </div>

                    <AnimatePresence mode="wait">
                        {textSent ? (
                            <motion.div key="sent" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-2 py-6">
                                <CheckCircle className="w-12 h-12 text-[#973b88] mb-2" />
                                <p className="text-[#973b88] font-bold text-lg">Message sent!</p>
                                <p className="text-[#77537e] text-sm mb-4">I&apos;ll read it with a smile.</p>
                                <button onClick={() => setTextSent(false)} className="text-[12px] font-medium text-[#77537e] hover:text-[#973b88] uppercase tracking-widest transition-colors">
                                    Write another?
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your feelings here..."
                                    rows={4}
                                    className={`w-full ${inputBox} mb-5 text-[#77537e] placeholder-[#77537e]/50 focus:outline-none focus:ring-2 focus:ring-[#973b88]/30`}
                                />
                                {textError && <p className="text-red-400 text-xs mb-3 font-medium">{textError}</p>}
                                <button
                                    onClick={handleSendText}
                                    disabled={!message.trim() || textLoading}
                                    className={`w-full py-4 text-[13px] uppercase tracking-[0.12em] flex items-center justify-center gap-2 
                                    ${!message.trim() ? 'opacity-50 cursor-not-allowed ' + btnDefault : btnPrimary}`}
                                >
                                    {textLoading ? <motion.div className="w-4 h-4 border-2 border-[#973b88]/30 border-t-[#973b88] rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} /> : (
                                        <><Send size={16} strokeWidth={2.5} /> Send Message</>
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* AUDIO NOTE CARD */}
                <motion.div className={`p-6 ${cardBg}`} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }}>
                    <div className="flex items-center gap-3 mb-5">
                        <Mic className="w-5 h-5 text-[#973b88]" />
                        <h2 className="font-bold text-[#973b88] text-[15px] uppercase tracking-widest">
                            Voice Note
                        </h2>
                    </div>

                    <AnimatePresence mode="wait">
                        {audioSent ? (
                            <motion.div key="audio-sent" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-2 py-6">
                                <CheckCircle className="w-12 h-12 text-[#973b88] mb-2" />
                                <p className="text-[#973b88] font-bold text-lg">Voice note sent!</p>
                                <p className="text-[#77537e] text-sm mb-4">Hearing your voice is the best gift.</p>
                                <button onClick={handleDiscardAudio} className="text-[12px] font-medium text-[#77537e] hover:text-[#973b88] uppercase tracking-widest transition-colors">
                                    Record another?
                                </button>
                            </motion.div>
                        ) : !audioUrl ? (
                            <motion.div key="record" className="flex flex-col items-center gap-4 py-2">
                                {!recording ? (
                                    <>
                                        <p className="text-[#77537e] text-[13px] font-medium mb-2">Record a message for me</p>
                                        <button onClick={startRecording} className={`${circleBtn} bg-white text-[#973b88] hover:bg-[#f1caeb] active:scale-95`}>
                                            <Mic size={28} strokeWidth={2.5} />
                                        </button>
                                        <p className="text-[#77537e] text-[10px] font-medium uppercase tracking-widest mt-2">Tap to record</p>
                                    </>
                                ) : (
                                    <>
                                        {/* Pink/Purple Waveform */}
                                        <div className="flex items-center gap-1.5 h-12 mb-2">
                                            {Array.from({ length: 12 }).map((_, i) => (
                                                <motion.div key={i} className="w-1.5 rounded-full bg-gradient-to-b from-pink-400 to-purple-400" animate={{ height: [8, 24 + Math.random() * 20, 8] }} transition={{ duration: 0.5 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.05 }} />
                                            ))}
                                        </div>
                                        <p className="text-[#973b88] font-black text-xl mb-2">{formatTime(recordTime)}</p>
                                        
                                        <button onClick={stopRecording} className={`${circleBtn} bg-red-400 text-white hover:bg-red-500 active:scale-95`}>
                                            <Square size={20} fill="currentColor" />
                                        </button>
                                        <p className="text-[#77537e] text-[10px] font-medium uppercase tracking-widest mt-2">Tap to stop</p>
                                    </>
                                )}
                                {audioError && <p className="text-red-400 text-xs mt-2 font-medium">{audioError}</p>}
                            </motion.div>
                        ) : (
                            <motion.div key="preview" className="flex flex-col gap-5 w-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <audio ref={audioRef} src={audioUrl} className="hidden" />

                                {/* Premium Playback UI */}
                                <div className="w-full p-4 rounded-[20px] shadow-inner bg-white flex items-center gap-4">
                                    <button onClick={handlePlayPause} className="w-10 h-10 rounded-full flex items-center justify-center bg-[#973b88] text-white shadow-md active:scale-95 flex-shrink-0">
                                        {playing ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" className="ml-1" />}
                                    </button>
                                    <div className="flex-1">
                                        <div className="h-1.5 bg-[#eecfeb] rounded-full overflow-hidden">
                                            <motion.div className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full" animate={playing ? { width: ["0%", "100%"] } : {}} transition={playing ? { duration: recordTime || 5, ease: "linear" } : {}} />
                                        </div>
                                    </div>
                                    <span className="text-[#77537e] text-[11px] font-bold">{formatTime(recordTime)}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button onClick={handleDiscardAudio} className={`w-14 h-14 rounded-xl flex items-center justify-center bg-white text-red-400 shadow-lg hover:bg-red-50 hover:text-red-500 transition-all`}>
                                        <Trash2 size={20} />
                                    </button>
                                    <button disabled={audioLoading} onClick={handleSendAudio} className={`flex-1 py-4 text-[13px] uppercase tracking-[0.12em] flex items-center justify-center gap-2 ${btnPrimary}`}>
                                        {audioLoading ? <motion.div className="w-4 h-4 border-2 border-[#973b88]/30 border-t-[#973b88] rounded-full" animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }} /> : (
                                            <><Send size={16} strokeWidth={2.5} /> Send Voice</>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Footer */}
                <motion.div className="text-center pb-6 pt-2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                    <p className="text-[#77537e] text-[10px] font-medium tracking-[0.2em] uppercase">
                        Made with <Heart className="inline w-3 h-3 mx-1 text-[#973b88] fill-[#973b88]" /> just for You
                    </p>
                    <p className="text-[#77537e]/60 text-[9px] font-medium tracking-[0.3em] uppercase mt-1">
                        Artist
                    </p>
                </motion.div>
            </div>
        </div>
    )
}
