import React, { useState, useEffect } from 'react';
import { BloodGroup } from '../../types/blood';
import {
  ALL_BLOOD_GROUPS,
  BLOOD_PROPERTIES_MAP,
  getCompatibleRecipientTypes,
  getCompatibleDonorTypes
} from '../../utils/compatibility';
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  Flame,
  Zap,
  ChevronDown,
  Home,
  HardDrive
} from 'lucide-react';
import confetti from 'canvas-confetti';

// Pre-defined varied rotation across ALL 8 blood groups with both roles
const ROTATING_PAIRS: { bloodType: BloodGroup; role: 'DONOR' | 'RECIPIENT' }[] = [
  { bloodType: 'A+', role: 'DONOR' },
  { bloodType: 'B+', role: 'RECIPIENT' },
  { bloodType: 'O+', role: 'DONOR' },
  { bloodType: 'AB+', role: 'RECIPIENT' },
  { bloodType: 'A-', role: 'RECIPIENT' },
  { bloodType: 'B-', role: 'DONOR' },
  { bloodType: 'AB-', role: 'RECIPIENT' },
  { bloodType: 'O-', role: 'DONOR' },
  { bloodType: 'B+', role: 'DONOR' },
  { bloodType: 'A+', role: 'RECIPIENT' },
  { bloodType: 'AB+', role: 'DONOR' },
  { bloodType: 'O-', role: 'RECIPIENT' },
  { bloodType: 'O+', role: 'RECIPIENT' },
  { bloodType: 'A-', role: 'DONOR' },
  { bloodType: 'B-', role: 'RECIPIENT' },
  { bloodType: 'AB-', role: 'DONOR' },
];

interface QuizExaminerProps {
  themeMode?: 'dark' | 'light';
  initialBloodType?: BloodGroup;
  onSaveToDrive?: (report: { title: string; bloodGroup: string; details: string; sampleId: string }) => void;
}

