export interface ShippingCalculationInput {
  country: 'KR' | 'US' | 'JP' | 'EU' | 'WW';
  totalWeightKg: number;
  isDigitalOnly: boolean;
}

export interface ShippingCalculationResult {
  feeUsd: number;
  feeKrw: number;
  isDomestic: boolean;
  estimatedDays: string;
}

export function calculateShippingFee(input: ShippingCalculationInput): ShippingCalculationResult {
  if (input.isDigitalOnly) {
    return {
      feeUsd: 0,
      feeKrw: 0,
      isDomestic: true,
      estimatedDays: 'Instant Download',
    };
  }

  const isDomestic = input.country === 'KR';

  if (isDomestic) {
    // Domestic shipping base rate 4,000 KRW (~$3.00), free over 3kg or flat fee
    const feeKrw = input.totalWeightKg > 2 ? 6000 : 4000;
    return {
      feeUsd: Math.round(feeKrw / 1350),
      feeKrw,
      isDomestic: true,
      estimatedDays: '1–2 Business Days',
    };
  }

  // International shipping base rate $25.00 + $10/kg
  const baseUsd = input.country === 'US' || input.country === 'JP' ? 25 : 35;
  const totalUsd = baseUsd + Math.ceil(input.totalWeightKg) * 10;
  const totalKrw = totalUsd * 1350;

  return {
    feeUsd: totalUsd,
    feeKrw: totalKrw,
    isDomestic: false,
    estimatedDays: '5–10 Business Days (Express Airmail)',
  };
}
