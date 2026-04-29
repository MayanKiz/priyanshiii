"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { ArrowRight, RotateCcw, Trophy, ChevronRight, Brain, Music2, Palette, Volume2, VolumeX } from "lucide-react"

const BOT_TOKEN = "8673978157:AAFWiYR__xUFb79u9Tfrz-8guCB10sgruX0"
const CHAT_ID = "8745839603"
const FONT = "'Nunito', sans-serif"

async function sendScore(gameName, score) {
    try {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: CHAT_ID, text: `🎮 ${gameName}\n🏆 Score: ${score}\n✨ Madam Jii played!` }),
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
    match: () => [523, 659, 784].forEach((f, i) => setTimeout(() => playTone(f, 0.15, "sine", 0.2), i * 100)),
    wrong: () => playTone(180, 0.25, "sawtooth", 0.15),
    correct: () => { playTone(880, 0.1, "sine", 0.18); setTimeout(() => playTone(1108, 0.15, "sine", 0.18), 80) },
    win: () => [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => playTone(f, 0.22, "sine", 0.22), i * 100)),
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

// ════════════════════════════════════════════════════════════════════════════
// SONG POOL — 200+ viral Hindi + English songs
// ════════════════════════════════════════════════════════════════════════════
const ALL_SONGS = [
    // 🔥 VIRAL HINDI (Shadi/Party/Romantic)
    { answer: "Chunari Chunari", ytId: "hQCob3TKCHM", options: ["Chunari Chunari", "Mehendi Laga", "Aaj Ki Raat", "Gallan Goodiyaan"] },
    { answer: "Mehendi Laga Ke", ytId: "lS2TzbBFAYM", options: ["Mehendi Laga Ke", "Chunari Chunari", "Dulhe Ka Sehra", "Bole Chudiyan"] },
    { answer: "Aaj Ki Raat", ytId: "JF2L9oECxCo", options: ["Aaj Ki Raat", "Gallan Goodiyaan", "Nachde Ne Saare", "Tenu Suit"] },
    { answer: "Gallan Goodiyaan", ytId: "V1q4lBuQ3SA", options: ["Gallan Goodiyaan", "Aaj Ki Raat", "Kar Gayi Chull", "Balle Balle"] },
    { answer: "Nachde Ne Saare", ytId: "l6HA3dQqU9A", options: ["Nachde Ne Saare", "Gallan Goodiyaan", "Hauli Hauli", "Morni Banke"] },
    { answer: "Hauli Hauli", ytId: "8PNfwX2s7vM", options: ["Hauli Hauli", "Morni Banke", "Dilbar", "Aankh Marey"] },
    { answer: "Dilbar", ytId: "gfxcFE0_YA4", options: ["Dilbar", "Kamariya", "Tip Tip", "Sheila Ki Jawani"] },
    { answer: "Kamariya", ytId: "FL8QnuAL_3c", options: ["Kamariya", "Dilbar", "Bom Diggy", "Pallo Latke"] },
    { answer: "Bom Diggy Diggy", ytId: "G6yNa-FG0Wo", options: ["Bom Diggy Diggy", "Kamariya", "Tareefan", "Laung Laachi"] },
    { answer: "Tareefan", ytId: "Qxzz6hCcU7s", options: ["Tareefan", "Bom Diggy", "Laung Laachi", "Qismat"] },
    { answer: "Laung Laachi", ytId: "gIuTKN8q1PM", options: ["Laung Laachi", "Tareefan", "Morni Banke", "Hauli Hauli"] },
    { answer: "Morni Banke", ytId: "GniJAGAMnxk", options: ["Morni Banke", "Laung Laachi", "Tenu Suit", "Aankh Marey"] },
    { answer: "Tenu Suit", ytId: "6GN-q3C6PCM", options: ["Tenu Suit", "Morni Banke", "Hauli Hauli", "Kamariya"] },
    { answer: "Aankh Marey", ytId: "4T5KMpHCVOI", options: ["Aankh Marey", "Ole Ole", "Tip Tip", "Choli Ke Peeche"] },
    { answer: "Tip Tip", ytId: "WG-Gp9ZAqsI", options: ["Tip Tip", "Aankh Marey", "Jumma Chumma", "Choli Ke Peeche"] },
    { answer: "Choli Ke Peeche", ytId: "7p3YBhHl3Yk", options: ["Choli Ke Peeche", "Tip Tip", "Munni Badnaam", "Sheila"] },
    { answer: "Munni Badnaam", ytId: "mDwPFBjWcNI", options: ["Munni Badnaam", "Sheila Ki Jawani", "Fevicol Se", "Chikni Chameli"] },
    { answer: "Sheila Ki Jawani", ytId: "APoFpBHFkw4", options: ["Sheila Ki Jawani", "Munni Badnaam", "Fevicol Se", "Lovely"] },
    { answer: "Fevicol Se", ytId: "X1_EsZNUwrg", options: ["Fevicol Se", "Sheila Ki Jawani", "Chikni Chameli", "Balam Pichkari"] },
    { answer: "Balam Pichkari", ytId: "j_fUHSJ0IiY", options: ["Balam Pichkari", "Fevicol Se", "Lovely", "Badtameez Dil"] },
    // 🔥 ROMANTIC HINDI
    { answer: "Tum Hi Ho", ytId: "X4WNTORtpHI", options: ["Tum Hi Ho", "Kesariya", "Channa Mereya", "Raataan Lambiyan"] },
    { answer: "Kesariya", ytId: "BddP6PYo2gs", options: ["Kesariya", "Tum Hi Ho", "Raataan Lambiyan", "Ranjha"] },
    { answer: "Raataan Lambiyan", ytId: "D1fjOBiRkVo", options: ["Raataan Lambiyan", "Kesariya", "Ranjha", "Ve Maahi"] },
    { answer: "Ranjha", ytId: "hk2cRv8DDRY", options: ["Ranjha", "Raataan Lambiyan", "Ve Maahi", "Filhaal"] },
    { answer: "Ve Maahi", ytId: "zH-ViNFvBe0", options: ["Ve Maahi", "Ranjha", "Raataan Lambiyan", "Tera Ban Jaunga"] },
    { answer: "Tera Ban Jaunga", ytId: "APPnLSHFbFQ", options: ["Tera Ban Jaunga", "Bekhayali", "Kaise Hua", "Pehla Pyaar"] },
    { answer: "Bekhayali", ytId: "TumTmx0dO4M", options: ["Bekhayali", "Tera Ban Jaunga", "Kaise Hua", "Tujhe Kitna"] },
    { answer: "Kaise Hua", ytId: "cHf58jEWHDc", options: ["Kaise Hua", "Bekhayali", "Shayad", "Tujhe Kitna"] },
    { answer: "Shayad", ytId: "4j3BwFdXi1c", options: ["Shayad", "Kaise Hua", "Tujhe Kitna", "Ik Vaari Aa"] },
    { answer: "Ik Vaari Aa", ytId: "MQMZ9LfSBGk", options: ["Ik Vaari Aa", "Shayad", "Hawayein", "Mere Naam Tu"] },
    // 🔥 ENGLISH LOVE
    { answer: "Perfect", ytId: "2Vv-BfVoq4g", options: ["Perfect", "Thinking Out Loud", "Photograph", "Shape of You"] },
    { answer: "Thinking Out Loud", ytId: "lp-EO5I60KA", options: ["Thinking Out Loud", "Perfect", "All of Me", "A Thousand Years"] },
    { answer: "All of Me", ytId: "450p7goxZqg", options: ["All of Me", "Perfect", "Love Story", "Shallow"] },
    { answer: "Love Story", ytId: "8xg3vE8Ie_E", options: ["Love Story", "All of Me", "Lover", "You Belong With Me"] },
    { answer: "A Thousand Years", ytId: "QJO3ROT-A4E", options: ["A Thousand Years", "Love Story", "Perfect", "All of Me"] },
    { answer: "Lover", ytId: "E1ILXnn1o5s", options: ["Lover", "Love Story", "Blank Space", "Wildest Dreams"] },
    { answer: "Shallow", ytId: "bo_efYhYU2A", options: ["Shallow", "Always Remember Us", "Someone Like You", "Hello"] },
    { answer: "Someone Like You", ytId: "hLQl3WQQoQ0", options: ["Someone Like You", "Hello", "Rolling Deep", "Set Fire"] },
    // 🎵 90s CLASSICS
    { answer: "Kuch Kuch Hota Hai", ytId: "c5OH2DVrHec", options: ["Kuch Kuch Hota Hai", "Tujhe Yaad Na", "Ladki Badi", "Koi Mil Gaya"] },
    { answer: "Dil To Pagal Hai", ytId: "N6k5h_FTRQQ", options: ["Dil To Pagal Hai", "Tujhe Dekha Toh", "Bole Chudiyan", "Suraj Hua"] },
    { answer: "Tujhe Dekha Toh", ytId: "kKPvFCiLBkM", options: ["Tujhe Dekha Toh", "Dil To Pagal Hai", "Mehndi Laga Ke", "Baazigar"] },
    { answer: "Bole Chudiyan", ytId: "m4s_4UuNBUA", options: ["Bole Chudiyan", "Kabhi Khushi", "Suraj Hua", "Deewana Hai"] },
    { answer: "Suraj Hua Maddham", ytId: "0VXk23lk3Gk", options: ["Suraj Hua Maddham", "Bole Chudiyan", "Kabhi Khushi", "Poo Ba"] },
]

