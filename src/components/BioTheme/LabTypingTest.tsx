import React, { useState } from 'react';
import { BloodGroup } from '../../types/blood';
import { ALL_BLOOD_GROUPS, BLOOD_PROPERTIES_MAP } from '../../utils/compatibility';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  FlaskConical,
  ArrowRight,
  ChevronDown,
  Activity,
  HardDrive,
  Pipette,
  Microscope,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface LabSample {
  id: string;
  sampleLabel: string;
  bloodType: BloodGroup;
  clinicalContext: string;
}

// 8 Diverse clinical samples covering all 8 blood phenotypes
const SAMPLES_POOL: LabSample[] = [
  { id: 'SMP-101', sampleLabel: 'Trauma Bay Urgent Arrival', bloodType: 'A+', clinicalContext: 'Emergency trauma arrival after collision; rapid pre-transfusion typing required.' },
  { id: 'SMP-102', sampleLabel: 'Neonatal Cord Blood Sample', bloodType: 'B+', clinicalContext: 'Newborn screening for maternal-fetal ABO & Rh incompatibility.' },
  { id: 'SMP-103', sampleLabel: 'Voluntary Blood Donor #42', bloodType: 'O-', clinicalContext: 'First-time donor; potential universal red cell donor.' },
  { id: 'SMP-104', sampleLabel: 'Cardiothoracic Surgery Pre-op', bloodType: 'AB+', clinicalContext: 'Pre-operative crossmatching verification prior to coronary bypass.' },
  { id: 'SMP-105', sampleLabel: 'Orthopedic Joint Patient', bloodType: 'A-', clinicalContext: 'Total knee arthroplasty reserve blood group verification.' },
  { id: 'SMP-106', sampleLabel: 'ICU Septic Shock Patient', bloodType: 'B-', clinicalContext: 'Urgent packed RBC requirement; crossmatch verification.' },
  { id: 'SMP-107', sampleLabel: 'Antenatal Clinic Patient', bloodType: 'O+', clinicalContext: 'Routine gestational RhD sensitization screening.' },
  { id: 'SMP-108', sampleLabel: 'Hematology Ward Inpatient', bloodType: 'AB-', clinicalContext: 'Rare phenotype verification prior to targeted platelet transfusion.' },
];

interface LabTypingTestProps {
  themeMode?: 'dark' | 'light';
  onTestCompatibility?: (bloodType: BloodGroup) => void;
  onSaveToDrive?: (report: { title: string; bloodGroup: string; details: string; sampleId: string }) => void;
}

