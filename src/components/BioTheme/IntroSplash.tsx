import React, { useEffect, useState } from 'react';
import { Droplet, Dna, Activity } from 'lucide-react';

interface IntroSplashProps {
  onComplete: () => void;
}

export const IntroSplash: React.FC<IntroSplashProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Snappy progress bar reaching 100% in ~1s
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 14;
      });
    }, 65);

    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(onComplete, 300);
    }, 1100);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div
      onClick={onComplete}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#070914] text-white p-4 cursor-pointer select-none transition-opacity duration-300 ${
        isFadingOut ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
    >
      <div className="relative flex flex-col items-center max-w-sm text-center">
        {/* Molecular Rotating Ring & Stark Emblem */}
        <div className="relative w-28 h-28 flex items-center justify-center mb-6">
          {/* Outer rotating dashed ring */}
          <div className="absolute inset-0 rounded-full border-2 border-dashed border-violet-500/40 animate-bio-spin-slow"></div>

          {/* Secondary glow ring */}
          <div className="absolute w-22 h-22 rounded-full border border-indigo-400/30 animate-ping opacity-35"></div>

          {/* Center Royal Indigo / Violet Drop */}
          <div className="relative w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-600 to-violet-500 text-white flex items-center justify-center shadow-[0_0_35px_rgba(99,102,241,0.55)] border border-indigo-400/40">
            <Droplet className="w-8 h-8 fill-white stroke-white" />
          </div>
        </div>

        {/* Brand Kicker */}
        <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-indigo-300 mb-2">
          <Activity className="w-3.5 h-3.5 text-violet-400 animate-pulse" />
          <span>Immunohematology Analyzer</span>
          <span className="text-indigo-600">·</span>
          <Dna className="w-3.5 h-3.5 text-indigo-400" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black tracking-wider text-white font-mono">
          HEMOMATCH
        </h1>

        {/* Prominent Maruf Attribution Signature */}
        <div className="mt-2.5">
          <span className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-xs font-black font-mono tracking-wide shadow-md border border-indigo-400/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
            Made by Maruf
          </span>
        </div>

        <p className="text-xs text-indigo-200/80 font-medium mt-3 font-mono">
          Calibrating ABO &amp; RhD Transfusion Antigen Matrix...
        </p>

        {/* Loading Bar */}
        <div className="w-52 h-1.5 bg-indigo-950/80 rounded-full overflow-hidden mt-6 border border-indigo-800/60 shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all duration-75 rounded-full shadow-[0_0_10px_rgba(139,92,246,0.8)]"
            style={{ width: `${Math.min(100, progress)}%` }}
          ></div>
        </div>

        <span className="text-[10px] text-indigo-400/70 uppercase tracking-widest mt-4 font-mono">
          Tap anywhere to skip
        </span>
      </div>
    </div>
  );
};
