// ============================================
// COMPLETE LYRICS GAME WITH VOICE RECORDING
// ============================================
function LyricsGame({ onScore }) {
    const [selectedSongs] = useState(() => [...songsData].sort(() => 0.5 - Math.random()).slice(0, 5))
    const [currentIdx, setCurrentIdx] = useState(0)
    const [gameState, setGameState] = useState("idle")
    const [userText, setUserText] = useState("")  // Text answer (optional)
    const [isRecording, setIsRecording] = useState(false)
    const [recordedBlob, setRecordedBlob] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [inputMethod, setInputMethod] = useState("")
    const mediaRecorderRef = useRef(null)
    const audioChunksRef = useRef([])
    const audioRef = useRef(null)
    const recognitionRef = useRef(null)

    // Speech-to-Text for fallback
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition()
            recognitionRef.current.lang = 'hi-IN'
            recognitionRef.current.continuous = false
            recognitionRef.current.onresult = (e) => {
                const transcript = e.results[0][0].transcript
                setUserText(transcript)
                setInputMethod("🎙️ Speech-to-Text")
                setIsRecording(false)
            }
            recognitionRef.current.onerror = () => setIsRecording(false)
            recognitionRef.current.onend = () => setIsRecording(false)
        }
    }, [])

    // Start Voice Recording (Audio file)
    const startVoiceRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            mediaRecorderRef.current = new MediaRecorder(stream)
            audioChunksRef.current = []

            mediaRecorderRef.current.ondataavailable = (event) => {
                audioChunksRef.current.push(event.data)
            }

            mediaRecorderRef.current.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
                setRecordedBlob(audioBlob)
                setInputMethod("🎤 Voice Recording")
                setIsRecording(false)
                
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop())
            }

            mediaRecorderRef.current.start()
            setIsRecording(true)
            
            // Auto stop after 10 seconds
            setTimeout(() => {
                if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                    mediaRecorderRef.current.stop()
                }
            }, 10000)
        } catch (err) {
            console.error("Microphone error:", err)
            alert("Microphone access denied. Please type your answer.")
        }
    }

    const stopVoiceRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
            mediaRecorderRef.current.stop()
        }
    }

    const toggleMicText = () => {
        if (!recognitionRef.current) {
            alert("Speech recognition not supported. Please type!")
            return
        }
        if (isRecording) {
            recognitionRef.current.stop()
            setIsRecording(false)
        } else {
            setUserText("")
            setInputMethod("🎙️ Speech-to-Text")
            recognitionRef.current.start()
            setIsRecording(true)
        }
    }

    const handleTextChange = (e) => {
        setUserText(e.target.value)
        setInputMethod("⌨️ Typed")
    }

    // Send voice file to Telegram
    const sendVoiceToTelegram = async (blob, songNo, expectedAnswer, userAnswerText) => {
        const formData = new FormData()
        formData.append("chat_id", CHAT_ID)
        formData.append("voice", blob, `song_${songNo}_answer.webm`)
        formData.append("caption", `🎤 LYRICS CHALLENGE - Song ${songNo}\n\n📝 Real Lyrics: ${expectedAnswer}\n🗣️ She said: ${userAnswerText || "[Voice Note]"} \n💜 Voice recording attached!`)

        try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendVoice`, {
                method: "POST",
                body: formData
            })
        } catch (err) {
            console.log("Failed to send voice:", err)
            // Fallback: send without voice
            await sendLyricsAnswer(songNo, expectedAnswer, userAnswerText, inputMethod)
        }
    }

    // Send text answer (fallback)
    const sendLyricsAnswer = async (songNo, expectedAnswer, userAnswer, method) => {
        const message = `🎤 LYRICS CHALLENGE - Song ${songNo}\n\n📝 Real Lyrics: ${expectedAnswer}\n🗣️ She said: ${userAnswer || "[No answer]"}\n🎙️ Input Method: ${method}\n\n💜 Recorded!`
        try {
            await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: CHAT_ID, text: message, parse_mode: "Markdown" }),
            })
        } catch { }
    }

    // Submit answer
    const submitAnswer = async () => {
        if (isRecording) {
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                mediaRecorderRef.current.stop()
            }
            if (recognitionRef.current) {
                recognitionRef.current.stop()
            }
            setIsRecording(false)
            return
        }

        setUploading(true)
        const currentSong = selectedSongs[currentIdx]
        
        // If voice recording exists, send that
        if (recordedBlob) {
            await sendVoiceToTelegram(recordedBlob, currentIdx + 1, currentSong.answer, userText)
            setRecordedBlob(null)
        } else {
            // Otherwise send text
            await sendLyricsAnswer(currentIdx + 1, currentSong.answer, userText, inputMethod || "⌨️ Typed")
        }
        
        setGameState("revealing")
        setUploading(false)
        sfx.correct()
    }

    const startGame = () => {
        setGameState("playing")
        audioRef.current.currentTime = selectedSongs[0].songStart
        audioRef.current.play()
    }

    const nextSong = () => {
        if (currentIdx < selectedSongs.length - 1) {
            setCurrentIdx(prev => prev + 1)
            setUserText("")
            setRecordedBlob(null)
            setInputMethod("")
            setGameState("playing")
            setTimeout(() => {
                audioRef.current.currentTime = selectedSongs[currentIdx + 1].songStart
                audioRef.current.play()
            }, 100)
        } else {
            setGameState("finished")
            sfx.win()
            sendScore("Lyrics Challenge", 0)
            onScore(0)
        }
    }

    // Audio time update
    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const handleTimeUpdate = () => {
            if (gameState === "playing" && audio.currentTime >= selectedSongs[currentIdx]?.pausePoint) {
                audio.pause()
                setGameState("answering")
            }
        }
        audio.addEventListener("timeupdate", handleTimeUpdate)
        return () => audio.removeEventListener("timeupdate", handleTimeUpdate)
    }, [currentIdx, gameState, selectedSongs])

    if (gameState === "finished") {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-3 w-full">
                <p className="text-white font-bold text-xl">🎤 Challenge Complete!</p>
                <p className="text-purple-300 text-sm">Voice notes have been sent to Telegram ✨</p>
                <button onClick={() => window.location.reload()} className="mt-2 text-pink-400 text-sm underline">Play Again</button>
            </motion.div>
        )
    }

    return (
        <motion.div className="flex flex-col items-center gap-4 w-full max-w-sm">
            <audio ref={audioRef} src="/guesssssss.mp3" />
            
            <div className="w-full flex justify-between text-xs">
                <span className="text-purple-400">🎤 Finish the Lyrics</span>
                <span className="text-purple-400">Song {currentIdx + 1}/{selectedSongs.length}</span>
            </div>

            <div className="w-full rounded-2xl p-5 text-center backdrop-blur-sm" style={{ background: "rgba(15,5,30,0.7)", border: "1px solid rgba(139,92,246,0.3)" }}>
                
                <AnimatePresence mode="wait">
                    {gameState === "idle" && (
                        <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Play className="w-8 h-8 text-pink-400 ml-1" />
                            </div>
                            <p className="text-white text-sm mb-4">🎵 Listen and complete the lyrics!</p>
                            <button onClick={startGame} className="py-2 px-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white font-bold">START</button>
                        </motion.div>
                    )}

                    {gameState === "playing" && (
                        <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 3, repeat: Infinity }}>
                                <div className="w-20 h-20 rounded-full border-2 border-dashed border-pink-400 flex items-center justify-center mx-auto mb-4">
                                    <Music2 className="w-8 h-8 text-pink-400" />
                                </div>
                            </motion.div>
                            <p className="text-pink-300 font-bold animate-pulse">Playing...</p>
                        </motion.div>
                    )}

                    {gameState === "answering" && (
                        <motion.div key="answering" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                            <p className="text-white font-bold mb-3">Complete the Lyrics!</p>
                            
                            <div className="flex gap-2 mb-3">
                                <input 
                                    type="text" 
                                    value={userText} 
                                    onChange={handleTextChange}
                                    placeholder="Type or speak..."
                                    className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white text-sm outline-none focus:border-pink-500"
                                />
                                <button onClick={toggleMicText} className={`w-10 h-10 rounded-full shrink-0 ${isRecording && !recordedBlob ? 'bg-red-500 animate-pulse' : 'bg-purple-500'}`}>
                                    {isRecording && !recordedBlob ? <MicOff size={16} color="#fff" /> : <Mic size={16} color="#fff" />}
                                </button>
                            </div>

                            <div className="flex gap-2">
                                <button onClick={startVoiceRecording} disabled={isRecording || recordedBlob} className="flex-1 py-2 bg-purple-500/40 rounded-full text-white text-sm">
                                    🎤 Record Voice
                                </button>
                                {recordedBlob && (
                                    <button onClick={submitAnswer} disabled={uploading} className="flex-1 py-2 bg-green-500 rounded-full text-white font-bold">
                                        {uploading ? "Sending..." : "Submit ✓"}
                                    </button>
                                )}
                                {!recordedBlob && userText && (
                                    <button onClick={submitAnswer} disabled={uploading} className="flex-1 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white font-bold">
                                        Submit
                                    </button>
                                )}
                            </div>

                            {recordedBlob && (
                                <div className="mt-2">
                                    <audio controls src={URL.createObjectURL(recordedBlob)} className="w-full h-10 mt-2" />
                                    <button onClick={() => setRecordedBlob(null)} className="text-xs text-red-400 mt-1">✗ Remove & Re-record</button>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {gameState === "revealing" && (
                        <motion.div key="revealing" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                            <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                            <p className="text-purple-300 text-sm mb-3">Sent to Telegram!</p>
                            <button onClick={nextSong} className="py-2 px-6 border border-white/20 rounded-full text-white font-bold">
                                NEXT SONG
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}