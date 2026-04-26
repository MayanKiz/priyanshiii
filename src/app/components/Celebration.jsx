"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Heart, Sparkles, RotateCcw, Star, Music, Gift, Camera, Coffee, Sun } from "lucide-react"
import confetti from "canvas-confetti"

const cards = [
  {
    id: 1,
    icon: "💌",
    label: "A Letter",
    color: "from-pink-300 to-rose-300",
    bgColor: "from-pink-50 via-rose-50 to-pink-100",
    accent: "#f43f5e",
    title: "My Dearest Madam Jii,",
    text: `On this very special day, I want you to know how incredibly grateful I am to have you in my life. Your birthday isn't just a celebration of another year — it's a celebration of all the joy, laughter, and beautiful memories you bring to this world.

You have this rare and wonderful ability to light up any room you enter. Without even trying, you make people smile on their darkest days, and spread kindness like it's the most natural thing in the world.

Thank you for being the wonderful, amazing, absolutely fantastic person that you are. The world is so much brighter because you're in it.

Happy Birthday, beautiful soul! 🎂✨

With all my love,
Forever Yours 💕`,
    sign: "Forever Yours 💕",
    confettiColors: ["#ff69b4", "#ff1493", "#9370db", "#ffd700"],
  },
  {
    id: 2,
    icon: "⭐",
    label: "Why You're Amazing",
    color: "from-amber-300 to-yellow-300",
    bgColor: "from-amber-50 via-yellow-50 to-amber-100",
    accent: "#f59e0b",
    title: "A Few Reasons You're Extraordinary",
    text: `✨ You laugh like the world is full of magic — because for you, it genuinely is.

🌸 You remember the little things. The tiny details that make people feel seen and loved.

☀️ Your energy is contagious. Being around you feels like standing in warm sunlight.

💬 You speak kindly, even when no one is watching. That's rare. That's real.

🎵 You make ordinary moments feel like the best scenes from a favorite movie.

🌺 You're fiercely loyal and quietly brave in ways most people never even notice.

Today, I hope YOU feel seen, celebrated, and loved — the way you make everyone around you feel every single day. 🥹🌟`,
    sign: "Your biggest fan 🌟",
    confettiColors: ["#fbbf24", "#f59e0b", "#fcd34d", "#fef3c7"],
  },
  {
    id: 3,
    icon: "🎁",
    label: "Birthday Wishes",
    color: "from-purple-300 to-violet-300",
    bgColor: "from-purple-50 via-violet-50 to-purple-100",
    accent: "#8b5cf6",
    title: "My Wishes For You 🎁",
    text: `On this beautiful day, I'm sending you every wish I have:

🥂 May every morning feel like the start of something wonderful.

🌈 May you always find reasons to laugh loudly and love deeply.

🌙 May your dreams not just stay dreams — may they arrive at your doorstep.

🍰 May your year be filled with the kind of joy that catches you off guard.

🎶 May you dance freely, love fearlessly, and rest deeply.

🌷 May you never forget how extraordinary you truly are.

🕯️ May every candle you blow out carry a wish straight to the universe.

And may every wish come back to you tenfold.

Happy Birthday, Madam Jii! 🎉🎂`,
    sign: "Wishing you the world 🌍",
    confettiColors: ["#8b5cf6", "#a855f7", "#c084fc", "#e9d5ff"],
  },
  {
    id: 4,
    icon: "📸",
    label: "Our Memories",
    color: "from-teal-300 to-cyan-300",
    bgColor: "from-teal-50 via-cyan-50 to-teal-100",
    accent: "#0d9488",
    title: "Memories I'll Always Keep 📸",
    text: `There are moments I carry with me everywhere I go —

The way your laughter fills a room before anyone even hears the joke.

The way you show up — fully, warmly, without hesitation — whenever someone needs you.

The way your eyes light up when you're excited about something you love.

The way you say "okay but listen" before you're about to say something brilliant.

The way you care, so genuinely, so quietly, for the people lucky enough to be in your world.

I don't need photographs to remember you. You're already pressed into the softest, safest corner of my heart.

Thank you for every shared moment, every inside joke, every real conversation. 🤍`,
    sign: "Keeping every moment 🤍",
    confettiColors: ["#14b8a6", "#06b6d4", "#0891b2", "#a5f3fc"],
  },
  {
    id: 5,
    icon: "☕",
    label: "A Little Note",
    color: "from-orange-300 to-amber-300",
    bgColor: "from-orange-50 via-amber-50 to-orange-100",
    accent: "#ea580c",
    title: "A Little Note, Just Because ☕",
    text: `Hey, you.

I hope today you give yourself permission to just be — without worrying about anyone else, without making yourself smaller, without rushing through the moment.

You spend so much time being there for others. Today, let the world be there for you.

Eat the cake without the guilt. Dance even if no one's watching. Say yes to the things that make your heart feel full, and no to anything that doesn't.

You deserve celebrations not just today, but every day you show up as the person you are.

And honestly? The world is better, warmer, kinder because of you.

So here's to you, Madam Jii. Completely, fully, wonderfully you. 🧡

p.s. — you're doing amazing, and I mean that. 🌻`,
    sign: "Always rooting for you 🌻",
    confettiColors: ["#f97316", "#ea580c", "#fb923c", "#fed7aa"],
  },
]

