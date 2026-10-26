import React, { useState } from 'react';
import { BloodGroup, BloodComponent } from '../../types/blood';
import {
  ALL_BLOOD_GROUPS,
  BLOOD_PROPERTIES_MAP,
  getCompatibleRecipientTypes,
  getCompatibleDonorTypes,
  isBloodCompatible
} from '../../utils/compatibility';
import { Check, X, ShieldCheck, AlertCircle, Info, Sparkles } from 'lucide-react';

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

  return (
    <div className="space-y-8">
      {/* Step 1: Select Role & Component in Classic Ledger Style */}
      <div className="parchment-card p-6 rounded-lg border border-[#ded7c8]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Role Selector */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#7c6d59] font-semibold mb-2">
              1. Specify the Person's Role
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#f4efe4] rounded-md border border-[#ded7c8]">
              <button
                type="button"
                onClick={() => setPersonRole('DONOR')}
                className={`py-3 px-4 text-center text-sm font-serif font-medium transition-all rounded ${
                  personRole === 'DONOR'
                    ? 'bg-[#ffffff] text-[#8b1d2c] font-semibold shadow-xs border border-[#ded7c8]'
                    : 'text-[#6e6050] hover:text-[#29221b]'
                }`}
              >
                <span className="block text-base font-normal tracking-wide">Person is a</span>
                <span className="font-bold text-lg uppercase tracking-wider">DONOR</span>
                <span className="block text-[11px] font-sans text-[#8a7b69] mt-0.5">(Giving Blood)</span>
              </button>

              <button
                type="button"
                onClick={() => setPersonRole('RECIPIENT')}
                className={`py-3 px-4 text-center text-sm font-serif font-medium transition-all rounded ${
                  personRole === 'RECIPIENT'
                    ? 'bg-[#ffffff] text-[#8b1d2c] font-semibold shadow-xs border border-[#ded7c8]'
                    : 'text-[#6e6050] hover:text-[#29221b]'
                }`}
              >
                <span className="block text-base font-normal tracking-wide">Person is a</span>
                <span className="font-bold text-lg uppercase tracking-wider">RECIPIENT</span>
                <span className="block text-[11px] font-sans text-[#8a7b69] mt-0.5">(Receiving Blood)</span>
              </button>
            </div>
          </div>

          {/* Component Selector */}
          <div>
            <label className="block text-xs uppercase tracking-widest text-[#7c6d59] font-semibold mb-2">
              2. Blood Component Fraction
            </label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-[#f4efe4] rounded-md border border-[#ded7c8]">
              <button
                type="button"
                onClick={() => setSelectedComponent('RBC')}
                className={`py-3 px-4 text-center text-sm font-serif transition-all rounded ${
                  selectedComponent === 'RBC'
                    ? 'bg-[#ffffff] text-[#29221b] font-semibold shadow-xs border border-[#ded7c8]'
                    : 'text-[#6e6050] hover:text-[#29221b]'
                }`}
              >
                <span className="font-bold block tracking-wide">Red Blood Cells (PRBC)</span>
                <span className="text-[11px] font-sans text-[#8a7b69] block mt-0.5">Whole Blood / Cells</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedComponent('PLASMA')}
                className={`py-3 px-4 text-center text-sm font-serif transition-all rounded ${
                  selectedComponent === 'PLASMA'
                    ? 'bg-[#ffffff] text-[#29221b] font-semibold shadow-xs border border-[#ded7c8]'
                    : 'text-[#6e6050] hover:text-[#29221b]'
                }`}
              >
                <span className="font-bold block tracking-wide">Blood Plasma (FFP)</span>
                <span className="text-[11px] font-sans text-[#8a7b69] block mt-0.5">Antibody Inverse Rules</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Blood Type Selector */}
      <div className="parchment-card p-6 rounded-lg border border-[#ded7c8]">
        <label className="block text-xs uppercase tracking-widest text-[#7c6d59] font-semibold mb-3 text-center sm:text-left">
          3. Select the Person's Blood Type
        </label>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
          {ALL_BLOOD_GROUPS.map((type) => {
            const isSelected = selectedBloodType === type;
            const props = BLOOD_PROPERTIES_MAP[type];
            return (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedBloodType(type)}
                className={`py-3 px-2 text-center rounded border transition-all ${
                  isSelected
                    ? 'bg-[#8b1d2c] border-[#721422] text-[#ffffff] shadow-md ring-2 ring-[#cbbba0]'
                    : 'bg-[#faf7f0] border-[#ded7c8] text-[#29221b] hover:bg-[#ffffff] hover:border-[#bdae95]'
                }`}
              >
                <span className="font-serif font-bold text-xl block tracking-tight">
                  {type}
                </span>
                <span className={`text-[10px] block mt-0.5 font-sans ${isSelected ? 'text-[#f5d0d6]' : 'text-[#8a7b69]'}`}>
                  {props.populationFrequencyPct}% pop.
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step 3: THE CLASSIC VERDICT LEDGER */}
      <div className="parchment-card border-2 border-[#cbbba0] rounded-lg p-6 sm:p-8 shadow-sm relative overflow-hidden bg-[#fffdf9]">
        {/* Subtle Watermark/Emboss Ornament */}
        <div className="absolute right-4 top-4 text-[#efe8d8] pointer-events-none select-none text-7xl font-serif font-bold opacity-30">
          {selectedBloodType}
        </div>

        {/* Heading Section with Self-Test Switcher */}
        <div className="border-b border-[#ded7c8] pb-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
            <div>
              <span className="text-[11px] font-sans uppercase tracking-[0.2em] text-[#8b1d2c] font-bold">
                Transfusion Compatibility Determination
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif text-[#29221b] mt-1">
                {personRole === 'DONOR' ? (
                  <>
                    A Donor with Blood Type <span className="text-[#8b1d2c] font-bold underline decoration-[#cbbba0] underline-offset-4">{selectedBloodType}</span>
                  </>
                ) : (
                  <>
                    A Recipient with Blood Type <span className="text-[#8b1d2c] font-bold underline decoration-[#cbbba0] underline-offset-4">{selectedBloodType}</span>
                  </>
                )}
              </h2>
            </div>

            {/* Mode Switcher: Reference vs Test Yourself */}
            <div className="flex items-center gap-1.5 p-1 bg-[#f4efe4] rounded-md border border-[#ded7c8] self-start sm:self-auto text-xs font-serif">
              <button
                type="button"
                onClick={() => {
                  setIsTestMode(false);
                  handleResetTestMode();
                }}
                className={`px-3 py-1.5 rounded transition-all ${
                  !isTestMode
                    ? 'bg-white font-bold text-[#8b1d2c] shadow-xs border border-[#ded7c8]'
                    : 'text-[#6e6050] hover:text-[#29221b]'
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
                className={`px-3 py-1.5 rounded transition-all ${
                  isTestMode
                    ? 'bg-white font-bold text-[#8b1d2c] shadow-xs border border-[#ded7c8]'
                    : 'text-[#6e6050] hover:text-[#29221b]'
                }`}
              >
                Test Yourself (Pick &amp; Check)
              </button>
            </div>
          </div>
        </div>

        {/* PRIMARY VERDICT BANNER OR TEST MODE */}
        {isTestMode ? (
          /* TEST YOURSELF INTERACTIVE WORKBENCH */
          <div className="space-y-6">
            <div className="bg-[#faf7f0] border border-[#ded7c8] p-5 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-serif text-lg font-bold text-[#29221b]">
                  {personRole === 'DONOR'
                    ? `Which blood types can safely RECEIVE blood from this ${selectedBloodType} donor?`
                    : `Which blood types can safely DONATE blood to this ${selectedBloodType} recipient?`}
                </h3>
                {hasCheckedAnswer && (
                  <button
                    onClick={handleResetTestMode}
                    className="text-xs text-[#8b1d2c] underline font-serif hover:text-[#721422]"
                  >
                    Try Again
                  </button>
                )}
              </div>
              <p className="text-xs font-serif italic text-[#635647] mb-4">
                Click each blood group you believe is compatible. When ready, click "Check My Answer" to see which are right or wrong.
              </p>

              {/* Choices grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {ALL_BLOOD_GROUPS.map((type) => {
                  const isSelected = userSelectedAnswers.includes(type);
                  const isActuallyCompatible = compatibleTypes.includes(type);

                  let cardStyle = 'bg-white border-[#ded7c8] text-[#29221b] hover:bg-[#faf6ee]';

                  if (!hasCheckedAnswer) {
                    if (isSelected) {
                      cardStyle = 'bg-[#8b1d2c] border-[#721422] text-white shadow-sm ring-1 ring-[#cbbba0]';
                    }
                  } else {
                    if (isSelected && isActuallyCompatible) {
                      cardStyle = 'bg-[#eef7f0] border-[#216e39] text-[#19532b] ring-2 ring-[#216e39] font-bold';
                    } else if (isSelected && !isActuallyCompatible) {
                      cardStyle = 'bg-[#fcf2f4] border-[#8b1d2c] text-[#8b1d2c] ring-2 ring-[#8b1d2c] line-through font-bold';
                    } else if (!isSelected && isActuallyCompatible) {
                      cardStyle = 'bg-[#f0f9f2] border-[#216e39] text-[#216e39] border-dashed font-bold';
                    } else {
                      cardStyle = 'bg-[#faf8f5] border-[#e8e2d6] text-[#9c8e7c] opacity-50';
                    }
                  }

                  return (
                    <button
                      key={type}
                      type="button"
                      disabled={hasCheckedAnswer}
                      onClick={() => handleToggleUserChoice(type)}
                      className={`p-3.5 rounded border text-center transition-all ${cardStyle}`}
                    >
                      <div className="font-serif font-bold text-2xl">{type}</div>
                      <span className="text-[10px] font-sans uppercase tracking-wider block mt-1">
                        {!hasCheckedAnswer ? (
                          isSelected ? 'Selected' : 'Click to select'
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

              {/* Action check button */}
              <div className="mt-5 pt-4 border-t border-[#ded7c8] flex flex-col sm:flex-row items-center justify-between gap-3">
                {!hasCheckedAnswer ? (
                  <button
                    type="button"
                    onClick={() => setHasCheckedAnswer(true)}
                    disabled={userSelectedAnswers.length === 0}
                    className={`px-6 py-2.5 rounded font-serif font-bold text-sm transition-all ${
                      userSelectedAnswers.length > 0
                        ? 'bg-[#8b1d2c] hover:bg-[#721422] text-white shadow-sm'
                        : 'bg-[#e8e2d6] text-[#9c8e7c] cursor-not-allowed'
                    }`}
                  >
                    Check My Answer Automatically
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="font-serif text-sm font-bold text-[#29221b]">
                      Results Checked!
                    </span>
                    <button
                      onClick={handleResetTestMode}
                      className="px-4 py-1.5 bg-[#29221b] text-white rounded font-serif text-xs hover:bg-[#1a1612]"
                    >
                      Reset &amp; Retest
                    </button>
                  </div>
                )}

                <span className="text-xs font-serif italic text-[#706250]">
                  {hasCheckedAnswer
                    ? 'Review the evaluated answers and immunological rationale below.'
                    : `${userSelectedAnswers.length} blood types currently selected.`}
                </span>
              </div>
            </div>

            {/* Evaluated summary banner */}
            {hasCheckedAnswer && (
              <div className="bg-[#f7fbf8] border border-[#bcdbc3] p-5 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#216e39]" />
                  <h4 className="font-serif font-bold text-[#19532b]">
                    Clinical Answer Key
                  </h4>
                </div>
                <p className="text-xs font-serif text-[#29221b] leading-relaxed">
                  The correct compatible blood types for {personRole === 'DONOR' ? 'donor' : 'recipient'} {selectedBloodType} ({selectedComponent}) are:{' '}
                  <strong className="text-[#19532b]">{compatibleTypes.join(', ')}</strong>.
                </p>
                <p className="text-[11px] font-serif italic text-[#4a7255]">
                  {personRole === 'DONOR'
                    ? `Donor ${selectedBloodType} RBCs do not carry antigens targeted by these recipients' circulating antibodies.`
                    : `Recipient ${selectedBloodType} plasma does not carry antibodies against these donors' RBC surface antigens.`}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* STANDARD REFERENCE VIEW */
          <div className="space-y-6">
            {/* COMPATIBLE SECTION */}
            <div className="bg-[#f7fbf8] border border-[#bcdbc3] p-5 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <ShieldCheck className="w-5 h-5 text-[#216e39]" />
                <h3 className="font-serif text-lg font-bold text-[#19532b] tracking-wide">
                  {personRole === 'DONOR'
                    ? 'CAN SAFELY DONATE BLOOD TO:'
                    : 'CAN SAFELY RECEIVE BLOOD FROM:'}
                </h3>
              </div>

              <p className="text-xs font-serif italic text-[#3f6e4d] mb-4">
                {personRole === 'DONOR'
                  ? `Patients with any of the following blood types can safely accept this donor's ${selectedComponent === 'RBC' ? 'red blood cells' : 'plasma'}:`
                  : `Units from donors with any of the following blood types are safe to infuse into this recipient:`}
              </p>

              {/* List of Compatible Blood Types */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {compatibleTypes.map((type) => {
                  const isExact = type === selectedBloodType;
                  return (
                    <div
                      key={type}
                      className={`p-3 rounded border text-center transition-all ${
                        isExact
                          ? 'bg-[#ffffff] border-[#216e39] text-[#19532b] ring-1 ring-[#216e39]'
                          : 'bg-[#ffffff] border-[#cfe2d3] text-[#245233]'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-1.5 font-serif font-bold text-2xl">
                        <Check className="w-4 h-4 text-[#216e39] stroke-[3]" />
                        <span>{type}</span>
                      </div>
                      <span className="text-[10px] font-sans uppercase tracking-wider block mt-1 text-[#467352]">
                        {isExact ? 'Exact Match' : 'Compatible'}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Universal Status Callout if applicable */}
              {selectedBloodType === 'O-' && selectedComponent === 'RBC' && personRole === 'DONOR' && (
                <div className="mt-4 p-3 bg-[#eef7f0] border border-[#a8d5b1] rounded text-xs text-[#1a532b] font-serif">
                  ❖ <strong>Universal Red Blood Cell Donor:</strong> Type O− expresses neither A, B, nor RhD surface antigens. This donor's red cells can be given to all eight blood types in emergencies.
                </div>
              )}
              {selectedBloodType === 'AB+' && selectedComponent === 'RBC' && personRole === 'RECIPIENT' && (
                <div className="mt-4 p-3 bg-[#eef7f0] border border-[#a8d5b1] rounded text-xs text-[#1a532b] font-serif">
                  ❖ <strong>Universal Red Blood Cell Recipient:</strong> Type AB+ has neither Anti-A nor Anti-B antibodies in plasma and is RhD positive. This recipient can safely receive red blood cells from all eight blood types.
                </div>
              )}
              {selectedBloodType === 'AB+' && selectedComponent === 'PLASMA' && personRole === 'DONOR' && (
                <div className="mt-4 p-3 bg-[#eef7f0] border border-[#a8d5b1] rounded text-xs text-[#1a532b] font-serif">
                  ❖ <strong>Universal Plasma Donor:</strong> Type AB+ plasma contains neither Anti-A nor Anti-B antibodies. It can be safely given to all recipients.
                </div>
              )}
              {selectedBloodType === 'O-' && selectedComponent === 'PLASMA' && personRole === 'RECIPIENT' && (
                <div className="mt-4 p-3 bg-[#eef7f0] border border-[#a8d5b1] rounded text-xs text-[#1a532b] font-serif">
                  ❖ <strong>Universal Plasma Recipient:</strong> Type O− red cells have no A or B antigens, so any donor plasma can be received safely without cell lysis.
                </div>
              )}
            </div>

          {/* INCOMPATIBLE SECTION */}
          {incompatibleTypes.length > 0 && (
            <div className="bg-[#fcf5f5] border border-[#e8c0c4] p-5 rounded-lg">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="w-5 h-5 text-[#8b1d2c]" />
                <h3 className="font-serif text-lg font-bold text-[#8b1d2c] tracking-wide">
                  {personRole === 'DONOR'
                    ? 'CANNOT DONATE BLOOD TO (CONTRAINDICATED):'
                    : 'CANNOT RECEIVE BLOOD FROM (CONTRAINDICATED):'}
                </h3>
              </div>

              <p className="text-xs font-serif italic text-[#72363e] mb-4">
                {personRole === 'DONOR'
                  ? 'Transfusing to any of these blood types will cause acute antibody-mediated hemolysis:'
                  : 'Receiving units from these blood types will trigger hemolytic transfusion reactions:'}
              </p>

              {/* List of Incompatible Blood Types */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {incompatibleTypes.map((type) => (
                  <div
                    key={type}
                    className="p-3 rounded border border-[#f0d0d4] bg-[#ffffff] text-center text-[#802a35]"
                  >
                    <div className="flex items-center justify-center gap-1.5 font-serif font-bold text-xl text-[#9c2b39]">
                      <X className="w-4 h-4 text-[#8b1d2c] stroke-[2.5]" />
                      <span>{type}</span>
                    </div>
                    <span className="text-[10px] font-sans uppercase tracking-wider block mt-1 text-[#8b3d48]">
                      Incompatible
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

        {/* Immunological Basis Footer in Classic Plate Style */}
        <div className="mt-8 pt-6 border-t border-[#ded7c8] grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-serif text-[#4d4235]">
          <div className="p-3 bg-[#fbf9f4] rounded border border-[#ded7c8]">
            <span className="font-sans font-bold uppercase text-[10px] tracking-wider text-[#7a6b57] block mb-1">
              RBC Surface Antigens
            </span>
            <p className="text-sm font-semibold text-[#29221b]">
              {currentProps.rbcAntigens.join(', ')}
            </p>
            <p className="text-[11px] text-[#706250] mt-0.5">
              Molecular structures present on red cell membrane
            </p>
          </div>

          <div className="p-3 bg-[#fbf9f4] rounded border border-[#ded7c8]">
            <span className="font-sans font-bold uppercase text-[10px] tracking-wider text-[#7a6b57] block mb-1">
              Serum Isohemagglutinins
            </span>
            <p className="text-sm font-semibold text-[#29221b]">
              {currentProps.plasmaAntibodies.length > 0
                ? currentProps.plasmaAntibodies.join(', ')
                : 'None Present'}
            </p>
            <p className="text-[11px] text-[#706250] mt-0.5">
              Circulating antibodies in blood plasma
            </p>
          </div>

          <div className="p-3 bg-[#fbf9f4] rounded border border-[#ded7c8]">
            <span className="font-sans font-bold uppercase text-[10px] tracking-wider text-[#7a6b57] block mb-1">
              Rhesus (RhD) Factor
            </span>
            <p className="text-sm font-semibold text-[#29221b]">
              {currentProps.rh === '+' ? 'RhD Positive (+)' : 'RhD Negative (−)'}
            </p>
            <p className="text-[11px] text-[#706250] mt-0.5">
              {currentProps.rh === '+'
                ? 'Can receive both Rh+ and Rh− RBCs'
                : 'Can receive ONLY Rh− RBCs'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
