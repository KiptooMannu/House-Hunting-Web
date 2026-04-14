import axios from 'axios';

// ===================== Configuration =====================
const SANDBOX_URL = 'https://sandbox.safaricom.co.ke';
const PRODUCTION_URL = 'https://api.safaricom.co.ke';

function getBaseUrl() {
  return process.env.MPESA_ENV === 'production' ? PRODUCTION_URL : SANDBOX_URL;
}

export function isConfigured() {
  return !!(process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET);
}

// ===================== Token Cache =====================
let tokenCache: { token: string | null; expiresAt: number } = { token: null, expiresAt: 0 };

export async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (tokenCache.token && Date.now() < tokenCache.expiresAt - 60000) {
    return tokenCache.token;
  }

  const consumerKey = process.env.MPESA_CONSUMER_KEY!;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET!;
  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');

  const response = await axios.get(`${getBaseUrl()}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
    timeout: 15000,
  });

  tokenCache = {
    token: response.data.access_token,
    expiresAt: Date.now() + (response.data.expires_in || 3600) * 1000,
  };

  console.log('🔑 M-Pesa access token generated successfully');
  return tokenCache.token!;
}

// ===================== Password Generation =====================
function generateTimestamp(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    now.getFullYear().toString() +
    pad(now.getMonth() + 1) +
    pad(now.getDate()) +
    pad(now.getHours()) +
    pad(now.getMinutes()) +
    pad(now.getSeconds())
  );
}

function generatePassword(timestamp: string): string {
  const shortcode = process.env.MPESA_SHORTCODE!;
  const passkey = process.env.MPESA_PASSKEY!;
  return Buffer.from(`${shortcode}${passkey}${timestamp}`).toString('base64');
}

// ===================== Helpers =====================
export function normalizePhone(phone: string): string {
  // Remove all non-digit characters except '+'
  let cleaned = phone.replace(/\s+/g, '').replace(/[^0-9+]/g, '');

  // Remove leading '+' if present
  if (cleaned.startsWith('+')) cleaned = cleaned.substring(1);

  // If it starts with '0', replace with 254
  if (cleaned.startsWith('0')) cleaned = '254' + cleaned.substring(1);

  // If it's a 9-digit number starting with '7' (e.g., 712345678), add 254 prefix
  if (cleaned.length === 9 && cleaned.startsWith('7')) cleaned = '254' + cleaned;

  // If it's a 10-digit number starting with '7' (e.g., 254712345678) – already correct
  // If it's 12 digits starting with '2547' – also correct

  return cleaned;
}


// ===================== STK Push =====================
interface STKPushParams {
  phone: string;
  amount: number;
  accountRef?: string;
  description?: string;
}

export async function initiateSTKPush({ phone, amount, accountRef, description }: STKPushParams) {
  const token = await getAccessToken();
  const timestamp = generateTimestamp();
  const password = generatePassword(timestamp);
  const shortcode = process.env.MPESA_SHORTCODE!;
  const callbackUrl = process.env.MPESA_CALLBACK_URL!;
  const normalizedPhone = normalizePhone(phone);

  const payload = {
    BusinessShortCode: shortcode,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.ceil(amount),
    PartyA: normalizedPhone,
    PartyB: shortcode,
    PhoneNumber: normalizedPhone,
    CallBackURL: callbackUrl,
    AccountReference: accountRef || 'HouseHunting',
    TransactionDesc: description || 'House Rental Payment',
  };

  const response = await axios.post(`${getBaseUrl()}/mpesa/stkpush/v1/processrequest`, payload, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    timeout: 30000,
  });

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
export function parseCallback(body: any) {
  const callback = body?.Body?.stkCallback;
  if (!callback) throw new Error('Invalid M-Pesa callback structure: missing Body.stkCallback');

  const result: any = {
    merchantRequestId: callback.MerchantRequestID,
    checkoutRequestId: callback.CheckoutRequestID,
    resultCode: callback.ResultCode,
    resultDesc: callback.ResultDesc,
    amount: null,
    mpesaReceiptNumber: null,
    transactionDate: null,
    phoneNumber: null,
  };

  if (callback.ResultCode === 0 && callback.CallbackMetadata?.Item) {
    for (const item of callback.CallbackMetadata.Item) {
      switch (item.Name) {
        case 'Amount': result.amount = item.Value; break;
        case 'MpesaReceiptNumber': result.mpesaReceiptNumber = item.Value; break;
        case 'TransactionDate': result.transactionDate = item.Value; break;
        case 'PhoneNumber': result.phoneNumber = String(item.Value); break;
      }
    }
  }
  return result;
}