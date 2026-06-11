"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Camera, ArrowRight, X } from "lucide-react"
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay } from 'swiper/modules'
import 'swiper/css'

export default function PhotoGallery({ onNext }) {
    const [selectedImg, setSelectedImg] = useState(null)
    const [randomPhotos, setRandomPhotos] = useState([])
    const swiperRef = useRef(null)

    // Colors matching the original theme
    const primaryColor = "#973b88"; // Bold Purple/Pink
    const textColor = "#77537e"; // Text Gray-Purple

    // 12 Images Array (Make sure these paths are correct in your /public folder)
    const initialPhotos = [
        { id: 1, src: "/images/1.jpg" },
        { id: 2, src: "/images/2.jpg" },
        { id: 4, src: "/images/4.jpg" },
        { id: 5, src: "/images/5.jpg" },
        { id: 6, src: "/images/6.jpg" },
        { id: 7, src: "/images/7.jpg" },
        { id: 8, src: "/images/8.jpg" },
        { id: 9, src: "/images/9.jpg" },
        { id: 10, src: "/images/10.jpg" },
        { id: 11, src: "/images/11.jpg" },
        { id: 12, src: "/images/12.jpg" },
        { id: 13, src: "/images/13.jpg" },
        { id: 14, src: "/images/14.jpg" },
        { id: 16, src: "/images/3.jpg" },
    ]

    useEffect(() => {
        // Simple Shuffle
        const shuffled = [...initialPhotos].sort(() => Math.random() - 0.5)
        setRandomPhotos(shuffled)
    }, [])

    // Slider pause/play logic when viewing a photo
    const handleImageClick = (src) => {
        setSelectedImg(src)
        if (swiperRef.current) swiperRef.current.autoplay.stop()
    }

    const handleCloseModal = () => {
        setSelectedImg(null)
        if (swiperRef.current) swiperRef.current.autoplay.start()
    }

    return (
        <motion.div
            className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#fdf7ff] font-sans relative overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.8 }}
        >
            {/* Elegant Original Background Accents */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
                <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] bg-pink-100/30 blur-[120px] rounded-full" />
                <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-purple-100/30 blur-[120px] rounded-full" />
                <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-rose-100/40 blur-[100px] rounded-full" />
            </div>

            <motion.div className="text-center mb-8 z-10 w-full max-w-sm" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                {/* ORIGINAL PINKISH NEU-CARD FOR ICON */}
                <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6
                                 bg-[#fdf7ff] rounded-[24px] shadow-[10px_10px_20px_rgba(151,59,136,0.1),-10px_-10px_20px_rgba(255,255,255,1)]">
                    <Camera className="w-10 h-10" style={{ color: primaryColor }} strokeWidth={1.5}/>
                </div>
                {/* Original Heading Styles */}
                <h1 className="text-3xl font-black mb-2 uppercase tracking-widest" style={{ color: primaryColor }}>
                    ✨️
                </h1>
            </motion.div>

            {/* INFINITE RANDOM SLIDER inside original Neu-Image-Frame */}
            <div className="w-full max-w-[340px] md:max-w-[400px] mx-auto z-10 p-4
                           bg-[#fdf7ff] rounded-[2rem] shadow-[inset_6px_6px_12px_rgba(151,59,136,0.1),inset_-6px_-6px_12px_rgba(255,255,255,1)] border border-white">
                {randomPhotos.length > 0 && (
                    <Swiper
                        onSwiper={(swiper) => { swiperRef.current = swiper }}
                        grabCursor={true}
                        loop={true}
                        spaceBetween={16}
                        speed={800}
                        autoplay={{ delay: 2500, disableOnInteraction: false }}
                        modules={[Autoplay]}
                        className="w-full aspect-[4/5] rounded-[16px]"
                    >
                        {randomPhotos.map((photo) => (
                            <SwiperSlide key={photo.id} className="w-full h-full">
                                <motion.div 
                                    className="w-full h-full rounded-[16px] overflow-hidden cursor-pointer"
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleImageClick(photo.src)}
                                >
                                    <img
                                        src={photo.src}
                                        alt="Memory"
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                )}
            </div>

            {/* Bottom Button (Original Neu-Button style) */}
            <motion.div className="mt-10 flex flex-col items-center z-10 w-full max-w-[340px]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <button onClick={onNext} className="w-full px-5 py-5 rounded-[20px] font-extrabold flex items-center justify-centergap-2 uppercase tracking-widest text-[14px] transition-all
                                                  bg-[#fdf7ff] shadow-[6px_6px_12px_rgba(151,59,136,0.1),-6px_-6px_12px_rgba(255,255,255,1)]
                                                  hover:shadow-[4px_4px_8px_rgba(151,59,136,0.1),-4px_-4px_8px_rgba(255,255,255,1)]
                                                  active:shadow-[inset_4px_4px_8px_rgba(151,59,136,0.1),inset_-4px_-4px_8px_rgba(255,255,255,1)]"
                                         style={{ color: primaryColor }}
                >
                    One Last Thing <ArrowRight size={20} strokeWidth={3} className="ml-2" />
                </button>
            </motion.div>

            {/* FULL SCREEN LIGHTBOX (Image Viewer) - Reverted to light with backdrop blur */}
            <AnimatePresence>
                {selectedImg && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={handleCloseModal}
                        className="fixed inset-0 z-[100] flex items-center justify-center bg-[#fdf7ff]/90 backdrop-blur-2xl p-4 md:p-8"
                    >
                        {/* Original Style Close Button */}
                        <button 
                            className="absolute top-6 right-6 z-[110] bg-white/80 p-4 rounded-full shadow-lg transition-all active:scale-90"
                            style={{ color: primaryColor }}
                            onClick={handleCloseModal}
                        >
                            <X className="w-6 h-6" strokeWidth={3} />
                        </button>
                        
                        {/* Enlarged Image */}
                        <motion.img
                            initial={{ scale: 0.8, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 25 }}
                            src={selectedImg}
                            alt="Full View"
                            className="max-w-full max-h-[85vh] object-contain rounded-[2rem] shadow-[0_25px_50px_-12px_rgba(151,59,136,0.3)] border-4 border-white"
                            onClick={(e) => e.stopPropagation()} // Click on image won't close it
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
