import React from 'react';
import { Sprout } from './Icons.jsx';

const { useState, useEffect } = window.React || React;

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    // Automatically fade out smoothly after exactly 2 seconds (2000ms)
    const fadeTimer = setTimeout(() => {
      setIsFading(true);
    }, 2000);

    // Completely unmount/remove overlay after the 500ms fade completes (total 2550ms)
    const removeTimer = setTimeout(() => {
      setIsVisible(false);
    }, 2550);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(removeTimer);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <div
      aria-hidden={isFading}
      className={`fixed inset-0 z-50 flex flex-col justify-between items-center bg-emerald-950 text-white p-8 transition-opacity duration-500 ${
        isFading ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Top spacer to balance flex-between */}
      <div className="w-full h-8" />

      {/* Center Brand Identity */}
      <div className="flex flex-col items-center text-center space-y-4 max-w-xs animate-fade-in">
        <div className="p-4 sm:p-5 bg-emerald-900/60 border border-emerald-500/30 text-emerald-400 rounded-3xl shadow-2xl shadow-emerald-900/80 ring-1 ring-emerald-400/20">
          <Sprout className="w-14 h-14 sm:w-16 sm:h-16 stroke-[1.75]" />
        </div>
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-200 via-teal-100 to-emerald-300 bg-clip-text text-transparent">
            KeepGreen
          </h1>
          <p className="mt-2 text-sm leading-tight text-emerald-200/80 font-medium">
            <span className="block">Smart Watering &amp;</span>
            <span className="block">Plant Care Assistant</span>
          </p>
        </div>
      </div>

      {/* Bottom Content: Minimalist spinner + Attribution */}
      <div className="flex flex-col items-center space-y-3 pb-4">
        {/* Minimalist spinner or subtle pulsing progress indicator */}
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-emerald-400/20 border-t-emerald-400 rounded-full animate-spin"></div>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
        </div>
        <p className="text-xs text-emerald-400/80 font-sans tracking-wide">
          Developed by AK Professional Services
        </p>
      </div>
    </div>
  );
}
