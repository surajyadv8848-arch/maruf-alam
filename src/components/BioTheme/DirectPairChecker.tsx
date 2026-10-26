import React, { useState } from 'react';
import { BloodGroup, BloodComponent } from '../../types/blood';
import { ALL_BLOOD_GROUPS, isBloodCompatible, BLOOD_PROPERTIES_MAP } from '../../utils/compatibility';
import { CheckCircle2, AlertTriangle, ArrowRight, Dna } from 'lucide-react';
import confetti from 'canvas-confetti';

export const DirectPairChecker: React.FC = () => {
  const [donorType, setDonorType] = useState<BloodGroup>('O-');
  const [recipientType, setRecipientType] = useState<BloodGroup>('A+');
  const [component, setComponent] = useState<BloodComponent>('RBC');

  const compatible = isBloodCompatible(donorType, recipientType, component);
  const donorProps = BLOOD_PROPERTIES_MAP[donorType];
  const recipientProps = BLOOD_PROPERTIES_MAP[recipientType];

  let explanation = '';
  if (compatible) {
    if (donorType === recipientType) {
      explanation = `Exact ABO and RhD identical crossmatch (${donorType} to ${recipientType}). No antigen-antibody conflict detected. Safe for infusion.`;
    } else {
      explanation = `Compatible alternate transfusion. Recipient ${recipientType} plasma does not contain antibodies that will react against Donor ${donorType} red cell antigens.`;
    }
  } else {
    const reasons: string[] = [];
    const donorHasA = donorProps.abo === 'A' || donorProps.abo === 'AB';
    const donorHasB = donorProps.abo === 'B' || donorProps.abo === 'AB';
    const recipientHasAntiA = recipientProps.plasmaAntibodies.includes('Anti-A');
    const recipientHasAntiB = recipientProps.plasmaAntibodies.includes('Anti-B');

    if (donorHasA && recipientHasAntiA) {
      reasons.push(`Recipient circulating Anti-A antibodies will bind and lyse Donor A-antigens`);
    }
    if (donorHasB && recipientHasAntiB) {
      reasons.push(`Recipient circulating Anti-B antibodies will bind and lyse Donor B-antigens`);
    }
    if (donorProps.rh === '+' && recipientProps.rh === '-') {
      reasons.push(`Rh Factor Mismatch: Donor expresses RhD protein which will cause severe sensitization in RhD(−) recipient`);
    }

    explanation = reasons.join('; ') + '. High risk of Acute Hemolytic Transfusion Reaction (AHTR)!';
  }

  const handleTestDirectPair = () => {
    if (compatible) {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#10b981', '#059669', '#0d9488'],
      });
    }
  };

  return (
    <div className="bio-card p-6 sm:p-8 rounded-xl border border-[#d1e2da] space-y-6">
      <div className="border-b border-[#d1e2da] pb-4">
        <div className="flex items-center gap-2">
          <Dna className="w-4 h-4 text-[#059669]" />
          <span className="text-xs font-bold uppercase tracking-wider text-[#059669]">
            Direct Serological Cross-Verification
          </span>
        </div>
        <h3 className="text-xl sm:text-2xl font-extrabold text-[#064e3b] mt-1">
          Can This Donor Blood be Given to this Recipient?
        </h3>
        <p className="text-xs text-[#3b6b59] mt-1">
          Select any donor and recipient combination to simulate immediate immunological crossmatching.
        </p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Donor Selector */}
        <div className="bg-[#f0f7f4] p-4 rounded-xl border border-[#bcd3c6]">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#2d614e] mb-2.5">
            Donor Blood Type:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {ALL_BLOOD_GROUPS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setDonorType(t);
                  handleTestDirectPair();
                }}
                className={`py-2 px-1 text-center rounded-lg border font-mono font-bold text-base transition-all ${
                  donorType === t
                    ? 'bg-[#e11d48] text-white border-[#be123c] shadow-xs'
                    : 'bg-white text-[#0f2922] border-[#d1e2da] hover:bg-[#eef6f2]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Arrow / Direction indicator */}
        <div className="flex flex-col items-center justify-center text-center py-2">
          <div className="w-10 h-10 rounded-full border border-[#a7ddc7] bg-[#e1f5ec] flex items-center justify-center text-[#065f46] shadow-xs mb-2">
            <ArrowRight className="w-5 h-5 stroke-[2.5]" />
          </div>
          <span className="text-xs text-[#3b6b59] font-medium">
            Infusion direction
          </span>
          <div className="mt-2 flex gap-1 p-0.5 bg-[#eef6f2] rounded-lg border border-[#d1e2da]">
            <button
              onClick={() => setComponent('RBC')}
              className={`px-2.5 py-1 text-xs rounded-md font-bold transition-all ${
                component === 'RBC' ? 'bg-white text-[#064e3b] shadow-xs' : 'text-[#5a8775]'
              }`}
            >
              PRBC
            </button>
            <button
              onClick={() => setComponent('PLASMA')}
              className={`px-2.5 py-1 text-xs rounded-md font-bold transition-all ${
                component === 'PLASMA' ? 'bg-white text-[#064e3b] shadow-xs' : 'text-[#5a8775]'
              }`}
            >
              Plasma
            </button>
          </div>
        </div>

        {/* Recipient Selector */}
        <div className="bg-[#f0f7f4] p-4 rounded-xl border border-[#bcd3c6]">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#2d614e] mb-2.5">
            Recipient Blood Type:
          </label>
          <div className="grid grid-cols-4 gap-2">
            {ALL_BLOOD_GROUPS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setRecipientType(t);
                  handleTestDirectPair();
                }}
                className={`py-2 px-1 text-center rounded-lg border font-mono font-bold text-base transition-all ${
                  recipientType === t
                    ? 'bg-[#064e3b] text-white border-[#064e3b] shadow-xs'
                    : 'bg-white text-[#0f2922] border-[#d1e2da] hover:bg-[#eef6f2]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Result Stamp Card with celebrate/shake feedback */}
      <div className={`p-6 rounded-xl border-2 text-center transition-all ${
        compatible
          ? 'bg-[#ecfdf5] border-[#10b981] text-[#065f46] animate-bio-celebrate'
          : 'bg-[#fff1f2] border-[#e11d48] text-[#be123c] animate-bio-shake'
      }`}>
        <div className="inline-flex items-center justify-center gap-2 mb-2">
          {compatible ? (
            <CheckCircle2 className="w-6 h-6 text-[#059669] stroke-[2.5]" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-[#e11d48] stroke-[2.5]" />
          )}
          <span className="font-extrabold text-xl sm:text-2xl uppercase tracking-wider">
            {compatible ? 'COMPATIBLE — SAFE TO DONATE' : 'INCOMPATIBLE — CONTRAINDICATED'}
          </span>
        </div>

        <p className="text-xs sm:text-sm max-w-2xl mx-auto leading-relaxed mt-2 text-[#0f2922]">
          {explanation}
        </p>

        <div className="mt-4 pt-3 border-t border-black/10 flex flex-wrap items-center justify-center gap-4 text-xs text-[#4b5563]">
          <span>Donor {donorType}: Antigens [<strong>{donorProps.rbcAntigens.join(', ')}</strong>]</span>
          <span>·</span>
          <span>Recipient {recipientType}: Antibodies [<strong>{recipientProps.plasmaAntibodies.join(', ') || 'None'}</strong>]</span>
        </div>
      </div>
    </div>
  );
};
