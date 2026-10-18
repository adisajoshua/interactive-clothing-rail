import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Product } from '../data/products';
import { RailHanger } from './RailHanger';
import { RailOverviewHud } from './RailOverviewHud';
import { ChevronLeft, ChevronRight, Grid } from 'lucide-react';

interface ClothingRailProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const ClothingRail: React.FC<ClothingRailProps> = ({
  products,
  onSelectProduct,
}) => {
  // NULL means ALL clothes on rack are resting sideways in profile!
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [swayDirection, setSwayDirection] = useState<'left' | 'right' | 'none'>('none');
  const [windowWidth, setWindowWidth] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  const audioCtxRef = useRef<AudioContext | null>(null);
  const touchStartX = useRef<number>(0);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 640;

  // Subtle metallic friction sound
  const playFrictionSound = useCallback(() => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext })
            .webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(340, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(150, ctx.currentTime + 0.05);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(850, ctx.currentTime);
      filter.Q.setValueAtTime(3, ctx.currentTime);

      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // AudioContext unavailable or blocked
    }
  }, []);

  const handleHoverHanger = (index: number) => {
    if (index !== activeIndex) {
      if (activeIndex !== null) {
        setSwayDirection(index > activeIndex ? 'right' : 'left');
      }
      setActiveIndex(index);
      playFrictionSound();

      setTimeout(() => {
        setSwayDirection('none');
      }, 300);
    }
  };

  // Mobile navigation handlers
  const handleNextMobile = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playFrictionSound();
    if (activeIndex === null) {
      setActiveIndex(0);
    } else {
      setActiveIndex((activeIndex + 1) % products.length);
    }
  };

  const handlePrevMobile = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    playFrictionSound();
    if (activeIndex === null) {
      setActiveIndex(products.length - 1);
    } else {
      setActiveIndex((activeIndex - 1 + products.length) % products.length);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff > 45) {
      handlePrevMobile();
    } else if (diff < -45) {
      handleNextMobile();
    }
  };

  const activeProduct = activeIndex !== null ? products[activeIndex] : null;

  // On mobile, calculate smooth horizontal translation so active piece is centered
  let mobileTranslateX = 0;
  if (isMobile && activeIndex !== null) {
    const itemCenter = activeIndex * 60 + 130;
    mobileTranslateX = windowWidth / 2 - itemCenter - 16;
  }

  return (
    <div
      onMouseLeave={() => {
        if (!isMobile) setActiveIndex(null);
      }}
      className="relative w-full max-w-5xl mx-auto flex flex-col items-center select-none pt-1"
    >
      {/* Mobile Collection Indicator / Full Rack Toggle */}
      <div className="sm:hidden flex items-center justify-between w-full px-6 mb-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-stone-500">
          {activeIndex !== null ? `Piece 0${activeIndex + 1} / 0${products.length}` : 'All 6 Pieces on Rack'}
        </span>
        {activeIndex !== null && (
          <button
            onClick={() => setActiveIndex(null)}
            className="flex items-center gap-1 text-[11px] font-mono text-stone-600 hover:text-black py-1 px-2.5 rounded-full bg-stone-100 border border-stone-200/80 active:scale-95 transition-all"
          >
            <Grid className="w-3 h-3" />
            <span>View All</span>
          </button>
        )}
      </div>

      {/* 1. Overhead Slender Satin-Steel Rail Bar (Video-Accurate) */}
      <div className="relative w-full max-w-4xl h-2 flex items-center justify-between px-2 mb-[-4px] z-30">
        {/* Left Stopper */}
        <div className="w-2 h-3.5 rounded-sm bg-stone-400 shadow-sm" />

        {/* Center Rail Line */}
        <div
          className="flex-1 h-[2.5px] rounded-full relative bg-stone-300"
          style={{
            boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
          }}
        >
          {/* Subtle metallic top highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-white/70 rounded-full" />
        </div>

        {/* Right Stopper */}
        <div className="w-2 h-3.5 rounded-sm bg-stone-400 shadow-sm" />
      </div>

      {/* 2. Physical Clothes Hangers Stage */}
      <div
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="relative w-full flex items-start justify-center overflow-hidden sm:overflow-visible py-1"
      >
        {/* Mobile Floating Left Arrow */}
        <button
          onClick={handlePrevMobile}
          className="sm:hidden absolute left-2 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-stone-200/80 text-stone-700 hover:text-black active:scale-90 transition-all"
          aria-label="Previous piece on rack"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Mobile Floating Right Arrow */}
        <button
          onClick={handleNextMobile}
          className="sm:hidden absolute right-2 top-1/2 -translate-y-1/2 z-40 p-2.5 rounded-full bg-white/90 backdrop-blur-md shadow-md border border-stone-200/80 text-stone-700 hover:text-black active:scale-90 transition-all"
          aria-label="Next piece on rack"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        <div
          className="flex items-start justify-center gap-1 sm:gap-2 px-4 transition-transform duration-300 ease-out"
          style={{
            transform: isMobile ? `translateX(${mobileTranslateX}px)` : 'none',
          }}
        >
          {products.map((product, i) => {
            const isHovered = i === activeIndex;

            // Physical Push-Aside displacement math (active only when a piece is pulled forward)
            let displacementX = 0;
            let swayAngle = 0;

            if (activeIndex !== null) {
              const diff = i - activeIndex;
              if (diff < 0) {
                displacementX = -105 * Math.exp(0.4 * diff);
                swayAngle = swayDirection === 'left' ? -2.5 : 0;
              } else if (diff > 0) {
                displacementX = 105 * Math.exp(-0.4 * diff);
                swayAngle = swayDirection === 'right' ? 2.5 : 0;
              }
            }

            return (
              <RailHanger
                key={product.id}
                product={product}
                index={i}
                isHovered={isHovered}
                displacementX={displacementX}
                swayAngle={swayAngle}
                onHover={() => handleHoverHanger(i)}
                onSelect={() => {
                  if (activeIndex === i) {
                    onSelectProduct(product);
                  } else {
                    handleHoverHanger(i);
                  }
                }}
              />
            );
          })}
        </div>
      </div>

      {/* 3. Product HUD Directly Beneath */}
      <div className="h-28 flex items-center justify-center z-20">
        {activeProduct ? (
          <RailOverviewHud
            product={activeProduct}
            onOpenDetail={onSelectProduct}
          />
        ) : (
          /* State where ALL clothes are resting sideways in profile */
          <div className="flex flex-col items-center text-center select-none pt-2 animate-in fade-in duration-300">
            <span className="text-[11px] font-mono uppercase tracking-widest text-stone-500 mb-1">
              Handcrafted African Streetwear
            </span>
            <p className="text-xs text-stone-700 font-medium">
              {isMobile ? 'Tap any piece or use arrows to browse' : 'Hover over any piece to pull forward'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
