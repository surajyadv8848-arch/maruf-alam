import React, { useState } from 'react';
import {
  FlaskConical,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  Eye,
  Sparkles,
  Droplet
} from 'lucide-react';
import { BloodGroup } from '../../types/blood';
import { ALL_BLOOD_GROUPS, BLOOD_PROPERTIES_MAP } from '../../utils/compatibility';

interface SampleCase {
  id: string;
  label: string;
  trueType: BloodGroup;
  clinicalNote: string;
}

const PRESET_SAMPLES: SampleCase[] = [
  {
    id: 'sample-1',
    label: 'Emergency Trauma Code Alpha (Unknown Patient)',
    trueType: 'A+',
    clinicalNote: 'Arrived unconscious from highway collision; no wristband or medical records.',
  },
  {
    id: 'sample-2',
    label: 'Pediatric Neonatal Jaundice Case',
    trueType: 'O-',
    clinicalNote: 'Suspected maternal-fetal Rh incompatibility; urgently verify cord blood.',
  },
  {
    id: 'sample-3',
    label: 'Voluntary Blood Drive Registrant',
    trueType: 'B+',
    clinicalNote: 'First-time donor; states blood group is unknown.',
  },
  {
    id: 'sample-4',
    label: 'Rare Presentation Candidate',
    trueType: 'AB-',
    clinicalNote: 'Scheduled for elective hip surgery; verifying crossmatch eligibility.',
  },
  {
    id: 'sample-5',
    label: 'Universal Donor Candidate',
    trueType: 'O+',
    clinicalNote: 'Trauma pack replenishment candidate.',
  },
];

interface TypingLabProps {
  onNavigateToMatching: (bloodType: BloodGroup) => void;
}

