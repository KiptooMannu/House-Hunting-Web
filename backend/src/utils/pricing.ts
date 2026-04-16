/**
 * Dynamic Pricing Engine for NestFind Kenya
 * Centralizes all business rules for platform fees and taxes.
 */

export interface PricingBreakdown {
  basePrice: number;
  platformFee: number;
  totalPayable: number;
}

export const calculateBookingFees = (monthlyRent: number): PricingBreakdown => {
  // Business Rule: 5% of monthly rent, with a minimum floor of KSh 1,500
  // These could eventually be fetched from a 'configs' table.
  const PLATFORM_FEE_PERCENTAGE = 0.05;
  const MINIMUM_PROCESSING_FEE = 1500;

  const rawFee = monthlyRent * PLATFORM_FEE_PERCENTAGE;
  const platformFee = Math.max(rawFee, MINIMUM_PROCESSING_FEE);

  return {
    basePrice: monthlyRent,
    platformFee: platformFee,
    totalPayable: monthlyRent + platformFee // Fixed: Should we include full rent or just fee?
    // In many house-hunting platforms, seeker pays 'Booking Fee' upfront, 
    // and rent is paid later/directly. For now, we assume Seeker pays Booking Fee.
  };
};

export const PLATFORM_TAX_RULES = {
  MRI_RATE: 0.075, // 7.5% for Landlord Revenue
  VAT_RATE: 0.16,  // 16% for Platform Fee Revenue
};
