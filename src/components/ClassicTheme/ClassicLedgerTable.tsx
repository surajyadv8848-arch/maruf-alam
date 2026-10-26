import React from 'react';
import { ALL_BLOOD_GROUPS, BLOOD_PROPERTIES_MAP, getCompatibleRecipientTypes, getCompatibleDonorTypes } from '../../utils/compatibility';

export const ClassicLedgerTable: React.FC = () => {
  return (
    <div className="parchment-card p-6 sm:p-8 rounded-lg border border-[#ded7c8] space-y-4">
      <div className="border-b border-[#ded7c8] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <span className="text-[11px] font-sans uppercase tracking-[0.2em] text-[#8a7a65] font-semibold">
            Universal Transfusion Registry
          </span>
          <h3 className="text-xl sm:text-2xl font-serif text-[#29221b] mt-0.5">
            Classical Master Compatibility Ledger
          </h3>
          <p className="text-xs font-serif italic text-[#635647] mt-1">
            Red Blood Cell (Packed RBC) and Whole Blood Compatibility across all eight phenotypes.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs font-serif">
          <thead>
            <tr className="border-b-2 border-[#cbbba0] bg-[#faf6ee] text-[#524536] text-[11px] uppercase tracking-wider font-sans font-bold">
              <th className="py-3 px-3">Blood Type</th>
              <th className="py-3 px-3">Can Donate To</th>
              <th className="py-3 px-3">Can Receive From</th>
              <th className="py-3 px-3">RBC Antigens</th>
              <th className="py-3 px-3">Serum Antibodies</th>
              <th className="py-3 px-3 text-right">Prevalence</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e8e2d4]">
            {ALL_BLOOD_GROUPS.map((type) => {
              const props = BLOOD_PROPERTIES_MAP[type];
              const canGiveTo = getCompatibleRecipientTypes(type, 'RBC');
              const canReceiveFrom = getCompatibleDonorTypes(type, 'RBC');
              const isUnivDonor = props.isUniversalRbcDonor;
              const isUnivRecip = props.isUniversalRbcRecipient;

              return (
                <tr
                  key={type}
                  className={`hover:bg-[#faf7f0] transition-colors ${
                    isUnivDonor ? 'bg-[#f7fbf8]/70' : isUnivRecip ? 'bg-[#f8f9fc]/70' : ''
                  }`}
                >
                  <td className="py-3.5 px-3">
                    <span className="font-bold text-base text-[#8b1d2c] font-serif">
                      {type}
                    </span>
                    {isUnivDonor && (
                      <span className="block text-[9px] uppercase tracking-wider font-sans font-bold text-[#216e39]">
                        Universal Donor
                      </span>
                    )}
                    {isUnivRecip && (
                      <span className="block text-[9px] uppercase tracking-wider font-sans font-bold text-[#1d4ed8]">
                        Universal Recipient
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-sans font-medium text-slate-800 flex flex-wrap gap-1">
                      {canGiveTo.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 bg-white border border-[#ded7c8] rounded text-[11px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-sans font-medium text-slate-800 flex flex-wrap gap-1">
                      {canReceiveFrom.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 bg-white border border-[#ded7c8] rounded text-[11px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-[#4a3f33]">
                    {props.rbcAntigens.join(', ')}
                  </td>

                  <td className="py-3.5 px-3 text-[#4a3f33]">
                    {props.plasmaAntibodies.length > 0 ? props.plasmaAntibodies.join(', ') : 'None'}
                  </td>

                  <td className="py-3.5 px-3 text-right font-sans font-semibold text-[#6e5f4e]">
                    {props.populationFrequencyPct}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pt-3 border-t border-[#ded7c8] flex flex-wrap items-center justify-between gap-3 text-[11px] font-serif text-[#706250]">
        <div>
          ❖ <strong>Red Blood Cells Rule:</strong> Donor cells must never contain antigens against which recipient serum possesses antibodies.
        </div>
        <div className="text-[#8b1d2c]">
          Reference: Standard Immunohematology Protocol
        </div>
      </div>
    </div>
  );
};
