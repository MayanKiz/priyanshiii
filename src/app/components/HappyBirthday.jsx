"use client"

import { motion } from "framer-motion"
import { ArrowRight, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

// ─── Confetti (Matched to Pinkish Theme) ─────────────────────────────────────
const RainingConfetti = () => {
    const [pieces, setPieces] = useState([])
    useEffect(() => {
        const colors = ['#f472b6', '#a855f7', '#fcd34d', '#ffffff'] // Clean colors
        setPieces(Array.from({ length: 60 }).map((_, i) => ({
            id: i,
            left: Math.random() * 100,
            dur: Math.random() * 4 + 3,
            delay: Math.random() * 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: Math.random() * 8 + 4,
            isCircle: Math.random() > 0.5,
            drift: Math.random() * 80 - 40,
            rotate: Math.random() * 720,
        })))
    }, [])

    return (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', overflow: 'hidden', zIndex: 50 }}>
            {pieces.map(p => (
                <motion.div
                    key={p.id}
                    style={{
                        position: 'absolute',
                        top: '-10%',
                        left: `${p.left}%`,
                        width: p.size,
                        height: p.isCircle ? p.size : p.size * 1.6,
                        backgroundColor: p.color,
                        borderRadius: p.isCircle ? '50%' : '2px',
                        boxShadow: `0 0 6px ${p.color}80`,
                    }}
                    animate={{ y: ['0vh', '110vh'], x: [0, p.drift, 0], rotate: [0, p.rotate] }}
                    transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: 'linear' }}
                />
            ))}
        </div>
    )
}

// ─── Flame ───────────────────────────────────────────────────────────────────
const Flame = () => (
    <motion.div
        style={{ position: 'relative', width: 18, height: 26, margin: '0 auto' }}
        animate={{ scaleX: [1, 1.15, 0.9, 1.1, 1], scaleY: [1, 0.92, 1.08, 0.95, 1] }}
        transition={{ duration: 0.7, repeat: Infinity, ease: 'easeInOut' }}
    >
        {/* outer glow */}
        <div style={{
            position: 'absolute', inset: '-6px', borderRadius: '50% 50% 40% 40%',
            background: 'radial-gradient(ellipse, #fde68a55 0%, transparent 70%)',
            filter: 'blur(4px)',
        }} />
        {/* outer flame */}
        <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, #f97316, #fbbf24, #fef08a)',
            borderRadius: '50% 50% 35% 35% / 60% 60% 40% 40%',
            boxShadow: '0 0 12px 4px #f9731655',
        }} />
        {/* inner blue core */}
        <div style={{
            position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
            width: 7, height: 10,
            background: 'linear-gradient(to top, #93c5fd, #bfdbfe)',
            borderRadius: '50% 50% 35% 35% / 60% 60% 40% 40%',
        }} />
    </motion.div>
)