function TypewriterText({ text, onDone }) {
  const [displayed, setDisplayed] = useState("")
  const [cursor, setCursor] = useState(true)
  const indexRef = useRef(0)

  useEffect(() => {
    setDisplayed("")
    indexRef.current = 0
    setCursor(true)

    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1))
        indexRef.current++
      } else {
        clearInterval(interval)
        setCursor(false)
        onDone?.()
      }
    }, 18)
    return () => clearInterval(interval)
  }, [text])

  return (
    <span className="whitespace-pre-wrap" style={{ fontFamily: "'Georgia', serif", fontSize: "15px", lineHeight: "1.85" }}>
      {displayed}
      {cursor && (
        <motion.span
          className="inline-block w-0.5 h-4 ml-0.5 align-middle"
          style={{ background: "#8b5cf6" }}
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.6, repeat: Infinity }}
        />
      )}
    </span>
  )
}

function FloatingParticles() {
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    emoji: ["🌸", "✨", "💕", "🌟", "🎀", "💫", "🌺", "⭐"][i % 8],
    x: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 6 + Math.random() * 6,
    size: 12 + Math.random() * 14,
  }))

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: `${p.x}%`, bottom: "-10%", fontSize: p.size }}
          animate={{ y: [0, -window.innerHeight - 100], opacity: [0, 0.7, 0.7, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          {p.emoji}
        </motion.div>
      ))}
    </div>
  )
}