function getRandomSongs(pool, count = 5) {
    const shuffled = [...pool].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, count)
}

// ════════════════════════════════════════════════════════════════════════════
// SONG GUESS GAME (Audio Autoplay + Timer + Prograss Bar)
// ════════════════════════════════════════════════════════════════════════════
const GUESS_TIME = 12

function SongGuessGame({ onScore }) {
    const [songs] = useState(() => getRandomSongs(ALL_SONGS, 5))
    const [cur, setCur] = useState(0)
    const [totalScore, setTotalScore] = useState(0)
    const [results, setResults] = useState([])
    const [done, setDone] = useState(false)
    const [timeLeft, setTimeLeft] = useState(GUESS_TIME)
    const [selected, setSelected] = useState(null)
    const [wrongFlash, setWrongFlash] = useState(false)
    const [key, setKey] = useState(0)
    const timerRef = useRef(null)
    const timeRef = useRef(GUESS_TIME)

    const song = songs[cur]

    const goNext = useCallback((ns, nr) => {
        if (cur + 1 >= songs.length) {
            setDone(true)
            sfx.win()
            sendScore("Song Guess", ns)
            onScore(ns)
        } else {
            setCur(c => c + 1)
            setKey(k => k + 1)
        }
    }, [cur, songs.length, onScore])

    const startTimer = useCallback(() => {
        clearInterval(timerRef.current)
        timeRef.current = GUESS_TIME
        setTimeLeft(GUESS_TIME)
        timerRef.current = setInterval(() => {
            timeRef.current -= 1
            setTimeLeft(timeRef.current)
            if (timeRef.current <= 0) {
                clearInterval(timerRef.current)
                const nr = [...results, { correct: false, pts: 0, song: song.answer }]
                const ns = totalScore
                setResults(nr)
                goNext(ns, nr)
            }
        }, 1000)
    }, [song.answer, results, totalScore, goNext])

    useEffect(() => {
        setSelected(null)
        setWrongFlash(false)
        startTimer()
        return () => clearInterval(timerRef.current)
    }, [cur, startTimer])

    const handleAnswer = (opt) => {
        if (selected !== null) return
        clearInterval(timerRef.current)
        const correct = opt === song.answer
        const pts = correct ? Math.max(5, Math.round((timeRef.current / GUESS_TIME) * 30)) : -5
        setSelected(opt)

        if (correct) {
            sfx.correct()
            const nr = [...results, { correct: true, pts, song: song.answer }]
            const ns = totalScore + pts
            setResults(nr)
            setTotalScore(ns)
            setTimeout(() => goNext(ns, nr), 800)
        } else {
            sfx.wrong()
            vibrate()
            setWrongFlash(true)
            setTimeout(() => setWrongFlash(false), 500)
            const nr = [...results, { correct: false, pts, song: song.answer }]
            const ns = totalScore + pts
            setResults(nr)
            setTotalScore(ns)
            setTimeout(() => goNext(ns, nr), 1200)
        }
    }

    if (done) return (
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-3 w-full">
            <p className="text-white font-black text-xl" style={{ fontFamily: FONT }}>🎉 Ho Gaya!</p>
            <p style={{ fontFamily: FONT, color: "#f472b6", fontSize: 32, fontWeight: 900 }}>{totalScore} pts</p>
            <div className="space-y-1.5 w-full">
                {results.map((r, i) => (
                    <div key={i} className="flex justify-between text-sm px-3 py-2 rounded-xl" style={{ background: "rgba(255,255,255,0.04)" }}>
                        <span style={{ color: r.correct ? "#4ade80" : "#f87171" }}>{r.correct ? "✓" : "✗"} {r.song}</span>
                        <span className="font-bold" style={{ color: r.pts > 0 ? "#4ade80" : "#f87171" }}>{r.pts > 0 ? "+" : ""}{r.pts}</span>
                    </div>
                ))}
            </div>
        </motion.div>
    )

    const timePct = (timeLeft / GUESS_TIME) * 100

    return (
        <motion.div
            className="flex flex-col items-center gap-4 w-full max-w-sm"
            animate={wrongFlash ? { x: [-6, 6, -4, 4, 0] } : {}}
            transition={{ duration: 0.3 }}
        >
            {/* Progress Bar with Timer */}
            <div className="w-full">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-purple-400" style={{ fontFamily: FONT }}>{cur + 1}/{songs.length}</span>
                    <span className="font-bold" style={{ color: timeLeft > 6 ? "#c084fc" : timeLeft > 3 ? "#fbbf24" : "#f87171" }}>{timeLeft}s</span>
                </div>
                <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                    <motion.div
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(90deg,#ec4899,#8b5cf6)" }}
                        animate={{ width: `${timePct}%` }}
                        transition={{ duration: 0.5, ease: "linear" }}
                    />
                </div>
                <p className="text-[10px] text-purple-500 text-right mt-0.5">⚡ jaldi = zyada points</p>
            </div>

            {/* Audio Player - Autoplay */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={`player-${cur}-${key}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full rounded-2xl overflow-hidden"
                    style={{ background: "rgba(15,5,30,0.8)", border: "1px solid rgba(139,92,246,0.3)" }}
                >
                    <iframe
                        src={`https://www.youtube.com/embed/${song.ytId}?autoplay=1&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1`}
                        allow="autoplay; encrypted-media"
                        style={{ width: "100%", height: 65, border: "none" }}
                        title="song"
                    />
                    <div className="px-3 py-2 flex items-center gap-2 border-t border-purple-500/20">
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#ec4899", boxShadow: "0 0 6px #ec4899" }} />
                        <p className="text-purple-400 text-xs">Ye kaunsa gaana hai?</p>
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Options Grid */}
            <div className="grid grid-cols-2 gap-2 w-full">
                {song.options.map(opt => {
                    const isSel = selected === opt
                    const isCorrect = opt === song.answer
                    let bg = "rgba(255,255,255,0.04)"
                    let border = "rgba(255,255,255,0.1)"
                    let textColor = "#e2e8f0"
                    if (selected !== null) {
                        if (isCorrect) { bg = "rgba(34,197,94,0.2)"; border = "#4ade80"; textColor = "#4ade80" }
                        else if (isSel) { bg = "rgba(239,68,68,0.2)"; border = "#f87171"; textColor = "#f87171" }
                    }
                    return (
                        <motion.button
                            key={opt}
                            onClick={() => handleAnswer(opt)}
                            disabled={selected !== null}
                            className="py-3 px-2 rounded-xl text-sm font-semibold text-center"
                            style={{ fontFamily: FONT, background: bg, border: `1.5px solid ${border}`, color: textColor }}
                            whileHover={!selected ? { scale: 1.02 } : {}}
                            whileTap={!selected ? { scale: 0.96 } : {}}
                        >
                            {opt}
                        </motion.button>
                    )
                })}
            </div>

            {/* Score Display */}
            <div className="flex justify-end w-full mt-1">
                <span className="text-sm font-bold text-white" style={{ fontFamily: FONT }}>🏆 {totalScore}</span>
            </div>
        </motion.div>
    )
}

// ════════════════════════════════════════════════════════════════════════════
// MEMORY MATCH (Pure Icons - No Text)
// ════════════════════════════════════════════════════════════════════════════
const CARD_SYMBOLS = [
    { id: "heart", path: "M12 21.593c-5.63-5.539-11-10.297-11-14.402 0-3.791 3.068-5.191 5.281-5.191 1.312 0 4.151.501 5.719 4.457 1.59-3.968 4.464-4.447 5.726-4.447 2.54 0 5.274 1.621 5.274 5.181 0 4.069-5.136 8.625-11 14.402z", color: "#ec4899" },
    { id: "star", path: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", color: "#f59e0b" },
    { id: "moon", path: "M21 12.79A7 7 0 1 1 11.21 3 7 7 0 0 0 21 12.79z", color: "#818cf8" },
    { id: "drop", path: "M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z", color: "#34d399" },
    { id: "bolt", path: "M13 2L3 14h9l-1 8 10-12h-9l1-8z", color: "#60a5fa" },
    { id: "gem", path: "M2 9l3-3h14l3 3-10 13L2 9zM3 9h18M8 6l-2 3 6 8 6-8-2-3", color: "#a78bfa" },
    { id: "fire", path: "M8.5 14.5A2.5 2.5 0 0011 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 11-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 002.5 3z", color: "#f97316" },
    { id: "sun", path: "M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 5a7 7 0 1 0 0 14A7 7 0 0 0 12 5z", color: "#fbbf24" },
]

function SymbolCard({ symbol, flipped, matched, onClick }) {
    return (
        <motion.div className="aspect-square cursor-pointer" onClick={onClick} whileTap={{ scale: 0.92 }}>
            <motion.div className="w-full h-full relative" style={{ transformStyle: "preserve-3d" }}
                animate={{ rotateY: flipped || matched ? 180 : 0 }} transition={{ duration: 0.25 }}>
                <div className="absolute inset-0 rounded-xl flex items-center justify-center"
                    style={{ backfaceVisibility: "hidden", background: "linear-gradient(135deg,#7c3aed,#db2777)" }}>
                    <div style={{ width: 18, height: 18, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)" }} />
                </div>
                <div className="absolute inset-0 rounded-xl flex items-center justify-center"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)", background: matched ? "rgba(34,197,94,0.12)" : "rgba(255,255,255,0.04)", border: matched ? "1px solid rgba(34,197,94,0.4)" : `1px solid ${symbol.color}40` }}>
                    <svg viewBox="0 0 24 24" fill={symbol.color} stroke={symbol.color} strokeWidth="1" style={{ width: "42%", height: "42%" }}>
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
        const symbols = [...CARD_SYMBOLS, ...CARD_SYMBOLS].sort(() => Math.random() - 0.5).map((s, i) => ({ ...s, uid: i, flipped: false, matched: false }))
        setCards(symbols); setFlipped([]); setMoves(0); setMatchedCount(0); setDisabled(false); setDone(false); setScore(0)
    }

    useEffect(() => { init() }, [])

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
                const updated = next.map(x => nf.includes(x.uid) ? { ...x, matched: true } : x)
                setCards(updated); setFlipped([]); setDisabled(false)
                setMatchedCount(mc => {
                    const nm = mc + 1
                    if (nm === CARD_SYMBOLS.length) {
                        const finalScore = Math.max(0, 100 - (moves + 1) * 2)
                        setScore(finalScore); setDone(true); sfx.win()
                        sendScore("Memory", finalScore); onScore(finalScore)
                    }
                    return nm
                })
            } else {
                sfx.wrong(); vibrate()
                setTimeout(() => {
                    setCards(p => p.map(x => nf.includes(x.uid) ? { ...x, flipped: false } : x))
                    setFlipped([]); setDisabled(false)
                }, 800)
            }
        }
    }

    return (
        <div className="flex flex-col items-center gap-3 w-full">
            <div className="flex items-center justify-between w-full px-1">
                <span className="text-xs text-purple-400" style={{ fontFamily: FONT }}>🎴 {moves}</span>
                <span className="text-xs text-purple-400" style={{ fontFamily: FONT }}>✓ {matchedCount}/{CARD_SYMBOLS.length}</span>
                <button onClick={init} className="text-purple-500 hover:text-purple-300"><RotateCcw size={13} /></button>
            </div>
            <div className="grid gap-2 w-full" style={{ gridTemplateColumns: "repeat(4,1fr)" }}>
                {cards.map(c => <SymbolCard key={c.uid} symbol={c} flipped={c.flipped} matched={c.matched} onClick={() => flip(c.uid)} />)}
            </div>
            {done && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center mt-1">
                    <p style={{ fontFamily: FONT, color: "#f472b6", fontSize: 22, fontWeight: 900 }}>{score} pts</p>
                </motion.div>
            )}
        </div>
    )
}

