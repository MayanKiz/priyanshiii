"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Send, Mic, Square, Play, Pause, Trash2, CheckCircle, Heart, Sparkles } from "lucide-react"

// ⚠️ IMPORTANT: Revoke and replace your bot token at t.me/BotFather if exposed publicly
const BOT_TOKEN = "8673978157:AAFWiYR__xUFb79u9Tfrz-8guCB10sgruX0"
const CHAT_ID = "8745839603"

async function sendTextToTelegram(text) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`
    const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: CHAT_ID, text: `💌 <b>Birthday Message from Priyanshi:</b>\n\n${text}`, parse_mode: "HTML" }),
    })
    if (!res.ok) throw new Error("Failed to send message")
}

async function sendAudioToTelegram(audioBlob) {
    const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendVoice`
    const formData = new FormData()
    formData.append("chat_id", CHAT_ID)
    formData.append("voice", audioBlob, "birthday_voice_note.ogg")
    formData.append("caption", "🎙️ Birthday Voice Note from Priyanshi!")
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
            setTextError("Oops! Couldn't send. Try again 💔")
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
            setAudioError("Oops! Couldn't send. Try again 💔")
        } finally {
            setAudioLoading(false)
        }
    }

    const formatTime = (s) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`

    return (
        <motion.div
            className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
        >
            {/* YAHAN FONT IMPORT KIYA HAI */}
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');`}</style>

            {/* Background glow */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    className="absolute w-96 h-96 rounded-full blur-3xl"
                    style={{ background: "radial-gradient(circle, rgba(236,72,153,0.12), transparent)", top: "5%", right: "10%" }}
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 7, repeat: Infinity }}
                />
                <motion.div
                    className="absolute w-80 h-80 rounded-full blur-3xl"
                    style={{ background: "radial-gradient(circle, rgba(139,92,246,0.12), transparent)", bottom: "10%", left: "5%" }}
                    animate={{ scale: [1.3, 1, 1.3] }}
                    transition={{ duration: 8, repeat: Infinity, delay: 2 }}
                />
            </div>

            {/* Floating emojis */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {["💌", "🎙️", "💕", "✨", "🌸", "💜"].map((e, i) => (
                    <motion.div
                        key={i}
                        className="absolute text-base select-none"
                        style={{ left: `${(i * 19 + 7) % 95}%`, top: `${(i * 31 + 5) % 80}%` }}
                        animate={{ y: [0, -15, 0], opacity: [0.15, 0.5, 0.15] }}
                        transition={{ duration: 4 + i, repeat: Infinity, delay: i * 0.6 }}
                    >
                        {e}
                    </motion.div>
                ))}
            </div>

            <div className="relative z-10 w-full max-w-sm mx-auto flex flex-col gap-5">

                {/* Header */}
                <motion.div
                    className="text-center"
                    initial={{ y: -30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    <motion.div
                        className="text-5xl mb-3 select-none"
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        💬
                    </motion.div>
                    <h1
                        className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 mb-2"
                        style={{ fontFamily: "'Nunito', sans-serif", filter: "drop-shadow(0 0 20px rgba(168,85,247,0.4))" }}
                    >
                        Leave a Message
                    </h1>
                    <p className="text-purple-300 text-sm" style={{ fontFamily: "'Nunito', sans-serif" }}>
                        Send your wishes to Mayank 💌
                    </p>
                </motion.div>

                {/* ── TEXT MESSAGE CARD ── */}
                <motion.div
                    className="rounded-3xl border-2 border-pink-500/30 p-6 shadow-2xl"
                    style={{ background: "rgba(15,5,30,0.85)", backdropFilter: "blur(16px)" }}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-pink-500 to-purple-500 flex items-center justify-center">
                            <Send className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="font-bold text-white text-lg" style={{ fontFamily: "'Nunito', sans-serif" }}>
                            Text Message
                        </h2>
                    </div>

                    <AnimatePresence mode="wait">
                        {textSent ? (
                            <motion.div
                                key="sent"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center gap-2 py-4"
                            >
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                                    <CheckCircle className="w-12 h-12 text-green-400" />
                                </motion.div>
                                <p className="text-green-400 font-semibold text-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
                                    Message sent! 🎉
                                </p>
                                <p className="text-gray-400 text-sm text-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
                                    He'll love it 💕
                                </p>
                                <button
                                    onClick={() => setTextSent(false)}
                                    className="mt-2 text-pink-400 text-sm underline"
                                    style={{ fontFamily: "'Nunito', sans-serif" }}
                                >
                                    Send another?
                                </button>
                            </motion.div>
                        ) : (
                            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Write your reaction here... 🎂"
                                    rows={4}
                                    className="w-full bg-white/5 border border-pink-500/20 rounded-2xl px-4 py-3 text-white placeholder-gray-500 resize-none outline-none focus:border-pink-500/60 transition-all text-sm"
                                    style={{ fontFamily: "'Nunito', sans-serif" }}
                                />
                                {textError && (
                                    <p className="text-red-400 text-xs mt-1" style={{ fontFamily: "'Nunito', sans-serif" }}>{textError}</p>
                                )}
                                <button
                                    onClick={handleSendText}
                                    disabled={!message.trim() || textLoading}
                                    className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold shadow-lg hover:scale-[1.02] transition-all disabled:opacity-40 disabled:scale-100"
                                    style={{ fontFamily: "'Nunito', sans-serif" }}
                                >
                                    {textLoading ? (
                                        <motion.div
                                            className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                        />
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Send Message
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* ── AUDIO NOTE CARD ── */}
                <motion.div
                    className="rounded-3xl border-2 border-purple-500/30 p-6 shadow-2xl"
                    style={{ background: "rgba(15,5,30,0.85)", backdropFilter: "blur(16px)" }}
                    initial={{ y: 30, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                            <Mic className="w-4 h-4 text-white" />
                        </div>
                        <h2 className="font-bold text-white text-lg" style={{ fontFamily: "'Nunito', sans-serif" }}>
                            Voice Note
                        </h2>
                    </div>

                    <AnimatePresence mode="wait">
                        {audioSent ? (
                            <motion.div
                                key="audio-sent"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center gap-2 py-4"
                            >
                                <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                                    <CheckCircle className="w-12 h-12 text-green-400" />
                                </motion.div>
                                <p className="text-green-400 font-semibold text-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
                                    Voice note sent! 🎙️
                                </p>
                                <p className="text-gray-400 text-sm text-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
                                    He'll be so happy to hear you 💜
                                </p>
                                <button
                                    onClick={handleDiscardAudio}
                                    className="mt-2 text-purple-400 text-sm underline"
                                    style={{ fontFamily: "'Nunito', sans-serif" }}
                                >
                                    Record another?
                                </button>
                            </motion.div>
                        ) : !audioUrl ? (
                            <motion.div key="record" className="flex flex-col items-center gap-4">
                                {!recording ? (
                                    <>
                                        <p className="text-gray-400 text-sm text-center" style={{ fontFamily: "'Nunito', sans-serif" }}>
                                            Record a voice message for Mayank 🎙️
                                        </p>
                                        <motion.button
                                            onClick={startRecording}
                                            className="w-20 h-20 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl"
                                            whileHover={{ scale: 1.08 }}
                                            whileTap={{ scale: 0.95 }}
                                            animate={{ boxShadow: ["0 0 0px rgba(168,85,247,0.4)", "0 0 30px rgba(168,85,247,0.7)", "0 0 0px rgba(168,85,247,0.4)"] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        >
                                            <Mic className="w-8 h-8 text-white" />
                                        </motion.button>
                                        <p className="text-purple-300 text-xs" style={{ fontFamily: "'Nunito', sans-serif" }}>
                                            Tap to start recording
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        {/* Recording waveform */}
                                        <div className="flex items-center gap-1 h-10">
                                            {Array.from({ length: 16 }).map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    className="w-1.5 rounded-full bg-gradient-to-t from-pink-500 to-purple-400"
                                                    animate={{ height: [6, 20 + Math.random() * 20, 6] }}
                                                    transition={{ duration: 0.5 + Math.random() * 0.3, repeat: Infinity, delay: i * 0.05 }}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-pink-400 font-bold text-lg" style={{ fontFamily: "'Nunito', sans-serif" }}>
                                            {formatTime(recordTime)}
                                        </p>
                                        <motion.button
                                            onClick={stopRecording}
                                            className="w-16 h-16 rounded-full bg-gradient-to-r from-red-500 to-rose-500 flex items-center justify-center shadow-xl"
                                            whileHover={{ scale: 1.08 }}
                                            whileTap={{ scale: 0.95 }}
                                            animate={{ scale: [1, 1.05, 1] }}
                                            transition={{ duration: 0.8, repeat: Infinity }}
                                        >
                                            <Square className="w-6 h-6 text-white fill-current" />
                                        </motion.button>
                                        <p className="text-gray-400 text-xs" style={{ fontFamily: "'Nunito', sans-serif" }}>
                                            Tap to stop
                                        </p>
                                    </>
                                )}
                                {audioError && (
                                    <p className="text-red-400 text-xs text-center" style={{ fontFamily: "'Nunito', sans-serif" }}>{audioError}</p>
                                )}
                            </motion.div>
                        ) : (
                            <motion.div key="preview" className="flex flex-col items-center gap-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <audio ref={audioRef} src={audioUrl} className="hidden" />

                                {/* Playback UI */}
                                <div className="w-full bg-white/5 rounded-2xl p-4 flex items-center gap-4">
                                    <button
                                        onClick={handlePlayPause}
                                        className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center shadow-lg flex-shrink-0"
                                    >
                                        {playing ? <Pause className="w-5 h-5 text-white" /> : <Play className="w-5 h-5 text-white ml-0.5" />}
                                    </button>
                                    <div className="flex-1">
                                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                                                animate={playing ? { width: ["0%", "100%"] } : {}}
                                                transition={playing ? { duration: recordTime || 5, ease: "linear" } : {}}
                                            />
                                        </div>
                                        <p className="text-gray-400 text-xs mt-1" style={{ fontFamily: "'Nunito', sans-serif" }}>
                                            {formatTime(recordTime)} recorded
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleDiscardAudio}
                                        className="text-red-400 hover:text-red-300 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>

                                {audioError && (
                                    <p className="text-red-400 text-xs text-center" style={{ fontFamily: "'Nunito', sans-serif" }}>{audioError}</p>
                                )}

                                <button
                                    onClick={handleSendAudio}
                                    disabled={audioLoading}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-bold shadow-lg hover:scale-[1.02] transition-all disabled:opacity-40 disabled:scale-100"
                                    style={{ fontFamily: "'Nunito', sans-serif" }}
                                >
                                    {audioLoading ? (
                                        <motion.div
                                            className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full"
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                                        />
                                    ) : (
                                        <>
                                            <Send className="w-4 h-4" />
                                            Send Voice Note
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Footer */}
                <motion.div
                    className="text-center pb-4"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    <motion.p
                        className="text-purple-400 text-sm"
                        style={{ fontFamily: "'Nunito', sans-serif" }}
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 3, repeat: Infinity }}
                    >
                        Made with 💕 just for You ARTIST 🎨 💐
                    </motion.p>
                </motion.div>
            </div>
        </motion.div>
    )
}