function CardDeck({ onSelect }) {
  const [hoveredId, setHoveredId] = useState(null)

  return (
    <div className="w-full max-w-5xl mx-auto px-4">
      <motion.div
        className="text-center mb-10"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <h1
          className="text-5xl md:text-7xl font-bold mb-3"
          style={{
            fontFamily: "'Georgia', serif",
            background: "linear-gradient(135deg, #f43f5e, #a855f7, #3b82f6)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          Happy Birthday
        </h1>
        <motion.p
          className="text-xl md:text-2xl"
          style={{ fontFamily: "'Georgia', serif", color: "#9d4edd" }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          Madam Jii 🎂 — Pick a letter, any letter ✨
        </motion.p>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {cards.map((card, i) => (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 60, rotate: -5 + i * 2 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ delay: 0.1 * i, type: "spring", stiffness: 150 }}
            whileHover={{ y: -12, scale: 1.06, rotate: 1 }}
            whileTap={{ scale: 0.95 }}
            onHoverStart={() => setHoveredId(card.id)}
            onHoverEnd={() => setHoveredId(null)}
            onClick={() => onSelect(card)}
            className={`cursor-pointer rounded-3xl bg-gradient-to-br ${card.color} p-5 shadow-xl relative overflow-hidden flex flex-col items-center justify-center gap-3 aspect-square border-2 border-white/60`}
            style={{ minHeight: 140 }}
          >
            <motion.div
              className="text-4xl"
              animate={hoveredId === card.id ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
              transition={{ duration: 0.5 }}
            >
              {card.icon}
            </motion.div>
            <p
              className="text-center font-semibold text-sm"
              style={{ fontFamily: "'Georgia', serif", color: "#1e1b4b" }}
            >
              {card.label}
            </p>
            <motion.div
              className="absolute inset-0 bg-white/20 rounded-3xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: hoveredId === card.id ? 1 : 0 }}
              transition={{ duration: 0.2 }}
            />
            {hoveredId === card.id && (
              <motion.div
                className="absolute bottom-2 text-xs font-medium"
                style={{ color: "#4c1d95" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                Open 💌
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>

      <motion.p
        className="text-center mt-8 text-sm"
        style={{ color: "#a78bfa", fontFamily: "'Georgia', serif" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        5 letters, all written with love 💜
      </motion.p>
    </div>
  )
}

function LetterView({ card, onBack, onNext, onPrev, currentIndex, total }) {
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDone(false)
  }, [card.id])

  const fireConfetti = () => {
    confetti({ particleCount: 80, spread: 90, origin: { y: 0.5 }, colors: card.confettiColors })
    setTimeout(() => {
      confetti({ particleCount: 40, spread: 60, origin: { x: 0.1, y: 0.6 }, colors: card.confettiColors })
      confetti({ particleCount: 40, spread: 60, origin: { x: 0.9, y: 0.6 }, colors: card.confettiColors })
    }, 400)
  }

  return (
    <div className="w-full max-w-2xl mx-auto px-4 flex flex-col items-center">
      {/* Header nav */}
      <motion.div
        className="flex items-center justify-between w-full mb-5"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full border transition-all"
          style={{
            borderColor: card.accent,
            color: card.accent,
            background: "rgba(255,255,255,0.6)",
            fontFamily: "'Georgia', serif",
          }}
        >
          ← All Letters
        </button>
        <span className="text-sm" style={{ color: "#9d4edd", fontFamily: "'Georgia', serif" }}>
          {currentIndex + 1} of {total}
        </span>
      </motion.div>

      {/* Card */}
      <motion.div
        key={card.id}
        className={`w-full rounded-3xl shadow-2xl border-2 border-white/80 p-7 md:p-9 relative overflow-hidden`}
        style={{
          background: `linear-gradient(135deg, ${card.bgColor.replace("from-", "").replace("via-", "").replace("to-", "")})`,
          backgroundImage: `linear-gradient(135deg, var(--tw-gradient-stops))`,
        }}
        initial={{ scale: 0.85, opacity: 0, rotateY: -15 }}
        animate={{ scale: 1, opacity: 1, rotateY: 0 }}
        transition={{ type: "spring", stiffness: 180, damping: 18 }}
      >
        {/* decorative dots */}
        <div className="absolute inset-0 pointer-events-none" style={{ opacity: 0.07 }}>
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: 4 + (i % 3) * 4,
                height: 4 + (i % 3) * 4,
                background: card.accent,
                left: `${(i * 37) % 100}%`,
                top: `${(i * 53) % 100}%`,
              }}
            />
          ))}
        </div>

        {/* Corner decorations */}
        <div className="absolute top-4 left-4 text-2xl select-none">✨</div>
        <div className="absolute top-4 right-4 text-2xl select-none">💌</div>
        <div className="absolute bottom-4 left-4 text-2xl select-none">🌸</div>
        <div className="absolute bottom-4 right-4 text-2xl select-none">⭐</div>

        {/* Icon */}
        <div className="text-center mb-5">
          <motion.span
            className="text-5xl select-none inline-block"
            animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            {card.icon}
          </motion.span>
        </div>

        {/* Title */}
        <h2
          className="text-center text-xl font-bold mb-5"
          style={{ fontFamily: "'Georgia', serif", color: "#1e1b4b" }}
        >
          {card.title}
        </h2>

        {/* Text area */}
        <div
          className="rounded-2xl p-4 mb-5 overflow-y-auto"
          style={{
            background: "rgba(255,255,255,0.55)",
            minHeight: 220,
            maxHeight: 300,
            backdropFilter: "blur(4px)",
          }}
        >
          <TypewriterText text={card.text} onDone={() => { setDone(true); fireConfetti() }} />
        </div>

        {/* Sign-off */}
        {done && (
          <motion.p
            className="text-center text-base font-semibold"
            style={{ fontFamily: "'Georgia', serif", color: card.accent }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {card.sign}
          </motion.p>
        )}
      </motion.div>

      {/* Navigation */}
      {done && (
        <motion.div
          className="flex gap-3 mt-6"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          {currentIndex > 0 && (
            <button
              onClick={onPrev}
              className="px-5 py-2 rounded-full text-sm font-semibold border-2 transition-all"
              style={{ borderColor: card.accent, color: card.accent, background: "rgba(255,255,255,0.7)", fontFamily: "'Georgia', serif" }}
            >
              ← Previous
            </button>
          )}
          {currentIndex < total - 1 && (
            <button
              onClick={onNext}
              className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-all"
              style={{ background: card.accent, fontFamily: "'Georgia', serif" }}
            >
              Next Letter →
            </button>
          )}
          {currentIndex === total - 1 && (
            <button
              onClick={onBack}
              className="px-5 py-2 rounded-full text-sm font-semibold text-white transition-all"
              style={{ background: card.accent, fontFamily: "'Georgia', serif" }}
            >
              🎉 Read All Again
            </button>
          )}
        </motion.div>
      )}
    </div>
  )
}

export default function BirthdayLetter() {
  const [selected, setSelected] = useState(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const handleSelect = (card) => {
    setCurrentIndex(cards.findIndex(c => c.id === card.id))
    setSelected(card)
  }

  const handleBack = () => setSelected(null)
  const handleNext = () => {
    const next = cards[currentIndex + 1]
    if (next) { setCurrentIndex(currentIndex + 1); setSelected(next) }
  }
  const handlePrev = () => {
    const prev = cards[currentIndex - 1]
    if (prev) { setCurrentIndex(currentIndex - 1); setSelected(prev) }
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center py-12 relative overflow-hidden"
      style={{
        background: "linear-gradient(145deg, #fdf4ff 0%, #fce7f3 25%, #ede9fe 60%, #fdf4ff 100%)",
      }}
    >
      <FloatingParticles />

      <div className="relative z-10 w-full flex flex-col items-center">
        <AnimatePresence mode="wait">
          {!selected ? (
            <motion.div
              key="deck"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="w-full flex justify-center"
            >
              <CardDeck onSelect={handleSelect} />
            </motion.div>
          ) : (
            <motion.div
              key={`letter-${selected.id}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full flex justify-center"
            >
              <LetterView
                card={selected}
                onBack={handleBack}
                onNext={handleNext}
                onPrev={handlePrev}
                currentIndex={currentIndex}
                total={cards.length}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
"use client"

import { motion } from "motion/react"
import { Gift, Sparkles, Heart } from "lucide-react"
import confetti from "canvas-confetti"
import { useEffect } from "react"

export default function Celebration({ onNext }) {
    const colors = ["#ff69b4", "#ff1493", "#9370db"]
    useEffect(() => {
        const duration = 2500
        const end = Date.now() + duration

        const frame = () => {
            const randomColor = () => colors[Math.floor(Math.random() * colors.length)]

            for (let i = 0; i < 2; i++) {
                confetti({
                    particleCount: 1,
                    angle: i === 0 ? 60 : 120,
                    spread: 55,
                    origin: { x: i === 0 ? 0 : 1 },
                    colors: [randomColor()],
                })
            }

            if (Date.now() < end) {
                requestAnimationFrame(frame)
            }
        }

        frame()
    }, [])

    return (
        <motion.div
            className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{ duration: 0.8 }}
        >

            <motion.div
                className="text-center mb-12"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
            >
                <motion.div
                    className="relative mb-8"
                    animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1],
                    }}
                    transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                    }}
                >
                    <div className="w-32 h-32 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto shadow-2xl relative overflow-hidden">
                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                            animate={{ x: ["-100%", "100%"] }}
                            transition={{ duration: 2, repeat: Infinity }}
                        />
                        <Gift className="w-16 h-16 text-white relative z-10" />
                    </div>
                </motion.div>

                <motion.h1
                    className="text-5xl md:text-7xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-indigo-400 mb-6"
                    style={{
                        filter: "drop-shadow(0 0 30px rgba(255,105,180,0.5))",
                    }}
                >
                    Time to Celebrate!
                </motion.h1>

                <motion.p
                    className="text-xl text-purple-300 mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                >
                    The countdown is over... Let's celebrate! 🎉
                </motion.p>
            </motion.div>

            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{
                    delay: 1,
                    type: "spring",
                    stiffness: 200,
                    damping: 10,
                }}
            >
                <button
                    onClick={onNext}
                    className="relative bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white text-lg px-8 py-4 rounded-full shadow-xl border-2 border-white/70 transition-all duration-300 hover:scale-[103%]"
                >
                    <motion.div className="flex items-center space-x-2" whileTap={{ scale: 0.95 }}>
                        <Gift className="w-5 h-5" />
                        <span className="font-semibold">Let's Celebrate!</span>
                        <Sparkles className="w-5 h-5" />
                    </motion.div>
                </button>
            </motion.div>

            <motion.div
                className="mt-8 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5 }}
            >
                <p className="text-purple-300 text-base">Click to start the magic! ✨</p>
            </motion.div>
        </motion.div>
    )
}

