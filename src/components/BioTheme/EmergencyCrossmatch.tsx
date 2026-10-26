import React, { useState } from 'react';
import {
  AlertTriangle,
  HeartPulse,
  ShieldCheck,
  ShieldAlert,
  Flame,
  CheckCircle2,
  XCircle,
  RotateCcw,
  HardDrive,
  Activity,
  Layers,
  Info,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { BloodGroup } from '../../types/blood';
import { BLOOD_PROPERTIES_MAP } from '../../utils/compatibility';

interface EmergencyCrossmatchProps {
  themeMode: 'dark' | 'light';
  onSaveToDrive?: (report: {
    title: string;
    bloodGroup?: string;
    details: string;
    sampleId?: string;
  }) => void;
}

interface TraumaScenario {
  id: string;
  title: string;
  subtitle: string;
  patientName: string;
  patientAge: number;
  patientSex: 'Female (Childbearing Age)' | 'Male' | 'Female (Post-menopausal)';
  patientType: BloodGroup;
  initialBp: string;
  initialHr: number;
  initialHgb: number;
  clinicalNote: string;
  donorUnits: {
    donorId: string;
    bloodType: BloodGroup;
    donorUnitLabel: string;
    hasAtypicalAntibodyConflict?: boolean;
    antibodyType?: string;
  }[];
}

const TRAUMA_SCENARIOS: TraumaScenario[] = [
  {
    id: 'trauma-bay-1',
    title: 'Code Crimson: Level-1 MVC Trauma',
    subtitle: 'Hypovolemic Shock & Massive Hemorrhage',
    patientName: 'Jane Doe (Trauma ID #4092)',
    patientAge: 24,
    patientSex: 'Female (Childbearing Age)',
    patientType: 'B-',
    initialBp: '72/40 mmHg',
    initialHr: 138,
    initialHgb: 6.4,
    clinicalNote:
      'High-velocity vehicular crash. Massive internal hemorrhage. Patient is female of reproductive age: Rh-negative sensitization prevention is vital to protect future pregnancies.',
    donorUnits: [
      { donorId: 'U-881', bloodType: 'B-', donorUnitLabel: 'PRBC Unit #BNEG-881' },
      { donorId: 'U-902', bloodType: 'O-', donorUnitLabel: 'PRBC Universal Unit #ONEG-902' },
      { donorId: 'U-114', bloodType: 'O+', donorUnitLabel: 'PRBC Unit #OPOS-114 (Rh+ Emergency)' },
      { donorId: 'U-455', bloodType: 'A-', donorUnitLabel: 'PRBC Incompatible Unit #ANEG-455' },
    ],
  },
  {
    id: 'trauma-bay-2',
    title: 'Upper GI Variceal Bleed',
    subtitle: 'Type & Screen with Alloantibody Check',
    patientName: 'Carlos M. (Medical ID #5108)',
    patientAge: 58,
    patientSex: 'Male',
    patientType: 'A+',
    initialBp: '85/55 mmHg',
    initialHr: 118,
    initialHgb: 7.1,
    clinicalNote:
      'Cirrhotic patient with active esophageal variceal bleed. Previously transfused 3 years ago. Screen for atypical warm IgG alloantibodies in AHG phase.',
    donorUnits: [
      { donorId: 'U-201', bloodType: 'A+', donorUnitLabel: 'PRBC Unit #APOS-201 (Matched Compatible)' },
      {
        donorId: 'U-332',
        bloodType: 'A+',
        donorUnitLabel: 'PRBC Unit #APOS-332 (Kell Antigen+ Conflict)',
        hasAtypicalAntibodyConflict: true,
        antibodyType: 'Anti-K (Kell) Alloantibody',
      },
      { donorId: 'U-440', bloodType: 'O+', donorUnitLabel: 'PRBC Unit #OPOS-440 (Universal RBC Donor)' },
      { donorId: 'U-667', bloodType: 'B+', donorUnitLabel: 'PRBC Unit #BPOS-667 (ABO Incompatible)' },
    ],
  },
  {
    id: 'trauma-bay-3',
    title: 'Ruptured Abdominal Aortic Aneurysm',
    subtitle: 'Emergency Massive Transfusion Protocol (MTP)',
    patientName: 'Robert K. (Surgical ID #9021)',
    patientAge: 69,
    patientSex: 'Male',
    patientType: 'AB+',
    initialBp: '65/35 mmHg',
    initialHr: 144,
    initialHgb: 5.8,
    clinicalNote:
      'Ruptured AAA in OR. Patient is AB+ (Universal RBC Recipient). Understand plasma vs RBC compatibility dynamics during critical 1:1:1 replenishment.',
    donorUnits: [
      { donorId: 'U-701', bloodType: 'AB+', donorUnitLabel: 'PRBC Unit #ABPOS-701' },
      { donorId: 'U-702', bloodType: 'A+', donorUnitLabel: 'PRBC Unit #APOS-702' },
      { donorId: 'U-703', bloodType: 'B+', donorUnitLabel: 'PRBC Unit #BPOS-703' },
      { donorId: 'U-704', bloodType: 'O+', donorUnitLabel: 'PRBC Unit #OPOS-704' },
    ],
  },
];

type CrossmatchPhase = 'IDLE' | 'IMMEDIATE_SPIN' | 'INCUBATION_37C' | 'AHG_COOMBS' | 'COMPLETE';

export function EmergencyCrossmatch({ themeMode, onSaveToDrive }: EmergencyCrossmatchProps) {
  const isDark = themeMode === 'dark';

  const [activeScenarioIdx, setActiveScenarioIdx] = useState<number>(0);
  const scenario = TRAUMA_SCENARIOS[activeScenarioIdx];

  const [selectedDonorIdx, setSelectedDonorIdx] = useState<number>(0);
  const selectedUnit = scenario.donorUnits[selectedDonorIdx];

  const [phase, setPhase] = useState<CrossmatchPhase>('IDLE');
  const [isRunningPhase, setIsRunningPhase] = useState<boolean>(false);

  // MTP Pack Balance
  const [rbcUnits, setRbcUnits] = useState<number>(4);
  const [ffpUnits, setFfpUnits] = useState<number>(4);
  const [pltUnits, setPltUnits] = useState<number>(1);

  // Crossmatch calculations
  const patientBlood = scenario.patientType;
  const donorBlood = selectedUnit.bloodType;

  // Major Crossmatch = Recipient Serum + Donor RBCs
  // Check ABO/Rh standard compatibility
  const patientProps = BLOOD_PROPERTIES_MAP[patientBlood];
  const donorProps = BLOOD_PROPERTIES_MAP[donorBlood];

  // ABO conflict: Does patient plasma have antibodies against donor RBC antigens?
  const hasAboConflict = donorProps.rbcAntigens.some((antigen: string) => {
    if (antigen.includes('A Antigen') && patientProps.plasmaAntibodies.includes('Anti-A')) return true;
    if (antigen.includes('B Antigen') && patientProps.plasmaAntibodies.includes('Anti-B')) return true;
    return false;
  });

  // Rh conflict: If patient is Rh-, donor is Rh+, patient might sensitize or hemolyze
  const hasRhConflict = patientProps.rh === '-' && donorProps.rh === '+';

  // Warm alloantibody conflict (e.g. Kell) in AHG phase
  const hasAtypicalConflict = Boolean(selectedUnit.hasAtypicalAntibodyConflict);

  const isCrossmatchIncompatible = hasAboConflict || hasRhConflict || hasAtypicalConflict;

  const runPhaseTest = (targetPhase: CrossmatchPhase) => {
    setIsRunningPhase(true);
    setTimeout(() => {
      setPhase(targetPhase);
      setIsRunningPhase(false);
      if (targetPhase === 'COMPLETE' && !isCrossmatchIncompatible) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
        });
      }
    }, 900);
  };

  const resetCrossmatch = () => {
    setPhase('IDLE');
  };

  // MTP Ratio calculation (Optimal is ~ 1:1:1 or 6:6:1 apheresis)
  const isMtpBalanced = rbcUnits === ffpUnits && pltUnits >= 1 && rbcUnits >= 4;

  const handleDriveReport = () => {
    if (!onSaveToDrive) return;
    const reportText = `=================================================================
EMERGENCY TRAUMA CROSSMATCH & MASSIVE TRANSFUSION REPORT
HemoMatch Diagnostics Emergency Protocol System
Station: Emergency Trauma Bay & Immunohematology Station
Verified by: Maruf (HemoMatch Station)
=================================================================

PATIENT DATA:
Name: ${scenario.patientName}
Age: ${scenario.patientAge} | Sex: ${scenario.patientSex}
Diagnosed Blood Group: ${scenario.patientType}
Vitals on Presentation: BP: ${scenario.initialBp} | HR: ${scenario.initialHr} bpm | Hgb: ${scenario.initialHgb} g/dL
Clinical Condition: ${scenario.title} (${scenario.subtitle})
Notes: ${scenario.clinicalNote}

DONOR UNIT CROSSMATCHED:
Unit: ${selectedUnit.donorUnitLabel}
Donor Blood Group: ${selectedUnit.bloodType}
Compatibility Status: ${isCrossmatchIncompatible ? 'INCOMPATIBLE - HIGH RISK OF ACUTE TRANSFUSION REACTION' : 'COMPATIBLE - SAFE FOR EMERGENCY INFUSION'}

TESTING PHASES:
- Immediate Spin Phase (ABO IgM): ${hasAboConflict ? 'AGGLUTINATION (4+) INCOMPATIBLE' : 'SMOOTH (0) COMPATIBLE'}
- 37°C Thermal Incubation: ${hasRhConflict ? 'SENSITIZED (Rh D-Positive Conflict)' : 'NO HEMOLYSIS'}
- AHG / Coombs Phase (IgG Alloantibodies): ${hasAtypicalConflict ? `AGGLUTINATION (${selectedUnit.antibodyType})` : 'NEGATIVE / COOMBS CHECK CELLS CONFIRMED'}

MASSIVE TRANSFUSION PROTOCOL (MTP) STATUS:
- PRBC Units: ${rbcUnits}
- Fresh Frozen Plasma (FFP): ${ffpUnits}
- Apheresis Platelet Packs: ${pltUnits}
Ratio Balance: ${isMtpBalanced ? 'Optimal 1:1:1 Hemostatic Resuscitation' : 'Warning: Unbalanced ratio may trigger coagulopathy'}

=================================================================
Signed & Certified by: Maruf (HemoMatch Station)
Platform: HemoMatch Emergency Immunohematology Simulator
=================================================================`;

    onSaveToDrive({
      title: `Emergency Crossmatch - ${scenario.patientName} [${selectedUnit.donorUnitLabel}]`,
      bloodGroup: scenario.patientType,
      sampleId: scenario.id,
      details: reportText,
    });
  };

  return (
    <div className="space-y-6 animate-bio-fade-in-up">
      {/* Top Banner: Emergency Trauma Header */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isDark
            ? 'bg-gradient-to-br from-red-950/40 via-slate-900 to-slate-950 border-red-900/40 shadow-lg'
            : 'bg-gradient-to-br from-red-50 via-white to-rose-50 border-red-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-500 animate-pulse">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30">
                  CRITICAL CARE STATION
                </span>
                <span className="text-xs font-mono text-slate-400">Station #3</span>
              </div>
              <h2 className="text-lg font-bold font-mono tracking-tight mt-0.5">
                Emergency Crossmatch &amp; MTP Simulator
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-rose-400 font-bold px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
              Verified by Maruf
            </span>
          </div>
        </div>

        {/* Scenario Picker Pills */}
        <div className="mt-4 pt-3 border-t border-red-500/15 flex flex-wrap gap-2">
          {TRAUMA_SCENARIOS.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => {
                setActiveScenarioIdx(idx);
                setSelectedDonorIdx(0);
                resetCrossmatch();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                activeScenarioIdx === idx
                  ? 'bg-red-600 text-white shadow-xs scale-102'
                  : isDark
                  ? 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
              }`}
            >
              Case {idx + 1}: {s.title.split(':')[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Patient Bedside Card */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/40">
          <div>
            <div className="flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-500 animate-pulse" />
              <h3 className="font-mono font-bold text-sm sm:text-base">{scenario.patientName}</h3>
              <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-mono">
                {scenario.patientSex}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{scenario.clinicalNote}</p>
          </div>

          {/* Patient Blood Group Badge */}
          <div className="flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Patient Blood Type</div>
              <div className="font-mono text-xs text-rose-400 font-semibold">
                Antigens: {patientProps.rbcAntigens.join(', ') || 'None'}
              </div>
            </div>
            <div className="w-11 h-11 rounded-lg bg-gradient-to-br from-rose-600 to-rose-800 text-white font-mono font-black text-xl flex items-center justify-center shadow-[0_0_15px_rgba(225,29,72,0.4)]">
              {scenario.patientType}
            </div>
          </div>
        </div>

        {/* Emergency Vitals Tracker */}
        <div className="grid grid-cols-3 gap-2 mt-3 text-center">
          <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <div className="text-[10px] font-mono text-slate-400">BLOOD PRESSURE</div>
            <div className="text-xs sm:text-sm font-mono font-bold text-amber-400 mt-0.5">
              {scenario.initialBp}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <div className="text-[10px] font-mono text-slate-400">HEART RATE</div>
            <div className="text-xs sm:text-sm font-mono font-bold text-rose-400 mt-0.5">
              {scenario.initialHr} BPM
            </div>
          </div>
          <div className="p-2 rounded-xl bg-slate-950/40 border border-slate-800/60">
            <div className="text-[10px] font-mono text-slate-400">HEMOGLOBIN</div>
            <div className="text-xs sm:text-sm font-mono font-bold text-red-500 mt-0.5">
              {scenario.initialHgb} g/dL (Crit Low)
            </div>
          </div>
        </div>
      </div>

      {/* Crossmatch Testing Bay */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-400" />
            <h3 className="font-mono font-bold text-sm uppercase tracking-wide">
              Major Crossmatch Test Rack
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Phase: <strong className="text-sky-400">{phase}</strong>
          </span>
        </div>

        {/* Donor Unit Selector */}
        <div className="mb-4">
          <label className="block text-xs font-mono text-slate-400 mb-2">
            Select Donor Blood Bag from Blood Bank to Crossmatch:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {scenario.donorUnits.map((unit, idx) => (
              <button
                key={unit.donorId}
                onClick={() => {
                  setSelectedDonorIdx(idx);
                  resetCrossmatch();
                }}
                className={`p-3 rounded-xl border text-left font-mono transition-all cursor-pointer flex items-center justify-between ${
                  selectedDonorIdx === idx
                    ? 'border-sky-500 bg-sky-500/10 shadow-xs'
                    : isDark
                    ? 'border-slate-800 bg-slate-950 hover:bg-slate-800/60 text-slate-300'
                    : 'border-slate-300 bg-slate-50 hover:bg-slate-100 text-slate-800'
                }`}
              >
                <div>
                  <div className="font-bold text-xs">{unit.donorUnitLabel}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Donor Type: <strong className="text-rose-400">{unit.bloodType}</strong>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center font-bold text-xs">
                  {unit.bloodType}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Visual Simulated Tubes */}
        <div
          className={`p-4 rounded-xl border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'
          }`}
        >
          <div className="text-xs font-mono font-bold text-slate-300 mb-3 text-center">
            Test Tube: [Patient Serum (Antibodies)] + [Donor {selectedUnit.bloodType} RBCs]
          </div>

          <div className="flex justify-center items-end gap-6 sm:gap-10 py-4">
            {/* Tube 1: Immediate Spin */}
            <div className="flex flex-col items-center">
              <div className="w-10 sm:w-12 h-32 rounded-b-2xl border-2 border-slate-600 bg-slate-900/60 relative overflow-hidden flex flex-col justify-end p-1 shadow-inner">
                {phase !== 'IDLE' && (
                  <div
                    className={`w-full transition-all duration-500 rounded-b-xl ${
                      hasAboConflict
                        ? 'h-16 bg-red-600/90 animate-pulse'
                        : 'h-12 bg-rose-500/60'
                    }`}
                  >
                    {hasAboConflict && (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[9px] font-mono text-white font-bold">CLUMPS</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-2 font-bold text-center">
                1. Immediate Spin
                <br />
                <span className="text-[9px] text-slate-500">(ABO IgM)</span>
              </span>
            </div>

            {/* Tube 2: 37°C Albumin */}
            <div className="flex flex-col items-center">
              <div className="w-10 sm:w-12 h-32 rounded-b-2xl border-2 border-slate-600 bg-slate-900/60 relative overflow-hidden flex flex-col justify-end p-1 shadow-inner">
                {(phase === 'INCUBATION_37C' || phase === 'AHG_COOMBS' || phase === 'COMPLETE') && (
                  <div
                    className={`w-full transition-all duration-500 rounded-b-xl ${
                      hasRhConflict
                        ? 'h-16 bg-amber-600/90 animate-pulse'
                        : 'h-12 bg-rose-500/60'
                    }`}
                  >
                    {hasRhConflict && (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-[9px] font-mono text-white font-bold">Rh D+ SENS</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-2 font-bold text-center">
                2. 37°C Thermal
                <br />
                <span className="text-[9px] text-slate-500">(Albumin / Rh)</span>
              </span>
            </div>

            {/* Tube 3: AHG / Coombs Phase */}
            <div className="flex flex-col items-center">
              <div className="w-10 sm:w-12 h-32 rounded-b-2xl border-2 border-slate-600 bg-slate-900/60 relative overflow-hidden flex flex-col justify-end p-1 shadow-inner">
                {(phase === 'AHG_COOMBS' || phase === 'COMPLETE') && (
                  <div
                    className={`w-full transition-all duration-500 rounded-b-xl ${
                      hasAtypicalConflict || isCrossmatchIncompatible
                        ? 'h-18 bg-red-700 animate-pulse'
                        : 'h-12 bg-emerald-500/70'
                    }`}
                  >
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-[9px] font-mono text-white font-bold">
                        {isCrossmatchIncompatible ? 'AGGLUTINATED' : 'SMOOTH (0)'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[10px] font-mono text-slate-400 mt-2 font-bold text-center">
                3. AHG / Coombs
                <br />
                <span className="text-[9px] text-slate-500">(Warm IgG)</span>
              </span>
            </div>
          </div>

          {/* Phase Control Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
            <button
              disabled={isRunningPhase}
              onClick={() => runPhaseTest('IMMEDIATE_SPIN')}
              className={`p-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                phase === 'IMMEDIATE_SPIN'
                  ? 'bg-sky-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              1. Spin (Room T)
            </button>
            <button
              disabled={isRunningPhase}
              onClick={() => runPhaseTest('INCUBATION_37C')}
              className={`p-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                phase === 'INCUBATION_37C'
                  ? 'bg-amber-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              2. 37°C Incubation
            </button>
            <button
              disabled={isRunningPhase}
              onClick={() => runPhaseTest('AHG_COOMBS')}
              className={`p-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                phase === 'AHG_COOMBS'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              3. AHG Coombs Wash
            </button>
            <button
              disabled={isRunningPhase}
              onClick={() => runPhaseTest('COMPLETE')}
              className="p-2 rounded-lg text-xs font-mono font-bold bg-gradient-to-r from-rose-600 to-rose-700 text-white hover:from-rose-500 hover:to-rose-600 transition-all cursor-pointer"
            >
              Run Full Sequence
            </button>
          </div>
        </div>

        {/* Phase Analysis & Verification Box */}
        {phase !== 'IDLE' && (
          <div
            className={`mt-4 p-4 rounded-xl border transition-all ${
              isCrossmatchIncompatible
                ? 'bg-red-500/10 border-red-500/40 text-red-300'
                : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2 mb-2 font-mono font-bold text-sm">
              {isCrossmatchIncompatible ? (
                <>
                  <ShieldAlert className="w-5 h-5 text-red-400" />
                  <span>CROSSMATCH INCOMPATIBLE (REJECT BLOOD BAG)</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>CROSSMATCH COMPATIBLE (SAFE TO TRANSFUSE)</span>
                </>
              )}
            </div>

            <p className="text-xs font-mono leading-relaxed text-slate-300">
              {isCrossmatchIncompatible ? (
                <>
                  <strong>Transfusion Hazard:</strong>{' '}
                  {hasAboConflict &&
                    `Recipient plasma contains anti-ABO antibodies that would cause catastrophic intravasular hemolysis of Donor ${selectedUnit.bloodType} RBCs.`}
                  {hasRhConflict &&
                    `Recipient is Rh-negative and donor is Rh-positive. RhD antigen will elicit immune alloimmunization.`}
                  {hasAtypicalConflict &&
                    `Recipient has atypical warm antibody ${selectedUnit.antibodyType} reactive in AHG phase.`}
                </>
              ) : (
                <>
                  <strong>Verification Confirmed:</strong> No agglutination or hemolysis detected
                  across Immediate Spin, 37°C, or AHG Coombs testing. Donor unit{' '}
                  <strong className="text-white">{selectedUnit.donorUnitLabel}</strong> is verified safe
                  for patient <strong className="text-white">{scenario.patientName}</strong>.
                </>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Massive Transfusion Protocol (MTP) Component Ratio Balancer */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-400" />
            <h3 className="font-mono font-bold text-sm uppercase tracking-wide">
              Massive Transfusion Protocol (1:1:1 Balancer)
            </h3>
          </div>
          <span
            className={`text-xs font-mono px-2 py-0.5 rounded-full font-bold ${
              isMtpBalanced
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}
          >
            {isMtpBalanced ? 'Balanced 1:1:1 Hemostasis' : 'Coagulopathy Risk'}
          </span>
        </div>

        <p className="text-xs text-slate-400 font-mono mb-4">
          In severe trauma exsanguination, infusing RBCs alone dilutes clotting factors and platelets.
          Target ratio is 1 PRBC : 1 FFP : 1 Platelet pack.
        </p>

        <div className="grid grid-cols-3 gap-3 text-center">
          {/* PRBC */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400">PRBC (RBCs)</div>
            <div className="text-xl font-mono font-black text-rose-500 my-1">{rbcUnits} Units</div>
            <div className="flex justify-center gap-1.5 mt-2">
              <button
                onClick={() => setRbcUnits((u) => Math.max(1, u - 1))}
                className="w-7 h-7 rounded bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
              >
                -
              </button>
              <button
                onClick={() => setRbcUnits((u) => u + 1)}
                className="w-7 h-7 rounded bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* FFP */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400">FFP (Plasma)</div>
            <div className="text-xl font-mono font-black text-amber-400 my-1">{ffpUnits} Units</div>
            <div className="flex justify-center gap-1.5 mt-2">
              <button
                onClick={() => setFfpUnits((u) => Math.max(1, u - 1))}
                className="w-7 h-7 rounded bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
              >
                -
              </button>
              <button
                onClick={() => setFfpUnits((u) => u + 1)}
                className="w-7 h-7 rounded bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* Platelets */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400">PLATELETS</div>
            <div className="text-xl font-mono font-black text-sky-400 my-1">{pltUnits} Pack</div>
            <div className="flex justify-center gap-1.5 mt-2">
              <button
                onClick={() => setPltUnits((u) => Math.max(1, u - 1))}
                className="w-7 h-7 rounded bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
              >
                -
              </button>
              <button
                onClick={() => setPltUnits((u) => u + 1)}
                className="w-7 h-7 rounded bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save to Google Drive Action */}
      {onSaveToDrive && (
        <button
          onClick={handleDriveReport}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-mono font-bold text-xs shadow-xs transition-all active:scale-[0.98] cursor-pointer ${
            isDark
              ? 'bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200'
              : 'bg-white border border-slate-300 hover:bg-slate-100 text-slate-800'
          }`}
        >
          <HardDrive className="w-4 h-4 text-rose-500" />
          <span>Save Emergency Crossmatch &amp; MTP Protocol to Google Drive (Made by Maruf)</span>
        </button>
      )}
    </div>
  );
}
