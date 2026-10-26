import React, { useState } from 'react';
import { BloodGroup, BloodComponent } from '../../types/blood';
import { ALL_BLOOD_GROUPS, isBloodCompatible, BLOOD_PROPERTIES_MAP } from '../../utils/compatibility';
import { CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

export const DirectPairChecker: React.FC = () => {
  const [donorType, setDonorType] = useState<BloodGroup>('O-');
  const [recipientType, setRecipientType] = useState<BloodGroup>('A+');
  const [component, setComponent] = useState<BloodComponent>('RBC');

  const compatible = isBloodCompatible(donorType, recipientType, component);
  const donorProps = BLOOD_PROPERTIES_MAP[donorType];
  const recipientProps = BLOOD_PROPERTIES_MAP[recipientType];

  // Specific explanation of why or why not
  let explanation = '';
  if (compatible) {
    if (donorType === recipientType) {
      explanation = `Exact ABO and Rh match (${donorType} to ${recipientType}). No antigen-antibody conflict exists. Fully safe for transfusion.`;
    } else {
      explanation = `Compatible transfusion. Recipient ${recipientType} plasma does not contain antibodies that will react against Donor ${donorType} red cell antigens.`;
    }
  } else {
    const reasons: string[] = [];
    const donorHasA = donorProps.abo === 'A' || donorProps.abo === 'AB';
    const donorHasB = donorProps.abo === 'B' || donorProps.abo === 'AB';
    const recipientHasAntiA = recipientProps.plasmaAntibodies.includes('Anti-A');
    const recipientHasAntiB = recipientProps.plasmaAntibodies.includes('Anti-B');

    if (donorHasA && recipientHasAntiA) {
      reasons.push(`Recipient's Anti-A antibodies will attack Donor's A-antigens`);
    }
    if (donorHasB && recipientHasAntiB) {
      reasons.push(`Recipient's Anti-B antibodies will attack Donor's B-antigens`);
    }
    if (donorProps.rh === '+' && recipientProps.rh === '-') {
      reasons.push(`Rh Incompatibility: Donor is RhD(+) and recipient is RhD(−), triggering severe sensitization`);
    }

    explanation = reasons.join('; ') + '. High risk of Acute Hemolytic Transfusion Reaction!';
  }

  return (
    <div className="parchment-card p-6 sm:p-8 rounded-lg border border-[#ded7c8] space-y-6">
      <div className="border-b border-[#ded7c8] pb-4">
        <span className="text-[11px] font-sans uppercase tracking-[0.2em] text-[#8a7a65] font-semibold">
          Direct Cross-Verification
        </span>
        <h3 className="text-xl sm:text-2xl font-serif text-[#29221b] mt-0.5">
          Can Donor Blood be Given to this Recipient?
        </h3>
        <p className="text-xs font-serif italic text-[#635647] mt-1">
          Select any donor and recipient pair to inspect immunological compatibility immediately.
        </p>
      </div>

      {/* Selectors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* Donor Selector */}
        <div className="bg-[#faf7f0] p-4 rounded border border-[#ded7c8]">
          <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#7a6b57] mb-2">
            Donor Blood Type
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {ALL_BLOOD_GROUPS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setDonorType(t)}
                className={`py-2 px-1 text-center rounded border font-serif font-bold text-base transition-all ${
                  donorType === t
                    ? 'bg-[#8b1d2c] text-white border-[#721422] shadow-xs'
                    : 'bg-white text-[#29221b] border-[#ded7c8] hover:bg-[#f5efe4]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Arrow / Direction indicator */}
        <div className="flex flex-col items-center justify-center text-center py-2">
          <div className="w-10 h-10 rounded-full border border-[#ded7c8] bg-[#ffffff] flex items-center justify-center text-[#8b1d2c] shadow-xs mb-2">
            <ArrowRight className="w-5 h-5" />
          </div>
          <span className="text-xs font-serif italic text-[#706250]">
            Infusion into
          </span>
          <div className="mt-2 flex gap-1 p-0.5 bg-[#f4efe4] rounded border border-[#ded7c8]">
            <button
              onClick={() => setComponent('RBC')}
              className={`px-2 py-0.5 text-[11px] font-serif rounded ${
                component === 'RBC' ? 'bg-white font-bold text-[#8b1d2c]' : 'text-[#6e6050]'
              }`}
            >
              PRBC
            </button>
            <button
              onClick={() => setComponent('PLASMA')}
              className={`px-2 py-0.5 text-[11px] font-serif rounded ${
                component === 'PLASMA' ? 'bg-white font-bold text-[#8b1d2c]' : 'text-[#6e6050]'
              }`}
            >
              Plasma
            </button>
          </div>
        </div>

        {/* Recipient Selector */}
        <div className="bg-[#faf7f0] p-4 rounded border border-[#ded7c8]">
          <label className="block text-[11px] font-sans font-bold uppercase tracking-wider text-[#7a6b57] mb-2">
            Recipient Blood Type
          </label>
          <div className="grid grid-cols-4 gap-1.5">
            {ALL_BLOOD_GROUPS.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setRecipientType(t)}
                className={`py-2 px-1 text-center rounded border font-serif font-bold text-base transition-all ${
                  recipientType === t
                    ? 'bg-[#8b1d2c] text-white border-[#721422] shadow-xs'
                    : 'bg-white text-[#29221b] border-[#ded7c8] hover:bg-[#f5efe4]'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Classic Stamp Result */}
      <div className={`p-6 rounded-lg border-2 text-center transition-all ${
        compatible
          ? 'bg-[#f7fbf8] border-[#216e39] text-[#19532b]'
          : 'bg-[#fcf5f5] border-[#8b1d2c] text-[#8b1d2c]'
      }`}>
        <div className="inline-flex items-center justify-center gap-2 mb-2">
          {compatible ? (
            <CheckCircle2 className="w-6 h-6 text-[#216e39]" />
          ) : (
            <XCircle className="w-6 h-6 text-[#8b1d2c]" />
          )}
          <span className="font-serif font-bold text-xl sm:text-2xl uppercase tracking-wider">
            {compatible ? 'COMPATIBLE — SAFE TO DONATE' : 'INCOMPATIBLE — DO NOT TRANSFUSE'}
          </span>
        </div>

        <p className="font-serif text-sm max-w-2xl mx-auto leading-relaxed mt-2 text-[#29221b]">
          {explanation}
        </p>

        <div className="mt-4 pt-3 border-t border-[#ded7c8] flex flex-wrap items-center justify-center gap-4 text-xs font-serif text-[#635647]">
          <span>Donor {donorType}: Antigens [{donorProps.rbcAntigens.join(', ')}]</span>
          <span>·</span>
          <span>Recipient {recipientType}: Antibodies [{recipientProps.plasmaAntibodies.join(', ') || 'None'}]</span>
        </div>
      </div>
    </div>
  );
};
