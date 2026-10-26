import { BloodGroup, BloodComponent, BloodProperties, Donor, MatchScore, CrossmatchSimulation } from '../types/blood';

export const ALL_BLOOD_GROUPS: BloodGroup[] = ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'];

export const BLOOD_PROPERTIES_MAP: Record<BloodGroup, BloodProperties> = {
  'O-': {
    type: 'O-',
    abo: 'O',
    rh: '-',
    rbcAntigens: ['None (H-antigen precursor only)'],
    plasmaAntibodies: ['Anti-A', 'Anti-B'],
    populationFrequencyPct: 6.6,
    isUniversalRbcDonor: true,
    isUniversalPlasmaRecipient: false,
  },
  'O+': {
    type: 'O+',
    abo: 'O',
    rh: '+',
    rbcAntigens: ['RhD'],
    plasmaAntibodies: ['Anti-A', 'Anti-B'],
    populationFrequencyPct: 37.4,
  },
  'A-': {
    type: 'A-',
    abo: 'A',
    rh: '-',
    rbcAntigens: ['A Antigen'],
    plasmaAntibodies: ['Anti-B'],
    populationFrequencyPct: 6.3,
  },
  'A+': {
    type: 'A+',
    abo: 'A',
    rh: '+',
    rbcAntigens: ['A Antigen', 'RhD'],
    plasmaAntibodies: ['Anti-B'],
    populationFrequencyPct: 35.7,
  },
  'B-': {
    type: 'B-',
    abo: 'B',
    rh: '-',
    rbcAntigens: ['B Antigen'],
    plasmaAntibodies: ['Anti-A'],
    populationFrequencyPct: 1.5,
  },
  'B+': {
    type: 'B+',
    abo: 'B',
    rh: '+',
    rbcAntigens: ['B Antigen', 'RhD'],
    plasmaAntibodies: ['Anti-A'],
    populationFrequencyPct: 8.5,
  },
  'AB-': {
    type: 'AB-',
    abo: 'AB',
    rh: '-',
    rbcAntigens: ['A Antigen', 'B Antigen'],
    plasmaAntibodies: ['None'],
    populationFrequencyPct: 0.6,
  },
  'AB+': {
    type: 'AB+',
    abo: 'AB',
    rh: '+',
    rbcAntigens: ['A Antigen', 'B Antigen', 'RhD'],
    plasmaAntibodies: ['None'],
    populationFrequencyPct: 3.4,
    isUniversalRbcRecipient: true,
    isUniversalPlasmaDonor: true,
  },
};

/**
 * Returns whether a donor's blood component is immunologically compatible with a recipient.
 */
export function isBloodCompatible(
  donorType: BloodGroup,
  recipientType: BloodGroup,
  component: BloodComponent = 'RBC'
): boolean {
  // Extract ABO and Rh
  const donorProps = BLOOD_PROPERTIES_MAP[donorType];
  const recipientProps = BLOOD_PROPERTIES_MAP[recipientType];

  if (component === 'RBC') {
    // Red Blood Cells: Recipient must NOT have antibodies against donor RBC antigens
    // ABO Check
    const donorHasA = donorProps.abo === 'A' || donorProps.abo === 'AB';
    const donorHasB = donorProps.abo === 'B' || donorProps.abo === 'AB';
    const recipientHasAntiA = recipientProps.plasmaAntibodies.includes('Anti-A');
    const recipientHasAntiB = recipientProps.plasmaAntibodies.includes('Anti-B');

    if (donorHasA && recipientHasAntiA) return false;
    if (donorHasB && recipientHasAntiB) return false;

    // Rh Check: Rh- recipients must not receive Rh+ RBCs
    if (donorProps.rh === '+' && recipientProps.rh === '-') return false;

    return true;
  }

  if (component === 'PLASMA') {
    // Plasma: Donor plasma must NOT have antibodies against recipient RBC antigens
    const recipientHasA = recipientProps.abo === 'A' || recipientProps.abo === 'AB';
    const recipientHasB = recipientProps.abo === 'B' || recipientProps.abo === 'AB';
    const donorHasAntiA = donorProps.plasmaAntibodies.includes('Anti-A');
    const donorHasAntiB = donorProps.plasmaAntibodies.includes('Anti-B');

    if (recipientHasA && donorHasAntiA) return false;
    if (recipientHasB && donorHasAntiB) return false;

    // Rh is generally not immunogenic in plasma, all Rh are acceptable if ABO matches
    return true;
  }

  if (component === 'WHOLE_BLOOD') {
    // Whole blood contains both donor cells and donor plasma.
    // Standard rule: Must be strictly identical ABO and Rh for non-emergency transfusions.
    return donorType === recipientType;
  }

  if (component === 'PLATELETS') {
    // Preferred: identical ABO. If unavailable, RBC-compatible platelets can be given.
    return isBloodCompatible(donorType, recipientType, 'RBC');
  }

  if (component === 'CRYOPRECIPITATE') {
    // Cryoprecipitate has minimal plasma volume; generally ABO compatible preferred.
    return isBloodCompatible(donorType, recipientType, 'PLASMA');
  }

  return false;
}

