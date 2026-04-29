"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ArrowRight, RotateCcw, Trophy, ChevronRight, Play, Square, Music2, Brain, Palette } from "lucide-react"

const BOT_TOKEN = "8673978157:AAFWiYR__xUFb79u9Tfrz-8guCB10sgruX0"
const CHAT_ID = "8745839603"
const FONT = "'Nunito', sans-serif"

async function sendScore(gameName, score) {
    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: CHAT_ID, text: `Game: ${gameName}\nScore: ${score}\n— Madam Jii played!` }),
        })
    } catch { }
}

function playTone(freq, dur, type = "sine", vol = 0.25) {
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
    flip: () => playTone(440, 0.08, "sine", 0.15),
    match: () => [523, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 0.18, "sine", 0.25), i * 130)),
    wrong: () => playTone(180, 0.25, "sawtooth", 0.18),
    correct: () => { playTone(880, 0.1, "sine", 0.2); setTimeout(() => playTone(1108, 0.18, "sine", 0.2), 100) },
    win: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => playTone(f, 0.28, "sine", 0.28), i * 110)),
    tick: () => playTone(660, 0.04, "square", 0.08),
}

// ── CSS OUTLINE ICON COMPONENT ─────────────────────────────────────────────
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

// ════════════════════════════════════════════════════════════════════════════
// GAME 1 — MEMORY MATCH
// ════════════════════════════════════════════════════════════════════════════
const CARD_SYMBOLS = [
    { id: "heart", path: "M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z", color: "#ec4899" },
    { id: "star", path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", color: "#f59e0b" },
    { id: "moon", path: "M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z", color: "#818cf8" },
    { id: "sun", path: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 1 0 0 14A7 7 0 0 0 12 5z", color: "#fbbf24" },
    { id: "bolt", path: "M13 2L3 14h9l-1 8 10-12h-9l1-8z", color: "#60a5fa" },
    { id: "drop", path: "M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z", color: "#34d399" },
    { id: "gem", path: "M2 9l3-3h14l3 3-10 13L2 9zM3 9h18M8 6l-2 3 6 8 6-8-2-3", color: "#a78bfa" },
    { id: "fire", path: "M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z", color: "#f97316" },
]

function SymbolCard({ symbol, flipped, matched, onClick }) {
    return (
        <motion.div
            className="aspect-square cursor-pointer"
            onClick={onClick}
            whileTap={{ scale: 0.9 }}
        >
            <motion.div
                className="w-full h-full relative"
                style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: flipped || matched ? 180 : 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Back */}
                <div className="absolute inset-0 rounded-xl flex items-center justify-center"
                    style={{ backfaceVisibility: "hidden", background: "linear-gradient(135deg,#7c3aed,#db2777)", boxShadow: "0 2px 10px #7c3aed40" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.4)", boxShadow: "0 0 8px rgba(255,255,255,0.2)" }} />
                </div>
                {/* Front */}
                <div className="absolute inset-0 rounded-xl flex items-center justify-center"
                    style={{
                        backfaceVisibility: "hidden", transform: "rotateY(180deg)",
                        background: matched ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.07)",
                        border: matched ? "1.5px solid rgba(34,197,94,0.5)" : `1.5px solid ${symbol.color}50`,
                        boxShadow: matched ? "none" : `0 0 10px ${symbol.color}30`,
                    }}>
                    <svg viewBox="0 0 24 24" fill={symbol.color} stroke={symbol.color} strokeWidth="1" style={{ width: "45%", height: "45%", opacity: matched ? 0.5 : 1 }}>
                        <path d={symbol.path} />
                    </svg>
                </div>
            </motion.div>
        </motion.div>
    )
}

function MemoryGame({ onScore }) {
    const [cards, setCards] = useState([])
    const [flipped, setFlipped] = useState([])
    const [moves, setMoves] = useState(0)
    const [matchedCount, setMatchedCount] = useState(0)
    const [disabled, setDisabled] = useState(false)
    const [done, setDone] = useState(false)
    const [score, setScore] = useState(0)

    const init = () => {
        const symbols = [...CARD_SYMBOLS, ...CARD_SYMBOLS].sort(() => Math.random() - 0.5)
            .map((s, i) => ({ ...s, uid: i, flipped: false, matched: false }))
        setCards(symbols); setFlipped([]); setMoves(0); setMatchedCount(0); setDisabled(false); setDone(false); setScore(0)
    }

    useEffect(() => {
        const saved = localStorage.getItem("mem_v2")
        if (saved) { try { const s = JSON.parse(saved); setCards(s.cards); setMoves(s.moves); setMatchedCount(s.matchedCount); return } catch { } }
        init()
    }, [])

    useEffect(() => {
        if (cards.length) localStorage.setItem("mem_v2", JSON.stringify({ cards, moves, matchedCount }))
    }, [cards, moves, matchedCount])

    const flip = (uid) => {
        if (disabled || flipped.length === 2) return
        const c = cards.find(x => x.uid === uid)
        if (!c || c.flipped || c.matched) return
        sfx.flip()
        const next = cards.map(x => x.uid === uid ? { ...x, flipped: true } : x)
        setCards(next)
        const nf = [...flipped, uid]
        setFlipped(nf)
        if (nf.length === 2) {
            setDisabled(true); setMoves(m => m + 1)
            const [a, b] = nf.map(id => next.find(x => x.uid === id))
            if (a.id === b.id) {
                sfx.match()
                const done2 = next.map(x => nf.includes(x.uid) ? { ...x, matched: true } : x)
                setCards(done2); setFlipped([]); setDisabled(false)
                setMatchedCount(mc => {
                    const nm = mc + 1
                    if (nm === CARD_SYMBOLS.length) {
                        const fs = Math.max(0, 100 - (moves + 1) * 2)
                        setScore(fs); setDone(true); sfx.win()
                        sendScore("Memory Match", fs); onScore(fs)
                        localStorage.removeItem("mem_v2")
                    }
                    return nm
                })
            } else {
                sfx.wrong()
                setTimeout(() => {
                    setCards(p => p.map(x => nf.includes(x.uid) ? { ...x, flipped: false } : x))
                    setFlipped([]); setDisabled(false)
                }, 850)
            }
        }
    }

    return (
        <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex items-center justify-between w-full">
                <span className="text-sm text-purple-300" style={{ fontFamily: FONT }}>Moves: <strong className="text-white">{moves}</strong></span>
                <span className="text-sm text-purple-300" style={{ fontFamily: FONT }}>Pairs: <strong className="text-pink-400">{matchedCount}/{CARD_SYMBOLS.length}</strong></span>
                <button onClick={() => { localStorage.removeItem("mem_v2"); init() }} className="text-purple-500 hover:text-purple-300 transition-colors"><RotateCcw size={15} /></button>
            </div>

            <div className="grid gap-2 w-full" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
                {cards.map(c => <SymbolCard key={c.uid} symbol={c} flipped={c.flipped} matched={c.matched} onClick={() => flip(c.uid)} />)}
            </div>

            <AnimatePresence>
                {done && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mt-1">
                        <p className="text-white font-bold" style={{ fontFamily: FONT }}>Done in {moves} moves</p>
                        <p style={{ fontFamily: FONT, color: "#f472b6", fontSize: 22, fontWeight: 900 }}>{score} pts</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// ════════════════════════════════════════════════════════════════════════════
// GAME 2 — HINDI SONG GUESS
// ════════════════════════════════════════════════════════════════════════════
const HINDI_SONGS = [
    {
        answer: "Tum Hi Ho",
        artist: "Arijit Singh",
        clues: ["Aashiqui 2 ki pehchaan", "Ek dard bhari mohabbat"],
        youtubeId: "X4WNTORtpHI", // Tum Hi Ho Instrumental
        options: ["Tum Hi Ho", "Tera Ban Jaunga", "Channa Mereya", "Raabta"],
    },
    {
        answer: "Kesariya",
        artist: "Arijit Singh",
        clues: ["Brahmastra ka title track", "Rang kesariya, mohabbat gehri"],
        youtubeId: "BddP6PYo2gs", // Kesariya instrumental
        options: ["Kesariya", "Agar Tum Saath Ho", "Ae Dil Hai Mushkil", "Mere Naam Tu"],
    },
    {
        answer: "Raataan Lambiyan",
        artist: "Jubin Nautiyal",
        clues: ["Shershaah ka pyaar", "Raaten aur yaadein saath aati hain"],
        youtubeId: "D1fjOBiRkVo", // Raataan Lambiyan instrumental
        options: ["Raataan Lambiyan", "Main Teri Ho Gayi", "Ve Maahi", "Ranjha"],
    },
    {
        answer: "Tera Ban Jaunga",
        artist: "Akhil Sachdeva & Tulsi Kumar",
        clues: ["Kabir Singh ka dil se ikraar", "Hamesha tera rehna ka waada"],
        youtubeId: "APPnLSHFbFQ", // Tera Ban Jaunga instrumental
        options: ["Tera Ban Jaunga", "Bekhayali", "Kaise Hua", "Mere Sohneya"],
    },
    {
        answer: "Channa Mereya",
        artist: "Arijit Singh",
        clues: ["Ae Dil Hai Mushkil ki vidhaayi", "Bichhad jaana hi tha, phir bhi pyaar tha"],
        youtubeId: "DHtBn-7JT3E", // Channa Mereya instrumental
        options: ["Channa Mereya", "Bulleya", "The Breakup Song", "Aayega Aane Wala"],
    },
]

function YoutubeAudioClue({ videoId, onReveal }) {
    const [shown, setShown] = useState(false)
    const reveal = () => { setShown(true); onReveal() }

    return (
        <div className="w-full">
            {!shown ? (
                <button
                    onClick={reveal}
                    className="w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                    style={{ fontFamily: FONT, background: "rgba(139,92,246,0.15)", border: "1.5px solid rgba(139,92,246,0.4)", color: "#c4b5fd" }}
                >
                    <Play size={14} /> Play instrumental clue
                </button>
            ) : (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="w-full rounded-xl overflow-hidden" style={{ border: "1.5px solid rgba(139,92,246,0.35)" }}>
                    <iframe
                        src={`https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`}
                        allow="autoplay; encrypted-media"
                        allowFullScreen={false}
                        style={{ width: "100%", height: 70, border: "none", background: "#0f0a1e" }}
                        title="audio clue"
                    />
                </motion.div>
            )}
        </div>
    )
}

function SongGuessGame({ onScore }) {
    const [current, setCurrent] = useState(0)
    const [clueIdx, setClueIdx] = useState(0)
    const [selected, setSelected] = useState(null)
    const [results, setResults] = useState([])
    const [totalScore, setTotalScore] = useState(0)
    const [done, setDone] = useState(false)
    const [audioUsed, setAudioUsed] = useState(false)

    const song = HINDI_SONGS[current]

    const handleAnswer = (opt) => {
        if (selected !== null) return
        setSelected(opt)
        const correct = opt === song.answer
        // 30pts if only 1 clue seen, 20 if 2, 10 if audio used, -3 if wrong
        const pts = correct ? (audioUsed ? 10 : clueIdx === 0 ? 30 : 20) : -3
        if (correct) sfx.correct(); else sfx.wrong()
        const nr = [...results, { correct, pts, song: song.answer }]
        const ns = totalScore + pts
        setResults(nr); setTotalScore(ns)
        setTimeout(() => {
            if (current + 1 >= HINDI_SONGS.length) {
                setDone(true); sfx.win()
                sendScore("Song Guess", ns); onScore(ns)
                localStorage.removeItem("song_v2")
            } else {
                setCurrent(c => c + 1); setSelected(null); setClueIdx(0); setAudioUsed(false)
            }
        }, 1100)
    }

    if (done) return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-3">
            <p className="text-white font-black text-xl" style={{ fontFamily: FONT }}>Music round done!</p>
            <p style={{ fontFamily: FONT, color: "#f472b6", fontSize: 28, fontWeight: 900 }}>{totalScore} pts</p>
            <div className="space-y-1.5 mt-2">
                {results.map((r, i) => (
                    <div key={i} className="flex justify-between text-sm px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)", fontFamily: FONT }}>
                        <span style={{ color: r.correct ? "#4ade80" : "#f87171" }}>{r.correct ? "✓" : "✗"} {r.song}</span>
                        <span className="font-bold" style={{ color: r.pts > 0 ? "#4ade80" : "#f87171" }}>{r.pts > 0 ? "+" : ""}{r.pts}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    )

    return (
        <div className="flex flex-col items-center gap-3 w-full max-w-sm">
            {/* Progress dots */}
            <div className="flex gap-1.5 w-full">
                {HINDI_SONGS.map((_, i) => (
                    <div key={i} className="flex-1 h-1 rounded-full transition-all" style={{ background: i < current ? "#ec4899" : i === current ? "rgba(236,72,153,0.4)" : "rgba(255,255,255,0.08)" }} />
                ))}
            </div>

            <div className="flex justify-between w-full">
                <span className="text-xs text-purple-400" style={{ fontFamily: FONT }}>Song {current + 1} of {HINDI_SONGS.length}</span>
                <span className="text-xs font-bold text-white" style={{ fontFamily: FONT }}>{totalScore} pts</span>
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={current} initial={{ x: 60, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -60, opacity: 0 }}
                    className="w-full rounded-2xl p-4 space-y-3" style={{ background: "rgba(15,5,30,0.85)", border: "1px solid rgba(139,92,246,0.25)" }}>

                    {/* Music note icon — CSS only, no emoji */}
                    <div className="flex justify-center">
                        <div style={{
                            width: 44, height: 44, borderRadius: "50%",
                            border: "2px solid #a855f7",
                            boxShadow: "0 0 16px #a855f740",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: "rgba(168,85,247,0.1)"
                        }}>
                            <Music2 size={20} color="#c084fc" strokeWidth={1.5} />
                        </div>
                    </div>

                    <p className="text-center text-xs uppercase tracking-widest text-purple-400" style={{ fontFamily: FONT }}>Clues</p>

                    <div className="space-y-2">
                        {song.clues.slice(0, clueIdx + 1).map((clue, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                                className="text-sm text-white/80 flex items-start gap-2" style={{ fontFamily: FONT }}>
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ec4899", marginTop: 6, flexShrink: 0, boxShadow: "0 0 6px #ec4899" }} />
                                {clue}
                            </motion.div>
                        ))}
                    </div>

                    {clueIdx < song.clues.length - 1 && (
                        <button onClick={() => { setClueIdx(c => c + 1); sfx.tick() }}
                            className="w-full py-2 rounded-xl text-xs font-bold transition-all"
                            style={{ fontFamily: FONT, background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.3)", color: "#f9a8d4" }}>
                            Next clue
                        </button>
                    )}

                    {clueIdx === song.clues.length - 1 && (
                        <YoutubeAudioClue videoId={song.youtubeId} onReveal={() => setAudioUsed(true)} />
                    )}
                </motion.div>
            </AnimatePresence>

            <div className="grid grid-cols-2 gap-2 w-full">
                {song.options.map(opt => {
                    const isSel = selected === opt, isCorrect = opt === song.answer
                    let bg = "rgba(255,255,255,0.04)", border = "rgba(255,255,255,0.1)", color = "#e2e8f0"
                    if (selected !== null) {
                        if (isCorrect) { bg = "rgba(34,197,94,0.15)"; border = "#4ade80"; color = "#4ade80" }
                        else if (isSel) { bg = "rgba(239,68,68,0.15)"; border = "#f87171"; color = "#f87171" }
                    }
                    return (
                        <motion.button key={opt} onClick={() => handleAnswer(opt)} disabled={selected !== null}
                            className="py-3 px-3 rounded-xl text-sm font-semibold text-center transition-all"
                            style={{ fontFamily: FONT, background: bg, border: `1.5px solid ${border}`, color }}
                            whileHover={!selected ? { scale: 1.03 } : {}} whileTap={!selected ? { scale: 0.97 } : {}}>
                            {opt}
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}

// ════════════════════════════════════════════════════════════════════════════
// GAME 3 — COLOR MATCH (Stroop)
// ════════════════════════════════════════════════════════════════════════════
const COLORS = [
    { name: "Laal", hex: "#ef4444" }, { name: "Neela", hex: "#3b82f6" },
    { name: "Hara", hex: "#22c55e" }, { name: "Peela", hex: "#eab308" },
    { name: "Gulabi", hex: "#ec4899" }, { name: "Baingan", hex: "#a855f7" },
]

function makeQ() {
    const word = COLORS[Math.floor(Math.random() * COLORS.length)]
    let ink = COLORS[Math.floor(Math.random() * COLORS.length)]
    while (ink.name === word.name) ink = COLORS[Math.floor(Math.random() * COLORS.length)]
    const opts = [ink, ...COLORS.filter(c => c.name !== ink.name).sort(() => Math.random() - 0.5).slice(0, 3)].sort(() => Math.random() - 0.5)
    return { word: word.name, inkHex: ink.hex, inkName: ink.name, opts }
}

function ColorMatchGame({ onScore }) {
    const [qs] = useState(() => Array.from({ length: 10 }, makeQ))
    const [cur, setCur] = useState(0)
    const [score, setScore] = useState(0)
    const [time, setTime] = useState(20)
    const [done, setDone] = useState(false)
    const [results, setResults] = useState([])
    const [selected, setSelected] = useState(null)
    const timerRef = useRef(null)
    const scoreRef = useRef(0)
    const resultsRef = useRef([])

    const finish = useCallback((fs) => {
        setDone(true); sfx.win()
        sendScore("Color Match", fs); onScore(fs)
    }, [onScore])

    useEffect(() => {
        timerRef.current = setInterval(() => {
            setTime(t => {
                if (t <= 1) { clearInterval(timerRef.current); finish(scoreRef.current); return 0 }
                if (t <= 5) sfx.tick()
                return t - 1
            })
        }, 1000)
        return () => clearInterval(timerRef.current)
    }, [finish])

    const answer = (name) => {
        if (selected || done) return
        const q = qs[cur], correct = name === q.inkName
        if (correct) sfx.correct(); else sfx.wrong()
        const pts = correct ? 10 : -3
        const ns = score + pts, nr = [...results, { correct, pts }]
        scoreRef.current = ns; resultsRef.current = nr
        setSelected(name); setScore(ns); setResults(nr)
        setTimeout(() => {
            if (cur + 1 >= qs.length) { clearInterval(timerRef.current); finish(ns) }
            else { setCur(c => c + 1); setSelected(null) }
        }, 550)
    }

    const q = qs[cur]
    if (done) return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <p className="text-white font-black text-xl mb-1" style={{ fontFamily: FONT }}>Color Master!</p>
            <p style={{ fontFamily: FONT, color: "#f472b6", fontSize: 28, fontWeight: 900 }}>{score} pts</p>
            <p className="text-purple-400 text-sm mt-1" style={{ fontFamily: FONT }}>{resultsRef.current.filter(r => r.correct).length}/10 sahi</p>
        </motion.div>
    )

    return (
        <div className="flex flex-col items-center gap-4 w-full max-w-sm">
            <div className="w-full">
                <div className="flex justify-between text-xs mb-1" style={{ fontFamily: FONT }}>
                    <span className="text-purple-400">Q {cur + 1}/10</span>
                    <span style={{ color: time <= 5 ? "#f87171" : time <= 10 ? "#fbbf24" : "#c084fc", fontWeight: 700 }}>{time}s</span>
                </div>
                <div className="w-full h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <motion.div className="h-full rounded-full" style={{ background: time > 10 ? "#ec4899" : time > 5 ? "#f59e0b" : "#ef4444" }}
                        animate={{ width: `${(time / 20) * 100}%` }} transition={{ duration: 0.4 }} />
                </div>
            </div>

            <div className="flex justify-end w-full">
                <span className="text-xs font-bold text-white" style={{ fontFamily: FONT }}>{score} pts</span>
            </div>

            <AnimatePresence mode="wait">
                <motion.div key={cur} initial={{ y: 15, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -15, opacity: 0 }}
                    className="w-full rounded-2xl p-5 text-center" style={{ background: "rgba(15,5,30,0.85)", border: "1px solid rgba(139,92,246,0.2)" }}>
                    <p className="text-xs uppercase tracking-widest text-purple-500 mb-3" style={{ fontFamily: FONT }}>Is word ka INK rang kya hai?</p>
                    <p className="font-black" style={{ fontFamily: FONT, fontSize: 42, color: q.inkHex, letterSpacing: "-0.5px" }}>{q.word}</p>
                    <p className="text-xs text-purple-500 mt-2" style={{ fontFamily: FONT }}>Word ko ignore karo — sirf rang dekho</p>
                </motion.div>
            </AnimatePresence>

            <div className="grid grid-cols-3 gap-2 w-full">
                {q.opts.map(opt => {
                    const isSel = selected === opt.name, isCorrect = opt.name === q.inkName
                    let bg = `${opt.hex}18`, border = `${opt.hex}60`, textCol = "#e2e8f0"
                    if (selected) {
                        if (isCorrect) { bg = "rgba(34,197,94,0.2)"; border = "#4ade80"; textCol = "#4ade80" }
                        else if (isSel) { bg = "rgba(239,68,68,0.2)"; border = "#f87171"; textCol = "#f87171" }
                    }
                    return (
                        <motion.button key={opt.name} onClick={() => answer(opt.name)} disabled={!!selected}
                            className="py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                            style={{ fontFamily: FONT, background: bg, border: `1.5px solid ${border}`, color: textCol }}
                            whileHover={!selected ? { scale: 1.05 } : {}} whileTap={!selected ? { scale: 0.95 } : {}}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: opt.hex, boxShadow: `0 0 6px ${opt.hex}`, flexShrink: 0 }} />
                            {opt.name}
                        </motion.button>
                    )
                })}
            </div>
        </div>
    )
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════════════
const GAMES_LIST = [
    { id: "memory", label: "Memory Match", sub: "Flip & match pairs", Icon: Brain, accent: "#ec4899" },
    { id: "song", label: "Song Guess", sub: "Hindi songs — audio clue last", Icon: Music2, accent: "#a855f7" },
    { id: "color", label: "Color Match", sub: "Stroop — 20 seconds", Icon: Palette, accent: "#3b82f6" },
]

export default function FunGames({ onComplete }) {
    const [active, setActive] = useState(null)
    const [scores, setScores] = useState({ memory: null, song: null, color: null })

    useEffect(() => {
        const s = localStorage.getItem("fg_scores")
        if (s) { try { setScores(JSON.parse(s)) } catch { } }
    }, [])

    const addScore = (id, s) => {
        const n = { ...scores, [id]: s }
        setScores(n); localStorage.setItem("fg_scores", JSON.stringify(n))
        sendScore(`All (${Object.values(n).filter(x => x !== null).length}/3)`, Object.values(n).reduce((a, b) => a + (b ?? 0), 0))
    }

    const total = Object.values(scores).reduce((a, b) => a + (b ?? 0), 0)
    const allDone = Object.values(scores).every(s => s !== null)

    return (
        <motion.div className="min-h-screen flex flex-col items-center pt-8 pb-12 px-4 relative overflow-hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>

            <div className="fixed inset-0 pointer-events-none">
                <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle,rgba(236,72,153,0.12),transparent)", top: "5%", left: "10%", filter: "blur(40px)" }} />
                <div style={{ position: "absolute", width: 280, height: 280, borderRadius: "50%", background: "radial-gradient(circle,rgba(139,92,246,0.1),transparent)", bottom: "8%", right: "5%", filter: "blur(40px)" }} />
            </div>

            <div className="relative z-10 w-full max-w-sm mx-auto">

                {/* Header */}
                <motion.div className="text-center mb-6" initial={{ y: -16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                    <div className="flex justify-center mb-3">
                        <GlowIcon color="#ec4899" size={52}>
                            <Trophy size={22} color="#ec4899" strokeWidth={1.5} />
                        </GlowIcon>
                    </div>
                    <h1 className="font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400"
                        style={{ fontFamily: FONT, fontSize: 32, filter: "drop-shadow(0 0 16px rgba(168,85,247,0.35))" }}>
                        Fun Games
                    </h1>
                    <p className="text-purple-400 text-sm mt-0.5" style={{ fontFamily: FONT }}>Madam Jii ke liye</p>
                    <div className="inline-flex items-center gap-2 mt-3 px-4 py-1.5 rounded-full" style={{ background: "rgba(236,72,153,0.1)", border: "1px solid rgba(236,72,153,0.3)" }}>
                        <span className="text-white font-black text-sm" style={{ fontFamily: FONT }}>{total} pts total</span>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">
                    {!active ? (
                        <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                            {GAMES_LIST.map((g, i) => (
                                <motion.button key={g.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                                    onClick={() => setActive(g.id)}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all"
                                    style={{ background: "rgba(15,5,30,0.8)", border: scores[g.id] !== null ? "1.5px solid rgba(34,197,94,0.4)" : "1.5px solid rgba(168,85,247,0.2)" }}
                                    whileHover={{ scale: 1.015 }} whileTap={{ scale: 0.985 }}>
                                    <GlowIcon color={g.accent} size={44}>
                                        <g.Icon size={18} color={g.accent} strokeWidth={1.5} />
                                    </GlowIcon>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-bold text-sm" style={{ fontFamily: FONT }}>{g.label}</p>
                                        <p className="text-purple-400 text-xs truncate" style={{ fontFamily: FONT }}>{g.sub}</p>
                                    </div>
                                    <div className="flex-shrink-0 text-right">
                                        {scores[g.id] !== null ? (
                                            <>
                                                <p className="text-green-400 text-xs font-bold" style={{ fontFamily: FONT }}>Done</p>
                                                <p className="text-white font-black text-lg leading-none" style={{ fontFamily: FONT }}>{scores[g.id]}</p>
                                            </>
                                        ) : <ChevronRight size={16} color="#7c3aed" />}
                                    </div>
                                </motion.button>
                            ))}

                            {allDone && onComplete && (
                                <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-center pt-2">
                                    <p className="text-white font-bold mb-1" style={{ fontFamily: FONT }}>Sab games khatam!</p>
                                    <p style={{ fontFamily: FONT, color: "#f472b6", fontSize: 24, fontWeight: 900, marginBottom: 14 }}>{total} pts</p>
                                    <motion.button onClick={() => onComplete(total)}
                                        className="inline-flex items-center gap-2 text-white font-bold px-8 py-3 rounded-full shadow-xl"
                                        style={{ fontFamily: FONT, background: "linear-gradient(135deg,#ec4899,#8b5cf6)" }}
                                        whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}
                                        animate={{ boxShadow: ["0 0 0px rgba(236,72,153,0.3)", "0 0 24px rgba(236,72,153,0.65)", "0 0 0px rgba(236,72,153,0.3)"] }}
                                        transition={{ duration: 2, repeat: Infinity }}>
                                        Aage chalein <ArrowRight size={18} />
                                    </motion.button>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key={active} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="flex flex-col items-center gap-4">
                            <button onClick={() => setActive(null)}
                                className="self-start text-xs text-purple-400 hover:text-white transition-colors mb-1"
                                style={{ fontFamily: FONT }}>
                                ← Back
                            </button>
                            {active === "memory" && <MemoryGame onScore={s => { addScore("memory", s); setTimeout(() => setActive(null), 1800) }} />}
                            {active === "song" && <SongGuessGame onScore={s => { addScore("song", s); setTimeout(() => setActive(null), 2200) }} />}
                            {active === "color" && <ColorMatchGame onScore={s => { addScore("color", s); setTimeout(() => setActive(null), 1800) }} />}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}
