import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  XCircle,
  HelpCircle,
  AlertTriangle,
  Droplet,
  ShieldAlert,
  Dna,
  Layers
} from 'lucide-react';
import { ALL_BLOOD_GROUPS, isBloodCompatible, BLOOD_PROPERTIES_MAP } from '../../utils/compatibility';
import { BloodComponent, BloodGroup } from '../../types/blood';

export const ReferenceView: React.FC = () => {
  const [componentMode, setComponentMode] = useState<BloodComponent>('RBC');
  const [hoveredPair, setHoveredPair] = useState<{ donor: BloodGroup; recipient: BloodGroup } | null>(null);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-rose-700 font-semibold uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Hematology & Immunogenetics Compendium</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Universal Blood Compatibility Matrix & Clinical Guide
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Understand ABO/Rh immunohematology, component fractionation rules, and transfusion reactions.
            </p>
          </div>

          {/* Component switcher */}
          <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200 self-start md:self-auto">
            <button
              onClick={() => setComponentMode('RBC')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                componentMode === 'RBC'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Red Blood Cells (PRBC)
            </button>
            <button
              onClick={() => setComponentMode('PLASMA')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                componentMode === 'PLASMA'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Plasma (FFP) [Inverse Rules]
            </button>
            <button
              onClick={() => setComponentMode('WHOLE_BLOOD')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                componentMode === 'WHOLE_BLOOD'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Whole Blood
            </button>
          </div>
        </div>
      </div>

      {/* 8x8 Interactive Matrix Grid */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              8×8 Transfusion Cross-Matching Grid ({componentMode === 'RBC' ? 'Packed Red Cells' : componentMode === 'PLASMA' ? 'Plasma (Inverse)' : 'Whole Blood'})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Horizontal: Recipient Target · Vertical: Donor Candidate. Hover over any cell to see immunological interaction.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Compatible
            </span>
            <span className="flex items-center gap-1.5 text-slate-400 font-semibold">
              <XCircle className="w-4 h-4 text-red-400" /> Incompatible
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              <tr>
                <th className="p-2 border border-slate-200 bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
                  Donor \ Recipient
                </th>
                {ALL_BLOOD_GROUPS.map((recipient) => (
                  <th
                    key={recipient}
                    className="p-2.5 border border-slate-200 bg-slate-50 font-bold text-slate-900"
                  >
                    {recipient}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ALL_BLOOD_GROUPS.map((donor) => (
                <tr key={donor}>
                  <td className="p-2.5 border border-slate-200 bg-slate-50 font-bold text-slate-900 text-left">
                    <span className="inline-block w-8 text-center bg-rose-50 text-rose-800 rounded border border-rose-200 mr-2">
                      {donor}
                    </span>
                    <span className="text-[10px] text-slate-500 font-normal hidden sm:inline">
                      ({BLOOD_PROPERTIES_MAP[donor].abo}{BLOOD_PROPERTIES_MAP[donor].rh})
                    </span>
                  </td>
                  {ALL_BLOOD_GROUPS.map((recipient) => {
                    const compatible = isBloodCompatible(donor, recipient, componentMode);
                    const isExact = donor === recipient;

                    return (
                      <td
                        key={recipient}
                        onMouseEnter={() => setHoveredPair({ donor, recipient })}
                        onMouseLeave={() => setHoveredPair(null)}
                        className={`p-2.5 border border-slate-200 transition-colors cursor-pointer ${
                          compatible
                            ? isExact
                              ? 'bg-emerald-100/70 hover:bg-emerald-200/80 font-bold text-emerald-900'
                              : 'bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-800'
                            : 'bg-slate-50/50 hover:bg-red-50 text-slate-300'
                        }`}
                      >
                        {compatible ? (
                          <div className="flex items-center justify-center gap-1">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                          </div>
                        ) : (
                          <span className="text-slate-300 font-mono text-[11px]">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Hover detail inspector */}
        {hoveredPair && (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fade-in">
            <div>
              <span className="font-bold text-slate-900">
                Evaluating Donor {hoveredPair.donor} → Recipient {hoveredPair.recipient} ({componentMode})
              </span>
              <p className="text-slate-600 mt-0.5">
                {isBloodCompatible(hoveredPair.donor, hoveredPair.recipient, componentMode)
                  ? `Immunologically SAFE: Recipient does not possess circulating antibodies targeting Donor ${hoveredPair.donor} antigens.`
                  : `CONTRAINDICATED: Incompatibility reaction! Recipient antibodies will cause acute complement activation and hemolysis.`}
              </p>
            </div>
            <span className={`px-2.5 py-1 rounded text-xs font-bold shrink-0 ${
              isBloodCompatible(hoveredPair.donor, hoveredPair.recipient, componentMode)
                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                : 'bg-red-100 text-red-800 border border-red-300'
            }`}>
              {isBloodCompatible(hoveredPair.donor, hoveredPair.recipient, componentMode) ? 'Compatible' : 'Incompatible'}
            </span>
          </div>
        )}
      </div>

      {/* Explanatory Cards: Immunological Mechanics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
            <Droplet className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">The RBC Transfusion Rule</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            In red cell transfusions, packed cells are infused into the recipient’s existing blood volume. Safety depends entirely on ensuring the recipient’s <strong>antibodies</strong> do not attack the donor’s <strong>RBC surface antigens</strong>.
          </p>
          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
            <strong>O- is the Universal RBC Donor</strong> because its cells have zero A, B, or RhD antigens.
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Layers className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">The Plasma Inverse Rule</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            Fresh Frozen Plasma contains no red blood cells, only liquid serum and antibodies. Here, donor antibodies must not attack recipient red cells!
          </p>
          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
            <strong>AB+ is the Universal Plasma Donor</strong> because its plasma contains neither Anti-A nor Anti-B antibodies!
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-3 shadow-xs">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700">
            <Dna className="w-4 h-4" />
          </div>
          <h4 className="text-sm font-bold text-slate-900">Rh Factor & Sensitization</h4>
          <p className="text-xs text-slate-600 leading-relaxed">
            The RhD protein is the most immunogenic RBC antigen. Unlike ABO, people do not naturally possess Anti-D antibodies; they produce them only after exposure (transfusion or pregnancy).
          </p>
          <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-200">
            Rh- females &lt;50 must never receive Rh+ blood to protect future pregnancies from HDFN.
          </div>
        </div>
      </div>

      {/* Rare Blood Phenotypes & Special Cases */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-5 h-5 text-rose-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Rare Phenotypes & Transfusion Hazards
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-600">
          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 block">The Bombay Phenotype (hh)</span>
            <p className="leading-relaxed">
              Individuals with the rare homozygous recessive `hh` genotype cannot synthesize the basic H-antigen precursor. Even standard O-negative blood will cause fatal hemolytic reactions because their plasma contains strong <strong>Anti-H antibodies</strong>. They can ONLY receive blood from other Bombay phenotype individuals.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 block">Rh-Null ("Golden Blood")</span>
            <p className="leading-relaxed">
              Completely lacks all 61 antigens in the Rh system. Individuals have altered red cell membranes (stomatocytosis) and mild chronic hemolytic anemia. Their blood is universally compatible for any patient with rare Rh antibodies, but they can only receive blood from another Rh-null donor.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 block">Acute Hemolytic Transfusion Reaction (AHTR)</span>
            <p className="leading-relaxed">
              Occurs when incompatible RBCs are transfused. Anti-A or Anti-B IgM antibodies trigger intravascular complement cascade, producing massive hemolysis, free hemoglobinemia, acute tubular necrosis, DIC, and shock.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
            <span className="font-bold text-slate-900 block">TRALI vs TACO</span>
            <p className="leading-relaxed">
              Transfusion-Related Acute Lung Injury (TRALI) is caused by donor anti-HLA/anti-HNA antibodies activating recipient neutrophils in pulmonary capillaries. Transfusion-Associated Circulatory Overload (TACO) is hydrostatic pulmonary edema from excessive volume infusion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
