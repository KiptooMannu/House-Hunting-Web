const axios = require('axios');

// ===================== Configuration =====================

const SANDBOX_URL = 'https://sandbox.developer.go.ke';
const PRODUCTION_URL = 'https://developer.go.ke';

function getBaseUrl() {
  // Allow explicit override via GAVA_API_URL, otherwise use env toggle
  if (process.env.GAVA_API_URL) {
    return process.env.GAVA_API_URL;
  }
  return process.env.GAVA_ENV === 'production' ? PRODUCTION_URL : SANDBOX_URL;
}

function isConfigured() {
  return !!(process.env.GAVA_CONSUMER_KEY && process.env.GAVA_CONSUMER_SECRET);
}

// ===================== Token Cache =====================

let tokenCache = { token: null, expiresAt: 0 };

/**
 * Generate an OAuth 2.0 access token from GavaConnect API.
 * Uses Basic Auth with Consumer Key and Consumer Secret.
 * Tokens are cached in-memory and refreshed 60s before expiry.
 */
async function getAccessToken() {
  // Return cached token if still valid (with 60s buffer)
  if (tokenCache.token && Date.now() < tokenCache.expiresAt - 60000) {
    return tokenCache.token;
  }

  const consumerKey = process.env.GAVA_CONSUMER_KEY;
  const consumerSecret = process.env.GAVA_CONSUMER_SECRET;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const response = await axios.get(
    `${getBaseUrl()}/token?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${auth}` },
      timeout: 15000,
    }
  );

  tokenCache = {
    token: response.data.access_token,
    expiresAt: Date.now() + (response.data.expires_in || 3600) * 1000,
  };

  console.log('🔑 GavaConnect access token generated successfully');
  return tokenCache.token;
}

// ===================== Revenue Report =====================

/**
 * Submit a revenue report to GavaConnect.
 *
 * @param {Object} params
 * @param {string} params.landlordPin   - KRA PIN of the landlord
 * @param {string} params.landlordName  - Name of the landlord
 * @param {string} params.landlordEmail - Email of the landlord
 * @param {string} params.period        - Tax period (YYYY-MM)
 * @param {number} params.totalRevenue  - Gross revenue for the period
 * @param {number} params.taxAmount     - Computed tax amount
 * @returns {Object} GavaConnect API response
 */
async function submitRevenueReport({
  landlordPin,
  landlordName,
  landlordEmail,
  period,
  totalRevenue,
  taxAmount,
}) {
  const token = await getAccessToken();

  const payload = {
    taxpayerPin: landlordPin,
    taxpayerName: landlordName,
    taxpayerEmail: landlordEmail,
    filingType: 'REVENUE_REPORT',
    period,
    grossRevenue: totalRevenue,
    taxableAmount: totalRevenue,
    taxComputed: taxAmount,
    taxRate: 10, // Kenyan residential rental income tax rate (simplified)
    sourceSystem: 'HouseHuntingApp',
    submissionDate: new Date().toISOString(),
  };

  const response = await axios.post(
    `${getBaseUrl()}/api/v1/revenue/filing`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  console.log('📊 GavaConnect revenue report submitted:', {
    referenceNumber: response.data.referenceNumber || response.data.reference_number,
    status: response.data.status,
  });

  return {
    success: true,
    referenceNumber: response.data.referenceNumber || response.data.reference_number,
    status: response.data.status || 'filed',
    message: response.data.message || 'Revenue report filed successfully',
    filedAt: response.data.filedAt || new Date().toISOString(),
    rawResponse: response.data,
  };
}

// ===================== Nil Filing =====================

/**
 * Submit a nil filing to GavaConnect.
 *
 * @param {Object} params
 * @param {string} params.landlordPin   - KRA PIN of the landlord
 * @param {string} params.landlordName  - Name of the landlord
 * @param {string} params.landlordEmail - Email of the landlord
 * @param {string} params.period        - Tax period (YYYY-MM)
 * @returns {Object} GavaConnect API response
 */
async function submitNilFiling({ landlordPin, landlordName, landlordEmail, period }) {
  const token = await getAccessToken();

  const payload = {
    taxpayerPin: landlordPin,
    taxpayerName: landlordName,
    taxpayerEmail: landlordEmail,
    filingType: 'NIL_FILING',
    period,
    grossRevenue: 0,
    taxableAmount: 0,
    taxComputed: 0,
    sourceSystem: 'HouseHuntingApp',
    submissionDate: new Date().toISOString(),
  };

  const response = await axios.post(
    `${getBaseUrl()}/api/v1/revenue/nil-filing`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  console.log('📊 GavaConnect nil filing submitted:', {
    referenceNumber: response.data.referenceNumber || response.data.reference_number,
    status: response.data.status,
  });

  return {
    success: true,
    referenceNumber: response.data.referenceNumber || response.data.reference_number,
    status: response.data.status || 'filed',
    message: response.data.message || 'Nil filing submitted successfully',
    filedAt: response.data.filedAt || new Date().toISOString(),
    rawResponse: response.data,
  };
}

module.exports = {
  isConfigured,
  getAccessToken,
  submitRevenueReport,
  submitNilFiling,
};
