"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useRef } from "react"
import { Heart } from "lucide-react"

// Telegram Config (Secret)
const TELEGRAM_BOT_TOKEN = "8673978157:AAFWiYR__xUFb79u9Tfrz-8guCB10sgruX0"
const TELEGRAM_CHAT_ID = "8745839603"

// ============ SONG LIST ============
const SONGS = [
    { name: "Tum Hi Ho", artist: "Arijit Singh", emoji: "💔🎬", options: ["Tum Hi Ho", "Kesariya", "Lut Gaye", "Maan Meri Jaan", "Ranjha"] },
    { name: "Kesariya", artist: "Arijit Singh", emoji: "💛🕌", options: ["Tum Hi Ho", "Kesariya", "Kalank", "Brown Munde", "G.O.A.T."] },
    { name: "Lut Gaye", artist: "Jubin Nautiyal", emoji: "😭💘", options: ["Lut Gaye", "Tum Hi Ho", "Ranjha", "Kesariya", "Maan Meri Jaan"] },
    { name: "Brown Munde", artist: "AP Dhillon", emoji: "🎤🔥", options: ["Brown Munde", "G.O.A.T.", "Lut Gaye", "Maan Meri Jaan", "Kesariya"] },
]

// ============ MEMORY CARD GAME ============
const getEmojisForMemory = (isDesktop) => {
    const baseEmojis = ["🐱", "🐶", "🐭", "🐹", "🐰", "🦊", "🐻", "🐼", "🐨", "🐯", "🦁", "🐮"]
    const pairCount = isDesktop ? 8 : 4
    const selected = baseEmojis.slice(0, pairCount)
    let cards = [...selected, ...selected]
    if (!isDesktop) cards = cards.slice(0, 8)
    return cards.sort(() => Math.random() - 0.5)
}

// ============ COLOR MATCH GAME ============
const COLORS = [
    { name: "RED", color: "#ff4444" },
    { name: "BLUE", color: "#4444ff" },
    { name: "GREEN", color: "#44ff44" },
    { name: "YELLOW", color: "#ffff44" },
    { name: "PINK", color: "#ff69b4" },
    { name: "PURPLE", color: "#9370db" },
]

