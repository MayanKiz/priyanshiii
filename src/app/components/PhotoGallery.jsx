"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Camera, ChevronLeft, ChevronRight, Pause, Play, X, Maximize2, Sparkles } from "lucide-react"
import { Swiper, SwiperSlide } from "swiper/react"
import { Autoplay, Keyboard, Pagination } from "swiper/modules"
import "swiper/css"
import "swiper/css/pagination"

const photos = [
    { id: 1, src: "/images/1.jpg", caption: "a little moment worth keeping" },
    { id: 2, src: "/images/2.jpg", caption: "soft smiles, softer memories" },
    { id: 3, src: "/images/3.jpg", caption: "one of my favourite frames" },
    { id: 4, src: "/images/4.jpg", caption: "main character energy" },
    { id: 5, src: "/images/5.jpg", caption: "pretty days, pretty memories" },
    { id: 6, src: "/images/6.jpg", caption: "a frame full of sunshine" },
    { id: 7, src: "/images/7.jpg", caption: "tiny detail, big feeling" },
    { id: 8, src: "/images/8.jpg", caption: "just you being you" },
    { id: 9, src: "/images/9.jpg", caption: "saved in my happy folder" },
    { id: 10, src: "/images/10.jpg", caption: "a memory with a little sparkle" },
    { id: 11, src: "/images/11.jpg", caption: "the kind of smile we replay" },
    { id: 12, src: "/images/12.jpg", caption: "some moments feel like home" },
    { id: 13, src: "/images/13.jpg", caption: "beautiful, as always" },
    { id: 14, src: "/images/14.jpg", caption: "and here is another favourite" },
]

