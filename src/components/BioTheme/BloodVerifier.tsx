import React, { useState } from 'react';
import { BloodGroup, BloodComponent } from '../../types/blood';
import {
  ALL_BLOOD_GROUPS,
  BLOOD_PROPERTIES_MAP,
  getCompatibleRecipientTypes,
  getCompatibleDonorTypes,
  isBloodCompatible
} from '../../utils/compatibility';
import { Check, X, ShieldCheck, AlertCircle, Droplet, Sparkles, Layers, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

export const BloodVerifier: React.FC = () => {
  // Person role: 'DONOR' or 'RECIPIENT'
  const [personRole, setPersonRole] = useState<'DONOR' | 'RECIPIENT'>('DONOR');
  // Selected Blood Group
  const [selectedBloodType, setSelectedBloodType] = useState<BloodGroup>('O-');
  // Blood Component
  const [selectedComponent, setSelectedComponent] = useState<BloodComponent>('RBC');

  // Interactive Self-Test Mode state
  const [isTestMode, setIsTestMode] = useState<boolean>(false);
  const [userSelectedAnswers, setUserSelectedAnswers] = useState<BloodGroup[]>([]);
  const [hasCheckedAnswer, setHasCheckedAnswer] = useState<boolean>(false);

  const currentProps = BLOOD_PROPERTIES_MAP[selectedBloodType];

  // List of compatible blood types based on role & component
  const compatibleTypes = personRole === 'DONOR'
    ? getCompatibleRecipientTypes(selectedBloodType, selectedComponent)
    : getCompatibleDonorTypes(selectedBloodType, selectedComponent);

  const incompatibleTypes = ALL_BLOOD_GROUPS.filter((t) => !compatibleTypes.includes(t));

  const handleToggleUserChoice = (type: BloodGroup) => {
    if (hasCheckedAnswer) return;
    setUserSelectedAnswers((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const handleResetTestMode = () => {
    setUserSelectedAnswers([]);
    setHasCheckedAnswer(false);
  };

  // Evaluate self-test
  const isAllCorrect =
    [...userSelectedAnswers].sort().join(',') === [...compatibleTypes].sort().join(',');

  const handleCheckSelfTest = () => {
    setHasCheckedAnswer(true);
    if (isAllCorrect) {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#10b981', '#059669', '#0d9488', '#e11d48'],
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Step 1: Role & Component Selection in Bio Lab styling */}
      <div className="bio-card p-6 rounded-xl border border-[#d1e2da]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Role Selector */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#2d614e] font-bold mb-2">
              1. Biological Role in Transfusion:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#eef6f2] rounded-xl border border-[#d1e2da]">
              <button
                type="button"
                onClick={() => {
                  setPersonRole('DONOR');
                  handleResetTestMode();
                }}
                className={`py-3 px-4 text-center rounded-lg transition-all ${
                  personRole === 'DONOR'
                    ? 'bg-[#064e3b] text-white font-bold shadow-xs ring-2 ring-[#10b981]'
                    : 'text-[#2d614e] hover:text-[#064e3b]'
                }`}
              >
                <span className="block text-xs font-medium opacity-90">Person is a</span>
                <span className="font-extrabold text-base tracking-wide uppercase">DONOR</span>
                <span className="block text-[11px] opacity-80 mt-0.5">(Providing Blood)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setPersonRole('RECIPIENT');
                  handleResetTestMode();
                }}
                className={`py-3 px-4 text-center rounded-lg transition-all ${
                  personRole === 'RECIPIENT'
                    ? 'bg-[#064e3b] text-white font-bold shadow-xs ring-2 ring-[#10b981]'
                    : 'text-[#2d614e] hover:text-[#064e3b]'
                }`}
              >
                <span className="block text-xs font-medium opacity-90">Person is a</span>
                <span className="font-extrabold text-base tracking-wide uppercase">RECIPIENT</span>
                <span className="block text-[11px] opacity-80 mt-0.5">(Receiving Blood)</span>
              </button>
            </div>
          </div>

          {/* Component Fraction */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#2d614e] font-bold mb-2">
              2. Blood Component Fraction:
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#eef6f2] rounded-xl border border-[#d1e2da]">
              <button
                type="button"
                onClick={() => {
                  setSelectedComponent('RBC');
                  handleResetTestMode();
                }}
                className={`py-3 px-4 text-center rounded-lg transition-all ${
                  selectedComponent === 'RBC'
                    ? 'bg-[#ffffff] text-[#064e3b] font-bold shadow-xs border border-[#a7ddc7]'
                    : 'text-[#2d614e] hover:text-[#064e3b]'
                }`}
              >
                <span className="font-bold block text-sm">Red Blood Cells (PRBC)</span>
                <span className="text-[11px] text-[#5a8775] block mt-0.5">Cellular Antigens</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedComponent('PLASMA');
                  handleResetTestMode();
                }}
                className={`py-3 px-4 text-center rounded-lg transition-all ${
                  selectedComponent === 'PLASMA'
                    ? 'bg-[#ffffff] text-[#064e3b] font-bold shadow-xs border border-[#a7ddc7]'
                    : 'text-[#2d614e] hover:text-[#064e3b]'
                }`}
              >
                <span className="font-bold block text-sm">Blood Plasma (FFP)</span>
                <span className="text-[11px] text-[#5a8775] block mt-0.5">Antibody Inverse Rules</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Blood Type Selector */}
      <div className="bio-card p-6 rounded-xl border border-[#d1e2da]">
        <label className="block text-xs uppercase tracking-wider text-[#2d614e] font-bold mb-3">
          3. Select Blood Type Phenotype:
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
          {ALL_BLOOD_GROUPS.map((type) => {
            const isSelected = selectedBloodType === type;
            const props = BLOOD_PROPERTIES_MAP[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => {
                  setSelectedBloodType(type);
                  handleResetTestMode();
                }}
                className={`py-3.5 px-2 text-center rounded-xl border transition-all ${
                  isSelected
                    ? 'bg-[#e11d48] border-[#be123c] text-white shadow-md ring-2 ring-[#fda4af]'
                    : 'bg-white border-[#d1e2da] text-[#0f2922] hover:bg-[#f0f7f4]'
                }`}
              >
                <span className="font-mono font-bold text-xl block tracking-tight">
                  {type}
                </span>
                <span className={`text-[10px] block mt-0.5 ${isSelected ? 'text-[#ffe4e6]' : 'text-[#5a8775]'}`}>
                  {props.populationFrequencyPct}% pop.
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: Primary Determination Stage with Reference View & Self-Test Mode */}
      <div
        className={`bio-card p-6 sm:p-8 rounded-xl border-2 transition-all ${
          isTestMode && hasCheckedAnswer
            ? isAllCorrect
              ? 'border-[#10b981] bg-[#f7fcf9] animate-bio-celebrate animate-bio-glow-success'
              : 'border-[#e11d48] bg-[#fff8f9] animate-bio-shake animate-bio-glow-error'
            : 'border-[#a7ddc7]'
        }`}
      >
        {/* Header with Mode Switcher */}
        <div className="border-b border-[#d1e2da] pb-5 mb-6 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-[#e1f5ec] text-[#065f46]">
                {selectedComponent === 'RBC' ? 'Red Cells (PRBC)' : 'Plasma (FFP)'}
              </span>
              <span className="text-xs text-[#059669] font-bold uppercase tracking-wider">
                Immunohematology Compatibility
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#064e3b] mt-1">
              {personRole === 'DONOR' ? (
                <>
                  Donor Phenotype <span className="font-mono text-[#e11d48]">{selectedBloodType}</span>
                </>
              ) : (
                <>
                  Recipient Phenotype <span className="font-mono text-[#e11d48]">{selectedBloodType}</span>
                </>
              )}
            </h2>
          </div>

          {/* Toggle between Reference & Test Mode */}
          <div className="flex items-center gap-1 p-1 bg-[#eef6f2] rounded-lg border border-[#d1e2da] text-xs">
            <button
              type="button"
              onClick={() => {
                setIsTestMode(false);
                handleResetTestMode();
              }}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                !isTestMode
                  ? 'bg-white text-[#064e3b] shadow-xs'
                  : 'text-[#5a8775] hover:text-[#064e3b]'
              }`}
            >
              Reference View
            </button>
            <button
              type="button"
              onClick={() => {
                setIsTestMode(true);
                handleResetTestMode();
              }}
              className={`px-3 py-1.5 rounded-md font-bold transition-all ${
                isTestMode
                  ? 'bg-[#064e3b] text-white shadow-xs'
                  : 'text-[#5a8775] hover:text-[#064e3b]'
              }`}
            >
              Test Yourself (Pick &amp; Check)
            </button>
          </div>
        </div>

        {/* INTERACTIVE TEST MODE OR REFERENCE VIEW */}
        {isTestMode ? (
          /* TEST YOURSELF MODE */
          <div className="space-y-6">
            <div className="bg-[#f0f7f4] border border-[#bcd3c6] p-5 rounded-xl">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider text-white ${
                    personRole === 'DONOR' ? 'bg-[#e11d48]' : 'bg-[#064e3b]'
                  }`}>
                    {personRole}
                  </span>
                  <span className="text-3xl font-mono font-black text-[#0f2922]">{selectedBloodType}</span>
                  <span className="text-base font-bold text-[#064e3b]">
                    {personRole === 'DONOR' ? 'Can Give Blood To:' : 'Can Receive Blood From:'}
                  </span>
                </div>
                {hasCheckedAnswer && (
                  <button
                    onClick={handleResetTestMode}
                    className="text-xs text-[#059669] hover:underline font-bold"
                  >
                    Reset &amp; Retest
                  </button>
                )}
              </div>

              {/* Choices Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                {ALL_BLOOD_GROUPS.map((type) => {
                  const isSelected = userSelectedAnswers.includes(type);
                  const isActuallyCompatible = compatibleTypes.includes(type);

                  let btnStyle = 'bg-white border-[#d1e2da] text-[#0f2922] hover:bg-[#eef6f2]';

                  if (!hasCheckedAnswer) {
                    if (isSelected) {
                      btnStyle = 'bg-[#064e3b] border-[#064e3b] text-white shadow-md ring-2 ring-[#10b981] font-bold';
                    }
                  } else {
                    if (isSelected && isActuallyCompatible) {
                      btnStyle = 'bg-[#d1fae5] border-[#059669] text-[#065f46] ring-2 ring-[#059669] font-bold';
                    } else if (isSelected && !isActuallyCompatible) {
                      btnStyle = 'bg-[#ffe4e6] border-[#e11d48] text-[#be123c] ring-2 ring-[#e11d48] font-bold line-through';
                    } else if (!isSelected && isActuallyCompatible) {
                      btnStyle = 'bg-[#ecfdf5] border-[#10b981] text-[#047857] border-dashed font-bold';
                    } else {
                      btnStyle = 'bg-[#f8faf9] border-[#e5e7eb] text-[#9ca3af] opacity-40';
                    }
                  }

                  return (
                    <button
                      key={type}
                      type="button"
                      disabled={hasCheckedAnswer}
                      onClick={() => handleToggleUserChoice(type)}
                      className={`p-3.5 rounded-xl border text-center transition-all ${btnStyle}`}
                    >
                      <div className="font-mono font-bold text-2xl">{type}</div>
                      <span className="text-[10px] font-sans font-bold uppercase block mt-1">
                        {!hasCheckedAnswer ? (
                          isSelected ? 'Selected' : 'Select'
                        ) : (
                          <>
                            {isSelected && isActuallyCompatible && '✓ Right!'}
                            {isSelected && !isActuallyCompatible && '✗ Wrong!'}
                            {!isSelected && isActuallyCompatible && '+ Missed!'}
                            {!isSelected && !isActuallyCompatible && 'Incompatible'}
                          </>
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Action Button */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                {!hasCheckedAnswer ? (
                  <button
                    type="button"
                    onClick={handleCheckSelfTest}
                    disabled={userSelectedAnswers.length === 0}
                    className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                      userSelectedAnswers.length > 0
                        ? 'bg-[#064e3b] hover:bg-[#043d2e] text-white shadow-md active:scale-95'
                        : 'bg-[#d1e2da] text-[#719b88] cursor-not-allowed'
                    }`}
                  >
                    Check Answer
                  </button>
                ) : (
                  <button
                    onClick={handleResetTestMode}
                    className="w-full sm:w-auto px-5 py-2 bg-[#064e3b] text-white rounded-xl text-xs font-bold hover:bg-[#043d2e]"
                  >
                    Retest This Type
                  </button>
                )}

                <span className="text-xs text-[#527d6d] italic">
                  {hasCheckedAnswer
                    ? 'Review evaluation below.'
                    : `${userSelectedAnswers.length} selected.`}
                </span>
              </div>
            </div>

            {/* Short Verdict Banner (Immediate Feedback) */}
            {hasCheckedAnswer && (
              <div
                className={`p-4 rounded-xl border-2 text-center transition-all ${
                  isAllCorrect
                    ? 'bg-[#ecfdf5] border-[#10b981] text-[#065f46] animate-bio-celebrate'
                    : 'bg-[#fff1f2] border-[#e11d48] text-[#be123c] animate-bio-shake'
                }`}
              >
                <div className="flex items-center justify-center gap-2 text-xl font-black">
                  {isAllCorrect ? (
                    <>
                      <Check className="w-6 h-6 text-[#10b981] stroke-[3]" />
                      <span>CORRECT! 🎉</span>
                    </>
                  ) : (
                    <>
                      <X className="w-6 h-6 text-[#e11d48] stroke-[3]" />
                      <span>INCORRECT! ❌</span>
                    </>
                  )}
                </div>
                <div className="text-sm font-bold mt-1 text-[#0f2922]">
                  Correct match:{' '}
                  <span className="font-mono font-black text-[#064e3b] underline">
                    {compatibleTypes.join(', ')}
                  </span>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* STANDARD REFERENCE VIEW */
          <div className="space-y-6">
            {/* COMPATIBLE SECTION */}
            <div className="bg-[#ecfdf5] border border-[#a7f3d0] p-5 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-[#059669]" />
                <h3 className="text-base font-extrabold text-[#065f46] tracking-wide">
                  {personRole === 'DONOR'
                    ? 'CAN SAFELY DONATE BLOOD TO:'
                    : 'CAN SAFELY RECEIVE BLOOD FROM:'}
                </h3>
              </div>

              <p className="text-xs text-[#2d614e] mb-4">
                {personRole === 'DONOR'
                  ? `Patients with any of the following blood types can safely receive this donor's ${selectedComponent === 'RBC' ? 'red blood cells' : 'plasma'}:`
                  : `Blood units from donors with any of the following blood types are safe to infuse:`}
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {compatibleTypes.map((type) => {
                  const isExact = type === selectedBloodType;
                  return (
                    <div
                      key={type}
                      className={`p-3.5 rounded-xl border text-center transition-all ${
                        isExact
                          ? 'bg-white border-[#059669] text-[#065f46] ring-2 ring-[#059669]'
                          : 'bg-white border-[#a7f3d0] text-[#065f46]'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5 font-mono font-extrabold text-2xl">
                        <Check className="w-4 h-4 text-[#059669] stroke-[3]" />
                        <span>{type}</span>
                      </div>
                      <span className="text-[10px] font-sans font-bold uppercase block mt-1 text-[#059669]">
                        {isExact ? 'Exact Match' : 'Compatible'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Universal Banners */}
              {selectedBloodType === 'O-' && selectedComponent === 'RBC' && personRole === 'DONOR' && (
                <div className="mt-4 p-3 bg-[#d1fae5] border border-[#6ee7b7] rounded-lg text-xs text-[#065f46] font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-[#059669]" />
                  <span>Universal Red Blood Cell Donor: Expresses zero A, B, or RhD surface antigens. Safe for all 8 blood types in emergency trauma!</span>
                </div>
              )}
              {selectedBloodType === 'AB+' && selectedComponent === 'RBC' && personRole === 'RECIPIENT' && (
                <div className="mt-4 p-3 bg-[#d1fae5] border border-[#6ee7b7] rounded-lg text-xs text-[#065f46] font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-[#059669]" />
                  <span>Universal Red Blood Cell Recipient: Possesses neither Anti-A nor Anti-B plasma antibodies. Can safely receive RBCs from all 8 blood types!</span>
                </div>
              )}
              {selectedBloodType === 'AB+' && selectedComponent === 'PLASMA' && personRole === 'DONOR' && (
                <div className="mt-4 p-3 bg-[#d1fae5] border border-[#6ee7b7] rounded-lg text-xs text-[#065f46] font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-[#059669]" />
                  <span>Universal Plasma Donor: Contains neither Anti-A nor Anti-B antibodies. Safe to transfuse plasma to all patients!</span>
                </div>
              )}
              {selectedBloodType === 'O-' && selectedComponent === 'PLASMA' && personRole === 'RECIPIENT' && (
                <div className="mt-4 p-3 bg-[#d1fae5] border border-[#6ee7b7] rounded-lg text-xs text-[#065f46] font-semibold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 shrink-0 text-[#059669]" />
                  <span>Universal Plasma Recipient: RBCs have no A or B antigens, so any donor plasma can be received safely without cell lysis.</span>
                </div>
              )}
            </div>

            {/* INCOMPATIBLE SECTION */}
            {incompatibleTypes.length > 0 && (
              <div className="bg-[#fff1f2] border border-[#fecdd3] p-5 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-5 h-5 text-[#e11d48]" />
                  <h3 className="text-base font-extrabold text-[#be123c] tracking-wide">
                    {personRole === 'DONOR'
                      ? 'CONTRAINDICATED RECIPIENTS (HEMOLYSIS RISK):'
                      : 'CONTRAINDICATED DONORS (HEMOLYSIS RISK):'}
                  </h3>
                </div>

                <p className="text-xs text-[#9f1239] mb-4">
                  {personRole === 'DONOR'
                    ? 'Transfusing to these blood types triggers acute antibody-mediated intravascular destruction:'
                    : 'Receiving units from these blood types triggers severe hemolytic transfusion reactions:'}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {incompatibleTypes.map((type) => (
                    <div
                      key={type}
                      className="p-3.5 rounded-xl border border-[#fda4af] bg-white text-center text-[#be123c]"
                    >
                      <div className="flex items-center justify-center gap-1.5 font-mono font-extrabold text-2xl text-[#e11d48]">
                        <X className="w-4 h-4 stroke-[3]" />
                        <span>{type}</span>
                      </div>
                      <span className="text-[10px] font-sans font-bold uppercase block mt-1 text-[#e11d48]">
                        Incompatible
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Immunological Biomarkers Footer */}
        <div className="mt-8 pt-6 border-t border-[#d1e2da] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-[#f0f7f4] rounded-xl border border-[#d1e2da]">
            <span className="font-bold uppercase text-[10px] tracking-wider text-[#3b6b59] block mb-1">
              RBC Membrane Surface Antigens
            </span>
            <p className="text-sm font-extrabold text-[#064e3b]">
              {currentProps.rbcAntigens.join(', ')}
            </p>
            <p className="text-[11px] text-[#5a8775] mt-0.5">
              Target for circulating agglutinins
            </p>
          </div>

          <div className="p-3.5 bg-[#f0f7f4] rounded-xl border border-[#d1e2da]">
            <span className="font-bold uppercase text-[10px] tracking-wider text-[#3b6b59] block mb-1">
              Serum Isohemagglutinins (Antibodies)
            </span>
            <p className="text-sm font-extrabold text-[#064e3b]">
              {currentProps.plasmaAntibodies.length > 0
                ? currentProps.plasmaAntibodies.join(', ')
                : 'None Present'}
            </p>
            <p className="text-[11px] text-[#5a8775] mt-0.5">
              Circulating plasma immune defenders
            </p>
          </div>

          <div className="p-3.5 bg-[#f0f7f4] rounded-xl border border-[#d1e2da]">
            <span className="font-bold uppercase text-[10px] tracking-wider text-[#3b6b59] block mb-1">
              Rhesus System (RhD Protein)
            </span>
            <p className="text-sm font-extrabold text-[#064e3b]">
              {currentProps.rh === '+' ? 'RhD Positive (+)' : 'RhD Negative (−)'}
            </p>
            <p className="text-[11px] text-[#5a8775] mt-0.5">
              {currentProps.rh === '+'
                ? 'Can receive both Rh+ and Rh− RBCs'
                : 'Must receive ONLY Rh− RBCs'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
