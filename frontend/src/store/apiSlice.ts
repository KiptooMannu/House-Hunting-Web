import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { setCredentials, logout } from './authSlice';

// Base query for all requests — includes the auth token
const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api',
  prepareHeaders: (headers) => {
    const token = localStorage.getItem('token');
    if (token) {
      console.log('🔑 [API] Attaching Authorization header');
      headers.set('Authorization', `Bearer ${token}`);
    } else {
      console.log('⚠️ [API] No token found in localStorage');
    }
    return headers;
  },
});

// Wrapper that automatically refreshes the access token on 401
const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to refresh the token
    const refreshToken = localStorage.getItem('refreshToken');
    if (refreshToken) {
      console.log('🔄 [API] Access token expired, attempting refresh...');
      const refreshResult = await rawBaseQuery(
        {
          url: '/auth/refresh',
          method: 'POST',
          body: { refreshToken },
        },
        api,
        extraOptions
      );

      if (refreshResult.data) {
        const { accessToken } = refreshResult.data as { accessToken: string };
        const user = JSON.parse(localStorage.getItem('user') || 'null');
        
        // Store new token
        localStorage.setItem('token', accessToken);
        api.dispatch(setCredentials({ user, token: accessToken }));
        
        console.log('✅ [API] Token refreshed successfully');
        // Retry the original request with new token
        result = await rawBaseQuery(args, api, extraOptions);
      } else {
        console.log('❌ [API] Token refresh failed, logging out');
        api.dispatch(logout());
        window.location.href = '/login?message=session_expired';
      }
    } else {
      console.log('❌ [API] No refresh token available, logging out');
      api.dispatch(logout());
      window.location.href = '/login?message=session_expired';
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['House', 'Booking', 'User', 'Payment', 'Compliance', 'Notification', 'SavedHouse'],
  endpoints: (builder) => ({
    // User Endpoints
    listUsers: builder.query<any, any>({
      query: (params) => ({
        url: '/users',
        params,
      }),
      providesTags: ['User'],
    }),

    // Auth Endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    register: builder.mutation({
      query: (data) => ({
        url: '/users',
        method: 'POST',
        body: data,
      }),
    }),
    getProfile: builder.query({
      query: () => '/users/profile',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (data) => ({
        url: '/users/profile',
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),
    updateUser: builder.mutation<any, { userId: number; data: any }>({
      query: ({ userId, data }) => ({
        url: `/users/${userId}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['User'],
    }),

    verifyKra: builder.mutation<any, { userId: number; kraPin: string }>({
      query: (data) => ({
        url: '/compliance/gava/verify',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['User', 'Compliance'],
    }),

    // House Endpoints
    getHouses: builder.query({
      query: (params) => ({
        url: '/houses',
        params,
      }),
      providesTags: ['House'],
    }),
    getHouseById: builder.query({
      query: (id) => `/houses/${id}`,
      providesTags: (_result, _error, id) => [{ type: 'House', id }],
    }),
    createHouse: builder.mutation({
      query: (data) => ({
        url: '/houses',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['House'],
    }),
    updateHouse: builder.mutation<any, { id: number; data: any }>({
      query: ({ id, data }) => ({
        url: `/houses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['House'],
    }),
    deleteHouse: builder.mutation<any, number>({
      query: (id) => ({
        url: `/houses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['House'],
    }),

    approveHouse: builder.mutation<any, number>({
      query: (houseId) => ({
        url: `/houses/${houseId}/approve`,
        method: 'PATCH',
      }),
      invalidatesTags: ['House'],
    }),

    rejectHouse: builder.mutation<any, { houseId: number; reason: string }>({
      query: ({ houseId, reason }) => ({
        url: `/houses/${houseId}/reject`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['House'],
    }),
    revokeHouse: builder.mutation<any, { houseId: number; reason: string }>({
      query: ({ houseId, reason }) => ({
        url: `/houses/${houseId}/revoke`,
        method: 'PATCH',
        body: { reason },
      }),
      invalidatesTags: ['House'],
    }),
    
    toggleSavedHouse: builder.mutation<any, { houseId: number; saved: boolean }>({
      query: ({ houseId, saved }) => ({
        url: `/houses/${houseId}/save`,
        method: 'POST',
        body: { saved },
      }),
      invalidatesTags: ['SavedHouse'],
    }),
    getSavedHouses: builder.query<any, void>({
      query: () => '/houses/collections/saved',
      providesTags: ['SavedHouse'],
    }),

    // Booking Endpoints
    getBookings: builder.query<any, any>({
      query: (params) => ({
        url: '/bookings',
        params,
      }),
      providesTags: ['Booking'],
    }),
    createBooking: builder.mutation<any, any>({
      query: (data) => ({
        url: '/bookings',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Booking'],
    }),
    updateBookingStatus: builder.mutation<any, { id: number; status: string }>({
      query: ({ id, status }) => ({
        url: `/bookings/${id}/status`,
        method: 'PUT',
        body: { booking_status: status },
      }),
      invalidatesTags: ['Booking'],
    }),

    // Payment Endpoints
    getRevenue: builder.query({
      query: (params) => ({
        url: '/payments/revenue',
        params,
      }),
      providesTags: ['Payment'],
    }),
    createMpesaPush: builder.mutation({
      query: (data) => ({
        url: '/payments/mpesa/stkpush',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payment', 'Booking'],
    }),
    createStripeIntent: builder.mutation({
      query: (data) => ({
        url: '/payments/card/create-intent',
        method: 'POST',
        body: data,
      }),
    }),
    confirmStripePayment: builder.mutation({
      query: (data) => ({
        url: '/payments/card/confirm',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payment', 'Booking'],
    }),
    getPaymentStatus: builder.query({
      query: (id) => `/payments/status/${id}`, // Corrected status path to match router
      providesTags: (_result, _error, id) => [{ type: 'Payment', id }],
    }),

    // Chatbot Endpoints
    sendMessage: builder.mutation({
      query: (data) => ({
        url: '/chatbot/message',
        method: 'POST',
        body: data,
      }),
    }),
    resetSession: builder.mutation({
      query: (data) => ({
        url: '/chatbot/reset',
        method: 'POST',
        body: data,
      }),
    }),
    getTowns: builder.query({
      query: () => '/houses/meta/towns',
    }),
    getLocations: builder.query({
      query: () => '/houses/meta/locations',
    }),
    
    // Compliance Endpoints
    getComplianceLogs: builder.query({
      query: () => '/compliance',
      providesTags: ['Compliance'],
    }),
    sendRevenueToGava: builder.mutation({
      query: (data) => ({
        url: '/compliance/gava/send-revenue',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Compliance'],
    }),
    submitNilFiling: builder.mutation({
      query: (data) => ({
        url: '/compliance/gava/nil-filing',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Compliance'],
    }),
    validateTcc: builder.mutation({
      query: (data) => ({
        url: '/compliance/gava/validate-tcc',
        method: 'POST',
        body: data,
      }),
    }),
    verifyCompliance: builder.mutation({
      query: (data) => ({
        url: '/compliance/gava/verify',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Compliance', 'User'],
    }),
    verifyNationalId: builder.mutation({
      query: (data) => ({
        url: '/compliance/gava/verify-id',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Compliance', 'User'],
    }),

    // ── Tax Rules Engine ─────────────────────────────────────────────────────
    calculateTax: builder.mutation<any, { monthlyRent: number; bookingFee?: number; isShortTermLodging?: boolean }>({
      query: (data) => ({
        url: '/compliance/tax/calculate',
        method: 'POST',
        body: data,
      }),
    }),
    getTaxRates: builder.query<any, void>({
      query: () => '/compliance/tax/rates',
    }),

    // ── Job Queue (Offline Queue Monitor) ────────────────────────────────────
    getJobQueue: builder.query<any, void>({
      query: () => '/jobs',
      providesTags: ['Job' as any],
    }),
    getJobStats: builder.query<any, void>({
      query: () => '/jobs/stats',
      providesTags: ['Job' as any],
    }),
    retryJob: builder.mutation<any, number>({
      query: (jobId) => ({ url: `/jobs/${jobId}/retry`, method: 'POST' }),
      invalidatesTags: ['Job' as any],
    }),
    purgeJobs: builder.mutation<any, void>({
      query: () => ({ url: '/jobs/purge', method: 'DELETE' }),
      invalidatesTags: ['Job' as any],
    }),

    // Analytics Endpoints
    getOverviewStats: builder.query<any, any>({
      query: () => '/analytics/overview-stats',
    }),
    getAdminStats: builder.query({
      query: () => '/analytics/admin-stats',
    }),
    getMarketPulse: builder.query({
      query: () => '/analytics/market-pulse',
    }),
    getNeighborhoodTrends: builder.query({
      query: () => '/analytics/neighborhood-trends',
    }),
    
    // Audit Logs Endpoints
    listAuditLogs: builder.query({
      query: () => '/audit-logs',
    }),

    // Notifications Endpoints
    getNotifications: builder.query<any, any>({
      query: () => '/notifications',
      providesTags: ['Notification'],
    }),
    markNotificationRead: builder.mutation<any, number>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: 'PATCH',
      }),
      invalidatesTags: ['Notification'],
    }),
    markAllNotificationsRead: builder.mutation<any, void>({
      query: () => ({
        url: '/notifications/read-all',
        method: 'POST',
      }),
      invalidatesTags: ['Notification'],
    }),
    
    // Webhook Management
    getWebhooks: builder.query<any, void>({
      query: () => '/webhooks',
      providesTags: ['Webhook' as any],
    }),
    createWebhook: builder.mutation<any, any>({
      query: (data) => ({
        url: '/webhooks',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Webhook' as any],
    }),
    updateWebhook: builder.mutation<any, { webhookId: number; updates: any }>({
      query: ({ webhookId, updates }) => ({
        url: `/webhooks/${webhookId}`,
        method: 'PUT',
        body: updates,
      }),
      invalidatesTags: ['Webhook' as any],
    }),
    deleteWebhook: builder.mutation<any, number>({
      query: (webhookId) => ({
        url: `/webhooks/${webhookId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Webhook' as any],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useGetProfileQuery,
  useUpdateProfileMutation,
  useGetHousesQuery,
  useGetTownsQuery,
  useGetLocationsQuery,
  useGetHouseByIdQuery,
  useCreateHouseMutation,
  useUpdateHouseMutation,
  useDeleteHouseMutation,
  useGetBookingsQuery,
  useCreateBookingMutation,
  useUpdateBookingStatusMutation,
  useGetRevenueQuery,
  useCreateMpesaPushMutation,
  useCreateStripeIntentMutation,
  useConfirmStripePaymentMutation,
  useGetPaymentStatusQuery,
  useSendMessageMutation,
  useResetSessionMutation,
  useGetComplianceLogsQuery,
  useSendRevenueToGavaMutation,
  useSubmitNilFilingMutation,
  useValidateTccMutation,
  useVerifyComplianceMutation,
  useGetAdminStatsQuery,
  useGetMarketPulseQuery,
  useGetNeighborhoodTrendsQuery,
  useToggleSavedHouseMutation,
  useGetSavedHousesQuery,
  useApproveHouseMutation,
  useRejectHouseMutation,
  useRevokeHouseMutation,
  useListAuditLogsQuery,
  useGetOverviewStatsQuery,
  useListUsersQuery,
  useUpdateUserMutation,
  useVerifyKraMutation,
  useVerifyNationalIdMutation,
  useGetNotificationsQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useGetWebhooksQuery,
  useCreateWebhookMutation,
  useUpdateWebhookMutation,
  useDeleteWebhookMutation,
  // Tax Rules Engine
  useCalculateTaxMutation,
  useGetTaxRatesQuery,
  // Job Queue / Offline Monitor
  useGetJobQueueQuery,
  useGetJobStatsQuery,
  useRetryJobMutation,
  usePurgeJobsMutation,
} = apiSlice;
