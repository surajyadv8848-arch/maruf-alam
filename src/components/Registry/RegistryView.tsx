import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
  Building,
  Heart,
  Droplet,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { Donor, RecipientRequest, BloodGroup, BloodComponent, UrgencyLevel } from '../../types/blood';
import { ALL_BLOOD_GROUPS, checkDonorEligibility } from '../../utils/compatibility';

interface RegistryViewProps {
  donors: Donor[];
  requests: RecipientRequest[];
  onAddDonor: (donor: Donor) => void;
  onDeleteDonor: (id: string) => void;
  onAddRequest: (req: RecipientRequest) => void;
  onDeleteRequest: (id: string) => void;
  onSelectRequestForMatching: (req: RecipientRequest) => void;
}

export const RegistryView: React.FC<RegistryViewProps> = ({
  donors,
  requests,
  onAddDonor,
  onDeleteDonor,
  onAddRequest,
  onDeleteRequest,
  onSelectRequestForMatching,
}) => {
  const [subTab, setSubTab] = useState<'DONORS' | 'REQUESTS'>('DONORS');
  const [searchQuery, setSearchQuery] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState<string>('ALL');

  // Add Donor Modal state
  const [isAddDonorOpen, setIsAddDonorOpen] = useState(false);
  const [newDonorName, setNewDonorName] = useState('');
  const [newDonorBlood, setNewDonorBlood] = useState<BloodGroup>('O-');
  const [newDonorGender, setNewDonorGender] = useState<'female' | 'male' | 'other'>('female');
  const [newDonorAge, setNewDonorAge] = useState<number>(30);
  const [newDonorWeight, setNewDonorWeight] = useState<number>(65);
  const [newDonorHb, setNewDonorHb] = useState<number>(14.0);
  const [newDonorCity, setNewDonorCity] = useState('Central District');
  const [newDonorDistance, setNewDonorDistance] = useState<number>(5.0);
  const [newDonorCmv, setNewDonorCmv] = useState(true);

  // Add Request Modal state
  const [isAddRequestOpen, setIsAddRequestOpen] = useState(false);
  const [newReqPatient, setNewReqPatient] = useState('');
  const [newReqHospital, setNewReqHospital] = useState('University Hospital');
  const [newReqWard, setNewReqWard] = useState('Trauma ICU Bay 1');
  const [newReqBlood, setNewReqBlood] = useState<BloodGroup>('O-');
  const [newReqComponent, setNewReqComponent] = useState<BloodComponent>('RBC');
  const [newReqUnits, setNewReqUnits] = useState<number>(2);
  const [newReqUrgency, setNewReqUrgency] = useState<UrgencyLevel>('CRITICAL');
  const [newReqReason, setNewReqReason] = useState('');

  const handleCreateDonor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDonorName.trim()) return;

    const newDonor: Donor = {
      id: `donor-${Date.now().toString().slice(-4)}`,
      fullName: newDonorName.trim(),
      bloodType: newDonorBlood,
      gender: newDonorGender,
      age: Number(newDonorAge),
      weightKg: Number(newDonorWeight),
      hemoglobinGdl: Number(newDonorHb),
      phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`,
      email: `${newDonorName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      city: newDonorCity,
      distanceKm: Number(newDonorDistance),
      lastDonationDate: '2026-06-01',
      isAvailable: true,
      isCmvNegative: newDonorCmv,
      totalDonationsCount: 1,
      medicalClearance: true,
    };

    onAddDonor(newDonor);
    setIsAddDonorOpen(false);
    setNewDonorName('');
  };

  const handleCreateRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReqPatient.trim()) return;

    const newReq: RecipientRequest = {
      id: `req-${Date.now().toString().slice(-4)}`,
      patientName: newReqPatient.trim(),
      hospitalName: newReqHospital,
      ward: newReqWard,
      bloodType: newReqBlood,
      component: newReqComponent,
      unitsNeeded: Number(newReqUnits),
      urgency: newReqUrgency,
      clinicalReason: newReqReason.trim() || 'Urgent transfusion required',
      requestDate: '2026-10-13 04:00',
      status: 'PENDING',
      matchedDonorIds: [],
    };

    onAddRequest(newReq);
    setIsAddRequestOpen(false);
    setNewReqPatient('');
    setNewReqReason('');
  };

  // Filtered Donors
  const filteredDonors = donors.filter((d) => {
    if (bloodTypeFilter !== 'ALL' && d.bloodType !== bloodTypeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        d.fullName.toLowerCase().includes(q) ||
        d.city.toLowerCase().includes(q) ||
        d.bloodType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Filtered Requests
  const filteredRequests = requests.filter((r) => {
    if (bloodTypeFilter !== 'ALL' && r.bloodType !== bloodTypeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        r.patientName.toLowerCase().includes(q) ||
        r.hospitalName.toLowerCase().includes(q) ||
        r.clinicalReason.toLowerCase().includes(q) ||
        r.bloodType.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-rose-700 font-semibold uppercase tracking-wider">
              <Users className="w-3.5 h-3.5" />
              <span>Hospital Transfusion Network Registry</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Virtual Donor & Patient Request Registry
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Maintain verified blood donors and manage real-time hospital requisition orders.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (subTab === 'DONORS') setIsAddDonorOpen(true);
                else setIsAddRequestOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>{subTab === 'DONORS' ? 'Register New Donor' : 'Create Blood Request'}</span>
            </button>
          </div>
        </div>

        {/* Tab switcher: Donors vs Patient Requests */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex p-1 bg-slate-100 rounded-lg border border-slate-200">
            <button
              onClick={() => setSubTab('DONORS')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${
                subTab === 'DONORS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Donors Pool ({donors.length})
            </button>
            <button
              onClick={() => setSubTab('REQUESTS')}
              className={`px-4 py-1.5 text-xs font-bold rounded-md transition-colors ${
                subTab === 'REQUESTS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Patient Requests ({requests.length})
            </button>
          </div>

          {/* Blood Type Filter buttons */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setBloodTypeFilter('ALL')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md border ${
                bloodTypeFilter === 'ALL'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
              }`}
            >
              All Types
            </button>
            {ALL_BLOOD_GROUPS.map((t) => (
              <button
                key={t}
                onClick={() => setBloodTypeFilter(t)}
                className={`px-2 py-1 text-xs font-semibold rounded-md border ${
                  bloodTypeFilter === t
                    ? 'bg-rose-600 text-white border-rose-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder={subTab === 'DONORS' ? 'Search donor name, city, phone...' : 'Search patient name, hospital, condition...'}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-hidden focus:ring-2 focus:ring-rose-500 shadow-xs"
        />
      </div>

      {/* DONORS TABLE / LIST */}
      {subTab === 'DONORS' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4">Donor Name & Contact</th>
                  <th className="py-3 px-4">Blood Type</th>
                  <th className="py-3 px-4">Clinical Status</th>
                  <th className="py-3 px-4">Hb / Weight</th>
                  <th className="py-3 px-4">Location & Distance</th>
                  <th className="py-3 px-4">CMV Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDonors.map((donor) => {
                  const eligibility = checkDonorEligibility(donor);
                  return (
                    <tr key={donor.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{donor.fullName}</div>
                        <div className="text-[11px] text-slate-500">{donor.phone} · {donor.gender}, {donor.age}y</div>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-bold text-sm text-rose-700 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                          {donor.bloodType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        {eligibility.isEligible ? (
                          <span className="font-semibold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Eligible ({donor.totalDonationsCount} donations)
                          </span>
                        ) : (
                          <span className="font-semibold text-amber-700 flex items-center gap-1" title={eligibility.reasons.join(', ')}>
                            <AlertTriangle className="w-3.5 h-3.5" /> Deferred
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        <div>Hb: <span className="font-semibold">{donor.hemoglobinGdl} g/dL</span></div>
                        <div className="text-[11px] text-slate-500">{donor.weightKg} kg</div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-700">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{donor.city}</span>
                        </div>
                        <div className="text-[11px] text-slate-500">{donor.distanceKm} km away</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {donor.isCmvNegative ? (
                          <span className="text-cyan-800 bg-cyan-50 border border-cyan-200 px-1.5 py-0.5 rounded text-[11px] font-medium">
                            CMV Negative
                          </span>
                        ) : (
                          <span className="text-slate-500 text-[11px]">CMV Positive</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => onDeleteDonor(donor.id)}
                          className="text-slate-400 hover:text-red-600 transition-colors p-1"
                          title="Remove donor"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* REQUESTS LIST */}
      {subTab === 'REQUESTS' && (
        <div className="space-y-4">
          {filteredRequests.map((req) => {
            const isCrit = req.urgency === 'CRITICAL';
            return (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all"
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
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                          <Building className="w-3 h-3 text-slate-400" />
                          <span>{req.hospitalName} ({req.ward})</span>
                          <span>·</span>
                          <span>Requisition: {req.requestDate}</span>
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-700 pt-1">
                      <span className="font-semibold text-slate-900">Diagnosis:</span> {req.clinicalReason}
                    </p>

                    <div className="text-xs text-slate-500 flex items-center gap-3 pt-1">
                      <span>Needed: <strong className="text-slate-800">{req.unitsNeeded} units {req.component}</strong></span>
                      <span>·</span>
                      <span>Status: <strong className="text-rose-700">{req.status}</strong></span>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <button
                      onClick={() => onSelectRequestForMatching(req)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                    >
                      <span>Find Donors on Ground</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => onDeleteRequest(req.id)}
                      className="text-xs text-slate-400 hover:text-red-600 transition-colors"
                    >
                      Remove Request
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Donor Modal */}
      {isAddDonorOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Register New Volunteer Donor
              </h3>
              <button
                onClick={() => setIsAddDonorOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateDonor} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samantha Hayes"
                  value={newDonorName}
                  onChange={(e) => setNewDonorName(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Blood Group</label>
                  <select
                    value={newDonorBlood}
                    onChange={(e) => setNewDonorBlood(e.target.value as BloodGroup)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    {ALL_BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Gender</label>
                  <select
                    value={newDonorGender}
                    onChange={(e) => setNewDonorGender(e.target.value as any)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Age</label>
                  <input
                    type="number"
                    min="18"
                    max="65"
                    value={newDonorAge}
                    onChange={(e) => setNewDonorAge(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    min="45"
                    max="150"
                    value={newDonorWeight}
                    onChange={(e) => setNewDonorWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hemoglobin (g/dL)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="10"
                    max="20"
                    value={newDonorHb}
                    onChange={(e) => setNewDonorHb(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">City / District</label>
                  <input
                    type="text"
                    value={newDonorCity}
                    onChange={(e) => setNewDonorCity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Distance (km)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    max="50"
                    value={newDonorDistance}
                    onChange={(e) => setNewDonorDistance(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newDonorCmv}
                    onChange={(e) => setNewDonorCmv(e.target.checked)}
                    className="rounded border-slate-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span>Verified Cytomegalovirus (CMV) Negative</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddDonorOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  Save Donor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Request Modal */}
      {isAddRequestOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Create Clinical Blood Request
              </h3>
              <button
                onClick={() => setIsAddRequestOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xs"
              >
                Cancel
              </button>
            </div>

            <form onSubmit={handleCreateRequest} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Patient Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. William Gallagher"
                  value={newReqPatient}
                  onChange={(e) => setNewReqPatient(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Hospital</label>
                  <input
                    type="text"
                    value={newReqHospital}
                    onChange={(e) => setNewReqHospital(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Ward / Unit</label>
                  <input
                    type="text"
                    value={newReqWard}
                    onChange={(e) => setNewReqWard(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Blood Group</label>
                  <select
                    value={newReqBlood}
                    onChange={(e) => setNewReqBlood(e.target.value as BloodGroup)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    {ALL_BLOOD_GROUPS.map((bg) => (
                      <option key={bg} value={bg}>{bg}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Component</label>
                  <select
                    value={newReqComponent}
                    onChange={(e) => setNewReqComponent(e.target.value as BloodComponent)}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="RBC">Packed RBC</option>
                    <option value="WHOLE_BLOOD">Whole Blood</option>
                    <option value="PLASMA">Plasma (FFP)</option>
                    <option value="PLATELETS">Platelets</option>
                    <option value="CRYOPRECIPITATE">Cryo</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Units</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={newReqUnits}
                    onChange={(e) => setNewReqUnits(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Urgency</label>
                <select
                  value={newReqUrgency}
                  onChange={(e) => setNewReqUrgency(e.target.value as UrgencyLevel)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="CRITICAL">CRITICAL (Immediate Trauma / MTP)</option>
                  <option value="URGENT">URGENT (Surgery within 24 hours)</option>
                  <option value="ROUTINE">ROUTINE (Scheduled Transfusion)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Clinical Indication / Diagnosis</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Ruptured abdominal aortic aneurysm with active hemorrhage"
                  value={newReqReason}
                  onChange={(e) => setNewReqReason(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                ></textarea>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddRequestOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold shadow-xs transition-colors"
                >
                  Dispatch Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
