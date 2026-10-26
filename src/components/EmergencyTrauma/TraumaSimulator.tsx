import React, { useState } from 'react';
import {
  ShieldAlert,
  HeartPulse,
  Clock,
  AlertTriangle,
  CheckCircle2,
  RotateCcw,
  Activity,
  Flame,
  ArrowRight
} from 'lucide-react';
import { BloodGroup } from '../../types/blood';

interface TraumaScenario {
  id: string;
  title: string;
  patientAge: number;
  patientGender: 'female' | 'male';
  initialBp: string;
  initialHr: number;
  initialHb: number;
  scenarioText: string;
  optimalBloodType: BloodGroup;
  acceptableBloodTypes: BloodGroup[];
  explanation: string;
  balancedMtpRequired: boolean;
}

const TRAUMA_CASES: TraumaScenario[] = [
  {
    id: 'case-1',
    title: 'Code Red: Severe Hemorrhagic Shock in Female of Childbearing Age',
    patientAge: 24,
    patientGender: 'female',
    initialBp: '68/42 mmHg',
    initialHr: 142,
    initialHb: 5.6,
    scenarioText:
      'High-speed motor vehicle collision. Patient presents with unstable pelvic fracture, internal exsanguinating hemorrhage, and altered mental status. Blood group is currently unknown. Immediate transfusion needed before lab typing.',
    optimalBloodType: 'O-',
    acceptableBloodTypes: ['O-'],
    explanation:
      'Females of childbearing potential (<50 years) MUST receive O-Negative uncrossmatched red blood cells. Infusing Rh-positive blood risks RhD alloimmunization, causing severe Hemolytic Disease of the Fetus and Newborn (HDFN) in future pregnancies.',
    balancedMtpRequired: true,
  },
  {
    id: 'case-2',
    title: 'Code Crimson: Penetrating Thoracic Trauma in Adult Male',
    patientAge: 48,
    patientGender: 'male',
    initialBp: '74/48 mmHg',
    initialHr: 130,
    initialHb: 6.2,
    scenarioText:
      'Penetrating thoracic trauma with massive hemothorax (1,500 mL chest tube output). Rapidly depleting hospital O-Negative inventory. What uncrossmatched unit can be safely administered to preserve O-Negative stores?',
    optimalBloodType: 'O+',
    acceptableBloodTypes: ['O-', 'O+'],
    explanation:
      'In adult males and females past childbearing age, emergency uncrossmatched O-Positive PRBC is clinically safe and recommended by trauma protocols to steward extremely scarce O-Negative stocks.',
    balancedMtpRequired: true,
  },
  {
    id: 'case-3',
    title: 'Code Silver: Massive Gastrointestinal Bleeding with DIC',
    patientAge: 62,
    patientGender: 'male',
    initialBp: '80/50 mmHg',
    initialHr: 118,
    initialHb: 6.8,
    scenarioText:
      'Massive upper gastrointestinal bleeding secondary to esophageal varices. Coagulopathy noted with INR 2.8 and fibrinogen 90 mg/dL. Bleeding continues despite endoscopic clipping.',
    optimalBloodType: 'O+',
    acceptableBloodTypes: ['O-', 'O+'],
    explanation:
      'Along with PRBCs, early resuscitation with Fresh Frozen Plasma (FFP) and Cryoprecipitate is critical to reverse dilutional coagulopathy and replenish depleted fibrinogen.',
    balancedMtpRequired: true,
  },
];

interface TraumaSimulatorProps {
  onGoToMatching: (bloodType: BloodGroup) => void;
}

