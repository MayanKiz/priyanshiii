"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, RotateCcw, Trophy, ChevronRight, Brain, Music2, Palette, Sparkles, Heart, Star, Moon, Droplet, Zap, Gem, Flame, Sun, Play, Mic, MicOff, CheckCircle, Send } from "lucide-react"

// ⚠️ TUMHARI DETAILS
const BOT_TOKEN = "8673978157:AAFWiYR__xUFb79u9Tfrz-8guCB10sgruX0"
const CHAT_ID = "8745839603"

async function sendScore(gameName, score) {
    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: CHAT_ID, text: `🎮 ${gameName}\n🏆 Final Score: ${score}` }),
        })
    } catch { }
}

// Ye naya function hai jo har answer tumhare TG par bhejega
async function sendAnswerToTG(songNo, expected, actual, isCorrect) {
    const text = `🎤 <b>Lyrics Challenge - Song ${songNo}</b>\n\n🎯 <b>Real Answer:</b> ${expected}\n🗣️ <b>She Answered:</b> ${actual || "[Kuch nahi bola/likha]"}\n\n${isCorrect ? "✅ Correct Guess!" : "❌ Wrong Guess!"}`
    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: CHAT_ID, text, parse_mode: "HTML" }),
        })
    } catch { }
}

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
    flip: () => playTone(440, 0.08, "sine", 0.12),
    match: () => { [523, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 0.15, "sine", 0.2), i * 100)) },
    wrong: () => playTone(180, 0.25, "sawtooth", 0.15),
    correct: () => { playTone(880, 0.1, "sine", 0.18); setTimeout(() => playTone(1108, 0.15, "sine", 0.18), 80) },
    win: () => { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => playTone(f, 0.22, "sine", 0.22), i * 100)) },
    tick: () => playTone(660, 0.04, "square", 0.06),
}

