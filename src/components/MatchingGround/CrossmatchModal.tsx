import React from 'react';
import { X, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { BloodGroup, BloodComponent, Donor } from '../../types/blood';
import { simulateCrossmatch, BLOOD_PROPERTIES_MAP } from '../../utils/compatibility';

interface CrossmatchModalProps {
  donor: Donor;
  recipientBloodType: BloodGroup;
  recipientName?: string;
  component: BloodComponent;
  onClose: () => void;
  onDispatch: () => void;
}

export const CrossmatchModal: React.FC<CrossmatchModalProps> = ({
  donor,
  recipientBloodType,
  recipientName = 'Patient in Bedside Care',
  component,
  onClose,
  onDispatch,
}) => {
  const sim = simulateCrossmatch(donor.bloodType, recipientBloodType, component, donor.id);
  const donorProps = BLOOD_PROPERTIES_MAP[donor.bloodType];
  const recipientProps = BLOOD_PROPERTIES_MAP[recipientBloodType];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Virtual Serological Crossmatch Simulator
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Laboratory Coombs & Agglutination Test Protocol
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 transition-colors p-1"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Visual Pair Comparison */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
            <div>
              <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Donor Candidate</span>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{donor.fullName}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded">
                  {donor.bloodType}
                </span>
                <span className="text-xs text-slate-600">
                  Antigens: {donorProps.rbcAntigens.join(', ')}
                </span>
              </div>
            </div>

            <div className="border-l border-slate-200 pl-4">
              <span className="text-xs text-slate-500 uppercase tracking-wider font-medium">Recipient Target</span>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{recipientName}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-lg font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-0.5 rounded">
                  {recipientBloodType}
                </span>
                <span className="text-xs text-slate-600">
                  Antibodies: {recipientProps.plasmaAntibodies.join(', ')}
                </span>
              </div>
            </div>
          </div>

          {/* Test Wells Visual Simulation */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Major Crossmatch */}
            <div className={`p-4 rounded-lg border ${
              sim.majorCrossmatchAgglutination
                ? 'bg-red-50/70 border-red-200 text-red-950'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Major Crossmatch
                </span>
                {sim.majorCrossmatchAgglutination ? (
                  <span className="text-xs font-bold text-red-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Agglutination (Failed)
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Negative (Safe)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Recipient Serum + Donor Red Blood Cells (Immediate spin & 37°C incubation)
              </p>
              <div className="h-16 rounded border bg-white flex items-center justify-center p-2">
                {sim.majorCrossmatchAgglutination ? (
                  <div className="flex items-center gap-2 text-xs text-red-700 font-medium">
                    <div className="w-6 h-6 rounded-full bg-red-200 border-2 border-red-500 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-red-600"></span>
                    </div>
                    <span>Agglutinated clumps observed. Severe hemolysis imminent!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 opacity-60"></span>
                    </div>
                    <span>Homogeneous cell suspension. No hemolysis detected.</span>
                  </div>
                )}
              </div>
            </div>

            {/* Minor Crossmatch */}
            <div className={`p-4 rounded-lg border ${
              sim.minorCrossmatchAgglutination
                ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">
                  Minor Crossmatch
                </span>
                {sim.minorCrossmatchAgglutination ? (
                  <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Minor Reaction
                  </span>
                ) : (
                  <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Negative (Safe)
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mb-3">
                Recipient Red Cells + Donor Serum (Evaluates donor antibodies vs host)
              </p>
              <div className="h-16 rounded border bg-white flex items-center justify-center p-2">
                {sim.minorCrossmatchAgglutination ? (
                  <div className="flex items-center gap-2 text-xs text-amber-700 font-medium">
                    <div className="w-6 h-6 rounded-full bg-amber-200 border-2 border-amber-500 flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                    </div>
                    <span>Minor donor isohemagglutinin titer detected.</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-emerald-700 font-medium">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 border border-emerald-400 flex items-center justify-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 opacity-60"></span>
                    </div>
                    <span>Clear. No anti-host antibodies detected in donor serum.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Immunological Rationale */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs space-y-1.5">
            <span className="font-semibold text-slate-900 block">Clinical Assessment</span>
            <p className="text-slate-700 leading-relaxed">
              {sim.immunologicalExplanation}
            </p>
            <p className="text-slate-500">
              Component: <span className="font-medium text-slate-800">{component}</span> · 
              Donor clearance status: <span className="font-medium text-slate-800">{donor.medicalClearance ? 'Passed' : 'Pending'}</span> · 
              CMV Negative: <span className="font-medium text-slate-800">{donor.isCmvNegative ? 'Yes' : 'No'}</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors"
          >
            Dismiss
          </button>

          {sim.verdict === 'COMPATIBLE' ? (
            <button
              onClick={() => {
                onClose();
                onDispatch();
              }}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium shadow-xs transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Verify & Dispatch Call</span>
            </button>
          ) : (
            <div className="text-xs text-red-600 font-semibold flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              <span>Transfusion Contraindicated (Crossmatch Positive)</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
