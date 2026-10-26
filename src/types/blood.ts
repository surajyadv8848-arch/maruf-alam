export type BloodGroup = 'O-' | 'O+' | 'A-' | 'A+' | 'B-' | 'B+' | 'AB-' | 'AB+';

export type BloodComponent = 'RBC' | 'WHOLE_BLOOD' | 'PLASMA' | 'PLATELETS' | 'CRYOPRECIPITATE';

export type UrgencyLevel = 'CRITICAL' | 'URGENT' | 'ROUTINE';

export interface BloodProperties {
  type: BloodGroup;
  abo: 'O' | 'A' | 'B' | 'AB';
  rh: '+' | '-';
  rbcAntigens: string[]; // Antigens present on RBC surface
  plasmaAntibodies: string[]; // Isohemagglutinins present in serum/plasma
  populationFrequencyPct: number; // Approximate global average %
  isUniversalRbcDonor?: boolean;
  isUniversalRbcRecipient?: boolean;
  isUniversalPlasmaDonor?: boolean;
  isUniversalPlasmaRecipient?: boolean;
}

export interface Donor {
  id: string;
  fullName: string;
  bloodType: BloodGroup;
  gender: 'female' | 'male' | 'other';
  age: number;
  weightKg: number;
  hemoglobinGdl: number; // Normal: 12.5 - 17.5 g/dL
  phone: string;
  email: string;
  city: string;
  distanceKm: number;
  lastDonationDate: string; // ISO date string or YYYY-MM-DD
  isAvailable: boolean;
  isCmvNegative: boolean; // Cytomegalovirus negative (crucial for neonates & immunocompromised)
  totalDonationsCount: number;
  medicalClearance: boolean;
}

export interface RecipientRequest {
  id: string;
  patientName: string;
  hospitalName: string;
  ward: string;
  bloodType: BloodGroup;
  component: BloodComponent;
  unitsNeeded: number;
  urgency: UrgencyLevel;
  clinicalReason: string;
  requestDate: string;
  status: 'PENDING' | 'MATCHED' | 'FULFILLED' | 'CANCELLED';
  matchedDonorIds: string[];
}

export interface MatchScore {
  donor: Donor;
  isCompatible: boolean;
  isIdentical: boolean;
  compatibilityScore: number; // 0 - 100
  component: BloodComponent;
  antigenConflictDetails?: string;
  crossmatchRisk: 'NONE' | 'LOW' | 'HIGH' | 'FATAL';
  reasons: string[];
}

export interface CrossmatchSimulation {
  donorId: string;
  recipientBloodType: BloodGroup;
  donorBloodType: BloodGroup;
  component: BloodComponent;
  majorCrossmatchAgglutination: boolean; // Recipient serum + Donor RBC
  minorCrossmatchAgglutination: boolean; // Recipient RBC + Donor serum
  verdict: 'COMPATIBLE' | 'INCOMPATIBLE';
  details: string;
  immunologicalExplanation: string;
}

export interface AgglutinationTestState {
  antiAAdded: boolean;
  antiBAdded: boolean;
  antiDAdded: boolean;
  antiAAgglutinated: boolean;
  antiBAgglutinated: boolean;
  antiDAgglutinated: boolean;
  determinedBloodType?: BloodGroup;
  patientSampleId: string;
}