/**
 * Get all compatible donors for a recipient blood type and component
 */
export function getCompatibleDonorTypes(
  recipientType: BloodGroup,
  component: BloodComponent = 'RBC'
): BloodGroup[] {
  return ALL_BLOOD_GROUPS.filter((donor) => isBloodCompatible(donor, recipientType, component));
}

/**
 * Get all recipients who can safely receive blood from a given donor type and component
 */
export function getCompatibleRecipientTypes(
  donorType: BloodGroup,
  component: BloodComponent = 'RBC'
): BloodGroup[] {
  return ALL_BLOOD_GROUPS.filter((recipient) => isBloodCompatible(donorType, recipient, component));
}

/**
 * Evaluates donor eligibility based on medical criteria
 */
export function checkDonorEligibility(donor: Donor): {
  isEligible: boolean;
  reasons: string[];
  daysSinceLastDonation: number;
} {
  const reasons: string[] = [];
  const now = new Date();
  const lastDate = new Date(donor.lastDonationDate);
  const diffTime = Math.abs(now.getTime() - lastDate.getTime());
  const daysSinceLast = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (daysSinceLast < 56) {
    reasons.push(`Minimum donation interval not reached (last donated ${daysSinceLast} days ago; 56 days required)`);
  }

  if (donor.weightKg < 50) {
    reasons.push(`Weight (${donor.weightKg} kg) is below clinical minimum threshold of 50 kg`);
  }

  if (donor.hemoglobinGdl < 12.5) {
    reasons.push(`Hemoglobin (${donor.hemoglobinGdl} g/dL) is below minimum clinical threshold of 12.5 g/dL`);
  }

  if (!donor.medicalClearance) {
    reasons.push('Medical clearance questionnaire pending or flagged');
  }

  if (!donor.isAvailable) {
    reasons.push('Donor status currently marked as unavailable or deferred');
  }

  return {
    isEligible: reasons.length === 0,
    reasons,
    daysSinceLastDonation: daysSinceLast,
  };
}

/**
 * Simulates lab crossmatch test (Major and Minor)
 */
