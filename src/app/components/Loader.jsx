"use client"

import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect, useCallback, useRef } from "react"
import { Heart, Timer, Award, Crown, Volume2, VolumeX, MessageCircle, Brain, Gift, Send, RotateCcw } from "lucide-react"

// Telegram Bot Configuration (SECRET)
const TELEGRAM_BOT_TOKEN = "8673978157:AAFWiYR__xUFb79u9Tfrz-8guCB10sgruX0"
const TELEGRAM_CHAT_ID = "8745839603"

// FINAL SELECTED QUESTIONS (14 total)
const SELECTED_QUESTIONS = [
    "Ek food jiske bina tu nahi reh sakti? 🍕",
    "Worst food experience kya tha? 🤢",
    "Midnight craving kya hoti hai? 🌙",
    "Apna signature dish kya hai? 👩‍🍳",
    "Chai ya Coffee? ☕",
    "Breakfast mein kya pasand hai? 🍳",
    "Ek cheez jo tu kabhi nahi khaayegi? 🚫",
    "Favourite dessert? 🍰",
    "Street food ya fine dining? 🚛",
    "Apni go-to comfort food? 🍜",
    "Teri biggest strength kya hai? 💪",
    "Tera life mantra kya hai? 🧘",
    "Tera biggest dream kya hai? 🌟",
    "Friendship mein tu kya dhundhti hai? Kaunsi cheez tujhe khush karti hai aur kaunsi gussa? 😊🫠😤"
]

const LOVE_LETTER_MESSAGES = [
    "💫 Hey Priyanshi...",
    "✨ You're not just a friend...",
    "🌟 You're a whole vibe!",
    "💜 Thanks for being awesome!",
    "🎉 Best friends like you are rare!",
    "🌸 Keep shining, superstar!",
]