function vibrate() { if (navigator?.vibrate) navigator.vibrate([60, 30, 60]) }

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
// NEW SONG GUESS GAME (FINISH THE LYRICS)
// ============================================
const songsData = [
    { id: 1, songStart: 12, pausePoint: 10, answerReveal: 15, answer: "यूं मुस्कुराए" },
    { id: 2, songStart: 16, pausePoint: 17, answerReveal: 22, answer: "तुमने ना जाने क्या सपने" },
    { id: 3, songStart: 28, pausePoint: 25, answerReveal: 30, answer: "यारा मैं क्या करूं?" },
    { id: 4, songStart: 42, pausePoint: 46, answerReveal: 51, answer: "दिल में कहीं तुम छुपा लो" },
    { id: 5, songStart: 57, pausePoint: 56, answerReveal: 61, answer: "तू मीठे घाट का पानी" },
    { id: 6, songStart: 113, pausePoint: 117, answerReveal: 122, answer: "नया प्यार है, नया इंतजार" },
    { id: 7, songStart: 128, pausePoint: 135, answerReveal: 140, answer: "अब तुम ही हो" },
    { id: 8, songStart: 144, pausePoint: 148, answerReveal: 153, answer: "प्यार होता है दीवाना सनम" },
    { id: 9, songStart: 159, pausePoint: 197, answerReveal: 202, answer: "एक पल" },
    { id: 10, songStart: 208, pausePoint: 209, answerReveal: 214, answer: "तुम चाह कायनात में नहीं है कहीं" },
    { id: 11, songStart: 230, pausePoint: 232, answerReveal: 237, answer: "अजब सी अजब सी अदाएं हैं" },
    { id: 12, songStart: 243, pausePoint: 247, answerReveal: 252, answer: "नजर नहीं चुराना सनम" },
    { id: 13, songStart: 258, pausePoint: 302, answerReveal: 307, answer: "जरा सा अपना ले बना" },
    { id: 14, songStart: 314, pausePoint: 318, answerReveal: 323, answer: "पहली दफा है बल्ला" },
    { id: 15, songStart: 329, pausePoint: 328, answerReveal: 333, answer: "लब से आ मन्नत पूरी तुमसे ही" },
    { id: 16, songStart: 344, pausePoint: 347, answerReveal: 352, answer: "मेरी बातों में तू है" },
    { id: 17, songStart: 358, pausePoint: 397, answerReveal: 402, answer: "बस आया हूं तेरे पास रे" },
    { id: 18, songStart: 413, pausePoint: 418, answerReveal: 423, answer: "पहले से ज्यादा तू पे मरने" },
    { id: 19, songStart: 428, pausePoint: 433, answerReveal: 438, answer: "छांव है कभी कभी है धूप" },
    { id: 20, songStart: 444, pausePoint: 449, answerReveal: 454, answer: "ती है" },
    { id: 21, songStart: 459, pausePoint: 458, answerReveal: 503, answer: "ये मीना रे" },
    { id: 22, songStart: 514, pausePoint: 518, answerReveal: 523, answer: "चांद जलने लगा" },
    { id: 23, songStart: 529, pausePoint: 534, answerReveal: 539, answer: "शाम आती है" },
    { id: 24, songStart: 545, pausePoint: 548, answerReveal: 553, answer: "तो मैं आ गया" },
    { id: 25, songStart: 559, pausePoint: 556, answerReveal: 601, answer: "माया" },
    { id: 26, songStart: 608, pausePoint: 609, answerReveal: 614, answer: "मोह मोह के धागे" },
    { id: 27, songStart: 623, pausePoint: 624, answerReveal: 629, answer: "तुमसे मिलके दिल का है जो हाल क्या कहें" },
    { id: 28, songStart: 639, pausePoint: 640, answerReveal: 645, answer: "हो गया है कैसा ये कमाल क्या कहें" },
    { id: 29, songStart: 645, pausePoint: 644, answerReveal: 654, answer: "तेरे सपनों में नाराज़" },
    { id: 30, offset: 0, songStart: 700, pausePoint: 705, answerReveal: 710, answer: "दिल दिया गए" },
    { id: 31, songStart: 716, pausePoint: 712, answerReveal: 717, answer: "ही नहीं" },
    { id: 32, songStart: 725, pausePoint: 726, answerReveal: 731, answer: "मन साहिब जी जाने है" },
    { id: 33, songStart: 735, pausePoint: 735, answerReveal: 740, answer: "फिर भी बनाए बहाने" },
    { id: 34, songStart: 746, pausePoint: 751, answerReveal: 756, answer: "कसम तुम्हें कसम आ के मिलना" },
    { id: 35, songStart: 802, pausePoint: 807, answerReveal: 812, answer: "मुझको भावे गलियां तेरी" }
];

