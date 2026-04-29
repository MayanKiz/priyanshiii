"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowRight, RotateCcw, Trophy, ChevronRight, Brain, Music2, Palette, Volume2, VolumeX, Sparkles, Heart, Star, Moon, Droplet, Zap, Gem, Flame, Sun } from "lucide-react"

const BOT_TOKEN = "8673978157:AAFWiYR__xUFb79u9Tfrz-8guCB10sgruX0"
const CHAT_ID = "8745839603"

async function sendScore(gameName, score) {
    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: CHAT_ID, text: `🎮 ${gameName}\n🏆 Score: ${score}` }),
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
// SONG POOL - Popular Hindi + English Songs
// ============================================
const ALL_SONGS = [
    { answer: "Tum Hi Ho", artist: "Arijit Singh", emoji: "💔", options: ["Tum Hi Ho", "Kesariya", "Channa Mereya", "Raataan Lambiyan"] },
    { answer: "Kesariya", artist: "Arijit Singh", emoji: "💛", options: ["Kesariya", "Tum Hi Ho", "Raataan Lambiyan", "Ranjha"] },
    { answer: "Raataan Lambiyan", artist: "Jubin Nautiyal", emoji: "🌙", options: ["Raataan Lambiyan", "Kesariya", "Ranjha", "Ve Maahi"] },
    { answer: "Ranjha", artist: "B Praak", emoji: "💘", options: ["Ranjha", "Raataan Lambiyan", "Ve Maahi", "Filhaal"] },
    { answer: "Perfect", artist: "Ed Sheeran", emoji: "🎸", options: ["Perfect", "Thinking Out Loud", "Shape of You", "Photograph"] },
    { answer: "Love Story", artist: "Taylor Swift", emoji: "📖", options: ["Love Story", "Lover", "Blank Space", "You Belong With Me"] },
    { answer: "All of Me", artist: "John Legend", emoji: "🎹", options: ["All of Me", "Perfect", "Ordinary People", "Stay With You"] },
    { answer: "A Thousand Years", artist: "Christina Perri", emoji: "✨", options: ["A Thousand Years", "Love Story", "Jar of Hearts", "Human"] },
    { answer: "Chunari Chunari", artist: "Kavita Krishnamurthy", emoji: "💃", options: ["Chunari Chunari", "Mehendi Laga Ke", "Aaj Ki Raat", "Gallan Goodiyaan"] },
    { answer: "Mehendi Laga Ke", artist: "Udit Narayan", emoji: "🎨", options: ["Mehendi Laga Ke", "Chunari Chunari", "Bole Chudiyan", "Suraj Hua"] },
    { answer: "Gallan Goodiyaan", artist: "Shankar Ehsaan Loy", emoji: "🕺", options: ["Gallan Goodiyaan", "Aaj Ki Raat", "Nachde Ne Saare", "Hauli Hauli"] },
    { answer: "Dilbar", artist: "Neha Kakkar", emoji: "💃", options: ["Dilbar", "Kamariya", "Aankh Marey", "Tip Tip"] },
    { answer: "Aankh Marey", artist: "Kumar Sanu", emoji: "👀", options: ["Aankh Marey", "Dilbar", "Tip Tip", "Sheila Ki Jawani"] },
    { answer: "Sheila Ki Jawani", artist: "Sunidhi Chauhan", emoji: "💃", options: ["Sheila Ki Jawani", "Munni Badnaam", "Fevicol Se", "Chikni Chameli"] },
    { answer: "Bekhayali", artist: "Sachet Tandon", emoji: "😢", options: ["Bekhayali", "Kaise Hua", "Tera Ban Jaunga", "Shayad"] },
    { answer: "Kaise Hua", artist: "Vishal Mishra", emoji: "💔", options: ["Kaise Hua", "Bekhayali", "Tujhe Kitna", "Ik Vaari Aa"] },
    { answer: "Kuch Kuch Hota Hai", artist: "Udit Narayan", emoji: "💕", options: ["Kuch Kuch Hota Hai", "Dil To Pagal Hai", "Tujhe Dekha Toh", "Bole Chudiyan"] },
    { answer: "Suraj Hua Maddham", artist: "Sonu Nigam", emoji: "☀️", options: ["Suraj Hua Maddham", "Bole Chudiyan", "Dil To Pagal Hai", "Tujhe Dekha Toh"] },
]

