const axios = require('axios');

// ===================== Configuration =====================

const SANDBOX_URL = 'https://sandbox.safaricom.co.ke';
const PRODUCTION_URL = 'https://api.safaricom.co.ke';

function getBaseUrl() {
  return process.env.MPESA_ENV === 'production' ? PRODUCTION_URL : SANDBOX_URL;
}

function isConfigured() {
  return !!(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET);
}

// ===================== Token Cache =====================

let tokenCache = { token: null, expiresAt: 0 };

/**
 * Generate an OAuth access token from Daraja API.
 * Tokens are cached in-memory and refreshed 60s before expiry.
 */
async function getAccessToken() {
  // Return cached token if still valid (with 60s buffer)
  if (tokenCache.token && Date.now() < tokenCache.expiresAt - 60000) {
    return tokenCache.token;
  }

  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const response = await axios.get(
    `${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`,
    {
      headers: { Authorization: `Basic ${auth}` },
      timeout: 15000,
    }
  );

  tokenCache = {
    token: response.data.access_token,
    // Daraja tokens expire in 3600s; cache for that duration
    expiresAt: Date.now() + (response.data.expires_in || 3600) * 1000,
  };

  console.log('🔑 M-Pesa access token generated successfully');
  return tokenCache.token;
}

// ===================== Password Generation =====================

/**
 * Generate the STK Push password.
 * Formula: Base64( Shortcode + Passkey + Timestamp )
 * Timestamp format: YYYYMMDDHHmmss
 */
function generateTimestamp() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

function generatePassword(timestamp) {
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
}

// ===================== STK Push =====================

/**
 * Initiate an M-Pesa STK Push (Lipa Na M-Pesa Online).
 *
 * @param {Object} params
 * @param {string} params.phone       - Customer phone number (254XXXXXXXXX format)
 * @param {number} params.amount      - Amount to charge (KES)
 * @param {string} params.accountRef  - Account reference (e.g. booking ID)
 * @param {string} params.description - Transaction description
 * @returns {Object} Daraja API response
 */
async function initiateSTKPush({ phone, amount, accountRef, description }) {
  const token = await getAccessToken();
  const timestamp = generateTimestamp();
  const password = generatePassword(timestamp);
  const shortcode = process.env.MPESA_SHORTCODE;
  const callbackUrl = process.env.MPESA_CALLBACK_URL;

  // Normalize phone number to 254 format
  const normalizedPhone = normalizePhone(phone);

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.ceil(amount), // M-Pesa requires whole numbers
    PartyA: normalizedPhone,
    PartyB: shortcode,
    PhoneNumber: normalizedPhone,
    CallBackURL: callbackUrl,
    AccountReference: accountRef || 'HouseHunting',
    TransactionDesc: description || 'House Rental Payment',
  };

  const response = await axios.post(
    `${getBaseUrl()}/mpesa/stkpush/v1/processrequest`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    }
  );

  console.log('📱 STK Push initiated:', {
    merchantRequestId: response.data.MerchantRequestID,
    checkoutRequestId: response.data.CheckoutRequestID,
    responseCode: response.data.ResponseCode,
  });

  return {
    success: response.data.ResponseCode === '0',
    merchantRequestId: response.data.MerchantRequestID,
    checkoutRequestId: response.data.CheckoutRequestID,
    responseCode: response.data.ResponseCode,
    responseDescription: response.data.ResponseDescription,
    customerMessage: response.data.CustomerMessage,
  };
}

// ===================== Callback Parser =====================

/**
 * Parse the M-Pesa STK Push callback payload.
 * Safaricom sends a nested structure under Body.stkCallback.
 *
 * @param {Object} body - The raw request body from Safaricom
 * @returns {Object} Normalized callback data
 */
function parseCallback(body) {
  const callback = body?.Body?.stkCallback;

  if (!callback) {
    throw new Error('Invalid M-Pesa callback structure: missing Body.stkCallback');
  }

  const result = {
    merchantRequestId: callback.MerchantRequestID,
    checkoutRequestId: callback.CheckoutRequestID,
    resultCode: callback.ResultCode,
    resultDesc: callback.ResultDesc,
    // These fields only exist on success (ResultCode === 0)
    amount: null,
    mpesaReceiptNumber: null,
    transactionDate: null,
    phoneNumber: null,
  };

  // On success, callback metadata items contain the transaction details
  if (callback.ResultCode === 0 && callback.CallbackMetadata?.Item) {
    const items = callback.CallbackMetadata.Item;
    for (const item of items) {
      switch (item.Name) {
        case 'Amount':
          result.amount = item.Value;
          break;
        case 'MpesaReceiptNumber':
          result.mpesaReceiptNumber = item.Value;
          break;
        case 'TransactionDate':
          result.transactionDate = item.Value;
          break;
        case 'PhoneNumber':
          result.phoneNumber = String(item.Value);
          break;
      }
    }
  }

  return result;
}

// ===================== Helpers =====================

/**
 * Normalize a Kenyan phone number to 254XXXXXXXXX format.
 * Accepts: 0712345678, +254712345678, 254712345678
 */
function normalizePhone(phone) {
  let cleaned = phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');

  if (cleaned.startsWith('+254')) {
    cleaned = cleaned.substring(1); // Remove +
  } else if (cleaned.startsWith('0')) {
    cleaned = '254' + cleaned.substring(1);
  }

  return cleaned;
}

module.exports = {
  isConfigured,
  getAccessToken,
  initiateSTKPush,
  parseCallback,
  normalizePhone,
};