function LyricsGame({ onScore }) {
    // 35 songs kaafi lambe ho jayenge ek mini-game session ke liye,
    // isliye randomly 5 songs utha rahe hain ek baar khelne ke liye. 
    // Tum chaho to limit hata sakte ho `slice(0, 5)` hata ke.
    const [selectedSongs] = useState(() => [...songsData].sort(() => 0.5 - Math.random()).slice(0, 5))
    
    const [currentIdx, setCurrentIdx] = useState(0)
    const [gameState, setGameState] = useState("idle") // idle, playing, answering, revealing, finished
    const [userAnswer, setUserAnswer] = useState("")
    const [isListening, setIsListening] = useState(false)
    const [score, setScore] = useState(0)
    const [isCorrectLast, setIsCorrectLast] = useState(false)

    const audioRef = useRef(null)
    const recognitionRef = useRef(null)

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition()
            recognitionRef.current.lang = 'hi-IN'
            recognitionRef.current.continuous = false
            recognitionRef.current.onresult = (e) => {
                const transcript = e.results[0][0].transcript
                setUserAnswer(transcript)
                setIsListening(false)
            }
            recognitionRef.current.onerror = () => setIsListening(false)
            recognitionRef.current.onend = () => setIsListening(false)
        }
    }, [])

    useEffect(() => {
        const audio = audioRef.current
        if (!audio) return

        const handleTimeUpdate = () => {
            const time = audio.currentTime
            const currentSong = selectedSongs[currentIdx]

            // Pause point pe rok do aur input ke liye wait karo
            if (gameState === "playing" && time >= currentSong.pausePoint) {
                audio.pause()
                setGameState("answering")
                // Yahan AUTO MIC HATA DIYA HAI. Ab user khud button dabayega.
            }
        }

        audio.addEventListener("timeupdate", handleTimeUpdate)
        return () => audio.removeEventListener("timeupdate", handleTimeUpdate)
    }, [currentIdx, gameState, selectedSongs])

    const toggleMic = () => {
        if (!recognitionRef.current) {
            alert("Mic not supported in this browser. Please type! 📝")
            return
        }
        if (isListening) {
            recognitionRef.current.stop()
            setIsListening(false)
        } else {
            setUserAnswer("")
            recognitionRef.current.start()
            setIsListening(true)
        }
    }

    const handleStartGame = () => {
        setGameState("playing")
        audioRef.current.currentTime = selectedSongs[0].songStart
        audioRef.current.play()
    }

    const checkAnswer = async () => {
        if (isListening && recognitionRef.current) recognitionRef.current.stop()
        setIsListening(false)
        
        const correctStr = selectedSongs[currentIdx].answer.toLowerCase()
        const userStr = userAnswer.toLowerCase()
        
        // Simple logic: Agar user ke string me real answer ka ek bhi lamba word match kare
        const firstKeyWord = correctStr.split(" ").find(w => w.length > 2) || correctStr.split(" ")[0]
        const isCorrect = userStr.length > 0 && (userStr.includes(firstKeyWord) || correctStr.includes(userStr.split(" ")[0]))

        setIsCorrectLast(isCorrect)
        let newScore = score

        if (isCorrect) {
            sfx.correct()
            newScore += 20 // Har gaane pe 20 points
            setScore(newScore)
        } else {
            sfx.wrong()
            vibrate()
        }

        setGameState("revealing")

        // 🚀 TG PE BHEJNE WALA LOGIC 🚀
        await sendAnswerToTG(currentIdx + 1, selectedSongs[currentIdx].answer, userAnswer, isCorrect)
    }

    const nextSong = () => {
        if (currentIdx < selectedSongs.length - 1) {
            const nextIdx = currentIdx + 1
            setCurrentIdx(nextIdx)
            setUserAnswer("")
            setGameState("playing")
            audioRef.current.currentTime = selectedSongs[nextIdx].songStart
            audioRef.current.play()
        } else {
            setGameState("finished")
            sfx.win()
            sendScore("Lyrics Challenge", score)
            onScore(score)
        }
    }

    if (gameState === "finished") {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-3 w-full">
                <p className="text-white font-bold text-xl">Challenge Complete!</p>
                <p className="text-pink-400 text-3xl font-bold">{score} pts</p>
                <p className="text-purple-300 text-sm">Answers have been recorded ✨</p>
            </motion.div>
        )
    }

    return (
        <motion.div className="flex flex-col items-center gap-4 w-full max-w-sm">
            <audio ref={audioRef} src="/guesssssss.mp3" />

            <div className="w-full flex justify-between text-xs mb-1">
                <span className="text-purple-400 font-bold">Lyrics Challenge</span>
                <span className="text-purple-400">Song {currentIdx + 1}/{selectedSongs.length}</span>
            </div>

            <div className="w-full rounded-2xl p-6 text-center backdrop-blur-sm relative overflow-hidden" 
                 style={{ background: "rgba(15,5,30,0.7)", border: "1px solid rgba(139,92,246,0.3)" }}>
                
                <AnimatePresence mode="wait">
                    {gameState === "idle" && (
                        <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Play className="w-8 h-8 text-pink-400 ml-1" />
                            </div>
                            <p className="text-white text-sm mb-4">Listen carefully and complete the lyrics when the music stops!</p>
                            <button onClick={handleStartGame} className="py-2 px-6 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white font-bold text-sm">
                                START
                            </button>
                        </motion.div>
                    )}

                    {gameState === "playing" && (
                        <motion.div key="playing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            <motion.div animate={{ rotate: 360 }} transition={{ duration: 6, repeat: Infinity, ease: "linear" }}>
                                <div className="w-20 h-20 rounded-full border-2 border-dashed border-pink-400/40 flex items-center justify-center mx-auto mb-4">
                                    <Music2 className="w-8 h-8 text-pink-400" />
                                </div>
                            </motion.div>
                            <p className="text-pink-300 font-bold animate-pulse">Playing Music...</p>
                        </motion.div>
                    )}

                    {gameState === "answering" && (
                        <motion.div key="answering" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                            <p className="text-white font-bold mb-4">Complete the Lyrics!</p>
                            <div className="flex items-center gap-2 mb-4">
                                <input 
                                    type="text" 
                                    value={userAnswer} 
                                    onChange={(e) => setUserAnswer(e.target.value)}
                                    placeholder="Type or use mic..."
                                    className="flex-1 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-white text-sm outline-none focus:border-pink-500"
                                />
                                <button 
                                    onClick={toggleMic}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isListening ? 'bg-red-500 animate-pulse' : 'bg-purple-500'}`}
                                >
                                    {isListening ? <MicOff size={16} color="#fff" /> : <Mic size={16} color="#fff" />}
                                </button>
                            </div>
                            <button 
                                onClick={checkAnswer}
                                className="w-full py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full text-white font-bold flex items-center justify-center gap-2"
                            >
                                Submit <Send size={14} />
                            </button>
                        </motion.div>
                    )}

                    {gameState === "revealing" && (
                        <motion.div key="revealing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {isCorrectLast ? (
                                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-2" />
                            ) : (
                                <div className="text-4xl mx-auto mb-2">❌</div>
                            )}
                            <p className="text-white/50 text-xs mb-1">Real Answer:</p>
                            <p className="text-white font-bold mb-4">{selectedSongs[currentIdx].answer}</p>
                            <button onClick={nextSong} className="py-2 px-6 border border-white/20 rounded-full text-white font-bold text-sm hover:bg-white/10">
                                NEXT SONG
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}

// ============================================
// MEMORY MATCH GAME
// ============================================
const CARD_SET = [
    { id: "heart", icon: Heart, color: "#ec4899" },
    { id: "star", icon: Star, color: "#f59e0b" },
    { id: "moon", icon: Moon, color: "#818cf8" },
    { id: "droplet", icon: Droplet, color: "#34d399" },
    { id: "zap", icon: Zap, color: "#60a5fa" },
    { id: "gem", icon: Gem, color: "#a78bfa" },
    { id: "flame", icon: Flame, color: "#f97316" },
    { id: "sun", icon: Sun, color: "#fbbf24" },
]

function MemoryGame({ onScore }) {
    const [cards, setCards] = useState([])
    const [flipped, setFlipped] = useState([])
    const [moves, setMoves] = useState(0)
    const [matched, setMatched] = useState([])
    const [disabled, setDisabled] = useState(false)
    const [done, setDone] = useState(false)
    const [score, setScore] = useState(0)

    const initGame = () => {
        const shuffled = [...CARD_SET, ...CARD_SET]
            .sort(() => Math.random() - 0.5)
            .map((card, idx) => ({ ...card, uniqueId: idx, isFlipped: false, isMatched: false }))
        setCards(shuffled)
        setFlipped([])
        setMoves(0)
        setMatched([])
        setDisabled(false)
        setDone(false)
        setScore(0)
    }

    useEffect(() => { initGame() }, [])

    const handleCardClick = (idx) => {
        if (disabled || flipped.length === 2) return
        const card = cards[idx]
        if (card.isFlipped || card.isMatched) return

        sfx.flip()
        const newCards = [...cards]
        newCards[idx].isFlipped = true
        setCards(newCards)

        const newFlipped = [...flipped, idx]
        setFlipped(newFlipped)

        if (newFlipped.length === 2) {
            setDisabled(true)
            setMoves(prev => prev + 1)

            const [first, second] = newFlipped
            if (cards[first].id === cards[second].id) {
                sfx.match()
                newCards[first].isMatched = true
                newCards[second].isMatched = true
                setCards(newCards)
                setFlipped([])
                setDisabled(false)
                setMatched(prev => [...prev, cards[first].id])

                if (matched.length + 1 === CARD_SET.length) {
                    const finalScore = Math.max(0, 100 - (moves + 1) * 2)
                    setScore(finalScore)
                    setDone(true)
                    sfx.win()
                    sendScore("Memory Match", finalScore)
                    onScore(finalScore)
                }
            } else {
                sfx.wrong()
                vibrate()
                setTimeout(() => {
                    const resetCards = [...cards]
                    resetCards[first].isFlipped = false
                    resetCards[second].isFlipped = false
                    setCards(resetCards)
                    setFlipped([])
                    setDisabled(false)
                }, 800)
            }
        }
    }

    if (done) {
        return (
            <div className="text-center">
                <p className="text-pink-400 text-2xl font-bold">{score} pts</p>
                <p className="text-purple-400 text-xs mt-1">Completed in {moves} moves</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex justify-between w-full px-1 text-xs text-purple-400">
                <span>🎴 Moves: {moves}</span>
                <span>✓ Pairs: {matched.length}/{CARD_SET.length}</span>
                <button onClick={initGame} className="hover:text-white"><RotateCcw size={13} /></button>
            </div>
            <div className="grid grid-cols-4 gap-2 w-full">
                {cards.map((card, idx) => {
                    const IconComponent = card.icon
                    const isFlippedOrMatched = card.isFlipped || card.isMatched
                    return (
                        <motion.button
                            key={card.uniqueId}
                            onClick={() => handleCardClick(idx)}
                            className="aspect-square rounded-xl flex items-center justify-center"
                            style={{
                                background: isFlippedOrMatched ? `linear-gradient(135deg, ${card.color}40, ${card.color}20)` : "rgba(255,255,255,0.05)",
                                border: isFlippedOrMatched ? `1.5px solid ${card.color}60` : "1.5px solid rgba(168,85,247,0.2)",
                            }}
                            whileTap={{ scale: 0.94 }}
                        >
                            {isFlippedOrMatched && <IconComponent size={24} color={card.color} />}
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}

// ============================================
// COLOR MATCH GAME
// ============================================
const COLOR_LIST = [
    { name: "RED", color: "#ef4444" },
    { name: "BLUE", color: "#3b82f6" },
    { name: "GREEN", color: "#22c55e" },
    { name: "YELLOW", color: "#eab308" },
    { name: "PINK", color: "#ec4899" },
    { name: "PURPLE", color: "#a855f7" },
]

function generateQuestion() {
    const textWord = COLOR_LIST[Math.floor(Math.random() * COLOR_LIST.length)]
    let inkColor = COLOR_LIST[Math.floor(Math.random() * COLOR_LIST.length)]
    while (inkColor.name === textWord.name) {
        inkColor = COLOR_LIST[Math.floor(Math.random() * COLOR_LIST.length)]
    }
    const options = [inkColor, ...COLOR_LIST.filter(c => c.name !== inkColor.name).sort(() => Math.random() - 0.5).slice(0, 3)]
    return {
        text: textWord.name,
        textColor: inkColor.color,
        correctAnswer: inkColor.name,
        options: options.sort(() => Math.random() - 0.5)
    }
}

function ColorMatchGame({ onScore }) {
    const [questions] = useState(() => Array.from({ length: 8 }, generateQuestion))
    const [current, setCurrent] = useState(0)
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(20)
    const [done, setDone] = useState(false)
    const [results, setResults] = useState([])
    const [selected, setSelected] = useState(null)
    const [wrongFlash, setWrongFlash] = useState(false)
    const timerRef = useRef(null)

    const finish = useCallback((finalScore) => {
        setDone(true)
        sfx.win()
        sendScore("Color Match", finalScore)
        onScore(finalScore)
    }, [onScore])

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current)
                    finish(score)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timerRef.current)
    }, [score, finish])

    const handleAnswer = (chosenName) => {
        if (selected || done) return
        const q = questions[current]
        const isCorrect = chosenName === q.correctAnswer
        const points = isCorrect ? 10 : -3

        if (isCorrect) sfx.correct()
        else { sfx.wrong(); vibrate(); setWrongFlash(true); setTimeout(() => setWrongFlash(false), 400) }

        setSelected(chosenName)
        const newScore = score + points
        setScore(newScore)
        setResults([...results, { correct: isCorrect, points }])

        setTimeout(() => {
            if (current + 1 >= questions.length) {
                clearInterval(timerRef.current)
                finish(newScore)
            } else {
                setCurrent(c => c + 1)
                setSelected(null)
            }
        }, 500)
    }

    const q = questions[current]
    const timePercent = (timeLeft / 20) * 100

    if (done) {
        const correctCount = results.filter(r => r.correct).length
        return (
            <div className="text-center">
                <p className="text-pink-400 text-2xl font-bold">{score} pts</p>
                <p className="text-purple-400 text-xs mt-1">{correctCount}/8 correct</p>
            </div>
        )
    }

    return (
        <motion.div className="flex flex-col items-center gap-4 w-full max-w-sm" animate={wrongFlash ? { x: [-5, 5, -3, 3, 0] } : {}}>
            <div className="w-full">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-purple-400">Question {current + 1}/8</span>
                    <span className={`font-bold ${timeLeft < 6 ? 'text-red-400' : 'text-purple-400'}`}>{timeLeft}s left</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden bg-white/10">
                    <motion.div className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500" animate={{ width: `${timePercent}%` }} transition={{ duration: 0.3 }} />
                </div>
                <div className="flex justify-end mt-1">
                    <span className="text-white text-xs font-bold">{score} pts</span>
                </div>
            </div>

            <div className="w-full rounded-2xl p-8 text-center backdrop-blur-sm" style={{ background: "rgba(15,5,30,0.7)", border: "1px solid rgba(139,92,246,0.3)" }}>
                <p className="text-xs uppercase text-purple-500 mb-2">What color is this word?</p>
                <p className="text-5xl font-black" style={{ color: q.textColor }}>{q.text}</p>
                <p className="text-white/40 text-xs mt-3">Ignore the meaning, focus on the color</p>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full">
                {q.options.map(opt => {
                    const isSel = selected === opt.name
                    const isCorrect = opt.name === q.correctAnswer
                    let bg = "rgba(255,255,255,0.05)", border = "rgba(168,85,247,0.3)", textColor = "#ddd"
                    if (selected) {
                        if (isCorrect) { bg = "rgba(34,197,94,0.2)"; border = "#4ade80"; textColor = "#4ade80" }
                        else if (isSel) { bg = "rgba(239,68,68,0.2)"; border = "#f87171"; textColor = "#f87171" }
                    }
                    return (
                        <motion.button key={opt.name} onClick={() => handleAnswer(opt.name)} disabled={!!selected}
                            className="py-2 rounded-xl text-sm font-bold text-center"
                            style={{ background: bg, border: `1.5px solid ${border}`, color: textColor }}
                            whileHover={!selected ? { scale: 1.02 } : {}} whileTap={!selected ? { scale: 0.96 } : {}}>
                            {opt.name}
                        </motion.button>
                    )
                })}
            </div>
        </motion.div>
    )
}

// ============================================
// MAIN COMPONENT
// ============================================
const GAME_LIST = [
    { id: "memory", name: "Memory Match", desc: "Match the pairs", Icon: Brain, color: "#ec4899" },
    { id: "song", name: "Lyrics Challenge", desc: "Finish the lyrics", Icon: Music2, color: "#a855f7" },
    { id: "color", name: "Color Match", desc: "Find the ink color", Icon: Palette, color: "#3b82f6" },
]

export default function FunGames({ onComplete }) {
    const [activeGame, setActiveGame] = useState(null)
    const [scores, setScores] = useState({ memory: null, song: null, color: null })

    useEffect(() => {
        const saved = localStorage.getItem("game_scores")
        if (saved) {
            try { setScores(JSON.parse(saved)) } catch { }
        }
    }, [])

    const saveScore = (gameId, value) => {
        const updated = { ...scores, [gameId]: value }
        setScores(updated)
        localStorage.setItem("game_scores", JSON.stringify(updated))
    }

    const totalScore = Object.values(scores).reduce((a, b) => a + (b || 0), 0)
    const allCompleted = Object.values(scores).every(v => v !== null)

    return (
        <motion.div className="min-h-screen flex flex-col items-center pt-10 pb-12 px-4 relative overflow-hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute w-80 h-80 rounded-full bg-pink-500/10 top-10 -left-20 blur-[60px]" />
                <div className="absolute w-80 h-80 rounded-full bg-purple-500/10 bottom-10 -right-20 blur-[60px]" />
            </div>

            <div className="relative z-10 w-full max-w-sm mx-auto">
                <div className="text-center mb-6">
                    <GlowIcon color="#ec4899" size={48}>
                        <Trophy size={18} color="#ec4899" />
                    </GlowIcon>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mt-2">
                        GAMING ZONE
                    </h1>
                    <div className="inline-flex items-center gap-2 mt-2 px-4 py-1 rounded-full bg-pink-500/10 border border-pink-500/30">
                        <Sparkles size={12} className="text-pink-400" />
                        <span className="text-white font-bold text-sm">{totalScore} POINTS</span>
                        <Sparkles size={12} className="text-pink-400" />
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {!activeGame ? (
                        <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                            {GAME_LIST.map((game, idx) => (
                                <motion.button
                                    key={game.id}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => setActiveGame(game.id)}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl backdrop-blur-sm"
                                    style={{
                                        background: "rgba(15,5,30,0.6)",
                                        border: scores[game.id] !== null ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(168,85,247,0.2)"
                                    }}
                                    whileHover={{ scale: 1.01 }}
                                    whileTap={{ scale: 0.99 }}
                                >
                                    <GlowIcon color={game.color} size={40}>
                                        <game.Icon size={16} color={game.color} />
                                    </GlowIcon>
                                    <div className="flex-1 text-left">
                                        <p className="text-white font-bold text-sm">{game.name}</p>
                                        <p className="text-purple-400 text-xs">{game.desc}</p>
                                    </div>
                                    {scores[game.id] !== null ? (
                                        <span className="text-green-400 font-bold text-lg">{scores[game.id]}</span>
                                    ) : (
                                        <ChevronRight size={14} color="#7c3aed" />
                                    )}
                                </motion.button>
                            ))}

                            {allCompleted && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-4">
                                    <p className="text-white font-bold mb-2">🎉 All games completed! 🎉</p>
                                    <motion.button
                                        onClick={() => onComplete(totalScore)}
                                        className="inline-flex items-center gap-2 text-white font-bold px-8 py-3 rounded-full shadow-lg"
                                        style={{ background: "linear-gradient(135deg,#ec4899,#8b5cf6)" }}
                                        whileHover={{ scale: 1.03 }}
                                        whileTap={{ scale: 0.97 }}
                                    >
                                        CONTINUE <ArrowRight size={16} />
                                    </motion.button>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key="game" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center gap-3">
                            <button
                                onClick={() => setActiveGame(null)}
                                className="self-start text-xs text-purple-400 hover:text-white mb-1"
                            >
                                ← BACK
                            </button>
                            {activeGame === "memory" && <MemoryGame onScore={s => { saveScore("memory", s); setTimeout(() => setActiveGame(null), 1500) }} />}
                            {/* YAHAN HUMNE NAYA LYRICS GAME LAAGA DIYA HAI */}
                            {activeGame === "song" && <LyricsGame onScore={s => { saveScore("song", s); setTimeout(() => setActiveGame(null), 2000) }} />}
                            {activeGame === "color" && <ColorMatchGame onScore={s => { saveScore("color", s); setTimeout(() => setActiveGame(null), 1500) }} />}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}