export const TypingLab: React.FC<TypingLabProps> = ({ onNavigateToMatching }) => {
  const [selectedSampleIndex, setSelectedSampleIndex] = useState<number>(0);
  const currentSample = PRESET_SAMPLES[selectedSampleIndex];

  // Reagent states (whether dropped)
  const [antiADropped, setAntiADropped] = useState(false);
  const [antiBDropped, setAntiBDropped] = useState(false);
  const [antiDDropped, setAntiDDropped] = useState(false);

  // Stirred / mixed state
  const [isMixed, setIsMixed] = useState(false);

  // User's guessed blood type
  const [userGuess, setUserGuess] = useState<BloodGroup | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Determine true agglutination based on trueType
  const trueProps = BLOOD_PROPERTIES_MAP[currentSample.trueType];
  const agglutinatesA = trueProps.abo === 'A' || trueProps.abo === 'AB';
  const agglutinatesB = trueProps.abo === 'B' || trueProps.abo === 'AB';
  const agglutinatesD = trueProps.rh === '+';

  const resetTest = () => {
    setAntiADropped(false);
    setAntiBDropped(false);
    setAntiDDropped(false);
    setIsMixed(false);
    setUserGuess(null);
    setIsSubmitted(false);
  };

  const handleSelectSample = (idx: number) => {
    setSelectedSampleIndex(idx);
    setAntiADropped(false);
    setAntiBDropped(false);
    setAntiDDropped(false);
    setIsMixed(false);
    setUserGuess(null);
    setIsSubmitted(false);
  };

  const allReagentsAdded = antiADropped && antiBDropped && antiDDropped;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Intro Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-rose-700 font-semibold uppercase tracking-wider">
              <FlaskConical className="w-3.5 h-3.5" />
              <span>Diagnostic Hemagglutination Workbench</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Bedside Blood Group Identification Simulator
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Apply monoclonal antibody reagents (Anti-A, Anti-B, and Anti-D) to detect RBC surface antigens through visible agglutination (clumping).
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={resetTest}
              className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Slide</span>
            </button>
          </div>
        </div>

        {/* Case selector tabs */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
            Select Patient Sample to Identify:
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {PRESET_SAMPLES.map((sample, idx) => (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(idx)}
                className={`shrink-0 px-3 py-2 text-xs rounded-lg border text-left transition-all ${
                  selectedSampleIndex === idx
                    ? 'border-rose-600 bg-rose-50 text-rose-950 font-semibold shadow-xs'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-white'
                }`}
              >
                <div>{sample.label}</div>
                <div className="text-[11px] text-slate-500 font-normal mt-0.5 truncate max-w-xs">
                  {sample.clinicalNote}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Virtual Laboratory Bench */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Side: Reagent Bottles & Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Step 1: Dispense Monoclonal Reagents
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Click each reagent dropper bottle to pipette onto corresponding wells.
              </p>
            </div>

            {/* Reagent Dropper Bottles */}
            <div className="space-y-3">
              {/* Anti-A Bottle */}
              <button
                onClick={() => setAntiADropped(true)}
                disabled={antiADropped}
                className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                  antiADropped
                    ? 'bg-blue-50/60 border-blue-200 text-blue-900 cursor-default'
                    : 'bg-white border-blue-300 hover:bg-blue-50/50 shadow-xs hover:border-blue-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    α-A
                  </div>
                  <div>
                    <span className="text-xs font-bold text-blue-950">Anti-A Reagent (Blue)</span>
                    <span className="text-[11px] text-blue-700 block">Detects RBC A-antigen</span>
                  </div>
                </div>
                {antiADropped ? (
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                ) : (
                  <span className="text-xs font-semibold text-blue-700 underline">Add Drop</span>
                )}
              </button>

              {/* Anti-B Bottle */}
              <button
                onClick={() => setAntiBDropped(true)}
                disabled={antiBDropped}
                className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                  antiBDropped
                    ? 'bg-amber-50/60 border-amber-200 text-amber-900 cursor-default'
                    : 'bg-white border-amber-300 hover:bg-amber-50/50 shadow-xs hover:border-amber-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    α-B
                  </div>
                  <div>
                    <span className="text-xs font-bold text-amber-950">Anti-B Reagent (Yellow)</span>
                    <span className="text-[11px] text-amber-700 block">Detects RBC B-antigen</span>
                  </div>
                </div>
                {antiBDropped ? (
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                ) : (
                  <span className="text-xs font-semibold text-amber-700 underline">Add Drop</span>
                )}
              </button>

              {/* Anti-D Bottle */}
              <button
                onClick={() => setAntiDDropped(true)}
                disabled={antiDDropped}
                className={`w-full flex items-center justify-between p-3 rounded-lg border text-left transition-all ${
                  antiDDropped
                    ? 'bg-slate-100 border-slate-300 text-slate-800 cursor-default'
                    : 'bg-white border-slate-300 hover:bg-slate-50 shadow-xs hover:border-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-700 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    α-D
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900">Anti-D Reagent (Rh)</span>
                    <span className="text-[11px] text-slate-600 block">Detects RhD surface antigen</span>
                  </div>
                </div>
                {antiDDropped ? (
                  <CheckCircle2 className="w-4 h-4 text-slate-700" />
                ) : (
                  <span className="text-xs font-semibold text-slate-700 underline">Add Drop</span>
                )}
              </button>
            </div>

            {/* Stir / Mix Button */}
            <div className="pt-2 border-t border-slate-200">
              <button
                onClick={() => setIsMixed(true)}
                disabled={!allReagentsAdded || isMixed}
                className={`w-full py-2.5 px-4 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  isMixed
                    ? 'bg-emerald-600 text-white'
                    : allReagentsAdded
                    ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-xs animate-pulse'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{isMixed ? 'Reagents Mixed (Reaction Complete)' : 'Gently Mix Reagents & Incubate'}</span>
              </button>
            </div>

            {/* Quick Reference Guide */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5 text-slate-600">
              <span className="font-semibold text-slate-900 block flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Interpretation Rule:
              </span>
              <p>• Clumping in <strong>Anti-A</strong> = Type A</p>
              <p>• Clumping in <strong>Anti-B</strong> = Type B</p>
              <p>• Clumping in <strong>Both</strong> = Type AB</p>
              <p>• No clumping in either = Type O</p>
              <p>• Clumping in <strong>Anti-D</strong> = Rh Positive (+)</p>
            </div>
          </div>
        </div>

        {/* Center & Right: The Testing Slide / Tile */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Agglutination Testing Tile (Slide Method)
                </span>
                <p className="text-xs text-slate-500 mt-0.5">
                  Whole blood suspension mixed with monoclonal test antisera
                </p>
              </div>
              <span className="text-xs text-slate-500">
                Sample ID: <span className="font-mono font-bold text-slate-800">{currentSample.id}</span>
              </span>
            </div>

            {/* The Ceramic Slide Wells */}
            <div className="p-6 bg-slate-100 rounded-xl border border-slate-300 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Well 1: Anti-A */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center flex flex-col items-center shadow-xs">
                <span className="text-xs font-bold text-blue-900 uppercase tracking-wider mb-2">
                  Well 1: Anti-A
                </span>
                <div className="relative w-32 h-32 rounded-full border-4 border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shadow-inner">
                  {!antiADropped ? (
                    <div className="w-16 h-16 rounded-full bg-rose-700/80 flex items-center justify-center text-white text-[10px] font-bold">
                      Whole Blood
                    </div>
                  ) : !isMixed ? (
                    <div className="relative w-24 h-24 rounded-full bg-rose-700 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-blue-500/80 absolute top-2 right-2 border border-white"></div>
                      <span className="text-[10px] text-white font-semibold">Unmixed Drop</span>
                    </div>
                  ) : agglutinatesA ? (
                    // Agglutinated clumps
                    <div className="w-full h-full bg-rose-50 p-2 flex flex-wrap gap-1.5 items-center justify-center animate-fade-in">
                      {Array.from({ length: 14 }).map((_, i) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-full bg-rose-900 border border-rose-950 shadow-xs inline-block animate-pulse"
                          style={{
                            margin: `${(i % 3) * 2}px`,
                            transform: `scale(${0.8 + (i % 4) * 0.15})`,
                          }}
                        ></span>
                      ))}
                    </div>
                  ) : (
                    // Homogeneous smooth suspension
                    <div className="w-24 h-24 rounded-full bg-rose-700 opacity-90 shadow-inner flex items-center justify-center">
                      <span className="text-[10px] text-rose-100 font-medium">Smooth (No Lysis)</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 text-xs">
                  {isMixed ? (
                    agglutinatesA ? (
                      <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                        Agglutination (+)
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        No Clumping (-)
                      </span>
                    )
                  ) : (
                    <span className="text-slate-400">
                      {antiADropped ? 'Awaiting mix' : 'Awaiting reagent'}
                    </span>
                  )}
                </div>
              </div>

              {/* Well 2: Anti-B */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center flex flex-col items-center shadow-xs">
                <span className="text-xs font-bold text-amber-900 uppercase tracking-wider mb-2">
                  Well 2: Anti-B
                </span>
                <div className="relative w-32 h-32 rounded-full border-4 border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shadow-inner">
                  {!antiBDropped ? (
                    <div className="w-16 h-16 rounded-full bg-rose-700/80 flex items-center justify-center text-white text-[10px] font-bold">
                      Whole Blood
                    </div>
                  ) : !isMixed ? (
                    <div className="relative w-24 h-24 rounded-full bg-rose-700 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-amber-400/80 absolute top-2 right-2 border border-white"></div>
                      <span className="text-[10px] text-white font-semibold">Unmixed Drop</span>
                    </div>
                  ) : agglutinatesB ? (
                    // Agglutinated clumps
                    <div className="w-full h-full bg-rose-50 p-2 flex flex-wrap gap-1.5 items-center justify-center animate-fade-in">
                      {Array.from({ length: 14 }).map((_, i) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-full bg-rose-900 border border-rose-950 shadow-xs inline-block animate-pulse"
                          style={{
                            margin: `${(i % 3) * 2}px`,
                            transform: `scale(${0.8 + (i % 4) * 0.15})`,
                          }}
                        ></span>
                      ))}
                    </div>
                  ) : (
                    // Homogeneous smooth suspension
                    <div className="w-24 h-24 rounded-full bg-rose-700 opacity-90 shadow-inner flex items-center justify-center">
                      <span className="text-[10px] text-rose-100 font-medium">Smooth (No Lysis)</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 text-xs">
                  {isMixed ? (
                    agglutinatesB ? (
                      <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                        Agglutination (+)
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        No Clumping (-)
                      </span>
                    )
                  ) : (
                    <span className="text-slate-400">
                      {antiBDropped ? 'Awaiting mix' : 'Awaiting reagent'}
                    </span>
                  )}
                </div>
              </div>

              {/* Well 3: Anti-D */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 text-center flex flex-col items-center shadow-xs">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Well 3: Anti-D (Rh)
                </span>
                <div className="relative w-32 h-32 rounded-full border-4 border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shadow-inner">
                  {!antiDDropped ? (
                    <div className="w-16 h-16 rounded-full bg-rose-700/80 flex items-center justify-center text-white text-[10px] font-bold">
                      Whole Blood
                    </div>
                  ) : !isMixed ? (
                    <div className="relative w-24 h-24 rounded-full bg-rose-700 flex items-center justify-center">
                      <div className="w-8 h-8 rounded-full bg-slate-400/80 absolute top-2 right-2 border border-white"></div>
                      <span className="text-[10px] text-white font-semibold">Unmixed Drop</span>
                    </div>
                  ) : agglutinatesD ? (
                    // Agglutinated clumps
                    <div className="w-full h-full bg-rose-50 p-2 flex flex-wrap gap-1.5 items-center justify-center animate-fade-in">
                      {Array.from({ length: 14 }).map((_, i) => (
                        <span
                          key={i}
                          className="w-3.5 h-3.5 rounded-full bg-rose-900 border border-rose-950 shadow-xs inline-block animate-pulse"
                          style={{
                            margin: `${(i % 3) * 2}px`,
                            transform: `scale(${0.8 + (i % 4) * 0.15})`,
                          }}
                        ></span>
                      ))}
                    </div>
                  ) : (
                    // Homogeneous smooth suspension
                    <div className="w-24 h-24 rounded-full bg-rose-700 opacity-90 shadow-inner flex items-center justify-center">
                      <span className="text-[10px] text-rose-100 font-medium">Smooth (No Lysis)</span>
                    </div>
                  )}
                </div>

                <div className="mt-3 text-xs">
                  {isMixed ? (
                    agglutinatesD ? (
                      <span className="font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                        Agglutination (+)
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        No Clumping (-)
                      </span>
                    )
                  ) : (
                    <span className="text-slate-400">
                      {antiDDropped ? 'Awaiting mix' : 'Awaiting reagent'}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Diagnostic Deduction Step */}
            <div className="mt-6 pt-6 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Step 2: Conclude Blood Group from Agglutination Pattern
              </span>

              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                {ALL_BLOOD_GROUPS.map((type) => {
                  const isSelected = userGuess === type;
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        setUserGuess(type);
                        setIsSubmitted(false);
                      }}
                      disabled={!isMixed}
                      className={`py-2 px-1 text-sm font-bold rounded-lg border transition-all ${
                        isSelected
                          ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                          : isMixed
                          ? 'bg-white border-slate-200 text-slate-800 hover:border-slate-300'
                          : 'bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-between">
                <button
                  onClick={() => setIsSubmitted(true)}
                  disabled={!userGuess || !isMixed}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    userGuess && isMixed
                      ? 'bg-slate-900 hover:bg-slate-800 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  Confirm & Validate Diagnosis
                </button>

                {isSubmitted && (
                  <div className="flex items-center gap-2">
                    {userGuess === currentSample.trueType ? (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Correct! Identified as {currentSample.trueType}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg">
                        <AlertCircle className="w-4 h-4" />
                        <span>Incorrect. True group is {currentSample.trueType}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Success Action Callout: Send to Matching Ground */}
              {isSubmitted && userGuess === currentSample.trueType && (
                <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                  <div>
                    <span className="font-bold text-emerald-950 block">Patient Profile Identified</span>
                    <span className="text-emerald-800">
                      Confirmed Type {currentSample.trueType}. Ready to cross-match against compatible active donors in the registry.
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigateToMatching(currentSample.trueType)}
                    className="shrink-0 flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold shadow-xs transition-colors"
                  >
                    <span>Open in Matching Ground</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
