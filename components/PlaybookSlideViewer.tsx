'use client'

import { useState, useEffect, useCallback } from 'react'
import Icon from '@/components/icons/Icon'

const TOTAL_SLIDES = 13
const SLIDES = Array.from({ length: TOTAL_SLIDES }, (_, i) => ({
  num: i + 1,
  src: `/handbook/slides/slide-${String(i + 1).padStart(2, '0')}.png`,
}))

export default function PlaybookSlideViewer({
  variant = 'contained',
}: {
  variant?: 'contained' | 'full' | 'hero'
}) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => Math.max(0, prev - 1))
  }, [])

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => Math.min(TOTAL_SLIDES - 1, prev + 1))
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrev()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === 'Escape' && isFullscreen) setIsFullscreen(false)
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToPrev, goToNext, isFullscreen])

  const slide = SLIDES[currentSlide]

  return (
    <div className={`relative w-full ${isFullscreen ? 'fixed inset-0 z-[9999] bg-black/95 p-4 sm:p-8 flex flex-col justify-center' : ''}`}>
      {/* Slide Container */}
      <div className="relative w-full max-w-5xl mx-auto rounded-3xl overflow-hidden border-2 border-white/15 bg-[#0A0D14] shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
        
        {/* Top Control Bar */}
        <div className="px-4 sm:px-5 py-3.5 bg-white/[0.04] border-b border-white/10 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFE600] animate-pulse"></span>
            <span className="font-display font-black text-xs uppercase tracking-widest text-white">
              ST Playbook Presentation
            </span>
            <span className="hidden sm:inline-block text-white/30 text-xs">·</span>
            <span className="hidden sm:inline-block text-white/60 font-mono text-xs">
              Slide {currentSlide + 1} of {TOTAL_SLIDES}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="/handbook/st-playbook.pdf"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/15 rounded-lg text-white/70 hover:text-white text-xs font-display font-bold transition-colors inline-flex items-center gap-1"
            >
              <span>Download PDF</span>
              <Icon name="download" className="w-3 h-3" />
            </a>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/15 rounded-lg text-white/70 hover:text-white text-xs font-display font-bold transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? 'Exit Fullscreen ✕' : 'Fullscreen ⛶'}
            </button>
          </div>
        </div>

        {/* Current Slide Display */}
        <div className="relative w-full bg-[#050608] flex items-center justify-center p-2 sm:p-4 min-h-[320px] sm:min-h-[500px]">
          <img
            key={slide.src}
            src={slide.src}
            alt={`Student Tribe Playbook Slide ${slide.num}`}
            className="w-full h-auto max-h-[75vh] object-contain rounded-xl shadow-2xl transition-all duration-300 animate-fade-in"
          />

          {/* Quick Floating Next/Prev on Image Hover */}
          <button
            onClick={goToPrev}
            disabled={currentSlide === 0}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/70 hover:bg-[#FFE600] text-white hover:text-black border border-white/20 hover:border-black flex items-center justify-center font-black text-xl transition-all disabled:opacity-20 disabled:pointer-events-none backdrop-blur shadow-xl"
            aria-label="Previous Slide"
          >
            ←
          </button>
          <button
            onClick={goToNext}
            disabled={currentSlide === TOTAL_SLIDES - 1}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/70 hover:bg-[#FFE600] text-white hover:text-black border border-white/20 hover:border-black flex items-center justify-center font-black text-xl transition-all disabled:opacity-20 disabled:pointer-events-none backdrop-blur shadow-xl"
            aria-label="Next Slide"
          >
            →
          </button>
        </div>

        {/* Bottom Navigation & Controls */}
        <div className="p-4 sm:p-5 bg-white/[0.04] border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Slide Navigation Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={goToPrev}
              disabled={currentSlide === 0}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white disabled:opacity-30 disabled:pointer-events-none font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5"
            >
              ← Prev Slide
            </button>
            <span className="font-mono text-xs font-bold text-[#FFE600] px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg">
              {String(currentSlide + 1).padStart(2, '0')} / {String(TOTAL_SLIDES).padStart(2, '0')}
            </span>
            <button
              onClick={goToNext}
              disabled={currentSlide === TOTAL_SLIDES - 1}
              className="px-5 py-2 bg-[#FFE600] hover:bg-[#D4FF00] text-black disabled:opacity-30 disabled:pointer-events-none font-display font-black text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 shadow-[2px_2px_0px_#000]"
            >
              Next Slide →
            </button>
          </div>

          {/* Slide Thumbnails / Progress Dots */}
          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {SLIDES.map((s, idx) => (
              <button
                key={s.num}
                onClick={() => setCurrentSlide(idx)}
                className={`w-6 h-6 rounded-md font-mono text-[10px] font-black transition-all ${
                  currentSlide === idx
                    ? 'bg-[#FFE600] text-black scale-110 shadow-md font-bold'
                    : 'bg-white/10 text-white/50 hover:bg-white/20 hover:text-white'
                }`}
                title={`Go to Slide ${s.num}`}
              >
                {s.num}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
