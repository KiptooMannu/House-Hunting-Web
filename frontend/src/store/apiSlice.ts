import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api', // Proxied via vite config
    prepareHeaders: (headers) => {
      const token = localStorage.getItem('token');
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  tagTypes: ['House', 'Booking', 'User', 'Payment', 'Compliance'],
  endpoints: (builder) => ({
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
    updateHouse: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/houses/${id}`,
        method: 'PUT',
        body: data,
      }),
      invalidatesTags: ['House'],
    }),
    deleteHouse: builder.mutation({
      query: (id) => ({
        url: `/houses/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['House'],
    }),

    // Booking Endpoints
    getBookings: builder.query({
      query: () => '/bookings',
      providesTags: ['Booking'],
    }),
    createBooking: builder.mutation({
      query: (data) => ({
        url: '/bookings',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Booking'],
    }),
    updateBookingStatus: builder.mutation({
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
        url: '/payments/mpesa/stk-push',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Payment', 'Booking'],
    }),
    getPaymentStatus: builder.query({
      query: (id) => `/payments/${id}`,
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
    
    // Compliance Endpoints
    getComplianceLogs: builder.query({
      query: () => '/compliance-logs',
      providesTags: ['Compliance'],
    }),
    sendRevenueToGava: builder.mutation({
      query: (data) => ({
        url: '/compliance-logs/gava/send-revenue',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Compliance'],
    }),
    submitNilFiling: builder.mutation({
      query: (data) => ({
        url: '/compliance-logs/gava/nil-filing',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Compliance'],
    }),
    validateTcc: builder.mutation({
      query: (data) => ({
        url: '/compliance-logs/gava/validate-tcc',
        method: 'POST',
        body: data,
      }),
    }),

    // Analytics Endpoints
    getAdminStats: builder.query({
      query: () => '/analytics/admin-stats',
    }),
    getMarketPulse: builder.query({
      query: () => '/analytics/market-pulse',
    }),
    getNeighborhoodTrends: builder.query({
      query: () => '/analytics/neighborhood-trends',
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
  useGetHouseByIdQuery,
  useCreateHouseMutation,
  useUpdateHouseMutation,
  useDeleteHouseMutation,
  useGetBookingsQuery,
  useCreateBookingMutation,
  useUpdateBookingStatusMutation,
  useGetRevenueQuery,
  useCreateMpesaPushMutation,
  useGetPaymentStatusQuery,
  useSendMessageMutation,
  useResetSessionMutation,
  useGetComplianceLogsQuery,
  useSendRevenueToGavaMutation,
  useSubmitNilFilingMutation,
  useValidateTccMutation,
  useGetAdminStatsQuery,
  useGetMarketPulseQuery,
  useGetNeighborhoodTrendsQuery,
} = apiSlice;