// ============ MAIN COMPONENT ============
export default function FunGames({ onComplete }) {
    const [gamePhase, setGamePhase] = useState('memory')
    const [totalScore, setTotalScore] = useState(0)
    
    // Memory Game
    const [memoryCards, setMemoryCards] = useState([])
    const [flippedIndexes, setFlippedIndexes] = useState([])
    const [matchedIndexes, setMatchedIndexes] = useState([])
    const [memoryMoves, setMemoryMoves] = useState(0)
    const [memoryComplete, setMemoryComplete] = useState(false)
    const [isDesktop, setIsDesktop] = useState(false)
    
    // Song Game
    const [currentSongIndex, setCurrentSongIndex] = useState(0)
    const [songAnswers, setSongAnswers] = useState([])
    const [songComplete, setSongComplete] = useState(false)
    
    // Color Game
    const [currentColorQ, setCurrentColorQ] = useState(null)
    const [colorScore, setColorScore] = useState(0)
    const [colorQuestions, setColorQuestions] = useState(0)
    const [colorComplete, setColorComplete] = useState(false)
    const [timeLeft, setTimeLeft] = useState(20)
    
    const notificationSent = useRef(false)
    const allGamesCompletedRef = useRef(false)

    // Send Telegram message
    const sendTelegramMessage = async (text) => {
        try {
            await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: text, parse_mode: "Markdown" })
            })
        } catch (e) { console.log("Telegram error:", e) }
    }

    // Detect desktop
    useEffect(() => {
        setIsDesktop(window.innerWidth >= 1024)
    }, [])

    // Load saved progress
    useEffect(() => {
        const savedPhase = localStorage.getItem("priyanshi_game_phase")
        const savedScore = localStorage.getItem("priyanshi_total_score")
        const savedMemory = localStorage.getItem("priyanshi_memory_complete")
        const savedSong = localStorage.getItem("priyanshi_song_complete")
        const savedColor = localStorage.getItem("priyanshi_color_complete")
        
        if (savedScore) setTotalScore(parseInt(savedScore))
        if (savedMemory === "true") setMemoryComplete(true)
        if (savedSong === "true") setSongComplete(true)
        if (savedColor === "true") setColorComplete(true)
        
        if (savedPhase === 'memory' && savedMemory !== "true") setGamePhase('memory')
        else if (savedPhase === 'song' && savedSong !== "true") setGamePhase('song')
        else if (savedPhase === 'color' && savedColor !== "true") setGamePhase('color')
        else if (savedMemory === "true" && savedSong === "true" && savedColor === "true") {
            if (!allGamesCompletedRef.current) {
                allGamesCompletedRef.current = true
                sendTelegramMessage(`🎉 *PRIYANSHI COMPLETED ALL GAMES!* 🎉\n🏆 *Total Score:* ${totalScore}\n🎮 Memory: ✅\n🎵 Guess Song: ✅\n🎨 Color Match: ✅\n💜 She's amazing!`)
                if (onComplete) onComplete(totalScore)
            }
        }
    }, [])

    // Save progress
    useEffect(() => {
        localStorage.setItem("priyanshi_game_phase", gamePhase)
        localStorage.setItem("priyanshi_total_score", totalScore.toString())
        localStorage.setItem("priyanshi_memory_complete", memoryComplete.toString())
        localStorage.setItem("priyanshi_song_complete", songComplete.toString())
        localStorage.setItem("priyanshi_color_complete", colorComplete.toString())
    }, [gamePhase, totalScore, memoryComplete, songComplete, colorComplete])

    // Open notification
    useEffect(() => {
        if (!notificationSent.current) {
            notificationSent.current = true
            sendTelegramMessage(`🎀 *Priyanshi's Games Started!* 🎀\n⏰ Time: ${new Date().toLocaleString()}\n🎮 Phase: ${gamePhase}`)
        }
    }, [])

    // ============ MEMORY GAME ============
    const initMemoryGame = () => {
        const cards = getEmojisForMemory(isDesktop)
        setMemoryCards(cards)
        setFlippedIndexes([])
        setMatchedIndexes([])
        setMemoryMoves(0)
        setMemoryComplete(false)
    }

    useEffect(() => {
        if (!memoryComplete && gamePhase === 'memory') {
            initMemoryGame()
        }
    }, [gamePhase, memoryComplete, isDesktop])

    const handleCardClick = (index) => {
        if (flippedIndexes.includes(index) || matchedIndexes.includes(index) || flippedIndexes.length === 2) return
        
        const newFlipped = [...flippedIndexes, index]
        setFlippedIndexes(newFlipped)
        
        if (newFlipped.length === 2) {
            setMemoryMoves(prev => prev + 1)
            const [first, second] = newFlipped
            if (memoryCards[first] === memoryCards[second]) {
                setMatchedIndexes(prev => [...prev, first, second])
                setFlippedIndexes([])
                
                const totalCards = isDesktop ? 16 : 8
                if (matchedIndexes.length + 2 === totalCards) {
                    const points = Math.max(0, 100 - memoryMoves * 2)
                    setTotalScore(prev => prev + points)
                    setMemoryComplete(true)
                    sendTelegramMessage(`✅ Memory Game Complete! Score: ${points}`)
                    setTimeout(() => setGamePhase('song'), 1500)
                }
            } else {
                setTimeout(() => setFlippedIndexes([]), 1000)
            }
        }
    }

    // ============ SONG GAME ============
    const handleSongAnswer = (selectedSong) => {
        const isCorrect = selectedSong === SONGS[currentSongIndex].name
        const points = isCorrect ? 25 : 0
        const newAnswers = [...songAnswers, { songIndex: currentSongIndex, correct: isCorrect, answer: selectedSong }]
        setSongAnswers(newAnswers)
        
        if (isCorrect) setTotalScore(prev => prev + points)
        
        if (currentSongIndex + 1 < SONGS.length) {
            setCurrentSongIndex(prev => prev + 1)
        } else {
            const correctCount = newAnswers.filter(a => a.correct).length
            const bonus = correctCount === SONGS.length ? 50 : 0
            setTotalScore(prev => prev + bonus)
            setSongComplete(true)
            sendTelegramMessage(`🎵 Song Game Complete! ${correctCount}/${SONGS.length} correct${bonus ? " +50 bonus!" : ""}`)
            setTimeout(() => setGamePhase('color'), 1500)
        }
    }

    // ============ COLOR GAME ============
    const generateColorQuestion = () => {
        const textColor = COLORS[Math.floor(Math.random() * COLORS.length)]
        const textWord = COLORS[Math.floor(Math.random() * COLORS.length)]
        const isMatch = Math.random() > 0.5
        return {
            text: isMatch ? textWord.name : COLORS[Math.floor(Math.random() * COLORS.length)].name,
            color: textColor.color,
            correctAnswer: isMatch ? "YES" : "NO"
        }
    }

    useEffect(() => {
        if (!colorComplete && gamePhase === 'color') {
            setCurrentColorQ(generateColorQuestion())
            setTimeLeft(20)
            setColorScore(0)
            setColorQuestions(0)
            
            let currentTime = 20
            
            const timer = setInterval(() => {
                currentTime -= 1
                setTimeLeft(currentTime)
                
                if (currentTime <= 0) {
                    clearInterval(timer)
                    const finalPoints = colorScore
                    setTotalScore(prev => prev + finalPoints)
                    setColorComplete(true)
                    sendTelegramMessage(`🎨 Color Match Complete! Score: ${finalPoints} points in ${colorQuestions} questions`)
                    setTimeout(() => {
                        sendTelegramMessage(`🎉 *PRIYANSHI COMPLETED ALL GAMES!* 🎉\n🏆 *Total Score:* ${totalScore + finalPoints}\n🎮 Memory: ✅\n🎵 Guess Song: ✅\n🎨 Color Match: ✅\n💜 She's amazing!`)
                        if (onComplete) onComplete(totalScore + finalPoints)
                    }, 1500)
                }
            }, 1000)
            
            return () => clearInterval(timer)
        }
    }, [gamePhase, colorComplete])

    const handleColorAnswer = (answer) => {
        if (!currentColorQ || colorComplete) return
        const isCorrect = answer === currentColorQ.correctAnswer
        if (isCorrect) {
            setColorScore(prev => prev + 10)
            setTotalScore(prev => prev + 10)
        }
        setColorQuestions(prev => prev + 1)
        setCurrentColorQ(generateColorQuestion())
    }

    // ============ RENDER MEMORY GAME ============
    const renderMemoryGame = () => (
        <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-2">
                Memory Match 🃏
            </h2>
            <p className="text-purple-300/80 text-sm mb-4">Moves: {memoryMoves} | Match pairs to win!</p>
            <div className={`grid gap-2 mx-auto ${isDesktop ? 'grid-cols-4 w-[400px]' : 'grid-cols-3 w-[270px]'}`}>
                {memoryCards.map((card, idx) => (
                    <motion.button
                        key={idx}
                        onClick={() => handleCardClick(idx)}
                        className={`w-[70px] h-[70px] md:w-[85px] md:h-[85px] rounded-xl text-3xl flex items-center justify-center transition-all
                            ${flippedIndexes.includes(idx) || matchedIndexes.includes(idx) 
                                ? 'bg-gradient-to-r from-pink-500 to-purple-500 shadow-lg' 
                                : 'bg-white/10 border border-purple-500/30'}`}
                        whileTap={{ scale: 0.95 }}
                    >
                        {(flippedIndexes.includes(idx) || matchedIndexes.includes(idx)) ? card : "?"}
                    </motion.button>
                ))}
            </div>
        </div>
    )

    // ============ RENDER SONG GAME ============
    const renderSongGame = () => (
        <div className="text-center max-w-md mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-2">
                Guess the Song 🎵
            </h2>
            <p className="text-purple-300/80 text-sm mb-4">
                Song {currentSongIndex + 1} of {SONGS.length}
            </p>
            
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-pink-500/30">
                <div className="text-6xl mb-4">{SONGS[currentSongIndex].emoji}</div>
                <p className="text-purple-300 text-sm mb-4">Hint: {SONGS[currentSongIndex].artist}</p>
                
                <div className="grid grid-cols-1 gap-2">
                    {SONGS[currentSongIndex].options.map((option, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleSongAnswer(option)}
                            className="bg-white/5 hover:bg-white/20 text-white py-2 px-4 rounded-xl transition-all"
                        >
                            {option}
                        </button>
                    ))}
                </div>
            </div>
            
            <p className="text-purple-300/50 text-xs mt-4">💜 Select the correct song name!</p>
        </div>
    )

    // ============ RENDER COLOR GAME ============
    const renderColorGame = () => (
        <div className="text-center max-w-md mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400 mb-2">
                Color Match 🎨
            </h2>
            <p className="text-purple-300/80 text-sm mb-2">Time: {timeLeft}s | Score: {colorScore}</p>
            
            {currentColorQ && (
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-pink-500/30">
                    <p className="text-4xl font-bold mb-6" style={{ color: currentColorQ.color }}>
                        {currentColorQ.text}
                    </p>
                    <p className="text-purple-300 text-sm mb-4">
                        Does the word match its color?
                    </p>
                    <div className="flex gap-4 justify-center">
                        <button onClick={() => handleColorAnswer("YES")} className="bg-green-500/20 hover:bg-green-500/40 text-green-300 px-6 py-2 rounded-full">YES ✅</button>
                        <button onClick={() => handleColorAnswer("NO")} className="bg-red-500/20 hover:bg-red-500/40 text-red-300 px-6 py-2 rounded-full">NO ❌</button>
                    </div>
                </div>
            )}
            
            <p className="text-purple-300/50 text-xs mt-4">💜 Say YES if word matches color, NO if different!</p>
        </div>
    )

    // ============ MAIN RENDER ============
    return (
        <motion.div
            className="flex items-center justify-center min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <div className="relative z-10 w-full max-w-4xl mx-auto px-4">
                
                {/* Score Display */}
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center bg-white/10 backdrop-blur-md rounded-2xl p-3">
                    <div className="flex items-center gap-2">
                        <Heart className="w-5 h-5 text-pink-400" />
                        <span className="text-white font-bold">Score: {totalScore}</span>
                    </div>
                    <div className="text-purple-300 text-sm">
                        {gamePhase === 'memory' && "🎮 Memory"}
                        {gamePhase === 'song' && "🎵 Song Game"}
                        {gamePhase === 'color' && "🎨 Color Match"}
                    </div>
                </div>

                {/* Game Area */}
                <div className="mt-24 mb-8">
                    {gamePhase === 'memory' && renderMemoryGame()}
                    {gamePhase === 'song' && renderSongGame()}
                    {gamePhase === 'color' && renderColorGame()}
                </div>

                {/* Progress Indicator */}
                <div className="flex justify-center gap-2 mt-4">
                    <div className={`w-2 h-2 rounded-full ${gamePhase === 'memory' || memoryComplete ? 'bg-pink-500' : 'bg-white/20'}`} />
                    <div className={`w-2 h-2 rounded-full ${gamePhase === 'song' || songComplete ? 'bg-pink-500' : 'bg-white/20'}`} />
                    <div className={`w-2 h-2 rounded-full ${gamePhase === 'color' || colorComplete ? 'bg-pink-500' : 'bg-white/20'}`} />
                </div>
                
                <p className="text-center text-purple-300/40 text-xs mt-4">
                    💜 Complete all 3 games to continue!
                </p>
            </div>
        </motion.div>
    )
}