import React, { useState } from 'react';
import {
  ALL_BLOOD_GROUPS,
  BLOOD_PROPERTIES_MAP,
  getCompatibleRecipientTypes,
  getCompatibleDonorTypes
} from '../../utils/compatibility';
import { BloodComponent } from '../../types/blood';
import { Dna, Droplet, Layers } from 'lucide-react';

export const BioLedgerTable: React.FC = () => {
  const [component, setComponent] = useState<BloodComponent>('RBC');

  return (
    <div className="bio-card p-6 sm:p-8 rounded-xl border border-[#d1e2da] space-y-5">
      <div className="border-b border-[#d1e2da] pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Dna className="w-4 h-4 text-[#059669]" />
            <span className="text-xs font-bold uppercase tracking-wider text-[#059669]">
              Immunohematology Matrix
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-[#064e3b] mt-0.5">
            Master Compatibility Ledger ({component === 'RBC' ? 'Red Blood Cells' : 'Blood Plasma'})
          </h3>
          <p className="text-xs text-[#3b6b59] mt-0.5">
            Full ABO &amp; RhD compatibility breakdown across all eight human blood phenotypes.
          </p>
        </div>

        {/* Component Switcher */}
        <div className="flex p-1 bg-[#eef6f2] rounded-lg border border-[#d1e2da] self-start sm:self-auto text-xs">
          <button
            onClick={() => setComponent('RBC')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              component === 'RBC'
                ? 'bg-[#064e3b] text-white shadow-xs'
                : 'text-[#2d614e] hover:text-[#064e3b]'
            }`}
          >
            Red Cells (PRBC)
          </button>
          <button
            onClick={() => setComponent('PLASMA')}
            className={`px-3 py-1.5 rounded-md font-bold transition-all ${
              component === 'PLASMA'
                ? 'bg-[#064e3b] text-white shadow-xs'
                : 'text-[#2d614e] hover:text-[#064e3b]'
            }`}
          >
            Plasma (FFP) [Inverse]
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#a7ddc7] bg-[#f0f7f4] text-[#065f46] text-[11px] uppercase tracking-wider font-extrabold">
              <th className="py-3.5 px-3">Phenotype</th>
              <th className="py-3.5 px-3">Can Donate To</th>
              <th className="py-3.5 px-3">Can Receive From</th>
              <th className="py-3.5 px-3">RBC Surface Antigens</th>
              <th className="py-3.5 px-3">Circulating Plasma Antibodies</th>
              <th className="py-3.5 px-3 text-right">Population %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e2efe8]">
            {ALL_BLOOD_GROUPS.map((type) => {
              const props = BLOOD_PROPERTIES_MAP[type];
              const canGiveTo = getCompatibleRecipientTypes(type, component);
              const canReceiveFrom = getCompatibleDonorTypes(type, component);
              const isUnivDonor = component === 'RBC' ? props.isUniversalRbcDonor : props.isUniversalPlasmaDonor;
              const isUnivRecip = component === 'RBC' ? props.isUniversalRbcRecipient : props.isUniversalPlasmaRecipient;

              return (
                <tr
                  key={type}
                  className={`hover:bg-[#f6faf8] transition-colors ${
                    isUnivDonor ? 'bg-[#ecfdf5]/80' : isUnivRecip ? 'bg-[#f0fdf4]/80' : ''
                  }`}
                >
                  <td className="py-3.5 px-3">
                    <span className="font-mono font-bold text-base text-[#064e3b]">
                      {type}
                    </span>
                    {isUnivDonor && (
                      <span className="block text-[9px] uppercase tracking-wider font-bold text-[#059669]">
                        Universal Donor
                      </span>
                    )}
                    {isUnivRecip && (
                      <span className="block text-[9px] uppercase tracking-wider font-bold text-[#0284c7]">
                        Universal Recipient
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-mono font-medium flex flex-wrap gap-1">
                      {canGiveTo.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 bg-white border border-[#a7ddc7] rounded text-[#065f46] text-[11px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-3">
                    <div className="font-mono font-medium flex flex-wrap gap-1">
                      {canReceiveFrom.map((t) => (
                        <span key={t} className="px-1.5 py-0.5 bg-white border border-[#a7ddc7] rounded text-[#065f46] text-[11px]">
                          {t}
                        </span>
                      ))}
                    </div>
                  </td>

                  <td className="py-3.5 px-3 text-[#374151]">
                    {props.rbcAntigens.join(', ')}
                  </td>

                  <td className="py-3.5 px-3 text-[#374151]">
                    {props.plasmaAntibodies.length > 0 ? props.plasmaAntibodies.join(', ') : 'None'}
                  </td>

                  <td className="py-3.5 px-3 text-right font-mono font-bold text-[#065f46]">
                    {props.populationFrequencyPct}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pt-3 border-t border-[#d1e2da] flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#527d6d]">
        <div>
          🔬 <strong>Biological Rule:</strong> Donor cells must never express antigens targeted by recipient circulating isohemagglutinins.
        </div>
        <div className="text-[#059669] font-bold">
          Standard AABB &amp; WHO Transfusion Protocols
        </div>
      </div>
    </div>
  );
};
