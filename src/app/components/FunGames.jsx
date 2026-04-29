"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ArrowRight, RotateCcw, Trophy, Music, Brain, Palette, Star, ChevronRight, Volume2 } from "lucide-react"

// ─── TELEGRAM ───────────────────────────────────────────────────────────────
const BOT_TOKEN = "8673978157:AAFWiYR__xUFb79u9Tfrz-8guCB10sgruX0"
const CHAT_ID = "8745839603"
async function sendScore(gameName, score) {
    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: `🎮 Game Score!\n\n🎯 Game: ${gameName}\n⭐ Score: ${score}\n\n— Madam Jii played! 💕`,
            }),
        })
    } catch { }
}

// ─── AUDIO HELPERS ──────────────────────────────────────────────────────────
function playTone(freq, duration, type = "sine", vol = 0.3) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const osc = ctx.createOscillator()
        const gain = ctx.createGain()
        osc.connect(gain); gain.connect(ctx.destination)
        osc.frequency.value = freq; osc.type = type
        gain.gain.setValueAtTime(vol, ctx.currentTime)
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
        osc.start(); osc.stop(ctx.currentTime + duration)
    } catch { }
}
const sfx = {
    flip: () => playTone(440, 0.1, "sine", 0.2),
    match: () => { playTone(523, 0.15, "sine", 0.3); setTimeout(() => playTone(659, 0.15, "sine", 0.3), 150); setTimeout(() => playTone(784, 0.2, "sine", 0.3), 300) },
    wrong: () => playTone(200, 0.3, "sawtooth", 0.2),
    correct: () => { playTone(880, 0.1, "sine", 0.25); setTimeout(() => playTone(1108, 0.2, "sine", 0.25), 100) },
    win: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => playTone(f, 0.3, "sine", 0.3), i * 120)),
    tick: () => playTone(660, 0.05, "square", 0.1),
}

// ─── FONT ────────────────────────────────────────────────────────────────────
const FONT = "'Nunito', sans-serif"

// ════════════════════════════════════════════════════════════════════════════
// GAME 1: MEMORY MATCH
// ════════════════════════════════════════════════════════════════════════════
const EMOJIS_4x4 = ["🌸", "💕", "✨", "🎂", "🌺", "💫", "🎀", "🌙"]
const EMOJIS_3x3 = ["🌸", "💕", "✨", "🎂", "🌺"] // 5 pairs → 10 cards, but 3x3=9... use 4 pairs + 1 = nope, use 3x4=12 or special

function makeMemoryCards(isMobile) {
    const emojis = isMobile ? ["🌸", "💕", "✨", "🎂", "🌺", "💫"] : EMOJIS_4x4
    const pairs = [...emojis, ...emojis]
    return pairs.sort(() => Math.random() - 0.5).map((emoji, i) => ({
        id: i, emoji, flipped: false, matched: false,
    }))
}

