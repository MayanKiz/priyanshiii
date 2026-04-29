"use client"

import { useState, useEffect } from "react"
import { AnimatePresence } from "motion/react"
import Loader from "./components/Loader"
import Countdown from "./components/Countdown"
import Celebration from "./components/Celebration"
import HappyBirthday from "./components/HappyBirthday"
import PhotoGallery from "./components/PhotoGallery"
import Letter from "./components/Letter"
import Wishes from "./components/Wishes"
import MessageBoard from "./components/MessageBoard"
import { motion } from "motion/react"

export default function BirthdayApp() {
  const [currentScreen, setCurrentScreen] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [musicStarted, setMusicStarted] = useState(false)
  const [gameScore, setGameScore] = useState(0)

  const birthdayDate = new Date("2026-06-11T00:00:00")
  const [isBirthdayOver, setIsBirthdayOver] = useState(new Date().getTime() >= birthdayDate.getTime())

  // 🔥 Loader 4 sec baad close hoga ONLY agar game complete nahi hua
  // Agar game complete hoga toh Loader khud se close hoga via onLoadingComplete
  useEffect(() => {
    let timer
    if (isLoading) {
      timer = setTimeout(() => {
        // Agar 4 sec mein game complete nahi hua toh forcefully close karo
        setIsLoading(false)
      }, 400000000)
    }
    return () => clearTimeout(timer)
  }, [isLoading])

  const screens = [
    !isBirthdayOver
      ? <Countdown key="countdown" onComplete={() => setIsBirthdayOver(true)} birthdayDate={birthdayDate} />
      : <Celebration key="celebration" onNext={() => setCurrentScreen(1)} onMusicStart={() => setMusicStarted(true)} />,
    <HappyBirthday key="happy" onNext={() => setCurrentScreen(2)} />,
    <PhotoGallery key="gallery" onNext={() => setCurrentScreen(3)} />,
    <Letter key="letter" onNext={() => setCurrentScreen(4)} />,
    <Wishes key="wishes" onNext={() => setCurrentScreen(5)} />,
    <MessageBoard key="messageboard" />,
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-950/30 via-black to-purple-950/30 overflow-hidden relative">

      <div className="fixed inset-0 z-0 blur-[120px] opacity-20" style={{
        backgroundImage: "radial-gradient(circle at 20% 25%, rgba(255, 99, 165, 0.6), transparent 40%)",
      }} />

      <div className="fixed inset-0 z-0 blur-[120px] opacity-20" style={{
        backgroundImage: "radial-gradient(circle at 80% 80%, rgba(99, 102, 241, 0.6), transparent 40%)",
      }} />

      <div className="fixed inset-0 z-0 blur-[160px] opacity-10" style={{
        backgroundImage: "radial-gradient(circle at 50% 50%, rgba(228, 193, 255, 0.4), transparent 40%)",
      }} />

      <AnimatePresence mode="wait">
        {isLoading ? (
          <Loader 
            key="loader" 
            onLoadingComplete={(score) => {
              setGameScore(score)
              console.log("🎮 Game completed with score:", score)
              // 🔥 IMPORTANT: Game complete hone par Loader band karo
              setIsLoading(false)
            }} 
          />
        ) : (
          <AnimatePresence mode="wait">{screens[currentScreen]}</AnimatePresence>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{
          duration: 1,
          delay: 1,
        }}
        className="fixed bottom-4 right-4 text-[13px] text-white/40 pointer-events-none z-50 font-light">
        @rao.mayankkk
      </motion.div>
    </div>
  )
}
