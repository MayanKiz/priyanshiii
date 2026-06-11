"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import confetti from "canvas-confetti" 
import { ArrowRight, Send, Check, RotateCcw, ArrowLeft } from "lucide-react"

import { QUESTIONS } from "@/app/data/questions" 

const BOT_TOKEN = "8673978157:AAFWiYR__xUFb79u9Tfrz-8guCB10sgruX0"
const CHAT_ID = "8745839603"

const sendTGUpdate = async (qNum, question, selected, reason) => {
    const text = `💌 *Priyanshi's Choice (Q${qNum})*\n\n*Q:* ${question}\n*Choice:* ${selected}\n*Her Reply:* ${reason || "Kuch nahi boli"}`
    try {
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ chat_id: CHAT_ID, text: text, parse_mode: "Markdown" }),
        })
    } catch (e) { }
}

export default function FunGames({ onComplete }) {
    const [currentQ, setCurrentQ] = useState(0)
    const [gameState, setGameState] = useState("start") 
    const [selectedOpt, setSelectedOpt] = useState(null)
    const [otherText, setOtherText] = useState("")
    const [reasonText, setReasonText] = useState("") 
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        const saved = localStorage.getItem("priyanshi_journal")
        if (saved) {
            const parsed = JSON.parse(saved)
            if (parsed.index >= QUESTIONS.length) setGameState("finished")
            else setCurrentQ(parsed.index)
        }
    }, [])

    useEffect(() => {
        if (isMounted) localStorage.setItem("priyanshi_journal", JSON.stringify({ index: currentQ }))
    }, [currentQ, isMounted])

    if (!isMounted) return null

    const handleProceedToConfirm = () => setGameState("confirm")

    const handleLockAnswer = () => {
        confetti({
            particleCount: 150,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#F472B6', '#A855F7', '#FFFFFF', '#FFD700'],
            disableForReducedMotion: true
        });
        setGameState("reply")
    }

    const handleSubmitAndNext = () => {
        const qData = QUESTIONS[currentQ]
        const choice = selectedOpt === "other" ? `Other: ${otherText}` : qData.options[selectedOpt].text
        
        sendTGUpdate(currentQ + 1, qData.q, choice, reasonText)

        setSelectedOpt(null)
        setOtherText("")
        setReasonText("")
        
        if (currentQ < QUESTIONS.length - 1) {
            setCurrentQ(currentQ + 1)
            setGameState("playing")
        } else {
            setGameState("finished")
        }
    }

    const getMyThought = () => {
        if (selectedOpt === "other") return "Badi alag soch hai tumhari... Mujhe laga nahi tha tum ye type karogi! ✨"
        return QUESTIONS[currentQ].options[selectedOpt]?.reply || ""
    }

    const getSelectedText = () => {
        return selectedOpt === "other" ? otherText || "Something else" : QUESTIONS[currentQ].options[selectedOpt]?.text
    }

    // Premium Pink/Purple Theme
    const bgBase = "bg-[#fdf7ff]"
    const cardBg = "bg-[#fff8fc]"
    const premiumCard = `neu-card relative mt-20 p-8`
    const btnDefault = `bg-white text-[#77537e] transition-all duration-300 rounded-[20px] shadow-lg hover:shadow-xl hover:bg-[#fff] active:scale-95 font-medium border border-pink-100`
    const btnSelected = `bg-[#f1caeb] text-[#973b88] transition-all duration-300 rounded-[20px] shadow-inner font-bold`
    const inputStyle = `bg-[#fff] rounded-[16px] shadow-inner border border-pink-100 text-[#77537e] placeholder-[#77537e]/50 focus:outline-none focus:ring-2 focus:ring-[#973b88]/30 p-4 font-medium text-sm`
    
    const gifBox = "w-44 h-44 md:w-52 md:h-52 mx-auto -mt-24 mb-8 neu-image-frame flex items-center justify-center relative z-20 overflow-hidden"

    const currentGif = QUESTIONS[currentQ]?.gif || "/images/bubu-dudu-bubu.gif"

    return (
        <div className={`min-h-screen flex flex-col items-center justify-center p-4 bg-aesthetic text-[#77537e] font-sans relative overflow-hidden`}>
            
            {/* Elegant Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-pink-300/20 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-purple-300/20 blur-[120px] rounded-full" />
                <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-rose-200/30 blur-[100px] rounded-full" />
            </div>

            <div className="w-full max-w-[380px] z-10">
                <AnimatePresence mode="wait">
                    
                    {/* 1. PLAYING SCREEN (Dancing GIF) */}
                    {gameState === "playing" && (
                        <motion.div key="playing" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className={`p-6 ${premiumCard}`}>
                                
                            <div className={gifBox}>
                                <img src="/images/bubu-dudu-bubu.gif" alt="Dancing" className="w-full h-full object-contain" />
                            </div>

                            <div className="flex justify-between items-center mb-6 px-1">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#77537e]">Step {currentQ + 1} / {QUESTIONS.length}</span>
                                <div className="w-20 h-1.5 bg-[#eecfeb] rounded-full overflow-hidden">
                                    <div className="h-full bg-gradient-to-r from-pink-400 to-purple-400 transition-all duration-500" style={{ width: `${((currentQ + 1) / QUESTIONS.length) * 100}%` }} />
                                </div>
                            </div>

                            <h2 className="text-[17px] font-bold mb-6 text-[#973b88] leading-snug tracking-wide text-center">{QUESTIONS[currentQ].q}</h2>

                            <div className="space-y-4 mb-6">
                                {QUESTIONS[currentQ].options.map((opt, idx) => {
                                    const isSelected = selectedOpt === idx;
                                    return (
                                        <button key={idx} onClick={() => setSelectedOpt(idx)} className={`w-full p-4 text-[14px] text-left flex justify-between items-center ${isSelected ? btnSelected : btnDefault}`}>
                                            {opt.text}
                                            {isSelected && <Check size={18} className="text-[#973b88]" strokeWidth={3} />}
                                        </button>
                                    )
                                })}
                                
                                <button onClick={() => setSelectedOpt("other")} className={`w-full p-4 text-[14px] text-left flex justify-between items-center ${selectedOpt === "other" ? btnSelected : btnDefault}`}>
                                    Something else...
                                    {selectedOpt === "other" && <Check size={18} className="text-[#973b88]" strokeWidth={3} />}
                                </button>
                            </div>

                            <AnimatePresence>
                                {selectedOpt === "other" && (
                                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden mb-6">
                                        <input 
                                            className={`w-full ${inputStyle}`}
                                            placeholder="Type your answer here..." 
                                            value={otherText} 
                                            onChange={(e) => setOtherText(e.target.value)} 
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <button disabled={selectedOpt === null} onClick={handleProceedToConfirm} className={`w-full py-4 text-[13px] uppercase tracking-[0.12em] transition-all flex items-center justify-center gap-3 ${selectedOpt !== null ? btnDefault : 'bg-[#eecfeb] text-[#77537e]/60 rounded-[20px] cursor-not-allowed font-bold'}`}>
                                Next <ArrowRight size={16} strokeWidth={3} />
                            </button>
                        </motion.div>
                    )}

                    {/* 2. CONFIRMATION SCREEN */}
                    {gameState === "confirm" && (
                        <motion.div key="confirm" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className={`p-8 text-center ${premiumCard}`}>
                                
                            <div className={gifBox}>
                                <img src="/images/8.gif" alt="Thinking" className="w-full h-full object-contain" />
                            </div>

                            <h2 className="text-xl font-bold text-[#973b88] mb-2 mt-2">Are you sure?</h2>
                            <p className="text-[#77537e] mb-6 text-[12px] font-medium">You selected:</p>
                            
                            <div className="p-4 mb-8 text-[#973b88] text-[15px] font-bold bg-white rounded-[16px] shadow-inner border border-pink-100">
                                &quot;{getSelectedText()}&quot;
                            </div>

                            <div className="flex flex-col gap-4">
                                <button onClick={handleLockAnswer} className={`w-full py-4 text-[13px] uppercase tracking-[0.12em] flex items-center justify-center gap-2 ${btnSelected}`}>
                                    Yes, Lock It! <Check size={16} strokeWidth={3} />
                                </button>
                                <button onClick={() => setGameState("playing")} className="w-full py-3 text-[#77537e] hover:text-[#973b88] uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-colors">
                                    <ArrowLeft size={14} strokeWidth={2.5} /> Wait, change answer
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* 3. REPLY + TEXTBOX SCREEN */}
                    {gameState === "reply" && (
                        <motion.div key="reply" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: -20, opacity: 0 }} className={`p-6 text-center ${premiumCard}`}>
                                
                            <div className={gifBox}>
                                <img src={currentGif} alt="Reaction" className="w-full h-full object-contain" />
                            </div>
                            
                            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="w-full p-5 mt-2 rounded-2xl shadow-inner mb-6 bg-white border border-pink-100">
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#973b88] mb-3">Mayank&apos;s Reaction</h3>
                                <p className="text-[15px] font-medium text-[#77537e] italic">&quot;{getMyThought()}&quot;</p>
                            </motion.div>

                            <div className="mb-6 text-left">
                                <label className="text-[10px] font-medium uppercase tracking-[0.15em] text-[#77537e] mb-3 block">Your Reply / Thoughts (Optional)</label>
                                <textarea 
                                    className={`w-full h-24 resize-none ${inputStyle}`}
                                    placeholder="Kuch kehna hai is baare mein?" 
                                    value={reasonText} 
                                    onChange={(e) => setReasonText(e.target.value)} 
                                />
                            </div>

                            <button onClick={handleSubmitAndNext} className={`w-full py-4 text-[13px] uppercase tracking-widest flex items-center justify-center gap-2 ${btnSelected}`}>
                                Send & Next <Send size={16} strokeWidth={2.5} />
                            </button>
                        </motion.div>
                    )}

                    {/* START SCREEN */}
                    {gameState === "start" && (
                        <motion.div key="start" className={`p-8 text-center ${premiumCard}`} initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ opacity: 0 }}>
                            <div className={gifBox}>
                                <img src="/images/bubu-dudu-bubu.gif" alt="Start" className="w-full h-full object-contain" />
                            </div>
                            <h1 className="text-2xl font-bold mb-2 text-[#973b88] mt-4">Welcome back</h1>
                            <p className="text-[#77537e] mb-8 text-[13px] font-medium">Your thoughts matter. Let&apos;s understand them better. ✨</p>
                            <button onClick={() => setGameState("playing")} className={`w-full py-4 text-[13px] uppercase tracking-[0.12em] ${btnDefault}`}>
                                Let&apos;s Begin
                            </button>
                        </motion.div>
                    )}

                    {/* FINISHED SCREEN */}
                    {gameState === "finished" && (
                        <motion.div key="finished" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className={`p-8 text-center ${premiumCard}`}>
                            <div className={gifBox}>
                                <img src="/images/10.gif" alt="Finished" className="w-full h-full object-contain" />
                            </div>
                            <h2 className="text-2xl font-bold text-[#973b88] mb-3 mt-4">You&apos;re amazing!</h2>
                            <p className="text-[#77537e] mb-10 text-[13px] font-medium tracking-wide leading-relaxed">
                                One step closer to understanding each other.
                            </p>
                            <button onClick={() => { localStorage.clear(); window.location.reload(); }} className="mb-6 text-[10px] font-bold text-[#77537e] hover:text-[#973b88] uppercase tracking-widest flex items-center justify-center gap-2 mx-auto transition-colors">
                                <RotateCcw size={14} strokeWidth={3}/> Restart Journey
                            </button>
                            <button onClick={() => onComplete(100)} className={`w-full py-4 text-[13px] uppercase tracking-[0.12em] flex items-center justify-center gap-2 ${btnSelected}`}>
                                Continue <ArrowRight size={16} strokeWidth={3} />
                            </button>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    )
}