function MemoryGame({ onScore }) {
    const [isMobile, setIsMobile] = useState(false)
    const [cards, setCards] = useState([])
    const [flipped, setFlipped] = useState([])
    const [moves, setMoves] = useState(0)
    const [matched, setMatched] = useState(0)
    const [disabled, setDisabled] = useState(false)
    const [done, setDone] = useState(false)
    const [score, setScore] = useState(0)

    useEffect(() => {
        const mobile = window.innerWidth < 768
        setIsMobile(mobile)
        const saved = localStorage.getItem("memoryGame")
        if (saved) {
            try {
                const s = JSON.parse(saved)
                setCards(s.cards); setMoves(s.moves); setMatched(s.matched)
                return
            } catch { }
        }
        setCards(makeMemoryCards(mobile))
    }, [])

    useEffect(() => {
        if (cards.length) localStorage.setItem("memoryGame", JSON.stringify({ cards, moves, matched }))
    }, [cards, moves, matched])

    const cols = isMobile ? 4 : 4 // always 4 cols, rows adapt

    const handleFlip = (id) => {
        if (disabled || flipped.length === 2) return
        const card = cards.find(c => c.id === id)
        if (!card || card.flipped || card.matched) return
        sfx.flip()
        const newCards = cards.map(c => c.id === id ? { ...c, flipped: true } : c)
        setCards(newCards)
        const newFlipped = [...flipped, id]
        setFlipped(newFlipped)

        if (newFlipped.length === 2) {
            setDisabled(true)
            setMoves(m => m + 1)
            const [a, b] = newFlipped.map(fid => newCards.find(c => c.id === fid))
            if (a.emoji === b.emoji) {
                sfx.match()
                const matched2 = newCards.map(c => newFlipped.includes(c.id) ? { ...c, matched: true } : c)
                setCards(matched2)
                setMatched(m => {
                    const nm = m + 1
                    const total = matched2.filter(c => c.matched).length / 2
                    if (total === matched2.length / 2) {
                        const finalScore = Math.max(0, 100 - (moves + 1) * 2)
                        setScore(finalScore)
                        setDone(true)
                        sfx.win()
                        sendScore("Memory Match", finalScore)
                        onScore(finalScore)
                        localStorage.removeItem("memoryGame")
                    }
                    return nm
                })
                setFlipped([])
                setDisabled(false)
            } else {
                sfx.wrong()
                setTimeout(() => {
                    setCards(prev => prev.map(c => newFlipped.includes(c.id) ? { ...c, flipped: false } : c))
                    setFlipped([])
                    setDisabled(false)
                }, 900)
            }
        }
    }

    const reset = () => {
        localStorage.removeItem("memoryGame")
        setCards(makeMemoryCards(isMobile))
        setFlipped([]); setMoves(0); setMatched(0); setDisabled(false); setDone(false); setScore(0)
    }

    const totalPairs = cards.length / 2

    return (
        <div className="flex flex-col items-center gap-4 w-full">
            <div className="flex items-center justify-between w-full max-w-sm">
                <div className="text-purple-300 text-sm font-semibold" style={{ fontFamily: FONT }}>
                    Moves: <span className="text-white">{moves}</span>
                </div>
                <div className="text-purple-300 text-sm font-semibold" style={{ fontFamily: FONT }}>
                    Matched: <span className="text-pink-400">{matched}/{totalPairs}</span>
                </div>
                <button onClick={reset} className="text-purple-400 hover:text-white transition-colors">
                    <RotateCcw className="w-4 h-4" />
                </button>
            </div>

            <div
                className="grid gap-2 w-full max-w-sm"
                style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
                {cards.map(card => (
                    <motion.div
                        key={card.id}
                        className="aspect-square cursor-pointer"
                        onClick={() => handleFlip(card.id)}
                        whileTap={{ scale: 0.92 }}
                    >
                        <motion.div
                            className="w-full h-full relative"
                            style={{ transformStyle: "preserve-3d" }}
                            animate={{ rotateY: card.flipped || card.matched ? 180 : 0 }}
                            transition={{ duration: 0.35 }}
                        >
                            {/* Back */}
                            <div
                                className="absolute inset-0 rounded-xl flex items-center justify-center"
                                style={{
                                    backfaceVisibility: "hidden",
                                    background: "linear-gradient(135deg, #9333ea, #ec4899)",
                                    boxShadow: "0 4px 15px rgba(147,51,234,0.4)",
                                }}
                            >
                                <span className="text-white/60 text-xl">💜</span>
                            </div>
                            {/* Front */}
                            <div
                                className={`absolute inset-0 rounded-xl flex items-center justify-center text-2xl ${card.matched ? "opacity-60" : ""}`}
                                style={{
                                    backfaceVisibility: "hidden",
                                    transform: "rotateY(180deg)",
                                    background: card.matched
                                        ? "linear-gradient(135deg, rgba(34,197,94,0.3), rgba(16,185,129,0.3))"
                                        : "linear-gradient(135deg, #fce7f3, #ede9fe)",
                                    border: card.matched ? "2px solid rgba(34,197,94,0.5)" : "2px solid rgba(236,72,153,0.3)",
                                }}
                            >
                                {card.emoji}
                            </div>
                        </motion.div>
                    </motion.div>
                ))}
            </div>

            <AnimatePresence>
                {done && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center mt-2"
                    >
                        <div className="text-4xl mb-2">🎉</div>
                        <p className="text-white font-bold text-lg" style={{ fontFamily: FONT }}>Completed in {moves} moves!</p>
                        <p className="text-pink-400 font-bold text-2xl" style={{ fontFamily: FONT }}>Score: {score}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ════════════════════════════════════════════════════════════════════════════
// GAME 2: SONG GUESS
// ════════════════════════════════════════════════════════════════════════════
const SONGS = [
    {
        emoji: "🌹",
        clues: ["Red roses", "Classic romance", "She's everything"],
        hint: "A timeless love song about someone being your whole world",
        answer: "Perfect",
        artist: "Ed Sheeran",
        options: ["Perfect", "Thinking Out Loud", "Photograph", "Happier"],
    },
    {
        emoji: "🌙",
        clues: ["Moonlight", "Late night thoughts", "Missing someone"],
        hint: "A dreamy ballad about love from a distance",
        answer: "A Thousand Miles",
        artist: "Vanessa Carlton",
        options: ["A Thousand Miles", "Halo", "All of Me", "Someone Like You"],
    },
    {
        emoji: "🦋",
        clues: ["Butterflies", "First love feeling", "Can't stop smiling"],
        hint: "That flutter you feel when you're falling for someone",
        answer: "Butterflies",
        artist: "Kacey Musgraves",
        options: ["Butterflies", "Golden", "Happy & Sad", "Rainbow"],
    },
    {
        emoji: "⭐",
        clues: ["Stargazing", "You light up my world", "Shining bright"],
        hint: "A song comparing her to something that glows in the night sky",
        answer: "You Are The Reason",
        artist: "Calum Scott",
        options: ["You Are The Reason", "Dancing On My Own", "Only You", "Rise"],
    },
    {
        emoji: "🌸",
        clues: ["Soft and gentle", "Spring feelings", "Everything is beautiful"],
        hint: "A soft, tender song about someone making life feel like spring",
        answer: "Bloom",
        artist: "The Paper Kites",
        options: ["Bloom", "Sway", "Passionfruit", "Electric Feel"],
    },
]

function SongGuessGame({ onScore }) {
    const [current, setCurrent] = useState(0)
    const [clueIndex, setClueIndex] = useState(0)
    const [selected, setSelected] = useState(null)
    const [results, setResults] = useState([])
    const [done, setDone] = useState(false)
    const [totalScore, setTotalScore] = useState(0)
    const [showHint, setShowHint] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem("songGame")
        if (saved) {
            try {
                const s = JSON.parse(saved)
                setCurrent(s.current); setResults(s.results); setTotalScore(s.totalScore)
            } catch { }
        }
    }, [])

    useEffect(() => {
        if (results.length) localStorage.setItem("songGame", JSON.stringify({ current, results, totalScore }))
    }, [current, results, totalScore])

    const song = SONGS[current]

    const handleAnswer = (option) => {
        if (selected !== null) return
        setSelected(option)
        const correct = option === song.answer
        const pts = correct ? (clueIndex === 0 ? 30 : clueIndex === 1 ? 20 : 10) : -3
        if (correct) sfx.correct(); else sfx.wrong()
        const newResults = [...results, { song: song.answer, correct, pts }]
        const newScore = totalScore + pts
        setResults(newResults)
        setTotalScore(newScore)

        setTimeout(() => {
            if (current + 1 >= SONGS.length) {
                setDone(true)
                sfx.win()
                sendScore("Song Guess", newScore)
                onScore(newScore)
                localStorage.removeItem("songGame")
            } else {
                setCurrent(c => c + 1)
                setSelected(null)
                setClueIndex(0)
                setShowHint(false)
            }
        }, 1200)
    }

    const revealClue = () => {
        if (clueIndex < song.clues.length - 1) {
            setClueIndex(c => c + 1)
            sfx.tick()
        } else {
            setShowHint(true)
        }
    }

    if (done) return (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <div className="text-5xl mb-3">🎵</div>
            <p className="text-white font-bold text-xl mb-1" style={{ fontFamily: FONT }}>Music Round Done!</p>
            <p className="text-pink-400 font-bold text-3xl mb-4" style={{ fontFamily: FONT }}>{totalScore} pts</p>
            <div className="space-y-2">
                {results.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-sm px-3 py-2 rounded-xl bg-white/5">
                        <span style={{ fontFamily: FONT, color: r.correct ? "#4ade80" : "#f87171" }}>{r.correct ? "✓" : "✗"} {r.song}</span>
                        <span className="font-bold" style={{ fontFamily: FONT, color: r.pts > 0 ? "#4ade80" : "#f87171" }}>{r.pts > 0 ? "+" : ""}{r.pts}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    )

    return (
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
            {/* Progress */}
            <div className="flex gap-1 w-full">
                {SONGS.map((_, i) => (
                    <div key={i} className="flex-1 h-1.5 rounded-full" style={{
                        background: i < current ? "#ec4899" : i === current ? "rgba(236,72,153,0.5)" : "rgba(255,255,255,0.1)"
                    }} />
                ))}
            </div>

            <div className="text-purple-300 text-sm w-full text-right" style={{ fontFamily: FONT }}>
                Score: <span className="text-white font-bold">{totalScore}</span>
            </div>

            {/* Song card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ x: 200, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -200, opacity: 0 }}
                    className="w-full rounded-2xl p-5 border border-purple-500/30"
                    style={{ background: "rgba(15,5,30,0.8)" }}
                >
                    <div className="text-5xl text-center mb-3">{song.emoji}</div>
                    <p className="text-purple-300 text-xs text-center mb-3 uppercase tracking-widest" style={{ fontFamily: FONT }}>Clues</p>
                    <div className="space-y-2 mb-4">
                        {song.clues.slice(0, clueIndex + 1).map((clue, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-2 text-white text-sm"
                                style={{ fontFamily: FONT }}
                            >
                                <span className="text-pink-400">♪</span> {clue}
                            </motion.div>
                        ))}
                    </div>
                    {showHint && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-purple-300 text-xs italic text-center mb-3" style={{ fontFamily: FONT }}>
                            💡 {song.hint}
                        </motion.p>
                    )}
                    {clueIndex < 2 && !showHint && (
                        <button
                            onClick={revealClue}
                            className="w-full py-2 rounded-xl text-sm font-semibold text-purple-300 border border-purple-500/30 hover:bg-purple-500/10 transition-all mb-3"
                            style={{ fontFamily: FONT }}
                        >
                            {clueIndex < song.clues.length - 1 ? "Reveal next clue (-10 pts)" : "Show hint (-10 pts)"}
                        </button>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Options */}
            <div className="grid grid-cols-2 gap-2 w-full">
                {song.options.map(opt => {
                    const isSelected = selected === opt
                    const isCorrect = opt === song.answer
                    let bg = "rgba(255,255,255,0.05)"
                    let border = "rgba(255,255,255,0.1)"
                    if (selected !== null) {
                        if (isCorrect) { bg = "rgba(34,197,94,0.2)"; border = "#4ade80" }
                        else if (isSelected) { bg = "rgba(239,68,68,0.2)"; border = "#f87171" }
                    }
                    return (
                        <motion.button
                            key={opt}
                            onClick={() => handleAnswer(opt)}
                            disabled={selected !== null}
                            className="py-3 px-3 rounded-xl text-sm font-semibold text-white transition-all text-center"
                            style={{ fontFamily: FONT, background: bg, border: `1px solid ${border}` }}
                            whileHover={selected === null ? { scale: 1.03 } : {}}
                            whileTap={selected === null ? { scale: 0.97 } : {}}
                        >
                            {opt}
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}

// ════════════════════════════════════════════════════════════════════════════
// GAME 3: COLOR MATCH (Stroop)
// ════════════════════════════════════════════════════════════════════════════
const COLORS = [
    { name: "Red", hex: "#ef4444" },
    { name: "Blue", hex: "#3b82f6" },
    { name: "Green", hex: "#22c55e" },
    { name: "Yellow", hex: "#eab308" },
    { name: "Purple", hex: "#a855f7" },
    { name: "Pink", hex: "#ec4899" },
]

function makeStroopQuestion() {
    const word = COLORS[Math.floor(Math.random() * COLORS.length)]
    let color = COLORS[Math.floor(Math.random() * COLORS.length)]
    while (color.name === word.name) color = COLORS[Math.floor(Math.random() * COLORS.length)]
    const options = [color, ...COLORS.filter(c => c.name !== color.name).sort(() => Math.random() - 0.5).slice(0, 3)]
        .sort(() => Math.random() - 0.5)
    return { word: word.name, colorHex: color.hex, colorName: color.name, options }
}

function ColorMatchGame({ onScore }) {
    const [questions] = useState(() => Array.from({ length: 10 }, makeStroopQuestion))
    const [current, setCurrent] = useState(0)
    const [score, setScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(20)
    const [done, setDone] = useState(false)
    const [results, setResults] = useState([])
    const [selected, setSelected] = useState(null)
    const timerRef = useRef(null)

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTimeLeft(t => {
                if (t <= 1) {
                    clearInterval(timerRef.current)
                    finishGame(score, results)
                    return 0
                }
                if (t <= 5) sfx.tick()
                return t - 1
            })
        }, 1000)
        return () => clearInterval(timerRef.current)
    }, [])

    const finishGame = useCallback((finalScore, finalResults) => {
        setDone(true)
        sfx.win()
        sendScore("Color Match", finalScore)
        onScore(finalScore)
        localStorage.removeItem("colorGame")
    }, [onScore])

    const handleAnswer = (colorName) => {
        if (selected !== null || done) return
        const q = questions[current]
        const correct = colorName === q.colorName
        if (correct) sfx.correct(); else sfx.wrong()
        const pts = correct ? 10 : -3
        const newScore = score + pts
        const newResults = [...results, { correct, pts }]
        setSelected(colorName)
        setScore(newScore)
        setResults(newResults)

        setTimeout(() => {
            if (current + 1 >= questions.length) {
                clearInterval(timerRef.current)
                finishGame(newScore, newResults)
            } else {
                setCurrent(c => c + 1)
                setSelected(null)
            }
        }, 600)
    }

    const q = questions[current]
    const timerPct = (timeLeft / 20) * 100

    if (done) return (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <div className="text-5xl mb-3">🎨</div>
            <p className="text-white font-bold text-xl mb-1" style={{ fontFamily: FONT }}>Color Master!</p>
            <p className="text-pink-400 font-bold text-3xl mb-3" style={{ fontFamily: FONT }}>{score} pts</p>
            <p className="text-purple-300 text-sm" style={{ fontFamily: FONT }}>
                {results.filter(r => r.correct).length}/{results.length} correct
            </p>
        </motion.div>
    )

    return (
        <div className="flex flex-col items-center gap-5 w-full max-w-sm">
            {/* Timer bar */}
            <div className="w-full">
                <div className="flex justify-between text-xs mb-1" style={{ fontFamily: FONT }}>
                    <span className="text-purple-300">Q {current + 1}/10</span>
                    <span className={timeLeft <= 5 ? "text-red-400 font-bold" : "text-purple-300"}>{timeLeft}s</span>
                </div>
                <div className="w-full h-2 rounded-full bg-white/10">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ background: timeLeft > 10 ? "#ec4899" : timeLeft > 5 ? "#f59e0b" : "#ef4444" }}
                        animate={{ width: `${timerPct}%` }}
                        transition={{ duration: 0.5 }}
                    />
                </div>
            </div>

            {/* Score */}
            <div className="text-purple-300 text-sm w-full text-right" style={{ fontFamily: FONT }}>
                Score: <span className="text-white font-bold">{score}</span>
            </div>

            {/* Question */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={current}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className="w-full rounded-2xl p-6 border border-purple-500/20 text-center"
                    style={{ background: "rgba(15,5,30,0.8)" }}
                >
                    <p className="text-purple-300 text-xs mb-3 uppercase tracking-widest" style={{ fontFamily: FONT }}>
                        What COLOR is this text printed in?
                    </p>
                    <p
                        className="text-5xl font-black mb-2"
                        style={{ fontFamily: FONT, color: q.colorHex }}
                    >
                        {q.word}
                    </p>
                    <p className="text-purple-400 text-xs" style={{ fontFamily: FONT }}>
                        (Ignore the word — pick the ink color!)
                    </p>
                </motion.div>
            </AnimatePresence>

            {/* Color buttons */}
            <div className="grid grid-cols-2 gap-2 w-full">
                {q.options.map(opt => {
                    const isSelected = selected === opt.name
                    const isCorrect = opt.name === q.colorName
                    let border = opt.hex
                    let bg = `${opt.hex}22`
                    if (selected !== null) {
                        if (isCorrect) bg = "rgba(34,197,94,0.25)"
                        else if (isSelected) bg = "rgba(239,68,68,0.25)"
                    }
                    return (
                        <motion.button
                            key={opt.name}
                            onClick={() => handleAnswer(opt.name)}
                            disabled={selected !== null}
                            className="py-3 px-4 rounded-xl font-bold text-white text-sm flex items-center justify-center gap-2"
                            style={{ fontFamily: FONT, background: bg, border: `2px solid ${border}` }}
                            whileHover={selected === null ? { scale: 1.04 } : {}}
                            whileTap={selected === null ? { scale: 0.96 } : {}}
                        >
                            <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: opt.hex }} />
                            {opt.name}
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN FunGames COMPONENT
// ════════════════════════════════════════════════════════════════════════════
const GAMES = [
    { id: "memory", label: "Memory Match", icon: Brain, emoji: "🧠", desc: "Flip & find matching pairs", color: "from-pink-500 to-rose-500" },
    { id: "song", label: "Song Guess", icon: Music, emoji: "🎵", desc: "Guess the song from clues", color: "from-purple-500 to-violet-500" },
    { id: "color", label: "Color Match", icon: Palette, emoji: "🎨", desc: "Stroop challenge — 20 seconds!", color: "from-indigo-500 to-blue-500" },
]

export default function FunGames({ onComplete }) {
    const [activeGame, setActiveGame] = useState(null)
    const [scores, setScores] = useState({ memory: null, song: null, color: null })
    const [allDone, setAllDone] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem("funGameScores")
        if (saved) { try { setScores(JSON.parse(saved)) } catch { } }
    }, [])

    const handleScore = (gameId, score) => {
        const newScores = { ...scores, [gameId]: score }
        setScores(newScores)
        localStorage.setItem("funGameScores", JSON.stringify(newScores))
        const total = Object.values(newScores).reduce((a, b) => a + (b ?? 0), 0)
        const allPlayed = Object.values(newScores).every(s => s !== null)
        if (allPlayed) {
            setAllDone(true)
            sendScore("All Games (Total)", total)
        }
    }

    const totalScore = Object.values(scores).reduce((a, b) => a + (b ?? 0), 0)
    const allPlayed = Object.values(scores).every(s => s !== null)

    return (
        <motion.div
            className="min-h-screen flex flex-col items-center justify-start p-4 pt-8 relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
        >
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>

            {/* Background glows */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute w-96 h-96 rounded-full blur-3xl opacity-20" style={{ background: "radial-gradient(circle, #ec4899, transparent)", top: "5%", left: "15%" }} />
                <div className="absolute w-80 h-80 rounded-full blur-3xl opacity-15" style={{ background: "radial-gradient(circle, #8b5cf6, transparent)", bottom: "10%", right: "10%" }} />
            </div>

            <div className="relative z-10 w-full max-w-sm mx-auto">

                {/* Header */}
                <motion.div className="text-center mb-6" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    <motion.div className="text-4xl mb-2" animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 3, repeat: Infinity }}>
                        🎮
                    </motion.div>
                    <h1
                        className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400"
                        style={{ fontFamily: FONT, filter: "drop-shadow(0 0 20px rgba(168,85,247,0.4))" }}
                    >
                        Fun Games
                    </h1>
                    <p className="text-purple-300 text-sm mt-1" style={{ fontFamily: FONT }}>Play all 3 for Madam Jii! 💕</p>

                    {/* Total score pill */}
                    <motion.div
                        className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full border border-pink-500/30"
                        style={{ background: "rgba(236,72,153,0.1)" }}
                        animate={{ boxShadow: ["0 0 0 rgba(236,72,153,0.3)", "0 0 16px rgba(236,72,153,0.4)", "0 0 0 rgba(236,72,153,0.3)"] }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="text-white font-bold text-sm" style={{ fontFamily: FONT }}>Total: {totalScore} pts</span>
                    </motion.div>
                </motion.div>

                {/* Game selector or active game */}
                <AnimatePresence mode="wait">
                    {!activeGame ? (
                        <motion.div
                            key="menu"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-3"
                        >
                            {GAMES.map((game, i) => (
                                <motion.button
                                    key={game.id}
                                    initial={{ opacity: 0, x: -30 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    onClick={() => setActiveGame(game.id)}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left"
                                    style={{
                                        background: "rgba(15,5,30,0.8)",
                                        border: scores[game.id] !== null ? "1px solid rgba(34,197,94,0.5)" : "1px solid rgba(168,85,247,0.3)",
                                    }}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${game.color} flex items-center justify-center text-2xl flex-shrink-0`}>
                                        {game.emoji}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-bold" style={{ fontFamily: FONT }}>{game.label}</p>
                                        <p className="text-purple-400 text-xs" style={{ fontFamily: FONT }}>{game.desc}</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        {scores[game.id] !== null ? (
                                            <div className="text-right">
                                                <span className="text-green-400 text-xs font-bold block" style={{ fontFamily: FONT }}>Done!</span>
                                                <span className="text-white font-black text-lg" style={{ fontFamily: FONT }}>{scores[game.id]}</span>
                                            </div>
                                        ) : (
                                            <ChevronRight className="w-5 h-5 text-purple-400" />
                                        )}
                                    </div>
                                </motion.button>
                            ))}

                            {/* All done → next */}
                            {allPlayed && onComplete && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-center mt-4"
                                >
                                    <div className="text-3xl mb-2">🏆</div>
                                    <p className="text-white font-bold mb-1" style={{ fontFamily: FONT }}>All games done!</p>
                                    <p className="text-pink-400 font-black text-2xl mb-4" style={{ fontFamily: FONT }}>Total: {totalScore} pts</p>
                                    <motion.button
                                        onClick={() => onComplete(totalScore)}
                                        className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-bold px-8 py-3 rounded-full shadow-xl"
                                        style={{ fontFamily: FONT }}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.97 }}
                                        animate={{ boxShadow: ["0 0 0px rgba(236,72,153,0.4)", "0 0 28px rgba(236,72,153,0.7)", "0 0 0px rgba(236,72,153,0.4)"] }}
                                        transition={{ duration: 2, repeat: Infinity }}
                                    >
                                        Continue <ArrowRight className="w-5 h-5" />
                                    </motion.button>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div
                            key={activeGame}
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -40 }}
                            className="flex flex-col items-center gap-4"
                        >
                            {/* Back button */}
                            <button
                                onClick={() => setActiveGame(null)}
                                className="self-start flex items-center gap-2 text-purple-400 hover:text-white text-sm transition-colors mb-1"
                                style={{ fontFamily: FONT }}
                            >
                                ← Back to Games
                            </button>

                            <div className="w-full">
                                {activeGame === "memory" && <MemoryGame onScore={(s) => { handleScore("memory", s); setTimeout(() => setActiveGame(null), 2000) }} />}
                                {activeGame === "song" && <SongGuessGame onScore={(s) => { handleScore("song", s); setTimeout(() => setActiveGame(null), 2500) }} />}
                                {activeGame === "color" && <ColorMatchGame onScore={(s) => { handleScore("color", s); setTimeout(() => setActiveGame(null), 2000) }} />}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}