export default function Loader({ onLoadingComplete }) {
    const [gameScore, setGameScore] = useState(0)
    const [timeLeft, setTimeLeft] = useState(25)
    const [hearts, setHearts] = useState([])
    const [gameActive, setGameActive] = useState(true)
    const [highScore, setHighScore] = useState(0)
    const [combo, setCombo] = useState(0)
    const [isMuted, setIsMuted] = useState(true)
    const [gameStarted, setGameStarted] = useState(false)
    
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [userAnswer, setUserAnswer] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showFeedback, setShowFeedback] = useState(false)
    const [feedbackMessage, setFeedbackMessage] = useState("")
    const [answeredQuestions, setAnsweredQuestions] = useState([])
    const [answeredIndexes, setAnsweredIndexes] = useState([])
    
    const [revealedMessages, setRevealedMessages] = useState(0)
    const [gamePhase, setGamePhase] = useState('game')
    const [dataLoaded, setDataLoaded] = useState(false)
    
    const catchSoundRef = useRef(null)
    const notificationSent = useRef(false)
    const heartColors = ["#ff69b4", "#ff1493", "#ff6b9d", "#ff85c1", "#ffb6c1"]

    // Helper function to send Telegram message (async but called properly)
    const sendTelegramMessage = useCallback(async (text) => {
        try {
            const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: TELEGRAM_CHAT_ID,
                    text: text,
                    parse_mode: "Markdown"
                })
            })
            return response.ok
        } catch (error) {
            console.log("Telegram error:", error)
            return false
        }
    }, [])

    // LOAD SAVED DATA
    useEffect(() => {
        const loadSavedData = () => {
            try {
                const savedAnswers = localStorage.getItem("priyanshi_answered_questions")
                if (savedAnswers) {
                    const parsed = JSON.parse(savedAnswers)
                    setAnsweredQuestions(parsed)
                    const indexes = parsed.map(q => q.index)
                    setAnsweredIndexes(indexes)
                    
                    let nextIndex = 0
                    while (indexes.includes(nextIndex) && nextIndex < SELECTED_QUESTIONS.length) {
                        nextIndex++
                    }
                    if (nextIndex < SELECTED_QUESTIONS.length) {
                        setCurrentQuestionIndex(nextIndex)
                    }
                }
                
                const savedScore = localStorage.getItem("priyanshi_game_score")
                if (savedScore) setGameScore(parseInt(savedScore))
                
                const savedHighScore = localStorage.getItem("priyanshiHeartScore")
                if (savedHighScore) setHighScore(parseInt(savedHighScore))
                
                const savedPhase = localStorage.getItem("priyanshi_game_phase")
                if (savedPhase && savedPhase !== 'game') {
                    setGamePhase(savedPhase)
                }
                
                const savedMessages = localStorage.getItem("priyanshi_letter_messages")
                if (savedMessages) setRevealedMessages(parseInt(savedMessages))
                
                const triviaComplete = localStorage.getItem("priyanshi_trivia_completed")
                if (triviaComplete === "true" && savedPhase !== 'letter') {
                    setGamePhase('letter')
                }
                
                setDataLoaded(true)
            } catch (e) {
                console.log("Error loading data:", e)
                setDataLoaded(true)
            }
        }
        loadSavedData()
    }, [])

    // SAVE DATA
    useEffect(() => {
        if (!dataLoaded) return
        localStorage.setItem("priyanshi_answered_questions", JSON.stringify(answeredQuestions))
        localStorage.setItem("priyanshi_game_score", gameScore.toString())
        localStorage.setItem("priyanshi_game_phase", gamePhase)
        localStorage.setItem("priyanshi_letter_messages", revealedMessages.toString())
        if (answeredQuestions.length === SELECTED_QUESTIONS.length) {
            localStorage.setItem("priyanshi_trivia_completed", "true")
        }
    }, [answeredQuestions, gameScore, gamePhase, revealedMessages, dataLoaded])

    // OPEN NOTIFICATION
    useEffect(() => {
        if (!notificationSent.current && dataLoaded) {
            notificationSent.current = true
            const deviceInfo = `🎀 *Priyanshi's Page Opened!* 🎀\n⏰ Time: ${new Date().toLocaleString()}\n📊 Progress: ${answeredQuestions.length}/${SELECTED_QUESTIONS.length} questions answered\n💜 Heart Score: ${gameScore}`
            sendTelegramMessage(deviceInfo)
        }
    }, [dataLoaded, answeredQuestions.length, gameScore, sendTelegramMessage])

    // HIGH SCORE
    useEffect(() => {
        if (gameScore > highScore) {
            setHighScore(gameScore)
            localStorage.setItem("priyanshiHeartScore", gameScore.toString())
        }
    }, [gameScore, highScore])

    // HEARTS GENERATION
    useEffect(() => {
        if (!gameActive || gamePhase !== 'game' || !gameStarted) return
        const interval = setInterval(() => {
            if (hearts.length < 12) {
                const newHeart = {
                    id: Date.now() + Math.random(),
                    x: Math.random() * 80 + 10,
                    y: 90,
                    size: Math.random() * 30 + 20,
                    speed: Math.random() * 2.5 + 2,
                    points: 10,
                    color: heartColors[Math.floor(Math.random() * heartColors.length)],
                }
                setHearts(prev => [...prev, newHeart])
                setTimeout(() => {
                    setHearts(prev => prev.filter(h => h.id !== newHeart.id))
                }, newHeart.speed * 1000)
            }
        }, 700)
        return () => clearInterval(interval)
    }, [hearts.length, gameActive, gamePhase, gameStarted])

    // GAME TIMER
    useEffect(() => {
        if (!gameActive || gamePhase !== 'game' || !gameStarted) return
        const timer = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer)
                    setGameActive(false)
                    setTimeout(() => {
                        const triviaComplete = localStorage.getItem("priyanshi_trivia_completed")
                        if (triviaComplete === "true" || answeredQuestions.length === SELECTED_QUESTIONS.length) {
                            setGamePhase('letter')
                        } else {
                            setGamePhase('trivia')
                        }
                        setGameActive(true)
                    }, 1000)
                    return 0
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(timer)
    }, [gameActive, gamePhase, gameStarted, answeredQuestions.length])

    const catchHeart = useCallback((id, points) => {
        setHearts(prev => prev.filter(h => h.id !== id))
        setGameScore(prev => prev + points)
        setCombo(prev => prev + 1)
        if (!isMuted && catchSoundRef.current) {
            catchSoundRef.current.currentTime = 0
            catchSoundRef.current.play()
        }
        setTimeout(() => setCombo(prev => 0), 500)
    }, [isMuted])

    const handleSubmitAnswer = async () => {
        if (!userAnswer.trim()) {
            setFeedbackMessage("💭 Kuch toh likh de!")
            setShowFeedback(true)
            setTimeout(() => setShowFeedback(false), 2000)
            return
        }
        
        setIsSubmitting(true)
        
        const currentQuestion = SELECTED_QUESTIONS[currentQuestionIndex]
        const questionNumber = currentQuestionIndex + 1
        
        // Send to Telegram
        const answerMsg = `📝 *NEW ANSWER!*\n❓ Q${questionNumber}: ${currentQuestion}\n💬 Answer: ${userAnswer}\n⏰ Time: ${new Date().toLocaleString()}\n❤️ Progress: ${answeredQuestions.length + 1}/${SELECTED_QUESTIONS.length}`
        await sendTelegramMessage(answerMsg)
        
        // Save answer
        const newAnswered = [...answeredQuestions, {
            index: currentQuestionIndex,
            number: questionNumber,
            question: currentQuestion,
            answer: userAnswer,
            timestamp: new Date().toISOString()
        }]
        setAnsweredQuestions(newAnswered)
        setAnsweredIndexes([...answeredIndexes, currentQuestionIndex])
        
        const remaining = SELECTED_QUESTIONS.length - newAnswered.length
        setFeedbackMessage(`✅ Saved! ${remaining} questions remaining!`)
        setShowFeedback(true)
        
        setTimeout(() => {
            setShowFeedback(false)
            
            let nextIndex = currentQuestionIndex + 1
            while ([...answeredIndexes, currentQuestionIndex].includes(nextIndex) && nextIndex < SELECTED_QUESTIONS.length) {
                nextIndex++
            }
            
            if (nextIndex >= SELECTED_QUESTIONS.length || newAnswered.length >= SELECTED_QUESTIONS.length) {
                localStorage.setItem("priyanshi_trivia_completed", "true")
                const completionMsg = `🎉 *PRIYANSHI COMPLETED ALL ${SELECTED_QUESTIONS.length} QUESTIONS!* 🎉\n💯 She answered everything!\n💜 Now moving to love letter!`
                sendTelegramMessage(completionMsg)
                setGamePhase('letter')
            } else {
                setCurrentQuestionIndex(nextIndex)
                setUserAnswer("")
            }
        }, 1500)
        
        setIsSubmitting(false)
    }

    const revealNextMessage = () => {
        if (revealedMessages < LOVE_LETTER_MESSAGES.length) {
            setRevealedMessages(prev => prev + 1)
        }
        if (revealedMessages + 1 >= LOVE_LETTER_MESSAGES.length) {
            setTimeout(() => {
                const finalMsg = `🎀 *PRIYANSHI'S COMPLETE RESULTS* 🎀\n💕 Heart Score: ${gameScore}\n🏆 High Score: ${highScore}\n📝 Questions Answered: ${answeredQuestions.length}/${SELECTED_QUESTIONS.length}\n💜 She's absolutely amazing!`
                sendTelegramMessage(finalMsg)
            }, 1000)
        }
    }

    const startGame = () => {
        setGameStarted(true)
        setGameActive(true)
    }

    const resetAllProgress = () => {
        if (confirm("Are you sure? This will reset all your progress!")) {
            localStorage.clear()
            window.location.reload()
        }
    }

    return (
        <motion.div
            className="flex items-center justify-center min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-950 to-pink-950"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <audio ref={catchSoundRef} src="/pop.mp3" preload="auto" />
            
            <motion.button
                onClick={() => setIsMuted(!isMuted)}
                className="absolute top-4 right-4 z-30 bg-white/10 backdrop-blur-sm p-2 rounded-full hover:bg-white/20 transition-all"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileTap={{ scale: 0.9 }}
            >
                {isMuted ? <Volume2 className="w-5 h-5 text-white" /> : <VolumeX className="w-5 h-5 text-white" />}
            </motion.button>
            
            <motion.button
                onClick={resetAllProgress}
                className="absolute top-4 left-4 z-30 bg-white/10 backdrop-blur-sm p-2 rounded-full hover:bg-white/20 transition-all"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileTap={{ scale: 0.9 }}
            >
                <RotateCcw className="w-5 h-5 text-white/70" />
            </motion.button>

            {/* GAME PHASE */}
            {gamePhase === 'game' && (
                <div className="relative z-10 w-full max-w-4xl mx-auto px-4">
                    {!gameStarted ? (
                        <motion.div className="text-center" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                            <motion.div animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }} transition={{ duration: 2, repeat: Infinity }}>
                                <Heart className="w-32 h-32 text-pink-500 mx-auto mb-6 fill-pink-500/50" />
                            </motion.div>
                            <h1 className="text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 mb-4">
                                Hey Priyanshi! 💜
                            </h1>
                            <p className="text-purple-300 text-lg mb-2">Welcome to your surprise!</p>
                            {answeredQuestions.length > 0 && (
                                <p className="text-pink-400 text-sm mb-4">📝 You've answered {answeredQuestions.length} questions already. Let's continue! 💪</p>
                            )}
                            <button onClick={startGame} className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white text-xl px-8 py-4 rounded-full shadow-xl transition-all hover:scale-105">
                                {answeredQuestions.length > 0 ? "Continue ❤️" : "Start the Fun ✨"}
                            </button>
                        </motion.div>
                    ) : (
                        <>
                            <div className="absolute top-20 left-4 right-4 flex justify-between items-center bg-white/10 backdrop-blur-md rounded-2xl p-3 z-20">
                                <div className="flex items-center gap-2">
                                    <Award className="w-5 h-5 text-yellow-400" />
                                    <span className="text-white font-bold">Score: {gameScore}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Crown className="w-5 h-5 text-purple-400" />
                                    <span className="text-white font-bold">Best: {highScore}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Timer className="w-5 h-5 text-pink-400" />
                                    <span className="text-white font-bold">{timeLeft}s</span>
                                </div>
                                {combo > 1 && (
                                    <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full">
                                        <span className="text-yellow-400 font-bold text-sm">{combo}x</span>
                                    </div>
                                )}
                            </div>

                            <div className="text-center mt-32 mb-4">
                                <h2 className="text-xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                                    Catch the Hearts! 💕
                                </h2>
                                <p className="text-purple-300/80 text-sm mt-1">Tap the floating hearts!</p>
                            </div>

                            <div className="relative h-[50vh] min-h-[350px] w-full">
                                <AnimatePresence>
                                    {gameActive && hearts.map((heart) => (
                                        <motion.button
                                            key={heart.id}
                                            className="absolute cursor-pointer z-10"
                                            style={{ left: `${heart.x}%`, bottom: '0%', width: heart.size, height: heart.size }}
                                            initial={{ y: 0, opacity: 0, scale: 0 }}
                                            animate={{ y: -window.innerHeight * 0.45, opacity: 1, scale: 1, rotate: [0, 10, -10, 0] }}
                                            transition={{ duration: heart.speed, ease: "linear", rotate: { duration: 0.5, repeat: Infinity } }}
                                            exit={{ scale: 0, opacity: 0 }}
                                            onClick={() => catchHeart(heart.id, heart.points)}
                                            whileTap={{ scale: 0.8 }}
                                        >
                                            <Heart className="w-full h-full drop-shadow-lg" style={{ color: heart.color, fill: heart.color }} />
                                        </motion.button>
                                    ))}
                                </AnimatePresence>
                            </div>
                            <p className="text-center text-purple-300/50 text-xs mt-2">💜 Tap hearts quickly! 💜</p>
                        </>
                    )}
                </div>
            )}

            {/* TRIVIA PHASE */}
            {gamePhase === 'trivia' && (
                <motion.div className="relative z-10 w-full max-w-2xl mx-auto px-4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring" }}>
                    <div className="text-center mb-6">
                        <Brain className="w-14 h-14 text-purple-400 mx-auto mb-3" />
                        <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                            Tell Me About You! 💜
                        </h2>
                        <p className="text-purple-300 mt-1">
                            Question {currentQuestionIndex + 1} of {SELECTED_QUESTIONS.length}
                        </p>
                        <p className="text-pink-400 text-sm">Answered: {answeredQuestions.length} / {SELECTED_QUESTIONS.length}</p>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-pink-500/30">
                        <h3 className="text-xl md:text-2xl text-white text-center mb-6">
                            {SELECTED_QUESTIONS[currentQuestionIndex]}
                        </h3>
                        
                        <textarea
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Type your answer here... 💭"
                            className="w-full bg-white/5 border border-purple-500/30 rounded-xl p-4 text-white placeholder-purple-300/50 focus:outline-none focus:border-pink-500 transition-all min-h-[120px]"
                            rows={3}
                        />
                        
                        <button
                            onClick={handleSubmitAnswer}
                            disabled={isSubmitting}
                            className="mt-4 w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white py-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {isSubmitting ? "Saving..." : <><Send className="w-5 h-5" /> Send Answer 💜</>}
                        </button>
                    </div>

                    <AnimatePresence>
                        {showFeedback && (
                            <motion.div className="fixed bottom-8 left-4 right-4 mx-auto max-w-md text-center p-4 bg-green-500/80 backdrop-blur-md rounded-xl z-50" initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}>
                                <p className="text-white font-medium">{feedbackMessage}</p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            )}

            {/* LOVE LETTER PHASE */}
            {gamePhase === 'letter' && (
                <motion.div className="relative z-10 w-full max-w-2xl mx-auto px-4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: "spring" }}>
                    <div className="text-center mb-6">
                        <MessageCircle className="w-14 h-14 text-pink-400 mx-auto mb-3" />
                        <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-400">
                            A Little Something for You 💌
                        </h2>
                    </div>

                    <div className="bg-gradient-to-r from-pink-500/10 to-purple-500/10 backdrop-blur-md rounded-2xl p-8 border border-pink-500/30 min-h-[300px]">
                        <div className="space-y-4">
                            {LOVE_LETTER_MESSAGES.slice(0, revealedMessages).map((msg, idx) => (
                                <motion.p key={idx} className="text-white text-lg md:text-xl" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.1 }}>
                                    {msg}
                                </motion.p>
                            ))}
                        </div>

                        {revealedMessages < LOVE_LETTER_MESSAGES.length && (
                            <motion.button onClick={revealNextMessage} className="mt-8 mx-auto block bg-gradient-to-r from-pink-500 to-purple-500 text-white px-6 py-3 rounded-full hover:scale-105 transition-all" whileTap={{ scale: 0.95 }} animate={{ scale: [1, 1.05, 1] }} transition={{ duration: 1, repeat: Infinity }}>
                                <Gift className="w-5 h-5 inline mr-2" />
                                Reveal Next Message
                            </motion.button>
                        )}

                        {revealedMessages >= LOVE_LETTER_MESSAGES.length && (
                            <motion.div className="text-center mt-8" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <p className="text-yellow-400 text-xl mb-4">🎉 All Done! 🎉</p>
                                <button onClick={() => { if (onLoadingComplete) onLoadingComplete(gameScore); }} className="bg-gradient-to-r from-pink-500 to-purple-500 text-white px-8 py-3 rounded-full text-lg font-bold hover:scale-105 transition-all">
                                    Continue to Celebration 🎊
                                </button>
                            </motion.div>
                        )}
                    </div>

                    <p className="text-center text-purple-300/50 text-sm mt-4">
                        Heart Score: {gameScore} | Questions: {answeredQuestions.length}/{SELECTED_QUESTIONS.length} 💜
                    </p>
                </motion.div>
            )}
        </motion.div>
    )
}
