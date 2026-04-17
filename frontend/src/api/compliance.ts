import { apiSlice } from '../store/apiSlice';

/**
 * Compliance API Compatibility Layer
 * This wrapper ensures legacy components (like ComplianceModule) can still function
 * while migrating to the platform's new RTK Query architecture.
 */
export const complianceApi = {
  listLogs: async () => {
    // This wrapper is for quick recovery of broken imports.
    return (apiSlice.endpoints as any).getComplianceLogs.initiate()(
      (state: any) => state,
      { forceRefetch: true }
    );
  },
  submitNilFiling: async (data: any) => {
    return (apiSlice.endpoints as any).submitNilFiling.initiate(data)(
      (state: any) => state
    );
  },
  validateTcc: async (data: any) => {
    return (apiSlice.endpoints as any).validateTcc.initiate(data)(
      (state: any) => state
    );
  },
  verifyCompliance: async (data: any) => {
    return (apiSlice.endpoints as any).verifyCompliance.initiate(data)(
      (state: any) => state
    );
  }
};