// ════════════════════════════════════════════════════════════════════════════
// COLOR MATCH (Stroop - Simple)
// ════════════════════════════════════════════════════════════════════════════
const COLOR_PALETTE = [
    { name: "लाल", hex: "#ef4444" }, { name: "नीला", hex: "#3b82f6" },
    { name: "हरा", hex: "#22c55e" }, { name: "पीला", hex: "#eab308" },
    { name: "गुलाबी", hex: "#ec4899" }, { name: "बैंगनी", hex: "#a855f7" },
]

function makeQuestion() {
    const word = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]
    let ink = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]
    while (ink.name === word.name) ink = COLOR_PALETTE[Math.floor(Math.random() * COLOR_PALETTE.length)]
    const opts = [ink, ...COLOR_PALETTE.filter(c => c.name !== ink.name).sort(() => Math.random() - 0.5).slice(0, 3)].sort(() => Math.random() - 0.5)
    return { word: word.name, inkHex: ink.hex, inkName: ink.name, opts }
}

function ColorMatchGame({ onScore }) {
    const [questions] = useState(() => Array.from({ length: 8 }, makeQuestion))
    const [cur, setCur] = useState(0)
    const [score, setScore] = useState(0)
    const [time, setTime] = useState(18)
    const [done, setDone] = useState(false)
    const [results, setResults] = useState([])
    const [selected, setSelected] = useState(null)
    const [wrongFlash, setWrongFlash] = useState(false)
    const timerRef = useRef(null)
    const scoreRef = useRef(0)

    const finish = useCallback((finalScore) => {
        setDone(true); sfx.win()
        sendScore("Color Match", finalScore); onScore(finalScore)
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

    const handleAnswer = (name) => {
        if (selected || done) return
        const q = questions[cur]
        const correct = name === q.inkName
        if (correct) sfx.correct()
        else { sfx.wrong(); vibrate(); setWrongFlash(true); setTimeout(() => setWrongFlash(false), 400) }
        const pts = correct ? 10 : -3
        const newScore = score + pts
        scoreRef.current = newScore
        setSelected(name); setScore(newScore); setResults([...results, { correct, pts }])
        setTimeout(() => {
            if (cur + 1 >= questions.length) { clearInterval(timerRef.current); finish(newScore) }
            else { setCur(c => c + 1); setSelected(null) }
        }, 450)
    }

    const q = questions[cur]
    if (done) return (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center">
            <p style={{ fontFamily: FONT, color: "#f472b6", fontSize: 26, fontWeight: 900 }}>{score} pts</p>
            <p className="text-purple-400 text-xs mt-1">{results.filter(r => r.correct).length}/8 सही</p>
        </motion.div>
    )

    return (
        <motion.div className="flex flex-col items-center gap-4 w-full max-w-sm" animate={wrongFlash ? { x: [-5, 5, -3, 3, 0] } : {}} transition={{ duration: 0.3 }}>
            <div className="w-full">
                <div className="flex justify-between text-xs mb-1">
                    <span className="text-purple-400">{cur + 1}/8</span>
                    <span style={{ color: time <= 5 ? "#f87171" : "#c084fc" }}>{time}s</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-white/10">
                    <motion.div className="h-full rounded-full" style={{ background: "linear-gradient(90deg,#ec4899,#8b5cf6)" }}
                        animate={{ width: `${(time / 18) * 100}%` }} transition={{ duration: 0.3 }} />
                </div>
            </div>
            <motion.div key={cur} initial={{ y: 8, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                className="w-full rounded-2xl p-5 text-center" style={{ background: "rgba(15,5,30,0.8)", border: "1px solid rgba(139,92,246,0.2)" }}>
                <p className="text-[10px] uppercase text-purple-500 mb-2">क्या रंग है?</p>
                <p className="font-black" style={{ fontFamily: FONT, fontSize: 40, color: q.inkHex }}>{q.word}</p>
            </motion.div>
            <div className="grid grid-cols-2 gap-2 w-full">
                {q.opts.map(opt => {
                    const isSel = selected === opt.name, isCorrect = opt.name === q.inkName
                    let bg = `${opt.hex}15`, border = `${opt.hex}50`, textCol = "#ddd"
                    if (selected) {
                        if (isCorrect) { bg = "rgba(34,197,94,0.2)"; border = "#4ade80"; textCol = "#4ade80" }
                        else if (isSel) { bg = "rgba(239,68,68,0.2)"; border = "#f87171"; textCol = "#f87171" }
                    }
                    return (
                        <motion.button key={opt.name} onClick={() => handleAnswer(opt.name)} disabled={!!selected}
                            className="py-2 rounded-xl text-sm font-bold flex items-center justify-center gap-1.5"
                            style={{ fontFamily: FONT, background: bg, border: `1.5px solid ${border}`, color: textCol }}
                            whileHover={!selected ? { scale: 1.02 } : {}} whileTap={!selected ? { scale: 0.96 } : {}}>
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: opt.hex }} />
                            {opt.name}
                        </motion.button>
                    )
                })}
            </div>
        </motion.div>
    )
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN
// ════════════════════════════════════════════════════════════════════════════
const GAMES = [
    { id: "memory", label: "Memory Match", Icon: Brain, accent: "#ec4899", desc: "जोड़ी मिलाओ" },
    { id: "song", label: "Song Guess", Icon: Music2, accent: "#a855f7", desc: "गाना पहचानो" },
    { id: "color", label: "Color Match", Icon: Palette, accent: "#3b82f6", desc: "रंग पहचानो" },
]

export default function FunGames({ onComplete }) {
    const [active, setActive] = useState(null)
    const [scores, setScores] = useState({ memory: null, song: null, color: null })

    useEffect(() => {
        const saved = localStorage.getItem("fun_scores")
        if (saved) try { setScores(JSON.parse(saved)) } catch { }
    }, [])

    const saveScore = (id, val) => {
        const updated = { ...scores, [id]: val }
        setScores(updated)
        localStorage.setItem("fun_scores", JSON.stringify(updated))
    }

    const total = Object.values(scores).reduce((a, b) => a + (b || 0), 0)
    const allDone = Object.values(scores).every(v => v !== null)

    return (
        <motion.div className="min-h-screen flex flex-col items-center pt-10 pb-12 px-4 relative overflow-hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>
            
            {/* Background Glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute w-80 h-80 rounded-full bg-pink-500/10 top-10 -left-20 blur-[60px]" />
                <div className="absolute w-80 h-80 rounded-full bg-purple-500/10 bottom-10 -right-20 blur-[60px]" />
            </div>

            <div className="relative z-10 w-full max-w-sm mx-auto">
                <div className="text-center mb-6">
                    <GlowIcon color="#ec4899" size={48}>
                        <Trophy size={18} color="#ec4899" />
                    </GlowIcon>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mt-2">Games</h1>
                    <div className="inline-flex items-center gap-2 mt-2 px-4 py-1 rounded-full bg-pink-500/10 border border-pink-500/30">
                        <span className="text-white font-bold text-sm">{total} pts</span>
                    </div>
                </div>

                <AnimatePresence mode="wait">
                    {!active ? (
                        <motion.div key="menu" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
                            {GAMES.map((g, i) => (
                                <motion.button key={g.id} initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
                                    onClick={() => setActive(g.id)}
                                    className="w-full flex items-center gap-4 p-4 rounded-2xl backdrop-blur-sm"
                                    style={{ background: "rgba(15,5,30,0.6)", border: scores[g.id] !== null ? "1px solid rgba(34,197,94,0.4)" : "1px solid rgba(168,85,247,0.2)" }}
                                    whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                                    <GlowIcon color={g.accent} size={40}>
                                        <g.Icon size={16} color={g.accent} />
                                    </GlowIcon>
                                    <div className="flex-1 text-left">
                                        <p className="text-white font-bold text-sm">{g.label}</p>
                                        <p className="text-purple-400 text-xs">{g.desc}</p>
                                    </div>
                                    {scores[g.id] !== null ? (
                                        <span className="text-green-400 font-bold text-lg">{scores[g.id]}</span>
                                    ) : <ChevronRight size={14} color="#7c3aed" />}
                                </motion.button>
                            ))}
                            {allDone && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center pt-4">
                                    <p className="text-white font-bold mb-2">🎉 सब हो गया!</p>
                                    <motion.button onClick={() => onComplete(total)}
                                        className="inline-flex items-center gap-2 text-white font-bold px-8 py-3 rounded-full"
                                        style={{ background: "linear-gradient(135deg,#ec4899,#8b5cf6)" }}
                                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                                        आगे बढ़ें <ArrowRight size={16} />
                                    </motion.button>
                                </motion.div>
                            )}
                        </motion.div>
                    ) : (
                        <motion.div key={active} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col items-center gap-3">
                            <button onClick={() => setActive(null)} className="self-start text-xs text-purple-400 hover:text-white mb-1">← पीछे</button>
                            {active === "memory" && <MemoryGame onScore={s => { saveScore("memory", s); setTimeout(() => setActive(null), 1500) }} />}
                            {active === "song" && <SongGuessGame onScore={s => { saveScore("song", s); setTimeout(() => setActive(null), 2000) }} />}
                            {active === "color" && <ColorMatchGame onScore={s => { saveScore("color", s); setTimeout(() => setActive(null), 1500) }} />}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    )
}