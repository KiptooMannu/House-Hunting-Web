// stimulate_flow.js
const BASE_URL = 'http://localhost:3000/api';

async function stimulate() {
    console.log('⚡ Starting System Stimulation (End-to-End)...\n');

    try {
        // 1. LOGIN as Seeker
        console.log('🔑 Phase 1: Authentication');
        const loginRes = await fetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'john@example.com', password: 'Temp@123' })
        });
        const loginData = await loginRes.json();
        if (!loginData.accessToken) throw new Error('Login failed: ' + JSON.stringify(loginData));
        const token = loginData.accessToken;
        console.log('✅ Logged in as Seeker. Token acquired.');

        // 2. INITIATE BOOKING (STK Push simulation)
        console.log('\n💳 Phase 2: Payment Initiation');
        const bookingRes = await fetch(`${BASE_URL}/payments/mpesa/stkpush`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ 
                houseId: 241, 
                phone: '254711223344',
                moveInDate: '2024-10-10'
            })
        });
        const bookingData = await bookingRes.json();
        if (!bookingData.checkoutRequestId) throw new Error('STK Push initiation failed: ' + JSON.stringify(bookingData));
        const checkoutId = bookingData.checkoutRequestId;
        console.log(`✅ STK Push triggered. CheckoutID: ${checkoutId}`);

        // 3. SIMULATE CALLBACK (The "Aha!" moment)
        console.log('\n📡 Phase 3: M-Pesa Callback Simulation');
        const callbackPayload = {
            Body: {
                stkCallback: {
                    MerchantRequestID: "M123",
                    CheckoutRequestID: checkoutId,
                    ResultCode: 0,
                    ResultDesc: "The service request is processed successfully.",
                    CallbackMetadata: {
                        Item: [
                            { Name: "Amount", Value: 1500.00 },
                            { Name: "MpesaReceiptNumber", Value: `TESTREC-${Date.now()}` },
                            { Name: "TransactionDate", Value: 20241010120000 },
                            { Name: "PhoneNumber", Value: 254711223344 }
                        ]
                    }
                }
            }
        };

        const callbackRes = await fetch(`${BASE_URL}/payments/mpesa/callback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(callbackPayload)
        });
        const callbackData = await callbackRes.json();
        console.log(`✅ Callback delivered. Result: ${callbackData.ResultDesc}`);

        // 4. VERIFY RESULTS (Polling)
        console.log('\n🔎 Phase 4: Final State Verification');
        const statusRes = await fetch(`${BASE_URL}/payments/status/${checkoutId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const statusData = await statusRes.json();
        console.log('📊 Current Booking/Payment Status:', JSON.stringify(statusData, null, 2));

        if (statusData.status === 'completed') {
            console.log('\n🔥 SUCCESS: The system processed the payment and updated the audit ledger automatically!');
        } else {
            console.log('\n⚠️  Processing... The job worker might still be syncing with GavaConnect.');
        }

    } catch (err) {
        console.error('❌ Stimulation Failed:', err.message);
    }
}

stimulate();
