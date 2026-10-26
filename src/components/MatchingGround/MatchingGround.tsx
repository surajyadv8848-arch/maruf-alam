import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Send,
  Droplet,
  Heart,
  ChevronRight,
  Info,
  MapPin,
  Sparkles
} from 'lucide-react';
import { BloodGroup, BloodComponent, Donor, RecipientRequest } from '../../types/blood';
import {
  ALL_BLOOD_GROUPS,
  BLOOD_PROPERTIES_MAP,
  getCompatibleDonorTypes,
  getCompatibleRecipientTypes,
  scoreDonorForRecipient,
  isBloodCompatible
} from '../../utils/compatibility';
import { CrossmatchModal } from './CrossmatchModal';
import { DispatchModal } from './DispatchModal';

interface MatchingGroundProps {
  donors: Donor[];
  requests: RecipientRequest[];
  onReserveDonor: (requestId: string, donorId: string) => void;
  initialBloodType?: BloodGroup;
  initialRequestId?: string;
}

export const MatchingGround: React.FC<MatchingGroundProps> = ({
  donors,
  requests,
  onReserveDonor,
  initialBloodType,
  initialRequestId,
}) => {
  // Mode: DONORS_FOR_RECIPIENT or RECIPIENTS_FOR_DONOR
  const [direction, setDirection] = useState<'FOR_RECIPIENT' | 'FOR_DONOR'>('FOR_RECIPIENT');
  const [selectedBloodType, setSelectedBloodType] = useState<BloodGroup>(initialBloodType || 'O-');
  const [selectedComponent, setSelectedComponent] = useState<BloodComponent>('RBC');
  const [activeRequestId, setActiveRequestId] = useState<string>(initialRequestId || '');
  const [maxDistanceKm, setMaxDistanceKm] = useState<number>(30);
  const [requireCmvNeg, setRequireCmvNeg] = useState<boolean>(false);
  const [onlyEligible, setOnlyEligible] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Sync props if parent changes them
  React.useEffect(() => {
    if (initialBloodType) {
      setSelectedBloodType(initialBloodType);
    }
  }, [initialBloodType]);

  React.useEffect(() => {
    if (initialRequestId) {
      setActiveRequestId(initialRequestId);
      const req = requests.find((r) => r.id === initialRequestId);
      if (req) {
        setSelectedBloodType(req.bloodType);
        setSelectedComponent(req.component);
      }
    }
  }, [initialRequestId, requests]);

  // Modals state
  const [crossmatchCandidate, setCrossmatchCandidate] = useState<Donor | null>(null);
  const [dispatchCandidate, setDispatchCandidate] = useState<Donor | null>(null);

  // Active recipient context
  const activeRequest = useMemo(() => {
    return requests.find((r) => r.id === activeRequestId);
  }, [requests, activeRequestId]);

  // When an active request is clicked, sync type and component
  const handleSelectRequest = (req: RecipientRequest) => {
    setActiveRequestId(req.id);
    setSelectedBloodType(req.bloodType);
    setSelectedComponent(req.component);
    setDirection('FOR_RECIPIENT');
  };

  // Compute compatible types
  const compatibleTypes = useMemo(() => {
    if (direction === 'FOR_RECIPIENT') {
      return getCompatibleDonorTypes(selectedBloodType, selectedComponent);
    } else {
      return getCompatibleRecipientTypes(selectedBloodType, selectedComponent);
    }
  }, [direction, selectedBloodType, selectedComponent]);

  const currentProps = BLOOD_PROPERTIES_MAP[selectedBloodType];

  // Scored and filtered donors (for recipient mode)
  const scoredDonors = useMemo(() => {
    return donors
      .map((d) => scoreDonorForRecipient(d, selectedBloodType, selectedComponent))
      .filter((match) => {
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchesName = match.donor.fullName.toLowerCase().includes(q);
          const matchesCity = match.donor.city.toLowerCase().includes(q);
          const matchesType = match.donor.bloodType.toLowerCase().includes(q);
          if (!matchesName && !matchesCity && !matchesType) return false;
        }

        if (match.donor.distanceKm > maxDistanceKm) return false;
        if (requireCmvNeg && !match.donor.isCmvNegative) return false;
        if (onlyEligible && !match.donor.isAvailable) return false;

        return true;
      })
      .sort((a, b) => {
        // Sort compatible first, then by score descending
        if (a.isCompatible !== b.isCompatible) return a.isCompatible ? -1 : 1;
        return b.compatibilityScore - a.compatibilityScore;
      });
  }, [donors, selectedBloodType, selectedComponent, maxDistanceKm, requireCmvNeg, onlyEligible, searchQuery]);

  // Scored and filtered recipients (for donor mode)
  const matchingRequests = useMemo(() => {
    return requests
      .filter((req) => {
        const compatible = isBloodCompatible(selectedBloodType, req.bloodType, req.component);
        if (!compatible) return false;
        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          const matchesPatient = req.patientName.toLowerCase().includes(q);
          const matchesHospital = req.hospitalName.toLowerCase().includes(q);
          if (!matchesPatient && !matchesHospital) return false;
        }
        return true;
      })
      .sort((a, b) => {
        const urgencyScore = { CRITICAL: 3, URGENT: 2, ROUTINE: 1 };
        return urgencyScore[b.urgency] - urgencyScore[a.urgency];
      });
  }, [requests, selectedBloodType, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner / Breadcrumb */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-rose-700 font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Decision Ground</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Virtual Blood Matching & Identification Engine
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Cross-checks ABO/Rh surface antigens, circulating isohemagglutinins, component fractionations, and laboratory crossmatching risks.
            </p>
          </div>

          {/* Direction Toggle (Segmented control) */}
          <div className="flex p-1 bg-slate-100 rounded-lg self-start md:self-auto border border-slate-200">
            <button
              onClick={() => {
                setDirection('FOR_RECIPIENT');
                setActiveRequestId('');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                direction === 'FOR_RECIPIENT'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Find Donors for Recipient
            </button>
            <button
              onClick={() => {
                setDirection('FOR_DONOR');
                setActiveRequestId('');
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                direction === 'FOR_DONOR'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Find Recipients for Donor
            </button>
          </div>
        </div>

        {/* Quick Pick: Active Hospital Requests */}
        {requests.length > 0 && direction === 'FOR_RECIPIENT' && (
          <div className="mt-5 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Quick Load from Bedside Urgent Requests:
              </span>
              {activeRequestId && (
                <button
                  onClick={() => setActiveRequestId('')}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Clear Selection
                </button>
              )}
            </div>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {requests.map((req) => {
                const isSelected = req.id === activeRequestId;
                const isCrit = req.urgency === 'CRITICAL';
                return (
                  <button
                    key={req.id}
                    onClick={() => handleSelectRequest(req)}
                    className={`shrink-0 text-left p-2.5 rounded-lg border text-xs transition-all ${
                      isSelected
                        ? 'border-rose-600 bg-rose-50/70 shadow-xs'
                        : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="font-bold text-slate-900">{req.patientName}</span>
                      <span className="font-bold text-rose-700 bg-white border border-rose-200 px-1.5 py-0.2 rounded text-[11px]">
                        {req.bloodType}
                      </span>
                    </div>
                    <div className="text-slate-500 mt-1 flex items-center gap-1.5 text-[11px]">
                      <span>{req.hospitalName.split(' ')[0]}</span>
                      <span>·</span>
                      <span className={isCrit ? 'text-rose-600 font-semibold' : 'text-slate-600'}>
                        {req.unitsNeeded}u {req.component}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Primary Control Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Blood Type & Component Selection */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6 shadow-xs">
            {/* Blood Group Picker */}
            <div>
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                {direction === 'FOR_RECIPIENT' ? 'Recipient Blood Group' : 'Donor Blood Group'}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {ALL_BLOOD_GROUPS.map((type) => {
                  const isSelected = selectedBloodType === type;
                  return (
                    <button
                      key={type}
                      onClick={() => {
                        setSelectedBloodType(type);
                        setActiveRequestId('');
                      }}
                      className={`py-2.5 px-2 rounded-lg text-sm font-bold border transition-all ${
                        isSelected
                          ? 'bg-rose-600 border-rose-600 text-white shadow-xs'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:border-slate-300 hover:bg-white'
                      }`}
                    >
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Blood Component Picker */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Blood Component
                </label>
                <span className="text-[11px] text-slate-400">Affects matching rules</span>
              </div>
              <div className="space-y-1.5">
                {[
                  { id: 'RBC', label: 'Packed Red Blood Cells (PRBC)', desc: 'Surface antigens (ABO/RhD) dictate safety' },
                  { id: 'WHOLE_BLOOD', label: 'Whole Blood (Complete)', desc: 'Requires strict identical ABO & Rh' },
                  { id: 'PLASMA', label: 'Fresh Frozen Plasma (FFP)', desc: 'Circulating antibodies dictate safety (Inverse rules)' },
                  { id: 'PLATELETS', label: 'Platelets (Thrombocytes)', desc: 'ABO identical preferred for recovery' },
                  { id: 'CRYOPRECIPITATE', label: 'Cryoprecipitate (Factor VIII)', desc: 'Rich in fibrinogen & vWF' },
                ].map((comp) => {
                  const isSelected = selectedComponent === comp.id;
                  return (
                    <button
                      key={comp.id}
                      onClick={() => setSelectedComponent(comp.id as BloodComponent)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-rose-600 bg-rose-50/50 text-slate-900'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="text-xs font-bold">{comp.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{comp.desc}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Scientific Properties Card */}
            <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="font-semibold text-slate-900 flex items-center gap-1.5">
                  <Droplet className="w-4 h-4 text-rose-600" />
                  Type {selectedBloodType} Phenotype
                </span>
                <span className="text-slate-500">
                  {currentProps.populationFrequencyPct}% Prevalence
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">RBC Surface Antigens:</span>
                <span className="font-medium text-slate-800">
                  {currentProps.rbcAntigens.join(', ')}
                </span>
              </div>

              <div>
                <span className="text-slate-500 block text-[11px]">Serum Antibodies (Isohemagglutinins):</span>
                <span className="font-medium text-slate-800">
                  {currentProps.plasmaAntibodies.length > 0
                    ? currentProps.plasmaAntibodies.join(', ')
                    : 'None (Universal Plasma Donor)'}
                </span>
              </div>

              {selectedBloodType === 'O-' && selectedComponent === 'RBC' && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 font-medium text-[11px]">
                  Universal Red Blood Cell Donor: Safe for emergency uncrossmatched transfusions in acute trauma.
                </div>
              )}
              {selectedBloodType === 'AB+' && selectedComponent === 'RBC' && (
                <div className="p-2 bg-blue-50 border border-blue-200 rounded text-blue-900 font-medium text-[11px]">
                  Universal Red Blood Cell Recipient: Can safely receive RBCs from all 8 blood groups.
                </div>
              )}
              {selectedBloodType === 'AB+' && selectedComponent === 'PLASMA' && (
                <div className="p-2 bg-emerald-50 border border-emerald-200 rounded text-emerald-900 font-medium text-[11px]">
                  Universal Plasma Donor: Contains neither Anti-A nor Anti-B antibodies; safe for all recipients.
                </div>
              )}
            </div>

            {/* Secondary Registry Filters */}
            <div className="space-y-4 pt-2 border-t border-slate-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                  <Filter className="w-3.5 h-3.5" /> Filter Criteria
                </span>
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-600 mb-1">
                  <span>Max Radius</span>
                  <span className="font-semibold text-slate-900">{maxDistanceKm} km</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="50"
                  step="5"
                  value={maxDistanceKm}
                  onChange={(e) => setMaxDistanceKm(Number(e.target.value))}
                  className="w-full accent-rose-600"
                />
              </div>

              <div className="space-y-2 text-xs">
                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={requireCmvNeg}
                    onChange={(e) => setRequireCmvNeg(e.target.checked)}
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Require CMV-Negative (Neonatal/Oncology Safe)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-700">
                  <input
                    type="checkbox"
                    checked={onlyEligible}
                    onChange={(e) => setOnlyEligible(e.target.checked)}
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Exclude Deferred / Ineligible Donors (&lt;56 days)</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Right Columns: Scored Identification Ground */}
        <div className="lg:col-span-2 space-y-6">
          {/* Compatibility Ribbon */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              {direction === 'FOR_RECIPIENT'
                ? `Scientifically Compatible Donors for ${selectedBloodType} (${selectedComponent})`
                : `Recipients who can safely receive ${selectedBloodType} (${selectedComponent})`}
            </span>
            <div className="flex flex-wrap items-center gap-2">
              {ALL_BLOOD_GROUPS.map((type) => {
                const isComp = compatibleTypes.includes(type);
                const isSelected = type === selectedBloodType;
                return (
                  <div
                    key={type}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${
                      isComp
                        ? isSelected
                          ? 'bg-rose-600 border-rose-600 text-white'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                    }`}
                  >
                    <span>{type}</span>
                    {isComp ? (
                      <span className="text-[10px] font-normal">
                        {isSelected ? '(Exact)' : '(Compatible)'}
                      </span>
                    ) : (
                      <span className="text-[10px] font-normal">(Blocked)</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Search Bar & Results Counter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder={direction === 'FOR_RECIPIENT' ? 'Search donor name, city, blood type...' : 'Search recipient name, hospital...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500"
              />
            </div>
            <div className="text-xs text-slate-500 self-center">
              Showing <span className="font-semibold text-slate-800">
                {direction === 'FOR_RECIPIENT' ? scoredDonors.length : matchingRequests.length}
              </span> verified candidates
            </div>
          </div>

          {/* RESULTS: When direction === FOR_RECIPIENT */}
          {direction === 'FOR_RECIPIENT' && (
            <div className="space-y-3">
              {scoredDonors.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6">
                  <AlertTriangle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-slate-900">No Matching Donors in Selected Radius</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Try expanding the search radius beyond {maxDistanceKm} km or unchecking the CMV-negative filter.
                  </p>
                </div>
              ) : (
                scoredDonors.map((match) => {
                  const { donor, isCompatible, isIdentical, compatibilityScore, reasons } = match;

                  return (
                    <div
                      key={donor.id}
                      className={`bg-white rounded-xl border p-5 transition-all shadow-xs ${
                        isCompatible
                          ? 'border-slate-200 hover:border-rose-300'
                          : 'border-red-200 bg-red-50/20 opacity-75'
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        {/* Donor identity & blood badge */}
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-3">
                            <span className={`text-base font-bold px-2.5 py-1 rounded-lg border ${
                              isIdentical
                                ? 'bg-rose-600 text-white border-rose-600'
                                : isCompatible
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : 'bg-red-100 text-red-800 border-red-300'
                            }`}>
                              {donor.bloodType}
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                {donor.fullName}
                                {donor.isCmvNegative && (
                                  <span className="text-[11px] font-normal text-cyan-800 bg-cyan-50 border border-cyan-200 px-1.5 py-0.2 rounded">
                                    CMV-
                                  </span>
                                )}
                              </h4>
                              <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-slate-400" />
                                  {donor.city} ({donor.distanceKm} km)
                                </span>
                                <span>·</span>
                                <span>Hb: {donor.hemoglobinGdl} g/dL</span>
                                <span>·</span>
                                <span>{donor.weightKg} kg</span>
                              </div>
                            </div>
                          </div>

                          {/* Immunological rationale points */}
                          <div className="pt-2 text-xs text-slate-600 space-y-1">
                            {reasons.slice(0, 2).map((r, i) => (
                              <div key={i} className="flex items-start gap-1.5">
                                <span className="text-emerald-600 font-bold mt-0.5">✓</span>
                                <span>{r}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Right side: Score & Action Buttons */}
                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                          <div className="text-right">
                            <div className="text-xs text-slate-500">Compatibility Score</div>
                            <div className={`text-lg font-bold ${
                              compatibilityScore >= 75 ? 'text-emerald-600' : compatibilityScore >= 50 ? 'text-amber-600' : 'text-red-600'
                            }`}>
                              {compatibilityScore}%
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setCrossmatchCandidate(donor)}
                              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-xs font-semibold text-slate-700 transition-colors"
                            >
                              Crossmatch Test
                            </button>

                            {isCompatible && (
                              <button
                                onClick={() => setDispatchCandidate(donor)}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
                              >
                                <Send className="w-3 h-3" />
                                <span>Reserve Unit</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* RESULTS: When direction === FOR_DONOR */}
          {direction === 'FOR_DONOR' && (
            <div className="space-y-3">
              {matchingRequests.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-xl border border-slate-200 p-6">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <h4 className="text-sm font-semibold text-slate-900">No Pending Requests for this Profile</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                    Type {selectedBloodType} can be processed and stored in the central blood bank inventory for future trauma cases.
                  </p>
                </div>
              ) : (
                matchingRequests.map((req) => {
                  const isCrit = req.urgency === 'CRITICAL';
                  return (
                    <div
                      key={req.id}
                      className="bg-white rounded-xl border border-slate-200 p-5 hover:border-rose-300 transition-all shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-3">
                            <span className="text-base font-bold px-2.5 py-1 rounded-lg border bg-rose-50 text-rose-800 border-rose-200">
                              {req.bloodType}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-sm font-bold text-slate-900">{req.patientName}</h4>
                                <span className={`text-[11px] font-semibold px-2 py-0.2 rounded border ${
                                  isCrit
                                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                  {req.urgency}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5">
                                {req.hospitalName} · {req.ward}
                              </p>
                            </div>
                          </div>

                          <p className="text-xs text-slate-700 pt-1">
                            <span className="font-semibold text-slate-900">Indication:</span> {req.clinicalReason}
                          </p>

                          <div className="text-xs text-slate-500 flex items-center gap-3 pt-1">
                            <span>Requires: <strong className="text-slate-800">{req.unitsNeeded} units {req.component}</strong></span>
                            <span>·</span>
                            <span>Requested: {req.requestDate}</span>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200">
                            Safe Recipient
                          </span>

                          <button
                            onClick={() => {
                              handleSelectRequest(req);
                            }}
                            className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition-colors"
                          >
                            <span>Open in Recipient Match</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>

      {/* Crossmatch Modal */}
      {crossmatchCandidate && (
        <CrossmatchModal
          donor={crossmatchCandidate}
          recipientBloodType={selectedBloodType}
          recipientName={activeRequest ? activeRequest.patientName : 'Target Recipient'}
          component={selectedComponent}
          onClose={() => setCrossmatchCandidate(null)}
          onDispatch={() => {
            const donor = crossmatchCandidate;
            setCrossmatchCandidate(null);
            setDispatchCandidate(donor);
          }}
        />
      )}

      {/* Dispatch Modal */}
      {dispatchCandidate && (
        <DispatchModal
          donor={dispatchCandidate}
          recipientBloodType={selectedBloodType}
          recipientName={activeRequest ? activeRequest.patientName : 'Target Recipient in Ward'}
          component={selectedComponent}
          onClose={() => setDispatchCandidate(null)}
          onConfirmReservation={(donorId) => {
            if (activeRequestId) {
              onReserveDonor(activeRequestId, donorId);
            }
          }}
        />
      )}
    </div>
  );
};