export const QuizExaminer: React.FC<QuizExaminerProps> = ({
  themeMode = 'dark',
  initialBloodType,
  onSaveToDrive,
}) => {
  const isDark = themeMode === 'dark';
  const [currentIndex, setCurrentIndex] = useState<number>(() => {
    if (initialBloodType) {
      const idx = ROTATING_PAIRS.findIndex((p) => p.bloodType === initialBloodType);
      return idx !== -1 ? idx : 0;
    }
    return 0;
  });

  useEffect(() => {
    if (initialBloodType) {
      const idx = ROTATING_PAIRS.findIndex((p) => p.bloodType === initialBloodType);
      if (idx !== -1) setCurrentIndex(idx);
      setSelectedAnswers([]);
      setResultState('IDLE');
    }
  }, [initialBloodType]);

  const currentPair = ROTATING_PAIRS[currentIndex % ROTATING_PAIRS.length];
  const currentRole = currentPair.role;
  const currentBloodType = currentPair.bloodType;

  // Compute correct answers
  const correctAnswers = currentRole === 'DONOR'
    ? getCompatibleRecipientTypes(currentBloodType, 'RBC')
    : getCompatibleDonorTypes(currentBloodType, 'RBC');

  const [selectedAnswers, setSelectedAnswers] = useState<BloodGroup[]>([]);
  const [resultState, setResultState] = useState<'IDLE' | 'CORRECT' | 'INCORRECT'>('IDLE');
  const [isSlidingDown, setIsSlidingDown] = useState(false);
  const [score, setScore] = useState(0);
  const [total, setTotal] = useState(0);
  const [streak, setStreak] = useState(0);

  const handleToggle = (type: BloodGroup) => {
    if (resultState !== 'IDLE') return;
    setSelectedAnswers((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleCheck = () => {
    if (resultState !== 'IDLE' || selectedAnswers.length === 0) return;

    setTotal((prev) => prev + 1);

    const chosenSorted = [...selectedAnswers].sort().join(',');
    const correctSorted = [...correctAnswers].sort().join(',');
    const isCorrect = chosenSorted === correctSorted;

    if (isCorrect) {
      setResultState('CORRECT');
      setScore((prev) => prev + 1);
      setStreak((prev) => prev + 1);

      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.55 },
        colors: ['#6366f1', '#8b5cf6', '#a855f7', '#fbbf24', '#ffffff'],
      });
    } else {
      setResultState('INCORRECT');
      setStreak(0);
    }
  };

  const handleNext = () => {
    setCurrentIndex((prev) => prev + 1);
    setSelectedAnswers([]);
    setResultState('IDLE');
    setIsSlidingDown(false);
  };

  const handleSwipeDownToHome = () => {
    setIsSlidingDown(true);
    setTimeout(() => {
      setResultState('IDLE');
      setIsSlidingDown(false);
    }, 240);
  };

  const handleTryAgain = () => {
    setIsSlidingDown(true);
    setTimeout(() => {
      setSelectedAnswers([]);
      setResultState('IDLE');
      setIsSlidingDown(false);
    }, 240);
  };

  const isDonor = currentRole === 'DONOR';
  const currentProps = BLOOD_PROPERTIES_MAP[currentBloodType];

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Top Telemetry Bar */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-mono transition-colors ${
          isDark
            ? 'bg-[#0c1022] border-indigo-900/50 text-indigo-200 shadow-md'
            : 'bg-white border-indigo-100 text-indigo-950 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold">
            <Zap className="w-4 h-4 text-violet-400" />
            <span>SCORE: {score}/{total}</span>
          </div>
          <span className={isDark ? 'text-indigo-800' : 'text-indigo-200'}>·</span>
          <div className="flex items-center gap-1.5 font-bold text-amber-400">
            <Flame className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>STREAK: {streak}</span>
          </div>
        </div>

        <button
          onClick={() => {
            setScore(0);
            setTotal(0);
            setStreak(0);
            handleNext();
          }}
          title="Reset Score"
          className={`flex items-center gap-1 transition-colors cursor-pointer hover:underline ${
            isDark ? 'text-indigo-300 hover:text-white' : 'text-indigo-700 hover:text-indigo-950'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Main Flashcard Container */}
      <div
        className={`relative overflow-hidden rounded-2xl border transition-all min-h-[460px] ${
          isDark
            ? 'ceramic-slide border-indigo-900/60 shadow-2xl text-slate-100'
            : 'ceramic-slide-light border-indigo-100 shadow-lg text-slate-900'
        }`}
      >
        {/* BASE QUESTION INTERFACE */}
        <div className="p-6 sm:p-8 text-center space-y-6">
          {/* Role Pill & Blood Type Display */}
          <div className="space-y-2">
            <div>
              <span className="inline-block px-4 py-1 rounded-full text-xs font-mono font-black tracking-widest uppercase shadow-sm border bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-400/40">
                {currentRole}
              </span>
            </div>

            <div className="text-6xl sm:text-7xl font-mono font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-violet-200 to-white">
              {currentBloodType}
            </div>

            <div className="text-base sm:text-lg font-mono font-bold">
              {isDonor ? 'Can Donate Blood To:' : 'Can Receive Blood From:'}
            </div>
            <p className={`text-xs ${isDark ? 'text-indigo-300/80' : 'text-slate-600'}`}>
              Select all immunologically compatible blood phenotypes:
            </p>
          </div>

          {/* 8 Blood Type Choice Buttons */}
          <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
            {ALL_BLOOD_GROUPS.map((type) => {
              const isSelected = selectedAnswers.includes(type);

              return (
                <button
                  key={type}
                  type="button"
                  disabled={resultState !== 'IDLE'}
                  onClick={() => handleToggle(type)}
                  className={`py-3 sm:py-4 px-2 rounded-xl border font-mono font-black text-xl sm:text-2xl transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white border-2 border-indigo-400 shadow-lg shadow-indigo-600/40 ring-2 ring-indigo-400 scale-[1.03]'
                      : isDark
                      ? 'bg-indigo-950/40 text-white border-indigo-800/60 hover:bg-indigo-900/60 hover:border-indigo-400'
                      : 'bg-white text-indigo-950 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-400 shadow-xs'
                  }`}
                >
                  <span>{type}</span>
                </button>
              );
            })}
          </div>

          {/* Action Check Button */}
          <div>
            <button
              type="button"
              onClick={handleCheck}
              disabled={selectedAnswers.length === 0}
              className={`w-full py-3.5 px-6 rounded-xl font-mono font-black text-sm uppercase tracking-wider transition-all cursor-pointer border ${
                selectedAnswers.length > 0
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-400 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 active:scale-[0.98]'
                  : isDark
                  ? 'bg-indigo-950/30 text-indigo-700 cursor-not-allowed border-indigo-900/30'
                  : 'bg-indigo-100 text-indigo-400 cursor-not-allowed border-indigo-200'
              }`}
            >
              Verify Match Compatibility
            </button>
          </div>
        </div>

        {/* SWIPED CORRECTION INTERFACE IN FRONT */}
        {resultState !== 'IDLE' && (
          <div
            className={`absolute inset-0 z-30 p-6 sm:p-8 flex flex-col justify-between text-center backdrop-blur-xl shadow-2xl ${
              isSlidingDown ? 'animate-bio-slide-down' : 'animate-bio-slide-up'
            } ${
              resultState === 'CORRECT'
                ? isDark
                  ? 'bg-[#090d20]/98 border-t-4 border-violet-500 text-white'
                  : 'bg-white/98 border-t-4 border-indigo-600 text-slate-900'
                : isDark
                ? 'bg-[#090d20]/98 border-t-4 border-amber-500 text-white'
                : 'bg-indigo-50/98 border-t-4 border-amber-600 text-slate-900'
            }`}
          >
            {/* Top Option to Swipe to Home Interface */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <button
                type="button"
                onClick={handleSwipeDownToHome}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all active:scale-95 shadow-xs cursor-pointer border ${
                  isDark
                    ? 'bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border-indigo-800'
                    : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border-indigo-300'
                }`}
                title="Swipe back down to the question interface"
              >
                <ChevronDown className="w-4 h-4 animate-bounce text-violet-400" />
                <span>Swipe down to Question</span>
              </button>
            </div>

            {/* Middle Evaluated Answers Content */}
            <div className="space-y-4 my-auto">
              {resultState === 'CORRECT' ? (
                <div className="space-y-1">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border mx-auto shadow-md bg-gradient-to-tr from-emerald-600 to-teal-500 text-white border-emerald-400">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-400">
                    CORRECT MATCH!
                  </h2>
                  <p className={`text-xs font-medium font-mono ${isDark ? 'text-indigo-200' : 'text-slate-700'}`}>
                    Flawless Transfusion Compatibility Verified
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border mx-auto animate-bio-shake bg-gradient-to-tr from-rose-600 to-amber-500 text-white border-rose-400">
                    <XCircle className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-rose-400">
                    INCORRECT MATCH
                  </h2>
                  <p className={`text-xs font-medium font-mono ${isDark ? 'text-indigo-200/80' : 'text-slate-600'}`}>
                    Severe Acute Hemolytic Transfusion Risk
                  </p>
                </div>
              )}

              {/* Subject Recap */}
              <div
                className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border shadow-xs text-xs font-mono font-bold ${
                  isDark ? 'bg-indigo-950/60 border-indigo-800/80' : 'bg-white border-indigo-200'
                }`}
              >
                <span className="font-black text-violet-400">{currentRole}</span>
                <span className="text-base font-black">{currentBloodType}</span>
                <span className={isDark ? 'text-indigo-700' : 'text-indigo-300'}>·</span>
                <span className={isDark ? 'text-indigo-300' : 'text-indigo-700'}>
                  {isDonor ? 'Safe Recipients' : 'Safe Donors'}
                </span>
              </div>

              {/* The Answers List */}
              <div
                className={`p-4 rounded-xl border space-y-3 text-left shadow-sm ${
                  isDark ? 'bg-indigo-950/50 border-indigo-900/50' : 'bg-white border-indigo-100'
                }`}
              >
                <div>
                  <span className={`text-[11px] font-mono uppercase font-bold tracking-wider block mb-1.5 ${isDark ? 'text-indigo-300' : 'text-indigo-800'}`}>
                    Compatible Blood Types:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {correctAnswers.map((type) => (
                      <span
                        key={type}
                        className="px-3 py-1 rounded-lg font-mono font-black text-sm border bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-400/40 shadow-xs"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Show user picks if incorrect */}
                {resultState === 'INCORRECT' && (
                  <div className={`pt-2 border-t ${isDark ? 'border-indigo-900/40' : 'border-indigo-100'}`}>
                    <span className={`text-[11px] font-mono uppercase font-bold tracking-wider block mb-1 ${isDark ? 'text-indigo-300' : 'text-indigo-800'}`}>
                      Your Selected Choices:
                    </span>
                    <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                      {selectedAnswers.length > 0 ? (
                        selectedAnswers.map((type) => {
                          const isRight = correctAnswers.includes(type);
                          return (
                            <span
                              key={type}
                              className={`px-2.5 py-0.5 rounded-lg font-bold border ${
                                isRight
                                  ? 'bg-emerald-600 text-white border-emerald-400'
                                  : 'bg-rose-900/60 text-rose-200 border-rose-700 line-through'
                              }`}
                            >
                              {type} {isRight ? '✓' : '✗'}
                            </span>
                          );
                        })
                      ) : (
                        <span className={`text-xs italic ${isDark ? 'text-indigo-400' : 'text-indigo-600'}`}>
                          None selected
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Short Immunological Reason */}
                <div className={`pt-2 border-t text-[11px] leading-relaxed ${isDark ? 'border-indigo-900/40 text-indigo-200/80' : 'border-indigo-100 text-slate-600'}`}>
                  {isDonor ? (
                    <span>
                      Donor {currentBloodType} RBCs express [<strong>{currentProps.rbcAntigens.join(', ')}</strong>]. They can only be infused into patients whose plasma lacks matching isohemagglutinins.
                    </span>
                  ) : (
                    <span>
                      Recipient {currentBloodType} plasma circulates [<strong>{currentProps.plasmaAntibodies.join(', ') || 'No antibodies'}</strong>]. Incompatible RBC units trigger acute complement-mediated lysis.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 space-y-2 shrink-0">
              {resultState === 'CORRECT' ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleSwipeDownToHome}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl font-mono font-bold text-xs shadow-xs transition-all active:scale-[0.98] cursor-pointer border ${
                        isDark
                          ? 'bg-indigo-950/60 border-indigo-800 hover:bg-indigo-900 text-indigo-200'
                          : 'bg-white border-indigo-200 hover:bg-indigo-50 text-indigo-900'
                      }`}
                    >
                      <Home className="w-3.5 h-3.5 text-current" />
                      <span>Back to Question</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl font-mono font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer border bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-400 hover:from-indigo-500 hover:to-violet-500"
                    >
                      <span>Next Blood Group</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {onSaveToDrive && (
                    <button
                      type="button"
                      onClick={() =>
                        onSaveToDrive({
                          title: `Compatibility Report: Type ${currentBloodType} as ${currentRole}`,
                          bloodGroup: currentBloodType,
                          sampleId: `QUIZ-${currentBloodType}-${currentRole}`,
                          details: `Role: ${currentRole}
Tested Blood Group: ${currentBloodType}
Compatible Blood Types: ${correctAnswers.join(', ')}
Immunological Basis:
- RBC Antigens: ${currentProps.rbcAntigens.join(', ')}
- Plasma Isohemagglutinins: ${currentProps.plasmaAntibodies.join(', ') || 'None'}
Status: Verified Compatible & Safe for Transfusion
Verified by: Maruf (HemoMatch Station)`,
                        })
                      }
                      className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-mono font-bold text-xs shadow-xs transition-all active:scale-[0.98] cursor-pointer border ${
                        isDark
                          ? 'bg-indigo-950/60 border-indigo-800 hover:bg-indigo-900 text-indigo-200'
                          : 'bg-white border-indigo-200 hover:bg-indigo-50 text-indigo-900'
                      }`}
                    >
                      <HardDrive className="w-3.5 h-3.5 text-current" />
                      <span>Save Compatibility Card to Google Drive</span>
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTryAgain}
                      className={`flex-1 py-3 px-4 rounded-xl font-mono font-bold text-xs shadow-xs transition-all active:scale-[0.98] cursor-pointer border ${
                        isDark
                          ? 'bg-indigo-950/60 border-indigo-800 hover:bg-indigo-900 text-indigo-200'
                          : 'bg-white border-indigo-200 hover:bg-indigo-50 text-indigo-900'
                      }`}
                    >
                      Try Again ↺
                    </button>
                    <button
                      type="button"
                      onClick={handleNext}
                      className="flex-1 flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl font-mono font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer border bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-400 hover:from-indigo-500 hover:to-violet-500"
                    >
                      <span>Next Blood Group</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSwipeDownToHome}
                    className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-mono transition-colors cursor-pointer hover:underline ${
                      isDark ? 'text-indigo-400 hover:text-white' : 'text-indigo-700 hover:text-indigo-950'
                    }`}
                  >
                    <span>Swipe down to Question Interface</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