export default function PhotoGallery({ onNext }) {
    const [activeIndex, setActiveIndex] = useState(0)
    const [selectedIndex, setSelectedIndex] = useState(null)
    const [isPlaying, setIsPlaying] = useState(true)
    const swiperRef = useRef(null)

    const stopAutoplay = useCallback(() => {
        swiperRef.current?.autoplay?.stop()
        setIsPlaying(false)
    }, [])

    const startAutoplay = useCallback(() => {
        swiperRef.current?.autoplay?.start()
        setIsPlaying(true)
    }, [])

    const openLightbox = (index) => {
        setSelectedIndex(index)
        stopAutoplay()
    }

    const closeLightbox = useCallback(() => {
        setSelectedIndex(null)
        startAutoplay()
    }, [startAutoplay])

    const moveLightbox = useCallback((direction) => {
        setSelectedIndex((current) => {
            if (current === null) return current
            return (current + direction + photos.length) % photos.length
        })
    }, [])

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (selectedIndex === null) return
            if (event.key === "Escape") closeLightbox()
            if (event.key === "ArrowRight") moveLightbox(1)
            if (event.key === "ArrowLeft") moveLightbox(-1)
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [closeLightbox, moveLightbox, selectedIndex])

    return (
        <motion.main
            className="gallery-shell flex min-h-screen flex-col items-center px-4 py-10 sm:px-6 sm:py-14"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.55 }}
        >
            <div className="dream-orb dream-orb-pink" aria-hidden="true" />
            <div className="dream-orb dream-orb-lilac" aria-hidden="true" />
            <div className="dream-sparkle sparkle-one" aria-hidden="true">✦</div>
            <div className="dream-sparkle sparkle-two" aria-hidden="true">✧</div>

            <div className="relative z-10 flex w-full max-w-5xl flex-1 flex-col items-center">
                <motion.header
                    className="mb-7 w-full text-center sm:mb-9"
                    initial={{ y: -16, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                >
                    <span className="eyebrow-pill"><Camera size={13} /> memories, in motion</span>
                    <h1 className="font-heading mt-5 text-4xl font-bold tracking-tight text-[#7d416f] sm:text-5xl">a little gallery</h1>
                    <p className="font-cute mx-auto mt-3 max-w-md text-sm font-semibold leading-relaxed text-[#986486] sm:text-base">
                        Every photo holds a small story — swipe, pause and keep your favourite frame.
                    </p>
                </motion.header>

                <motion.section
                    className="w-full max-w-[520px]"
                    initial={{ y: 18, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.12, type: "spring", stiffness: 160 }}
                    aria-label="Photo memory gallery"
                >
                    <div className="gallery-frame">
                        <Swiper
                            onSwiper={(swiper) => { swiperRef.current = swiper }}
                            onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                            slidesPerView={1}
                            loop
                            speed={650}
                            grabCursor
                            keyboard={{ enabled: true }}
                            autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
                            modules={[Autoplay, Keyboard, Pagination]}
                            pagination={{ clickable: true, el: ".gallery-swiper-pagination" }}
                            onMouseEnter={stopAutoplay}
                            onMouseLeave={startAutoplay}
                            className="overflow-hidden rounded-[1.55rem]"
                        >
                            {photos.map((photo, index) => (
                                <SwiperSlide key={photo.id}>
                                    <button
                                        type="button"
                                        className="gallery-slide block w-full cursor-zoom-in text-left outline-none focus-visible:ring-4 focus-visible:ring-[#d28bb7]/50"
                                        onClick={() => openLightbox(index)}
                                        aria-label={`Open ${photo.caption}`}
                                    >
                                        <img
                                            src={photo.src}
                                            alt={photo.caption}
                                            loading={index === 0 ? "eager" : "lazy"}
                                            decoding="async"
                                        />
                                        <span className="gallery-caption">{photo.caption}</span>
                                        <span className="absolute right-4 top-4 z-10 inline-flex rounded-full bg-white/70 p-2 text-[#945c80] backdrop-blur-md" aria-hidden="true">
                                            <Maximize2 size={15} />
                                        </span>
                                    </button>
                                </SwiperSlide>
                            ))}
                        </Swiper>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3 px-1">
                        <button type="button" className="gallery-control" onClick={() => swiperRef.current?.slidePrev()} aria-label="Previous photo">
                            <ChevronLeft size={19} />
                        </button>
                        <div className="gallery-dots gallery-swiper-pagination min-h-3" aria-label="Photo pagination" />
                        <button type="button" className="gallery-control" onClick={() => swiperRef.current?.slideNext()} aria-label="Next photo">
                            <ChevronRight size={19} />
                        </button>
                    </div>

                    <div className="mt-5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.15em] text-[#a46b8c]">
                            <Sparkles size={14} />
                            <span>{String(activeIndex + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")}</span>
                        </div>
                        <button
                            type="button"
                            className="gallery-button !px-4 !py-2.5 !text-[0.65rem] !tracking-[0.12em]"
                            onClick={isPlaying ? stopAutoplay : startAutoplay}
                            aria-pressed={isPlaying}
                        >
                            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
                            {isPlaying ? "pause" : "play"}
                        </button>
                    </div>

                    <div className="thumbnail-rail mt-5" aria-label="Choose a photo">
                        {photos.map((photo, index) => (
                            <button
                                type="button"
                                key={photo.id}
                                className={`thumbnail-button ${activeIndex === index ? "is-active" : ""}`}
                                onClick={() => swiperRef.current?.slideToLoop(index)}
                                aria-label={`Show photo ${index + 1}`}
                                aria-current={activeIndex === index ? "true" : undefined}
                            >
                                <img src={photo.src} alt="" loading="lazy" decoding="async" />
                            </button>
                        ))}
                    </div>
                </motion.section>

                <motion.div
                    className="mt-auto flex w-full max-w-[520px] flex-col items-center gap-4 pt-9"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                >
                    <p className="font-cute text-center text-sm font-semibold text-[#a06d8d]">Some memories deserve a second look ✨</p>
                    <button type="button" onClick={onNext} className="primary-pill w-full sm:w-auto">
                        one last thing <ArrowRight size={17} strokeWidth={2.5} />
                    </button>
                </motion.div>
            </div>

            <AnimatePresence>
                {selectedIndex !== null && (
                    <motion.div
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#3e253c]/75 p-4 backdrop-blur-xl sm:p-8"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        role="dialog"
                        aria-modal="true"
                        aria-label="Expanded photo viewer"
                        onClick={closeLightbox}
                    >
                        <button type="button" className="absolute right-5 top-5 z-[110] rounded-full bg-white/85 p-3 text-[#7d416f] shadow-lg transition hover:scale-105 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70" onClick={closeLightbox} aria-label="Close photo viewer">
                            <X size={22} />
                        </button>
                        <button type="button" className="gallery-control absolute left-4 z-[110] border-white/40 bg-white/80 sm:left-7" onClick={(event) => { event.stopPropagation(); moveLightbox(-1) }} aria-label="Previous expanded photo">
                            <ChevronLeft size={22} />
                        </button>
                        <motion.figure
                            className="relative m-0 max-h-[88vh] max-w-[min(88vw,720px)]"
                            initial={{ scale: 0.92, y: 15 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.92, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 260, damping: 24 }}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <img src={photos[selectedIndex].src} alt={photos[selectedIndex].caption} className="max-h-[78vh] max-w-full rounded-[1.5rem] border-4 border-white/85 object-contain shadow-[0_25px_65px_rgba(0,0,0,0.35)]" />
                            <figcaption className="mt-3 text-center font-cute text-sm font-semibold text-white/90">{photos[selectedIndex].caption}</figcaption>
                        </motion.figure>
                        <button type="button" className="gallery-control absolute right-4 z-[110] border-white/40 bg-white/80 sm:right-7" onClick={(event) => { event.stopPropagation(); moveLightbox(1) }} aria-label="Next expanded photo">
                            <ChevronRight size={22} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.main>
    )
}