export const LabTypingTest: React.FC<LabTypingTestProps> = ({
  themeMode = 'dark',
  onTestCompatibility,
  onSaveToDrive,
}) => {
  const isDark = themeMode === 'dark';
  const [sampleIndex, setSampleIndex] = useState(0);
  const currentSample = SAMPLES_POOL[sampleIndex % SAMPLES_POOL.length];

  // Reagent states
  const [addedAntiA, setAddedAntiA] = useState(false);
  const [addedAntiB, setAddedAntiB] = useState(false);
  const [addedAntiD, setAddedAntiD] = useState(false);
  const [isMixed, setIsMixed] = useState(false);

  // User diagnosis
  const [selectedGuess, setSelectedGuess] = useState<BloodGroup | null>(null);
  const [resultState, setResultState] = useState<'IDLE' | 'CORRECT' | 'INCORRECT'>('IDLE');
  const [isSlidingDown, setIsSlidingDown] = useState(false);

  // Score tracking
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);

  // True agglutination reactions based on blood phenotype
  const trueProps = BLOOD_PROPERTIES_MAP[currentSample.bloodType];
  const clumpsA = trueProps.abo === 'A' || trueProps.abo === 'AB';
  const clumpsB = trueProps.abo === 'B' || trueProps.abo === 'AB';
  const clumpsD = trueProps.rh === '+';

  const allReagentsAdded = addedAntiA && addedAntiB && addedAntiD;

  const handleAddReagent = (reagent: 'A' | 'B' | 'D') => {
    if (resultState !== 'IDLE') return;
    if (reagent === 'A') setAddedAntiA(true);
    if (reagent === 'B') setAddedAntiB(true);
    if (reagent === 'D') setAddedAntiD(true);
  };

  const handleAddAllReagents = () => {
    if (resultState !== 'IDLE') return;
    setAddedAntiA(true);
    setAddedAntiB(true);
    setAddedAntiD(true);
    setIsMixed(true);
  };

  const handleMix = () => {
    if (!allReagentsAdded || isMixed) return;
    setIsMixed(true);
  };

  const handleCheckDiagnosis = () => {
    if (!selectedGuess || resultState !== 'IDLE') return;

    setTotalAttempts((prev) => prev + 1);
    const isCorrect = selectedGuess === currentSample.bloodType;

    if (isCorrect) {
      setResultState('CORRECT');
      setScore((prev) => prev + 1);
      confetti({
        particleCount: 90,
        spread: 75,
        origin: { y: 0.55 },
        colors: ['#6366f1', '#8b5cf6', '#a855f7', '#fbbf24', '#ffffff'],
      });
    } else {
      setResultState('INCORRECT');
    }
  };

  const handleNextSample = () => {
    setSampleIndex((prev) => prev + 1);
    setAddedAntiA(false);
    setAddedAntiB(false);
    setAddedAntiD(false);
    setIsMixed(false);
    setSelectedGuess(null);
    setResultState('IDLE');
    setIsSlidingDown(false);
  };

  const handleTryAgain = () => {
    setIsSlidingDown(true);
    setTimeout(() => {
      setSelectedGuess(null);
      setResultState('IDLE');
      setIsSlidingDown(false);
    }, 240);
  };

  const handleSwipeDownToLab = () => {
    setIsSlidingDown(true);
    setTimeout(() => {
      setResultState('IDLE');
      setIsSlidingDown(false);
    }, 240);
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Top Telemetry / Score Bar */}
      <div
        className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-mono transition-colors ${
          isDark
            ? 'bg-[#0c1022] border-indigo-900/50 text-indigo-200 shadow-md'
            : 'bg-white border-indigo-100 text-indigo-950 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold">
            <FlaskConical className="w-4 h-4 text-violet-400" />
            <span>ACCURACY: {score}/{totalAttempts}</span>
          </div>
          <span className={isDark ? 'text-indigo-800' : 'text-indigo-200'}>·</span>
          <span className={`font-medium ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
            {currentSample.id}
          </span>
        </div>

        <button
          onClick={() => {
            setScore(0);
            setTotalAttempts(0);
            handleNextSample();
          }}
          title="Reset Analyzer"
          className={`flex items-center gap-1 transition-colors cursor-pointer hover:underline ${
            isDark ? 'text-indigo-300 hover:text-white' : 'text-indigo-700 hover:text-indigo-950'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      </div>

      {/* Main Testing Bench Card */}
      <div
        className={`relative overflow-hidden rounded-2xl border transition-all min-h-[500px] ${
          isDark
            ? 'ceramic-slide border-indigo-900/60 shadow-2xl text-slate-100'
            : 'ceramic-slide-light border-indigo-100 shadow-lg text-slate-900'
        }`}
      >
        {/* BASE WORKBENCH INTERFACE */}
        <div className="p-6 sm:p-7 text-center space-y-5">
          {/* Sample Header */}
          <div className="space-y-1">
            <div
              className={`flex items-center justify-center gap-2 text-xs font-mono tracking-wider uppercase font-bold ${
                isDark ? 'text-indigo-400' : 'text-indigo-600'
              }`}
            >
              <Microscope className="w-3.5 h-3.5 text-current" />
              <span>Diagnostic Agglutination Slide Method</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight font-mono">
              {currentSample.sampleLabel}
            </h2>
            <p className={`text-xs max-w-md mx-auto ${isDark ? 'text-indigo-200/70' : 'text-slate-600'}`}>
              {currentSample.clinicalContext}
            </p>
          </div>

          {/* STEP 1: Antisera Reagent Bottles */}
          <div
            className={`p-3.5 rounded-xl border space-y-2.5 text-left transition-colors ${
              isDark ? 'bg-indigo-950/40 border-indigo-900/50' : 'bg-indigo-50/50 border-indigo-100'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[11px] uppercase font-bold font-mono tracking-wider flex items-center gap-1.5 ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                <Pipette className="w-3.5 h-3.5 text-current" />
                <span>1. Dispense Monoclonal Antisera</span>
              </span>

              {!allReagentsAdded && (
                <button
                  type="button"
                  onClick={handleAddAllReagents}
                  className="text-[11px] font-mono hover:underline font-bold transition-colors cursor-pointer text-violet-400 hover:text-violet-300"
                >
                  ⚡ Dispense All
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {/* Anti-A Dropper Bottle (Monoclonal Azure Blue) */}
              <button
                type="button"
                disabled={addedAntiA || resultState !== 'IDLE'}
                onClick={() => handleAddReagent('A')}
                className={`py-2 px-2 rounded-xl border text-xs font-mono font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  addedAntiA
                    ? isDark
                      ? 'bg-indigo-950/60 border-indigo-900/60 text-indigo-400/50 opacity-60 cursor-default'
                      : 'bg-indigo-100 border-indigo-200 text-indigo-400 opacity-70 cursor-default'
                    : isDark
                    ? 'bg-indigo-900/40 border-sky-500/40 text-white hover:bg-sky-950/40 hover:border-sky-400 active:scale-95 shadow-xs'
                    : 'bg-white border-sky-300 text-slate-900 hover:bg-sky-50 hover:border-sky-500 active:scale-95 shadow-xs'
                }`}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white bg-gradient-to-tr from-sky-600 to-blue-500 shadow-sm border border-sky-300/40">
                  α-A
                </div>
                <span className="text-sky-300 font-bold">Anti-A</span>
                <span className={`text-[10px] font-normal ${isDark ? 'text-indigo-300/70' : 'text-indigo-700/70'}`}>
                  {addedAntiA ? '✓ In Well A' : '+ Drop Well A'}
                </span>
              </button>

              {/* Anti-B Dropper Bottle (Monoclonal Tartrazine Yellow) */}
              <button
                type="button"
                disabled={addedAntiB || resultState !== 'IDLE'}
                onClick={() => handleAddReagent('B')}
                className={`py-2 px-2 rounded-xl border text-xs font-mono font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  addedAntiB
                    ? isDark
                      ? 'bg-indigo-950/60 border-indigo-900/60 text-indigo-400/50 opacity-60 cursor-default'
                      : 'bg-indigo-100 border-indigo-200 text-indigo-400 opacity-70 cursor-default'
                    : isDark
                    ? 'bg-indigo-900/40 border-amber-500/40 text-white hover:bg-amber-950/40 hover:border-amber-400 active:scale-95 shadow-xs'
                    : 'bg-white border-amber-300 text-slate-900 hover:bg-amber-50 hover:border-amber-500 active:scale-95 shadow-xs'
                }`}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-slate-950 bg-gradient-to-tr from-amber-400 to-yellow-300 shadow-sm border border-amber-300">
                  α-B
                </div>
                <span className="text-amber-300 font-bold">Anti-B</span>
                <span className={`text-[10px] font-normal ${isDark ? 'text-indigo-300/70' : 'text-indigo-700/70'}`}>
                  {addedAntiB ? '✓ In Well B' : '+ Drop Well B'}
                </span>
              </button>

              {/* Anti-D Dropper Bottle (Monoclonal Violet / Rh) */}
              <button
                type="button"
                disabled={addedAntiD || resultState !== 'IDLE'}
                onClick={() => handleAddReagent('D')}
                className={`py-2 px-2 rounded-xl border text-xs font-mono font-bold transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  addedAntiD
                    ? isDark
                      ? 'bg-indigo-950/60 border-indigo-900/60 text-indigo-400/50 opacity-60 cursor-default'
                      : 'bg-indigo-100 border-indigo-200 text-indigo-400 opacity-70 cursor-default'
                    : isDark
                    ? 'bg-indigo-900/40 border-violet-500/40 text-white hover:bg-violet-950/40 hover:border-violet-400 active:scale-95 shadow-xs'
                    : 'bg-white border-violet-300 text-slate-900 hover:bg-violet-50 hover:border-violet-500 active:scale-95 shadow-xs'
                }`}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white bg-gradient-to-tr from-violet-600 to-purple-500 shadow-sm border border-violet-300/40">
                  α-D
                </div>
                <span className="text-violet-300 font-bold">Anti-D (Rh)</span>
                <span className={`text-[10px] font-normal ${isDark ? 'text-indigo-300/70' : 'text-indigo-700/70'}`}>
                  {addedAntiD ? '✓ In Well Rh' : '+ Drop Well Rh'}
                </span>
              </button>
            </div>
          </div>

          {/* STEP 2: The 3 Slide Testing Wells */}
          <div
            className={`p-4 rounded-xl border transition-colors ${
              isDark ? 'bg-indigo-950/30 border-indigo-900/40' : 'bg-indigo-50/60 border-indigo-100'
            }`}
          >
            <div className="flex items-center justify-between mb-3 text-left">
              <span className={`text-[11px] font-mono uppercase font-bold tracking-wider ${isDark ? 'text-indigo-300' : 'text-indigo-800'}`}>
                2. Agglutination Reactions:
              </span>

              {allReagentsAdded && !isMixed && (
                <button
                  type="button"
                  onClick={handleMix}
                  className="px-3.5 py-1 rounded-full text-xs font-mono font-bold transition-all cursor-pointer shadow-md bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-500 hover:to-violet-500 border border-indigo-400/30 active:scale-95"
                >
                  Mix &amp; Incubate 🌀
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              {/* Well A: Anti-A */}
              <div
                className={`p-3 rounded-xl border flex flex-col items-center transition-colors ${
                  isDark ? 'bg-[#0f142b] border-indigo-900/50' : 'bg-white border-indigo-100 shadow-xs'
                }`}
              >
                <span className="text-xs font-mono font-black uppercase mb-2 tracking-wide text-sky-400">
                  Well A
                </span>

                <div
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center overflow-hidden transition-all ${
                    isDark ? 'testing-well-dark' : 'testing-well-light'
                  }`}
                >
                  {!addedAntiA ? (
                    /* Initial pure red blood droplet */
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-600 to-red-800 opacity-95 shadow-md border border-rose-500/30"></div>
                  ) : !isMixed ? (
                    /* Blood + Blue Reagent unmixed */
                    <div className="relative w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-rose-600 to-red-800 shadow-md">
                      <div className="w-4 h-4 rounded-full bg-sky-400 absolute top-1 right-1 border border-white shadow-xs"></div>
                    </div>
                  ) : clumpsA ? (
                    /* Agglutination Clumps in Red */
                    <div className="w-full h-full p-1.5 flex flex-wrap gap-1.5 items-center justify-center animate-clump bg-red-950/40">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <span
                          key={i}
                          className="w-2.5 h-2.5 rounded-full inline-block bg-gradient-to-tr from-red-600 to-rose-400 shadow-sm border border-red-300/40"
                          style={{ margin: `${(i % 2) * 2}px` }}
                        ></span>
                      ))}
                    </div>
                  ) : (
                    /* Smooth homogeneous reddish suspension */
                    <div className="w-14 h-14 rounded-full opacity-90 flex items-center justify-center bg-gradient-to-br from-rose-700/80 to-red-900/80 shadow-inner border border-rose-600/30">
                      <span className="text-[9px] font-mono font-bold text-rose-200">Smooth</span>
                    </div>
                  )}
                </div>

                <div className="mt-2 text-xs font-mono font-bold">
                  {isMixed ? (
                    clumpsA ? (
                      <span className="px-2 py-0.5 rounded-md border font-black bg-rose-500/20 text-rose-300 border-rose-500/40">
                        Clumped (+)
                      </span>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-md border ${
                        isDark
                          ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        Smooth (−)
                      </span>
                    )
                  ) : (
                    <span className={`text-[10px] ${isDark ? 'text-indigo-400/60' : 'text-indigo-600/60'}`}>
                      {addedAntiA ? 'Needs mix' : 'Awaiting drop'}
                    </span>
                  )}
                </div>
              </div>

              {/* Well B: Anti-B */}
              <div
                className={`p-3 rounded-xl border flex flex-col items-center transition-colors ${
                  isDark ? 'bg-[#0f142b] border-indigo-900/50' : 'bg-white border-indigo-100 shadow-xs'
                }`}
              >
                <span className="text-xs font-mono font-black uppercase mb-2 tracking-wide text-amber-400">
                  Well B
                </span>

                <div
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center overflow-hidden transition-all ${
                    isDark ? 'testing-well-dark' : 'testing-well-light'
                  }`}
                >
                  {!addedAntiB ? (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-600 to-red-800 opacity-95 shadow-md border border-rose-500/30"></div>
                  ) : !isMixed ? (
                    <div className="relative w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-rose-600 to-red-800 shadow-md">
                      <div className="w-4 h-4 rounded-full bg-amber-400 absolute top-1 right-1 border border-white shadow-xs"></div>
                    </div>
                  ) : clumpsB ? (
                    <div className="w-full h-full p-1.5 flex flex-wrap gap-1.5 items-center justify-center animate-clump bg-red-950/40">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <span
                          key={i}
                          className="w-2.5 h-2.5 rounded-full inline-block bg-gradient-to-tr from-red-600 to-rose-400 shadow-sm border border-red-300/40"
                          style={{ margin: `${(i % 2) * 2}px` }}
                        ></span>
                      ))}
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full opacity-90 flex items-center justify-center bg-gradient-to-br from-rose-700/80 to-red-900/80 shadow-inner border border-rose-600/30">
                      <span className="text-[9px] font-mono font-bold text-rose-200">Smooth</span>
                    </div>
                  )}
                </div>

                <div className="mt-2 text-xs font-mono font-bold">
                  {isMixed ? (
                    clumpsB ? (
                      <span className="px-2 py-0.5 rounded-md border font-black bg-rose-500/20 text-rose-300 border-rose-500/40">
                        Clumped (+)
                      </span>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-md border ${
                        isDark
                          ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        Smooth (−)
                      </span>
                    )
                  ) : (
                    <span className={`text-[10px] ${isDark ? 'text-indigo-400/60' : 'text-indigo-600/60'}`}>
                      {addedAntiB ? 'Needs mix' : 'Awaiting drop'}
                    </span>
                  )}
                </div>
              </div>

              {/* Well Rh: Anti-D */}
              <div
                className={`p-3 rounded-xl border flex flex-col items-center transition-colors ${
                  isDark ? 'bg-[#0f142b] border-indigo-900/50' : 'bg-white border-indigo-100 shadow-xs'
                }`}
              >
                <span className="text-xs font-mono font-black uppercase mb-2 tracking-wide text-violet-400">
                  Well Rh
                </span>

                <div
                  className={`relative w-20 h-20 rounded-full flex items-center justify-center overflow-hidden transition-all ${
                    isDark ? 'testing-well-dark' : 'testing-well-light'
                  }`}
                >
                  {!addedAntiD ? (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-600 to-red-800 opacity-95 shadow-md border border-rose-500/30"></div>
                  ) : !isMixed ? (
                    <div className="relative w-14 h-14 rounded-full flex items-center justify-center bg-gradient-to-br from-rose-600 to-red-800 shadow-md">
                      <div className="w-4 h-4 rounded-full bg-violet-400 absolute top-1 right-1 border border-white shadow-xs"></div>
                    </div>
                  ) : clumpsD ? (
                    <div className="w-full h-full p-1.5 flex flex-wrap gap-1.5 items-center justify-center animate-clump bg-red-950/40">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <span
                          key={i}
                          className="w-2.5 h-2.5 rounded-full inline-block bg-gradient-to-tr from-red-600 to-rose-400 shadow-sm border border-red-300/40"
                          style={{ margin: `${(i % 2) * 2}px` }}
                        ></span>
                      ))}
                    </div>
                  ) : (
                    <div className="w-14 h-14 rounded-full opacity-90 flex items-center justify-center bg-gradient-to-br from-rose-700/80 to-red-900/80 shadow-inner border border-rose-600/30">
                      <span className="text-[9px] font-mono font-bold text-rose-200">Smooth</span>
                    </div>
                  )}
                </div>

                <div className="mt-2 text-xs font-mono font-bold">
                  {isMixed ? (
                    clumpsD ? (
                      <span className="px-2 py-0.5 rounded-md border font-black bg-rose-500/20 text-rose-300 border-rose-500/40">
                        Clumped (+)
                      </span>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-md border ${
                        isDark
                          ? 'bg-indigo-950/80 text-indigo-300 border-indigo-800/60'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        Smooth (−)
                      </span>
                    )
                  ) : (
                    <span className={`text-[10px] ${isDark ? 'text-indigo-400/60' : 'text-indigo-600/60'}`}>
                      {addedAntiD ? 'Needs mix' : 'Awaiting drop'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* STEP 3: Conclude Blood Group from Agglutination */}
          <div className="space-y-3 pt-1">
            <div className={`text-xs font-mono font-bold uppercase tracking-wider ${isDark ? 'text-indigo-300' : 'text-indigo-800'}`}>
              3. Conclude Blood Group:
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
              {ALL_BLOOD_GROUPS.map((type) => {
                const isSelected = selectedGuess === type;
                return (
                  <button
                    key={type}
                    type="button"
                    disabled={!isMixed || resultState !== 'IDLE'}
                    onClick={() => setSelectedGuess(type)}
                    className={`py-2.5 px-1 rounded-xl font-mono font-black text-lg transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-gradient-to-tr from-indigo-600 to-violet-600 text-white border-2 border-indigo-400 shadow-lg shadow-indigo-600/40 ring-2 ring-indigo-400 scale-[1.03]'
                        : isMixed
                        ? isDark
                          ? 'bg-indigo-950/50 border-indigo-800/60 text-white hover:bg-indigo-900/60 hover:border-indigo-400'
                          : 'bg-white border-indigo-200 text-indigo-950 hover:bg-indigo-50 hover:border-indigo-400 shadow-xs'
                        : isDark
                        ? 'bg-indigo-950/20 text-indigo-700 border-indigo-950/50 cursor-not-allowed'
                        : 'bg-indigo-50/50 text-indigo-300 border-indigo-100 cursor-not-allowed'
                    }`}
                  >
                    {type}
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              disabled={!selectedGuess || !isMixed || resultState !== 'IDLE'}
              onClick={handleCheckDiagnosis}
              className={`w-full py-3.5 px-6 rounded-xl font-mono font-black text-sm uppercase tracking-wider transition-all cursor-pointer border ${
                selectedGuess && isMixed
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-400 hover:from-indigo-500 hover:to-violet-500 shadow-lg shadow-indigo-600/30 active:scale-[0.98]'
                  : isDark
                  ? 'bg-indigo-950/30 text-indigo-700 cursor-not-allowed border-indigo-900/30'
                  : 'bg-indigo-100 text-indigo-400 cursor-not-allowed border-indigo-200'
              }`}
            >
              Verify Diagnosis
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
            {/* Top Pull Down Button */}
            <div className="flex flex-col items-center justify-center shrink-0">
              <button
                type="button"
                onClick={handleSwipeDownToLab}
                className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-mono font-bold transition-all active:scale-95 shadow-xs cursor-pointer border ${
                  isDark
                    ? 'bg-indigo-950/80 hover:bg-indigo-900 text-indigo-200 border-indigo-800'
                    : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-900 border-indigo-300'
                }`}
                title="Swipe back down to the lab bench"
              >
                <ChevronDown className="w-4 h-4 animate-bounce text-violet-400" />
                <span>Swipe down to Lab Bench</span>
              </button>
            </div>

            {/* Middle Evaluated Content */}
            <div className="space-y-4 my-auto">
              {resultState === 'CORRECT' ? (
                <div className="space-y-1">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border mx-auto shadow-md bg-gradient-to-tr from-emerald-600 to-teal-500 text-white border-emerald-400">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-emerald-400">
                    CORRECT DIAGNOSIS!
                  </h2>
                  <p className={`text-xs font-medium font-mono ${isDark ? 'text-indigo-200' : 'text-slate-700'}`}>
                    Immunohematology phenotype identified with 100% precision
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  <div className="inline-flex items-center justify-center w-14 h-14 rounded-full border mx-auto animate-bio-shake bg-gradient-to-tr from-rose-600 to-amber-500 text-white border-rose-400">
                    <XCircle className="w-8 h-8 stroke-[2.5]" />
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-rose-400">
                    INCORRECT DIAGNOSIS
                  </h2>
                  <p className={`text-xs font-medium font-mono ${isDark ? 'text-indigo-200/80' : 'text-slate-600'}`}>
                    Agglutination interpretation mismatch
                  </p>
                </div>
              )}

              {/* Identified Blood Group Badge */}
              <div
                className={`inline-flex items-center gap-3 px-5 py-2.5 rounded-2xl border shadow-md ${
                  isDark ? 'bg-indigo-950/60 border-indigo-800/80' : 'bg-white border-indigo-200'
                }`}
              >
                <span className={`text-xs font-mono uppercase font-semibold ${isDark ? 'text-indigo-300' : 'text-indigo-700'}`}>
                  Sample Result:
                </span>
                <span className="text-4xl font-mono font-black tracking-tight text-violet-400">
                  {currentSample.bloodType}
                </span>
              </div>

              {/* Agglutination Reading Card */}
              <div
                className={`p-4 rounded-xl border space-y-2 text-xs text-left shadow-sm ${
                  isDark ? 'bg-indigo-950/50 border-indigo-900/50' : 'bg-white border-indigo-100'
                }`}
              >
                <span className={`text-[11px] font-mono font-bold uppercase tracking-wider block ${isDark ? 'text-indigo-300' : 'text-indigo-800'}`}>
                  Agglutination Reading Matrix:
                </span>
                <div className="grid grid-cols-3 gap-2 text-center font-mono">
                  <div
                    className={`p-2 rounded-lg border ${
                      clumpsA
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : isDark
                        ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/40'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}
                  >
                    <span className="block text-[10px] opacity-80">
                      Well A (Anti-A)
                    </span>
                    <span className="font-extrabold">{clumpsA ? 'Clumped (+)' : 'Smooth (−)'}</span>
                  </div>
                  <div
                    className={`p-2 rounded-lg border ${
                      clumpsB
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : isDark
                        ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/40'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}
                  >
                    <span className="block text-[10px] opacity-80">
                      Well B (Anti-B)
                    </span>
                    <span className="font-extrabold">{clumpsB ? 'Clumped (+)' : 'Smooth (−)'}</span>
                  </div>
                  <div
                    className={`p-2 rounded-lg border ${
                      clumpsD
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : isDark
                        ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/40'
                        : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                    }`}
                  >
                    <span className="block text-[10px] opacity-80">
                      Well Rh (Anti-D)
                    </span>
                    <span className="font-extrabold">{clumpsD ? 'Clumped (+)' : 'Smooth (−)'}</span>
                  </div>
                </div>

                <div className={`text-[11px] pt-1 leading-relaxed ${isDark ? 'text-indigo-200/80' : 'text-slate-600'}`}>
                  {clumpsA && clumpsB && 'Both A and B antigens present (AB). '}
                  {clumpsA && !clumpsB && 'A antigen present, no B antigen (Type A). '}
                  {!clumpsA && clumpsB && 'B antigen present, no A antigen (Type B). '}
                  {!clumpsA && !clumpsB && 'Neither A nor B antigens present (Type O). '}
                  {clumpsD ? 'RhD antigen expressed (Rh-Positive +).' : 'No RhD antigen expressed (Rh-Negative −).'}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 space-y-2 shrink-0">
              {resultState === 'CORRECT' ? (
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleNextSample}
                    className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-mono font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer border bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-400 hover:from-indigo-500 hover:to-violet-500"
                  >
                    <span>Test Next Clinical Sample →</span>
                  </button>

                  {onSaveToDrive && (
                    <button
                      type="button"
                      onClick={() =>
                        onSaveToDrive({
                          title: `Clinical Agglutination Typing - ${currentSample.sampleLabel}`,
                          bloodGroup: currentSample.bloodType,
                          sampleId: currentSample.id,
                          details: `Agglutination Results:
- Anti-A: ${clumpsA ? 'Agglutination (+)' : 'Smooth (-)'}
- Anti-B: ${clumpsB ? 'Agglutination (+)' : 'Smooth (-)'}
- Anti-D (Rh): ${clumpsD ? 'Agglutination (+)' : 'Smooth (-)'}
Diagnosed Blood Phenotype: ${currentSample.bloodType}
Clinical Context: ${currentSample.clinicalContext}
Antigens Present: ${trueProps.rbcAntigens.join(', ')}
Plasma Antibodies: ${trueProps.plasmaAntibodies.join(', ') || 'None'}
Verified & Certified by: Maruf (HemoMatch Station)`,
                        })
                      }
                      className={`w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl font-mono font-bold text-xs shadow-xs transition-all active:scale-[0.98] cursor-pointer border ${
                        isDark
                          ? 'bg-indigo-950/60 border-indigo-800 hover:bg-indigo-900 text-indigo-200'
                          : 'bg-white border-indigo-200 hover:bg-indigo-50 text-indigo-900'
                      }`}
                    >
                      <HardDrive className="w-3.5 h-3.5 text-current" />
                      <span>Save Clinical Report to Google Drive</span>
                    </button>
                  )}

                  {onTestCompatibility && (
                    <button
                      type="button"
                      onClick={() => onTestCompatibility(currentSample.bloodType)}
                      className={`w-full flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl font-mono font-bold text-xs transition-all active:scale-[0.98] cursor-pointer border ${
                        isDark
                          ? 'bg-indigo-950/40 border-indigo-900 hover:bg-indigo-900/60 text-indigo-300'
                          : 'bg-indigo-50 border-indigo-200 hover:bg-indigo-100 text-indigo-900'
                      }`}
                    >
                      <Activity className="w-3.5 h-3.5 text-violet-400" />
                      <span>Check Donor / Recipient Compatibility for {currentSample.bloodType}</span>
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
                      onClick={handleNextSample}
                      className="flex-1 flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl font-mono font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer border bg-gradient-to-r from-indigo-600 to-violet-600 text-white border-indigo-400 hover:from-indigo-500 hover:to-violet-500"
                    >
                      <span>Next Sample</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleSwipeDownToLab}
                    className={`w-full flex items-center justify-center gap-1.5 py-1.5 px-3 text-xs font-mono transition-colors cursor-pointer hover:underline ${
                      isDark ? 'text-indigo-400 hover:text-white' : 'text-indigo-700 hover:text-indigo-950'
                    }`}
                  >
                    <span>Swipe down to Lab Bench</span>
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
