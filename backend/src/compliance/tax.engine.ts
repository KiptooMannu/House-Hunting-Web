// src/compliance/tax.engine.ts
// Kenya Tax Rules Engine — KRA eTIMS Compliant
// Regulations: Income Tax Act, VAT Act Cap 476, Tourism Levy Act

export interface RentalTaxInput {
  monthlyRent: number;
  bookingFee?: number;
  isShortTermLodging?: boolean;
}

export interface TaxLineItem {
  name: string;
  rate: number;
  rateLabel: string;
  base: number;
  amount: number;
  regulation: string;
  applies: boolean;
}

export interface TaxBreakdown {
  monthlyRent: number;
  annualRent: number;
  bookingFee: number;
  lines: TaxLineItem[];
  totalMonthlyTax: number;
  totalAnnualTax: number;
  netToLandlordMonthly: number;
  platformFee: number;
  effectiveRatePercent: number;
  calculatedAt: string;
  taxYear: number;
  isWithholdingApplicable: boolean;
}

const TAX_RULES = {
  MRI:        { rate: 0.075, name: 'Monthly Rental Income Tax (MRI)',    regulation: 'ITA Sec 6A — 7.5% on gross rental income' },
  VAT:        { rate: 0.16,  name: 'Value Added Tax (VAT)',               regulation: 'VAT Act Cap 476 — 16% on service/booking fees' },
  WITHHOLDING:{ rate: 0.10,  name: 'Withholding Tax on Rent',             regulation: 'ITA Sec 35 — 10% WHT if annual rent > KES 144,000', annualThreshold: 144000 },
  TOURISM:    { rate: 0.02,  name: 'Tourism Levy',                        regulation: 'Tourism Act 2011 — 2% on short-term accommodation revenue' },
  PLATFORM:   { rate: 0.03,  name: 'NestFind Platform Commission',        regulation: 'Service Agreement — 3% on monthly rent' },
};

export function calculateRentalTax(input: RentalTaxInput): TaxBreakdown {
  const { monthlyRent, bookingFee = 0, isShortTermLodging = false } = input;
  const annualRent = monthlyRent * 12;
  const taxYear  = new Date().getFullYear();

  const mriAmount          = monthlyRent * TAX_RULES.MRI.rate;
  const vatAmount          = bookingFee  * TAX_RULES.VAT.rate;
  const isWHT              = annualRent  > TAX_RULES.WITHHOLDING.annualThreshold;
  const withholdingAmount  = isWHT ? monthlyRent * TAX_RULES.WITHHOLDING.rate : 0;
  const tourismAmount      = isShortTermLodging ? monthlyRent * TAX_RULES.TOURISM.rate : 0;
  const platformFeeAmount  = monthlyRent * TAX_RULES.PLATFORM.rate;
  const totalMonthlyTax    = mriAmount + vatAmount + withholdingAmount + tourismAmount;

  const lines: TaxLineItem[] = [
    { name: TAX_RULES.MRI.name,         rate: TAX_RULES.MRI.rate,         rateLabel: '7.5%',                         base: monthlyRent, amount: +mriAmount.toFixed(2),         regulation: TAX_RULES.MRI.regulation,         applies: true },
    { name: TAX_RULES.VAT.name,         rate: TAX_RULES.VAT.rate,         rateLabel: '16%',                          base: bookingFee,  amount: +vatAmount.toFixed(2),         regulation: TAX_RULES.VAT.regulation,         applies: bookingFee > 0 },
    { name: TAX_RULES.WITHHOLDING.name, rate: isWHT ? 0.10 : 0,          rateLabel: isWHT ? '10%' : '0% (exempt)',  base: monthlyRent, amount: +withholdingAmount.toFixed(2), regulation: TAX_RULES.WITHHOLDING.regulation, applies: isWHT },
    { name: TAX_RULES.TOURISM.name,     rate: isShortTermLodging ? 0.02 : 0, rateLabel: isShortTermLodging ? '2%' : '0% (long-term)', base: monthlyRent, amount: +tourismAmount.toFixed(2), regulation: TAX_RULES.TOURISM.regulation, applies: isShortTermLodging },
  ];

  return {
    monthlyRent,
    annualRent,
    bookingFee,
    lines,
    totalMonthlyTax:      +totalMonthlyTax.toFixed(2),
    totalAnnualTax:       +(totalMonthlyTax * 12).toFixed(2),
    netToLandlordMonthly: +(monthlyRent - totalMonthlyTax - platformFeeAmount).toFixed(2),
    platformFee:          +platformFeeAmount.toFixed(2),
    effectiveRatePercent: monthlyRent > 0 ? +((totalMonthlyTax / monthlyRent) * 100).toFixed(2) : 0,
    calculatedAt:         new Date().toISOString(),
    taxYear,
    isWithholdingApplicable: isWHT,
  };
}

export function getTaxRatesSummary() {
  return {
    mri:        { rate: TAX_RULES.MRI.rate,         label: 'Monthly Rental Income Tax', regulation: TAX_RULES.MRI.regulation },
    vat:        { rate: TAX_RULES.VAT.rate,         label: 'VAT on Service Fees',       regulation: TAX_RULES.VAT.regulation },
    withholding:{ rate: TAX_RULES.WITHHOLDING.rate, label: 'Withholding Tax on Rent',   regulation: TAX_RULES.WITHHOLDING.regulation, threshold: TAX_RULES.WITHHOLDING.annualThreshold },
    tourismLevy:{ rate: TAX_RULES.TOURISM.rate,     label: 'Tourism Levy',              regulation: TAX_RULES.TOURISM.regulation },
  };
}