export const TraumaSimulator: React.FC<TraumaSimulatorProps> = ({ onGoToMatching }) => {
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const currentCase = TRAUMA_CASES[selectedCaseIdx];

  // User triage decisions
  const [chosenProtocol, setChosenProtocol] = useState<'WAIT_FULL_CROSSMATCH' | 'UNCROSSMATCHED_O_NEG' | 'UNCROSSMATCHED_O_POS' | null>(null);
  const [chosenRatio, setChosenRatio] = useState<'RBC_ONLY' | 'BALANCED_1_1_1' | null>(null);
  const [isEvaluated, setIsEvaluated] = useState(false);

  const resetScenario = () => {
    setChosenProtocol(null);
    setChosenRatio(null);
    setIsEvaluated(false);
  };

  const handleSelectCase = (idx: number) => {
    setSelectedCaseIdx(idx);
    resetScenario();
  };

  // Outcome calculation
  const isProtocolOptimal =
    (currentCase.patientGender === 'female' && currentCase.patientAge < 50 && chosenProtocol === 'UNCROSSMATCHED_O_NEG') ||
    (currentCase.patientGender === 'male' && (chosenProtocol === 'UNCROSSMATCHED_O_POS' || chosenProtocol === 'UNCROSSMATCHED_O_NEG'));

  const isFatalDelay = chosenProtocol === 'WAIT_FULL_CROSSMATCH';
  const isRatioOptimal = chosenRatio === 'BALANCED_1_1_1';

  const patientSurvived = isProtocolOptimal && isRatioOptimal && !isFatalDelay;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Trauma Header */}
      <div className="bg-slate-900 text-white rounded-xl p-6 shadow-md border border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-rose-400 font-bold uppercase tracking-wider">
              <Flame className="w-4 h-4 text-rose-500 animate-pulse" />
              <span>Massive Transfusion Protocol (MTP) Simulator</span>
            </div>
            <h2 className="text-xl font-bold text-white mt-1">
              Emergency Trauma Bay: Code Red Arena
            </h2>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Make split-second clinical transfusion decisions for exsanguinating trauma patients when crossmatched blood is not yet available.
            </p>
          </div>

          <button
            onClick={resetScenario}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-700 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg transition-colors self-start md:self-auto"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Case</span>
          </button>
        </div>

        {/* Case Selector Tabs */}
        <div className="mt-6 pt-4 border-t border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
            Select Trauma Scenario:
          </span>
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {TRAUMA_CASES.map((c, idx) => (
              <button
                key={c.id}
                onClick={() => handleSelectCase(idx)}
                className={`shrink-0 px-3 py-2 text-xs rounded-lg border text-left transition-all ${
                  selectedCaseIdx === idx
                    ? 'border-rose-500 bg-rose-950/60 text-white font-bold'
                    : 'border-slate-800 bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <div>{c.title}</div>
                <div className="text-[11px] text-slate-400 font-normal mt-0.5">
                  {c.patientGender.toUpperCase()} · Age {c.patientAge}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Clinical Arena */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Patient Monitor & Vitals */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-950 text-white rounded-xl border border-slate-800 p-6 shadow-md space-y-5 font-mono">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs text-rose-400 font-bold flex items-center gap-1.5 uppercase">
                <HeartPulse className="w-4 h-4 text-rose-500 animate-pulse" /> Bedside Telemetry
              </span>
              <span className="text-xs text-emerald-400 animate-pulse">● LIVE</span>
            </div>

            {/* Vitals Grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Blood Pressure</span>
                <span className={`text-xl font-bold ${isEvaluated && patientSurvived ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isEvaluated && patientSurvived ? '112/74 mmHg' : isEvaluated && !patientSurvived ? '42/20 mmHg' : currentCase.initialBp}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {isEvaluated && patientSurvived ? 'MAP 86 (Normotensive)' : 'Severe Hypotension'}
                </span>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Heart Rate</span>
                <span className={`text-xl font-bold ${isEvaluated && patientSurvived ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isEvaluated && patientSurvived ? '78 bpm' : isEvaluated && !patientSurvived ? '164 bpm (VTach)' : `${currentCase.initialHr} bpm`}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Sinus Tachycardia</span>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Hemoglobin</span>
                <span className={`text-xl font-bold ${isEvaluated && patientSurvived ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {isEvaluated && patientSurvived ? '9.6 g/dL' : `${currentCase.initialHb} g/dL`}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Critical Anemia</span>
              </div>

              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase block">Lactate / Acidosis</span>
                <span className={`text-xl font-bold ${isEvaluated && patientSurvived ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {isEvaluated && patientSurvived ? '1.8 mmol/L' : '5.9 mmol/L'}
                </span>
                <span className="text-[10px] text-slate-500 block mt-0.5">Lactic Acidosis</span>
              </div>
            </div>

            {/* Case Background Box */}
            <div className="p-3 bg-slate-900/90 rounded-lg border border-slate-800 text-xs font-sans text-slate-300">
              <span className="font-bold text-white block mb-1">Trauma Bay Report:</span>
              <p className="leading-relaxed text-slate-300">{currentCase.scenarioText}</p>
            </div>
          </div>
        </div>

        {/* Center & Right: Triage Decisions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">
                Critical Decision 1 of 2: Blood Selection Protocol
              </span>
              <p className="text-xs text-slate-600 mt-1">
                Laboratory reports standard antibody screening and crossmatch will take 45 minutes. What is your immediate resuscitation order?
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  id: 'UNCROSSMATCHED_O_NEG',
                  label: 'Infuse Emergency Uncrossmatched O-Negative PRBC',
                  desc: 'Universal red blood cell donor. Expresses neither A, B, nor RhD antigens. Zero risk of RhD alloimmunization.',
                  badge: 'Standard for Females < 50',
                },
                {
                  id: 'UNCROSSMATCHED_O_POS',
                  label: 'Infuse Emergency Uncrossmatched O-Positive PRBC',
                  desc: 'RhD-positive universal ABO donor. Preserves scarce O-negative reserves. Safe for adult males and older females.',
                  badge: 'Conserves O- Negative',
                },
                {
                  id: 'WAIT_FULL_CROSSMATCH',
                  label: 'Withhold Transfusion & Wait 45 min for Full Crossmatch',
                  desc: 'Administer crystalloid saline fluids only until identical typed blood is delivered from the blood bank.',
                  badge: 'High Exsanguination Risk',
                },
              ].map((opt) => {
                const isSelected = chosenProtocol === opt.id;
                return (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setChosenProtocol(opt.id as any);
                      setIsEvaluated(false);
                    }}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/70 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">{opt.label}</span>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        {opt.badge}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{opt.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Decision 2: Component Ratio */}
            <div className="pt-4 border-t border-slate-200">
              <span className="text-xs font-bold text-rose-700 uppercase tracking-wider block">
                Critical Decision 2 of 2: Hemostatic Transfusion Ratio
              </span>
              <p className="text-xs text-slate-600 mt-1">
                How should the transfusion therapy be balanced to prevent trauma coagulopathy?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                <button
                  onClick={() => {
                    setChosenRatio('BALANCED_1_1_1');
                    setIsEvaluated(false);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    chosenRatio === 'BALANCED_1_1_1'
                      ? 'border-rose-600 bg-rose-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 block">
                    Balanced 1:1:1 Ratio (PRBC : Plasma : Platelets)
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Reconstitutes whole blood, prevents clotting factor dilution, arrests trauma-induced coagulopathy.
                  </p>
                </button>

                <button
                  onClick={() => {
                    setChosenRatio('RBC_ONLY');
                    setIsEvaluated(false);
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    chosenRatio === 'RBC_ONLY'
                      ? 'border-rose-600 bg-rose-50/70 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <span className="text-xs font-bold text-slate-900 block">
                    Packed Red Cells Only (No Plasma or Platelets)
                  </span>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Transfuses oxygen-carrying cells only. Causes dilutional coagulopathy in massive bleeding.
                  </p>
                </button>
              </div>
            </div>

            {/* Execute Triage Button */}
            <div className="pt-2 flex items-center justify-between">
              <button
                onClick={() => setIsEvaluated(true)}
                disabled={!chosenProtocol || !chosenRatio}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                  chosenProtocol && chosenRatio
                    ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                Execute Transfusion Orders & Evaluate Outcome
              </button>
            </div>

            {/* Evaluation Debrief */}
            {isEvaluated && (
              <div className={`p-5 rounded-xl border space-y-3 ${
                patientSurvived
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-red-50 border-red-200 text-red-950'
              }`}>
                <div className="flex items-center gap-2">
                  {patientSurvived ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  )}
                  <h4 className="text-sm font-bold">
                    {patientSurvived ? 'Resuscitation Successful: Vitals Stabilized!' : 'Adverse Clinical Outcome / Protocol Error'}
                  </h4>
                </div>

                <p className="text-xs leading-relaxed">
                  {currentCase.explanation}
                </p>

                {!isRatioOptimal && (
                  <p className="text-xs text-red-800 font-medium">
                    ⚠️ Failure to initiate balanced 1:1:1 plasma and platelet ratios causes dilutional coagulopathy, worsening surgical bleeding!
                  </p>
                )}

                {isFatalDelay && (
                  <p className="text-xs text-red-800 font-medium">
                    ⚠️ Fatal Error: In class IV hemorrhagic shock, waiting 45 minutes without blood transfusion leads to irreversible hypoxic cardiac arrest!
                  </p>
                )}

                {patientSurvived && (
                  <div className="pt-2 flex items-center justify-between border-t border-emerald-200/60">
                    <span className="text-xs text-emerald-800">
                      Now ready to replenish inventory from registered donors.
                    </span>
                    <button
                      onClick={() => onGoToMatching(currentCase.optimalBloodType)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                    >
                      <span>Find Type {currentCase.optimalBloodType} Donors</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