export function simulateCrossmatch(
  donorType: BloodGroup,
  recipientType: BloodGroup,
  component: BloodComponent = 'RBC',
  donorId: string = 'mock-donor'
): CrossmatchSimulation {
  const donorProps = BLOOD_PROPERTIES_MAP[donorType];
  const recipientProps = BLOOD_PROPERTIES_MAP[recipientType];

  // Major Crossmatch: Recipient Serum + Donor RBCs
  // Checks if recipient serum has antibodies that agglutinate donor RBCs
  const donorHasA = donorProps.abo === 'A' || donorProps.abo === 'AB';
  const donorHasB = donorProps.abo === 'B' || donorProps.abo === 'AB';
  const recipientAntiA = recipientProps.plasmaAntibodies.includes('Anti-A');
  const recipientAntiB = recipientProps.plasmaAntibodies.includes('Anti-B');
  const rhConflict = donorProps.rh === '+' && recipientProps.rh === '-';

  const majorAgglutination = (donorHasA && recipientAntiA) || (donorHasB && recipientAntiB) || rhConflict;

  // Minor Crossmatch: Recipient RBCs + Donor Serum
  // Checks if donor serum contains antibodies that attack recipient RBCs
  const recipientHasA = recipientProps.abo === 'A' || recipientProps.abo === 'AB';
  const recipientHasB = recipientProps.abo === 'B' || recipientProps.abo === 'AB';
  const donorAntiA = donorProps.plasmaAntibodies.includes('Anti-A');
  const donorAntiB = donorProps.plasmaAntibodies.includes('Anti-B');

  const minorAgglutination = (recipientHasA && donorAntiA) || (recipientHasB && donorAntiB);

  const isCompatible = isBloodCompatible(donorType, recipientType, component);

  let explanation = '';
  if (isCompatible) {
    explanation = donorType === recipientType
      ? `Exact type match (${donorType} to ${recipientType}). No isohemagglutinins or Rh incompatibility detected. Clear crossmatch.`
      : `Compatible alternate match. Donor ${donorType} RBCs do not express antigens targeted by recipient ${recipientType} circulating antibodies.`;
  } else {
    const conflicts: string[] = [];
    if (donorHasA && recipientAntiA) conflicts.push('Recipient anti-A antibodies will bind and lyse Donor A antigens');
    if (donorHasB && recipientAntiB) conflicts.push('Recipient anti-B antibodies will bind and lyse Donor B antigens');
    if (rhConflict) conflicts.push('Donor RhD(+) will trigger hemolytic sensitization in RhD(-) recipient');
    explanation = `Severe immunological incompatibility: ${conflicts.join('; ')}. Immediate Acute Hemolytic Transfusion Reaction (AHTR) risk!`;
  }

  return {
    donorId,
    recipientBloodType: recipientType,
    donorBloodType: donorType,
    component,
    majorCrossmatchAgglutination: majorAgglutination,
    minorCrossmatchAgglutination: minorAgglutination,
    verdict: isCompatible ? 'COMPATIBLE' : 'INCOMPATIBLE',
    details: isCompatible
      ? 'Crossmatch test Negative (No agglutination or hemolysis observed). Safe for infusion.'
      : 'Crossmatch test Positive (Visible agglutination observed). Infusion contraindicated!',
    immunologicalExplanation: explanation,
  };
}

/**
 * Score and rank donors for a recipient need
 */
export function scoreDonorForRecipient(
  donor: Donor,
  recipientType: BloodGroup,
  component: BloodComponent = 'RBC'
): MatchScore {
  const isCompatible = isBloodCompatible(donor.bloodType, recipientType, component);
  const isIdentical = donor.bloodType === recipientType;
  const eligibility = checkDonorEligibility(donor);

  const reasons: string[] = [];
  let score = 0;
  let crossmatchRisk: 'NONE' | 'LOW' | 'HIGH' | 'FATAL' = 'NONE';

  if (!isCompatible) {
    score = 0;
    crossmatchRisk = 'FATAL';
    reasons.push(`Incompatible blood group (${donor.bloodType} to ${recipientType}) for ${component}`);
  } else {
    // Base score for compatibility
    score = isIdentical ? 60 : 45;
    if (isIdentical) {
      reasons.push(`Identical blood type (${donor.bloodType}) - Ideal primary match`);
    } else {
      reasons.push(`Universal or compatible secondary donor (${donor.bloodType} to ${recipientType})`);
    }

    // Eligibility boost
    if (eligibility.isEligible) {
      score += 20;
      reasons.push('Meets all clinical criteria (Hb > 12.5, Weight > 50kg, 56d interval)');
    } else {
      score -= 30;
      reasons.push(...eligibility.reasons);
      crossmatchRisk = 'LOW';
    }

    // Distance consideration (closer = higher score, up to 10 pts)
    const distanceBonus = Math.max(0, 10 - Math.floor(donor.distanceKm / 5));
    score += distanceBonus;
    reasons.push(`Distance: ${donor.distanceKm} km from facility`);

    // CMV negative bonus (helpful for surgery/neonates)
    if (donor.isCmvNegative) {
      score += 5;
      reasons.push('CMV Negative: Suitable for neonates & immunocompromised patients');
    }

    // Donation experience
    if (donor.totalDonationsCount >= 5) {
      score += 5;
      reasons.push(`Experienced repeat donor (${donor.totalDonationsCount} donations)`);
    }

    score = Math.min(100, Math.max(0, score));
  }

  return {
    donor,
    isCompatible,
    isIdentical,
    compatibilityScore: score,
    component,
    crossmatchRisk,
    reasons,
  };
}
