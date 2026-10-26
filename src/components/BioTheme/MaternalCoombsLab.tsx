import React, { useState } from 'react';
import {
  Baby,
  ShieldCheck,
  ShieldAlert,
  Pipette,
  CheckCircle2,
  XCircle,
  HardDrive,
  RotateCcw,
  Sparkles,
  Info,
  Layers,
  Heart,
  Droplet,
  Calculator,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface MaternalCoombsLabProps {
  themeMode: 'dark' | 'light';
  onSaveToDrive?: (report: {
    title: string;
    bloodGroup?: string;
    details: string;
    sampleId?: string;
  }) => void;
}

type CoombsTestType = 'IAT' | 'DAT'; // Indirect (Maternal Serum) vs Direct (Fetal Cord RBCs)
type LabStage = 'SAMPLE_LOADED' | 'SALINE_WASHED' | 'AHG_ADDED' | 'CENTRIFUGED' | 'RESULT_READY';

export function MaternalCoombsLab({ themeMode, onSaveToDrive }: MaternalCoombsLabProps) {
  const isDark = themeMode === 'dark';

  // Mode Selection
  const [testType, setTestType] = useState<CoombsTestType>('IAT');
  const [labStage, setLabStage] = useState<LabStage>('SAMPLE_LOADED');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  // Clinical Pregnancy Scenario
  const [motherRh] = useState<'-'>('-');
  const [motherType, setMotherType] = useState<'O-' | 'A-'>('O-');
  const [fatherType] = useState<'A+'>('A+');
  const [pregnancyNumber, setPregnancyNumber] = useState<1 | 2>(2);
  const [priorRhoGamGiven, setPriorRhoGamGiven] = useState<boolean>(false);

  // Kleihauer-Betke (KB) Prophylaxis Calculator State
  const [fetalCellsCounted, setFetalCellsCounted] = useState<number>(24); // out of 2000 maternal RBCs
  const [maternalWeightKg, setMaternalWeightKg] = useState<number>(65);

  // Is Sensitization present?
  // If 2nd pregnancy and no prior RhoGAM was given -> Sensitized!
  const isSensitized = pregnancyNumber === 2 && !priorRhoGamGiven;

  // Coombs test result logic:
  // If testing IAT (Indirect Coombs on Maternal Serum):
  // Positive agglutination if mother is sensitized with circulating anti-D IgG!
  // If testing DAT (Direct Coombs on Neonatal Cord RBCs):
  // Positive agglutination if maternal IgG crossed placenta and coated fetal RBCs!
  const isCoombsPositive = isSensitized;

  const handleAdvanceStep = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      if (labStage === 'SAMPLE_LOADED') setLabStage('SALINE_WASHED');
      else if (labStage === 'SALINE_WASHED') setLabStage('AHG_ADDED');
      else if (labStage === 'AHG_ADDED') setLabStage('CENTRIFUGED');
      else if (labStage === 'CENTRIFUGED') {
        setLabStage('RESULT_READY');
        if (!isCoombsPositive) {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 },
          });
        }
      }
    }, 700);
  };

  const handleResetLab = () => {
    setLabStage('SAMPLE_LOADED');
  };

  // KB Calculator formula:
  // Fetal Maternal Hemorrhage (FMH) in mL = (% fetal cells) x 50 (standard 5000mL maternal blood volume)
  // Each 300 ug RhoGAM vial protects against 30 mL fetal whole blood (or 15 mL packed RBCs).
  // Vials = ceil(FMH / 30) + 1 safety cushion vial.
  const fetalPercentage = (fetalCellsCounted / 2000) * 100;
  const fmhVolumeMl = Math.round(fetalPercentage * 50 * 10) / 10;
  const rhoGamVialsNeeded = Math.max(1, Math.ceil(fmhVolumeMl / 30) + (fmhVolumeMl % 30 > 0 ? 1 : 0));

  const handleSaveReport = () => {
    if (!onSaveToDrive) return;
    const reportText = `=================================================================
MATERNAL-FETAL IMMUNOHEMATOLOGY & COOMBS (HDFN) REPORT
HemoMatch Specialized Obstetrics Immunohematology Station
Station: Maternal-Fetal Rh Incompatibility & Antiglobulin Laboratory
Verified & Certified by: Maruf (HemoMatch Station)
=================================================================

CLINICAL OBSTETRICS PROFILE:
Maternal Blood Group: ${motherType} (RhD Negative)
Paternal Blood Group: ${fatherType} (RhD Positive)
Gestational Parity: Gravida ${pregnancyNumber}, Para ${pregnancyNumber - 1}
Prior RhoGAM (anti-D) Prophylaxis Administered: ${priorRhoGamGiven ? 'YES (Protected)' : 'NO (Sensitization Risk)'}

ANTIGLOBULIN (COOMBS) TESTING PROTOCOL:
Test Modality: ${testType === 'IAT' ? 'Indirect Antiglobulin Test (IAT) - Maternal Serum Screen' : 'Direct Antiglobulin Test (DAT) - Fetal Cord Erythrocytes'}
Saline Wash Phase: 3x Complete Normal Saline Wash (Unbound IgG Cleared)
AHG Reagent: Monoclonal Green Anti-Human Globulin (Anti-IgG + C3d)
Coombs Reaction Outcome: ${isCoombsPositive ? 'POSITIVE (3+ Agglutination Observed)' : 'NEGATIVE (Smooth 0 Suspension)'}
Clinical Diagnosis: ${isCoombsPositive ? 'Maternal Anti-D Isoimmunization Confirmed / High Fetal Hemolysis Risk' : 'No Active Anti-D Isoimmunization Detected'}

KLEIHAUER-BETKE (KB) FETOMATERNAL HEMORRHAGE CALCULATION:
- Fetal Cells Counted: ${fetalCellsCounted} / 2000 RBCs (${fetalPercentage.toFixed(2)}%)
- Estimated Fetal Hemorrhage Volume: ${fmhVolumeMl} mL Whole Blood
- Recommended Rho(D) Immune Globulin (RhoGAM 300 mcg) Vials: ${rhoGamVialsNeeded} Vial(s)
- Optimal Timing: Administer intramuscularly within 72 hours postpartum / post-event

=================================================================
Signed & Certified by: Maruf (HemoMatch Station)
Platform: HemoMatch Maternal Immunohematology Simulator
=================================================================`;

    onSaveToDrive({
      title: `Maternal Coombs HDFN - ${motherType} Mother [G${pregnancyNumber}]`,
      bloodGroup: motherType,
      sampleId: `HDFN-G${pregnancyNumber}-${testType}`,
      details: reportText,
    });
  };

  return (
    <div className="space-y-6 animate-bio-fade-in-up">
      {/* Header Banner */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isDark
            ? 'bg-gradient-to-br from-purple-950/40 via-slate-900 to-slate-950 border-purple-900/40 shadow-lg'
            : 'bg-gradient-to-br from-purple-50 via-white to-pink-50 border-purple-200 shadow-sm'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400">
              <Baby className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  OBSTETRICS IMMUNOHEMATOLOGY
                </span>
                <span className="text-xs font-mono text-slate-400">Station #4</span>
              </div>
              <h2 className="text-lg font-bold font-mono tracking-tight mt-0.5">
                Rh Incompatibility &amp; Coombs Lab (HDFN)
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-rose-400 font-bold px-2.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
              Verified by Maruf
            </span>
          </div>
        </div>

        {/* Tab Switcher: IAT vs DAT */}
        <div className="mt-4 pt-3 border-t border-purple-500/15 flex flex-wrap gap-2">
          <button
            onClick={() => {
              setTestType('IAT');
              handleResetLab();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              testType === 'IAT'
                ? 'bg-purple-600 text-white shadow-xs'
                : isDark
                ? 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
            }`}
          >
            Indirect Coombs (IAT): Maternal Serum Screen
          </button>
          <button
            onClick={() => {
              setTestType('DAT');
              handleResetLab();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
              testType === 'DAT'
                ? 'bg-purple-600 text-white shadow-xs'
                : isDark
                ? 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
            }`}
          >
            Direct Coombs (DAT): Neonatal Cord RBC Test
          </button>
        </div>
      </div>

      {/* Maternal-Fetal Clinical Genetics Setup */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex items-center gap-2 mb-3">
          <Heart className="w-4 h-4 text-purple-400" />
          <h3 className="font-mono font-bold text-sm uppercase tracking-wide">
            Clinical Pregnancy &amp; Sensitization Model
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Mother */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Mother (Patient)</div>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono font-bold text-base text-purple-300">{motherType}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                Rh Negative (dd)
              </span>
            </div>
            <div className="mt-2 text-[10px] text-slate-400">
              Select maternal ABO type:
              <div className="flex gap-1.5 mt-1">
                <button
                  onClick={() => setMotherType('O-')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                    motherType === 'O-' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  O-
                </button>
                <button
                  onClick={() => setMotherType('A-')}
                  className={`px-2 py-0.5 rounded text-[10px] font-mono cursor-pointer ${
                    motherType === 'A-' ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  A-
                </button>
              </div>
            </div>
          </div>

          {/* Father */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Father</div>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono font-bold text-base text-rose-400">{fatherType}</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                Rh Positive (Dd)
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-2">
              Passes RhD antigen allele to fetus with 50-100% inheritance probability.
            </div>
          </div>

          {/* Fetus */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400 uppercase">Fetus / Newborn</div>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono font-bold text-base text-amber-400">Rh+ (D+)</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                Foreign to Mother
              </span>
            </div>
            <div className="text-[10px] text-slate-400 mt-2">
              Expresses RhD glycoprotein on erythrocyte membrane.
            </div>
          </div>
        </div>

        {/* Gestational History Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800/60">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Current Pregnancy Number:
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPregnancyNumber(1);
                  handleResetLab();
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                  pregnancyNumber === 1
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                1st Pregnancy (Primary Exposure)
              </button>
              <button
                onClick={() => {
                  setPregnancyNumber(2);
                  handleResetLab();
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                  pregnancyNumber === 2
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                2nd Pregnancy (Secondary Recall)
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">
              Prior Anti-D Prophylaxis (RhoGAM Given):
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setPriorRhoGamGiven(false);
                  handleResetLab();
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                  !priorRhoGamGiven
                    ? 'bg-red-600/90 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                No RhoGAM (Unprotected)
              </button>
              <button
                onClick={() => {
                  setPriorRhoGamGiven(true);
                  handleResetLab();
                }}
                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold cursor-pointer transition-all ${
                  priorRhoGamGiven
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                Yes RhoGAM 300µg (Protected)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Coombs Laboratory Bench */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Pipette className="w-4 h-4 text-emerald-400" />
            <h3 className="font-mono font-bold text-sm uppercase tracking-wide">
              {testType === 'IAT' ? 'Indirect Coombs Test (IAT)' : 'Direct Coombs Test (DAT)'} Procedure
            </h3>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Stage: <strong className="text-emerald-400">{labStage.replace(/_/g, ' ')}</strong>
          </span>
        </div>

        <div
          className={`p-4 rounded-xl border ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-300'
          }`}
        >
          {/* Step Breadcrumbs */}
          <div className="grid grid-cols-4 gap-1.5 text-center mb-5">
            <div
              className={`p-2 rounded-lg text-[10px] font-mono font-bold ${
                labStage === 'SAMPLE_LOADED'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800/80 text-slate-400'
              }`}
            >
              1. Sample
            </div>
            <div
              className={`p-2 rounded-lg text-[10px] font-mono font-bold ${
                labStage === 'SALINE_WASHED'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800/80 text-slate-400'
              }`}
            >
              2. 3x Wash
            </div>
            <div
              className={`p-2 rounded-lg text-[10px] font-mono font-bold ${
                labStage === 'AHG_ADDED'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800/80 text-slate-400'
              }`}
            >
              3. Green AHG
            </div>
            <div
              className={`p-2 rounded-lg text-[10px] font-mono font-bold ${
                labStage === 'RESULT_READY' || labStage === 'CENTRIFUGED'
                  ? 'bg-purple-600 text-white'
                  : 'bg-slate-800/80 text-slate-400'
              }`}
            >
              4. Reaction
            </div>
          </div>

          {/* Test Tube Centerpiece Animation */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="w-16 h-36 rounded-b-3xl border-2 border-slate-600 bg-slate-900/80 relative overflow-hidden flex flex-col justify-end p-1.5 shadow-2xl">
              {/* Fluid */}
              <div
                className={`w-full rounded-b-2xl transition-all duration-700 flex items-center justify-center ${
                  labStage === 'SAMPLE_LOADED'
                    ? 'h-14 bg-rose-500/50'
                    : labStage === 'SALINE_WASHED'
                    ? 'h-10 bg-slate-400/40'
                    : labStage === 'AHG_ADDED'
                    ? 'h-20 bg-emerald-500/60'
                    : isCoombsPositive
                    ? 'h-20 bg-red-600 animate-pulse'
                    : 'h-20 bg-rose-400/60'
                }`}
              >
                {labStage === 'RESULT_READY' && (
                  <span className="text-[10px] font-mono text-white font-black text-center leading-tight">
                    {isCoombsPositive ? '4+ CLUMP' : 'SMOOTH'}
                  </span>
                )}
              </div>
            </div>

            <div className="text-xs font-mono text-slate-400 mt-3 text-center max-w-sm">
              {labStage === 'SAMPLE_LOADED' &&
                (testType === 'IAT'
                  ? 'Incubating maternal serum with reagent RhD+ red blood cells.'
                  : 'Adding newborn fetal cord blood RBC suspension.')}
              {labStage === 'SALINE_WASHED' &&
                'Normal saline wash (3 cycles) executed. Unbound plasma globulins decanted to prevent AHG neutralisation.'}
              {labStage === 'AHG_ADDED' &&
                'Green Anti-Human Globulin (Coombs reagent: anti-IgG) added to cross-link sensitized antibodies.'}
              {(labStage === 'CENTRIFUGED' || labStage === 'RESULT_READY') &&
                (isCoombsPositive
                  ? 'POSITIVE: Visible lattice agglutination. Heavy erythrocyte clumping confirms antibody binding.'
                  : 'NEGATIVE: Completely smooth suspended red cells. No antibody sensitization.')}
            </div>

            {/* Action Button */}
            <div className="mt-4 flex gap-2">
              {labStage !== 'RESULT_READY' ? (
                <button
                  disabled={isProcessing}
                  onClick={handleAdvanceStep}
                  className="px-5 py-2.5 rounded-xl font-mono font-bold text-xs bg-gradient-to-r from-purple-600 to-purple-700 text-white hover:from-purple-500 hover:to-purple-600 transition-all cursor-pointer shadow-md disabled:opacity-50"
                >
                  {isProcessing
                    ? 'Processing in Centrifuge...'
                    : labStage === 'SAMPLE_LOADED'
                    ? 'Perform 3x Saline Wash'
                    : labStage === 'SALINE_WASHED'
                    ? 'Pipette Green AHG Reagent'
                    : 'Centrifuge & Read Coombs Result'}
                </button>
              ) : (
                <button
                  onClick={handleResetLab}
                  className="px-4 py-2 rounded-xl font-mono font-bold text-xs bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset Test Procedure</span>
                </button>
              )}
            </div>
          </div>

          {/* Result Alert */}
          {labStage === 'RESULT_READY' && (
            <div
              className={`mt-4 p-4 rounded-xl border transition-all ${
                isCoombsPositive
                  ? 'bg-red-500/10 border-red-500/40 text-red-300'
                  : 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2 font-mono font-bold text-sm">
                {isCoombsPositive ? (
                  <>
                    <ShieldAlert className="w-5 h-5 text-red-400" />
                    <span>COOMBS TEST POSITIVE: ACTIVE SENSITIZATION</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                    <span>COOMBS TEST NEGATIVE: UNSENSITIZED (SAFE)</span>
                  </>
                )}
              </div>
              <p className="text-xs font-mono leading-relaxed text-slate-300">
                {isCoombsPositive ? (
                  <>
                    <strong>High Hemolytic Risk:</strong> Mother has developed maternal anti-D IgG
                    antibodies. In 2nd pregnancy without previous RhoGAM protection, these antibodies
                    actively cross the placenta to lyse fetal RhD+ erythrocytes, leading to Hemolytic
                    Disease of the Fetus &amp; Newborn (HDFN), fetal anemia, and hydrops fetalis.
                  </>
                ) : (
                  <>
                    <strong>Safe &amp; Unsensitized:</strong> No anti-D alloantibodies detected. The
                    patient is an eligible candidate for standard 300 µg RhoGAM prophylaxis to maintain
                    protection against future sensitization.
                  </>
                )}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Kleihauer-Betke (KB) Stain & RhoGAM Dosing Calculator */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border transition-all ${
          isDark ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-pink-400" />
            <h3 className="font-mono font-bold text-sm uppercase tracking-wide">
              Kleihauer-Betke (KB) Acid Elution Calculator
            </h3>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
            ACOG Dosing Standard
          </span>
        </div>

        <p className="text-xs text-slate-400 font-mono mb-4">
          Acid elution stains maternal adult hemoglobin (ghost cells) while fetal hemoglobin (HbF)
          remains brightly stained pink. Use this count to calculate exact RhoGAM vials needed for
          massive fetomaternal hemorrhage.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Input Fetal Cells */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400">
              FETAL CELLS / 2000 RBCs
            </div>
            <div className="text-xl font-mono font-black text-pink-400 my-1">
              {fetalCellsCounted} cells
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={fetalCellsCounted}
              onChange={(e) => setFetalCellsCounted(Number(e.target.value))}
              className="w-full accent-pink-500 mt-1 cursor-pointer"
            />
          </div>

          {/* Calculated Volume */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400">ESTIMATED FETAL HEMORRHAGE</div>
            <div className="text-xl font-mono font-black text-amber-400 my-1">
              {fmhVolumeMl} mL
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1">
              Standard dose covers ≤ 30 mL
            </div>
          </div>

          {/* Vials Needed */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-[10px] font-mono text-slate-400">RHOGAM (300 µg) REQUIRED</div>
            <div className="text-xl font-mono font-black text-emerald-400 my-1">
              {rhoGamVialsNeeded} Vial(s)
            </div>
            <div className="text-[10px] font-mono text-slate-500 mt-1">
              Includes safety cushion vial
            </div>
          </div>
        </div>
      </div>

      {/* Save to Drive Button */}
      {onSaveToDrive && (
        <button
          onClick={handleSaveReport}
          className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-mono font-bold text-xs shadow-xs transition-all active:scale-[0.98] cursor-pointer ${
            isDark
              ? 'bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-200'
              : 'bg-white border border-slate-300 hover:bg-slate-100 text-slate-800'
          }`}
        >
          <HardDrive className="w-4 h-4 text-rose-500" />
          <span>Save Maternal Coombs &amp; HDFN Report to Google Drive (Made by Maruf)</span>
        </button>
      )}
    </div>
  );
}