function getRandomSongs(pool, count = 5) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
}

// ============================================
// SONG GUESS GAME - Pure Audio
// ============================================
const SONG_TIME = 30

function SongGuessGame({ onScore }) {
    const [songs] = useState(() => getRandomSongs(ALL_SONGS, 5))
    const [cur, setCur] = useState(0)
    const [totalScore, setTotalScore] = useState(0)
    const [results, setResults] = useState([])
    const [done, setDone] = useState(false)
    const [timeLeft, setTimeLeft] = useState(SONG_TIME)
    const [timerActive, setTimerActive] = useState(false)
    const [selected, setSelected] = useState(null)
    const [wrongFlash, setWrongFlash] = useState(false)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const audioRef = useRef(null)
    const timerRef = useRef(null)

    const song = songs[cur]

    const finishGame = useCallback((finalScore, finalResults) => {
        setDone(true)
        sfx.win()
        sendScore("Song Guess", finalScore)
        onScore(finalScore)
    }, [onScore])

    const stopAudioAndTimer = useCallback(() => {
        if (timerRef.current) {
            clearInterval(timerRef.current)
            timerRef.current = null
        }
        if (audioRef.current) {
            audioRef.current.pause()
            audioRef.current.src = ""
        }
        setTimerActive(false)
    }, [])

    const loadAndPlaySong = useCallback(async () => {
        stopAudioAndTimer()
        setIsLoading(true)
        setIsPlaying(false)
        setSelected(null)
        setWrongFlash(false)
        setTimeLeft(SONG_TIME)
        
        const searchQuery = encodeURIComponent(`${song.answer} song`)
        
        try {
            const audio = new Audio()
            audioRef.current = audio
            
            audio.addEventListener('canplaythrough', () => {
                setIsLoading(false)
                audio.play().catch(e => console.log("Playback failed:", e))
                setIsPlaying(true)
                
                setTimerActive(true)
                timerRef.current = setInterval(() => {
                    setTimeLeft(prev => {
                        if (prev <= 1) {
                            if (timerRef.current) clearInterval(timerRef.current)
                            if (!selected) {
                                const nr = [...results, { correct: false, pts: 0, song: song.answer }]
                                setResults(nr)
                                const ns = totalScore
                                if (cur + 1 >= songs.length) {
                                    finishGame(ns, nr)
                                } else {
                                    setCur(c => c + 1)
                                }
                            }
                            return 0
                        }
                        return prev - 1
                    })
                }, 1000)
            })
            
            audio.src = `https://www.soundhelix.com/examples/mp3/SoundHelix-Song-${Math.floor(Math.random() * 10) + 1}.mp3`
            
        } catch (error) {
            console.log("Audio error:", error)
            setIsLoading(false)
        }
    }, [song, results, totalScore, cur, songs.length, finishGame, selected, stopAudioAndTimer])

    useEffect(() => {
        loadAndPlaySong()
        return () => stopAudioAndTimer()
    }, [cur, loadAndPlaySong, stopAudioAndTimer])

    const handleAnswer = (opt) => {
        if (selected) return
        if (timerRef.current) clearInterval(timerRef.current)
        
        const correct = opt === song.answer
        const timeBonus = Math.floor(timeLeft / 3)
        const pts = correct ? 10 + timeBonus : -5
        
        setSelected(opt)
        setTimerActive(false)
        
        if (audioRef.current) audioRef.current.pause()
        
        if (correct) {
            sfx.correct()
            const nr = [...results, { correct: true, pts, song: song.answer }]
            const ns = totalScore + pts
            setResults(nr)
            setTotalScore(ns)
            setTimeout(() => {
                if (cur + 1 >= songs.length) {
                    finishGame(ns, nr)
                } else {
                    setCur(c => c + 1)
                }
            }, 800)
        } else {
            sfx.wrong()
            vibrate()
            setWrongFlash(true)
            setTimeout(() => setWrongFlash(false), 500)
            const nr = [...results, { correct: false, pts, song: song.answer }]
            const ns = totalScore + pts
            setResults(nr)
            setTotalScore(ns)
            setTimeout(() => {
                if (cur + 1 >= songs.length) {
                    finishGame(ns, nr)
                } else {
                    setCur(c => c + 1)
                }
            }, 1200)
        }
    }

    if (done) {
        return (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-3 w-full">
                <p className="text-white font-bold text-xl">Complete!</p>
                <p className="text-pink-400 text-3xl font-bold">{totalScore} pts</p>
                <div className="space-y-1.5 w-full max-h-48 overflow-y-auto">
                    {results.map((r, i) => (
                        <div key={i} className="flex justify-between text-sm px-3 py-2 rounded-lg bg-white/5">
                            <span className={r.correct ? "text-green-400" : "text-red-400"}>{r.correct ? "✓" : "✗"} {r.song}</span>
                            <span className={r.pts > 0 ? "text-green-400" : "text-red-400"}>{r.pts > 0 ? "+" : ""}{r.pts}</span>
                        </div>
                    ))}
                </div>
            </motion.div>
        )
    }

    const timePercent = (timeLeft / SONG_TIME) * 100

    return (
        <motion.div className="flex flex-col items-center gap-4 w-full max-w-sm" animate={wrongFlash ? { x: [-5, 5, -3, 3, 0] } : {}}>
            <div className="w-full">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-purple-400">Song {cur + 1} of {songs.length}</span>
                    <span className="font-bold text-purple-400">{totalScore} pts</span>
                </div>
                <div className="flex justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-green-400 animate-pulse' : isLoading ? 'bg-yellow-400' : 'bg-red-400'}`} />
                        <span className="text-purple-400 text-xs">
                            {isPlaying ? "Playing now..." : isLoading ? "Loading..." : "Ready"}
                        </span>
                    </div>
                    {timerActive && (
                        <span className={`font-bold text-xs ${timeLeft < 10 ? 'text-red-400' : 'text-purple-400'}`}>
                            ⏱️ {timeLeft}s left
                        </span>
                    )}
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden bg-white/10">
                    <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-500"
                        animate={{ width: `${timePercent}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
                <p className="text-[10px] text-purple-500 text-right mt-0.5">⚡ Faster answer = more points!</p>
            </div>

            <div className="w-full rounded-2xl p-6 text-center backdrop-blur-sm" style={{ background: "rgba(15,5,30,0.7)", border: "1px solid rgba(139,92,246,0.3)" }}>
                <div className="text-6xl mb-3">{song.emoji}</div>
                <p className="text-purple-300 text-sm mb-2">Artist: {song.artist}</p>
                <p className="text-white/50 text-xs">👉 Can you guess this song?</p>
            </div>

            <div className="grid grid-cols-2 gap-2 w-full">
                {song.options.map(opt => {
                    const isSel = selected === opt
                    const isCorrect = opt === song.answer
                    let bg = "rgba(255,255,255,0.05)"
                    let border = "rgba(168,85,247,0.3)"
                    let textColor = "#e2e8f0"
                    
                    if (selected !== null) {
                        if (isCorrect) {
                            bg = "rgba(34,197,94,0.2)"
                            border = "#4ade80"
                            textColor = "#4ade80"
                        } else if (isSel) {
                            bg = "rgba(239,68,68,0.2)"
                            border = "#f87171"
                            textColor = "#f87171"
                        }
                    }
                    
                    return (
                        <motion.button
                            key={opt}
                            onClick={() => handleAnswer(opt)}
                            disabled={selected !== null}
                            className="py-3 px-2 rounded-xl text-sm font-medium text-center transition-all"
                            style={{ background: bg, border: `1.5px solid ${border}`, color: textColor }}
                            whileHover={!selected ? { scale: 1.02 } : {}}
                            whileTap={!selected ? { scale: 0.96 } : {}}
                        >
                            {opt}
                        </motion.button>
                    )
                })}
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
    { id: "song", name: "Song Guess", desc: "Identify the song", Icon: Music2, color: "#a855f7" },
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
                            {activeGame === "song" && <SongGuessGame onScore={s => { saveScore("song", s); setTimeout(() => setActiveGame(null), 2000) }} />}
                            {activeGame === "color" && <ColorMatchGame onScore={s => { saveScore("color", s); setTimeout(() => setActiveGame(null), 1500) }} />}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}