// ─── Cake ────────────────────────────────────────────────────────────────────
const AnimatedCake = () => {
    const floatAnim = { y: [0, -8, 0] }
    const floatTrans = { duration: 3.5, repeat: Infinity, ease: 'easeInOut' }

    // Shared style helpers
    const layer = (bg, w, h, radius = '14px 14px 6px 6px') => ({
        width: w, height: h,
        background: bg,
        borderRadius: radius,
        margin: '0 auto',
        position: 'relative',
    })

    const icingDrips = (color, top = -12) => (
        <div style={{ position: 'absolute', top, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '0 8px' }}>
            {[14, 22, 18, 25, 16, 20, 13].map((h, i) => (
                <div key={i} style={{
                    width: 10, height: h,
                    background: color,
                    borderRadius: '0 0 8px 8px',
                    marginTop: 4,
                }} />
            ))}
        </div>
    )

    return (
        <motion.div
            animate={floatAnim}
            transition={floatTrans}
            style={{ position: 'relative', width: 180, margin: '0 auto', paddingTop: 16 }}
        >
            {/* ── Candle ── */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: -2, zIndex: 10, position: 'relative' }}>
                <Flame />
                <div style={{
                    width: 14, height: 42,
                    background: 'linear-gradient(to bottom, #fde68a, #fbbf24)',
                    borderRadius: '4px 4px 2px 2px',
                    boxShadow: '0 0 8px rgba(251,191,36,0.4)',
                    position: 'relative',
                }}>
                    {/* stripe decoration */}
                    {[8, 18, 28].map(t => (
                        <div key={t} style={{
                            position: 'absolute', top: t, left: 0, right: 0,
                            height: 3, background: '#f472b6aa', borderRadius: 2
                        }} />
                    ))}
                </div>
            </div>

            {/* ── Top Tier ── */}
            <div style={{ ...layer('linear-gradient(135deg, #f9a8d4, #ec4899, #db2777)', 120, 52, '14px 14px 4px 4px'), margin: '0 auto' }}>
                {icingDrips('linear-gradient(to bottom, #fdf2f8, #fbcfe8)')}
                <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 8 }}>
                    {['#fcd34d','#a78bfa','#fcd34d','#a78bfa'].map((c,i) => (
                        <div key={i} style={{ width: 8, height: 8, borderRadius: '50%', background: c }} />
                    ))}
                </div>
            </div>

            {/* ── Middle Tier ── */}
            <div style={{ ...layer('linear-gradient(135deg, #c084fc, #a855f7, #7c3aed)', 150, 58, '4px 4px 4px 4px'), margin: '0 auto', marginTop: -2 }}>
                {icingDrips('linear-gradient(to bottom, #faf5ff, #e9d5ff)', -10)}
                <div style={{ position: 'absolute', bottom: 10, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 10 }}>
                    {['♥','♥','♥','♥'].map((h,i) => (
                        <span key={i} style={{ fontSize: 11, color: '#fcd34d' }}>{h}</span>
                    ))}
                </div>
            </div>

            {/* ── Bottom Tier ── */}
            <div style={{ ...layer('linear-gradient(135deg, #f472b6, #ec4899, #be185d)', 180, 68, '4px 4px 10px 10px'), margin: '0 auto', marginTop: -2 }}>
                {icingDrips('linear-gradient(to bottom, #fdf2f8, #fce7f3)', -10)}
                <div style={{ position: 'absolute', bottom: 14, left: 0, right: 0, display: 'flex', justifyContent: 'center', gap: 12 }}>
                    {['★','★','★','★','★'].map((s,i) => (
                        <span key={i} style={{ fontSize: 13, color: '#fcd34d' }}>{s}</span>
                    ))}
                </div>
            </div>

            {/* ── Plate ── */}
            <div style={{
                width: 210, height: 20,
                background: 'linear-gradient(to bottom, #fdf7ff, #eecfeb)',
                borderRadius: '50%',
                margin: '0 auto', marginTop: -4,
                boxShadow: '0 6px 15px rgba(151,59,136,0.15)',
            }} />

            {/* ── Table shadow ── */}
            <div style={{
                width: 200, height: 12,
                background: 'radial-gradient(ellipse, rgba(151,59,136,0.1) 0%, transparent 70%)',
                margin: '4px auto 0',
            }} />
        </motion.div>
    )
}

// ─── Main Page (Pinkish Neumorphism Theme) ───────────────────────────────────
export default function HappyBirthday({ onNext }) {
    const primaryColor = "#973b88"; // Bold Purple/Pink
    const textColor = "#77537e"; // Text Gray-Purple

    return (
        <motion.div
            className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#fdf7ff] font-sans relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.8 }}
        >
            {/* Elegant Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-pink-100/40 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-purple-100/40 blur-[120px] rounded-full" />
                <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-rose-100/40 blur-[100px] rounded-full" />
            </div>

            <RainingConfetti />

            <div className="relative z-10 w-full max-w-md mx-auto flex flex-col items-center text-center">

                {/* ORIGINAL PINKISH NEU-CARD Container */}
                <div className="bg-[#fdf7ff] rounded-[32px] shadow-[10px_10px_20px_rgba(151,59,136,0.1),-10px_-10px_20px_rgba(255,255,255,1)] p-10 md:p-12 w-full max-w-[460px] flex flex-col items-center">

                    <AnimatedCake />

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6, type: 'spring', stiffness: 120 }}
                        className="text-center mt-10 mb-8"
                    >
                        <h1 className="text-4xl md:text-5xl font-black mb-3 drop-shadow-sm tracking-wider uppercase"
                            style={{ color: primaryColor }}>
                            Happy Birthday
                        </h1>
                        <h2 className="text-[14px] font-bold tracking-[0.2em] uppercase flex items-center justify-center gap-2"
                            style={{ color: textColor }}>
                            <Sparkles style={{ width: 16, height: 16, color: '#f472b6' }} />
                            Madam Jii
                            <Sparkles style={{ width: 16, height: 16, color: '#f472b6' }} />
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 1.2, type: 'spring', stiffness: 200 }}
                        className="w-full max-w-[280px]"
                    >
                        {/* Neumorphic Button */}
                        <button
                            onClick={onNext}
                            className="w-full bg-[#fdf7ff] text-[13px] px-8 py-5 font-bold rounded-[20px] flex items-center justify-center gap-3 uppercase tracking-[0.12em] transition-all
                                       shadow-[6px_6px_12px_rgba(151,59,136,0.1),-6px_-6px_12px_rgba(255,255,255,1)]
                                       hover:shadow-[4px_4px_8px_rgba(151,59,136,0.1),-4px_-4px_8px_rgba(255,255,255,1)]
                                       active:shadow-[inset_4px_4px_8px_rgba(151,59,136,0.1),inset_-4px_-4px_8px_rgba(255,255,255,1)]"
                            style={{ color: primaryColor }}
                        >
                            See Our Moments <ArrowRight size={18} strokeWidth={3} className="ml-1" />
                        </button>
                    </motion.div>

                </div>
            </div>
        </motion.div>
    )
}
