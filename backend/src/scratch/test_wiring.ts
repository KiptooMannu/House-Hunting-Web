import { db } from '../db/db';
import { bookings, houses, users, complianceLogs, payments } from '../db/schema';
import { handleMpesaCallback } from '../payments/payments.service';
import { eq } from 'drizzle-orm';

async function testWiring() {
  console.log('--- STARTING FINTECH WIRING TEST ---');
  const fs = await import('fs');
  const path = await import('path');
  const schemaPath = path.resolve(__dirname, '../db/schema.ts');
  console.log('Schema File Path:', schemaPath);
  const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
  console.log('Schema Houses Definition snippet:', schemaContent.substring(schemaContent.indexOf('export const houses = pgTable'), schemaContent.indexOf('export const houseImages') ));
  
  // @ts-ignore
  console.log('Houses Table Object:', houses[Symbol.for('drizzle:Name')]);
  // Use a hack to find where it's defined if possible
  console.log('Detected Houses Columns:', Object.keys(houses));

  try {
    // 1. Setup Mock Data
    console.log('[1/5] Setting up mock entities...');
    const [landlord] = await db.insert(users).values({
      fullName: 'Test Landlord',
      email: `landlord_${Date.now()}@test.com`,
      phone: `+254700${Math.floor(Math.random() * 1000000)}`,
      role: 'landlord',
      accountStatus: 'active'
    }).returning();

    const [seeker] = await db.insert(users).values({
      fullName: 'Test Seeker',
      email: `seeker_${Date.now()}@test.com`,
      phone: `+254711${Math.floor(Math.random() * 1000000)}`,
      role: 'seeker'
    }).returning();

    const [house] = await db.insert(houses).values({
      landlordId: landlord.userId,
      title: 'Wiring Test Villa',
      houseType: 'mansion',
      monthlyRent: '50000',
      bookingFee: '1500',
      status: 'active'
    }).returning();

    const checkoutId = `test_stk_${Date.now()}`;
    const [booking] = await db.insert(bookings).values({
      seekerId: seeker.userId,
      houseId: house.houseId,
      status: 'pending_payment',
      bookingFee: '1500',
      mpesaCheckoutRequestId: checkoutId,
      paymentMethod: 'mpesa'
    }).returning();

    console.log(`Created Mock Booking ID: ${booking.bookingId}`);

    // 2. Simulate M-Pesa Callback
    console.log('[2/5] Simulating M-Pesa Payment Callback...');
    const mockCallback = {
      Body: {
        stkCallback: {
          MerchantRequestID: '123',
          CheckoutRequestID: checkoutId,
          ResultCode: 0,
          ResultDesc: 'The service was accepted successfully',
          CallbackMetadata: {
            Item: [
              { Name: 'Amount', Value: 1500 },
              { Name: 'MpesaReceiptNumber', Value: 'WIRINGTEST01' },
              { Name: 'TransactionDate', Value: 20260416112000 }
            ]
          }
        }
      }
    };

    const result = await handleMpesaCallback(mockCallback);
    console.log('Payment Callback Result:', result);

    // 3. Verify Payment Record
    console.log('[3/5] Verifying Payment Record...');
    const payment = await db.query.payments.findFirst({
      where: eq(payments.bookingId, booking.bookingId)
    });
    if (payment) {
      console.log('✅ Payment record created successfully.');
    } else {
      throw new Error('❌ Payment record missing!');
    }

    // 4. Verify Compliance Log (The "Wiring" verification)
    console.log('[4/5] Verifying Compliance Log (Wiring check)...');
    // Wait a bit if it was async, but here it's awaited in the service
    const compLog = await db.query.complianceLogs.findFirst({
      where: eq(complianceLogs.bookingId, booking.bookingId)
    });

    if (compLog) {
      console.log('✅ Compliance Log found and linked to booking!');
      console.log('Log ID:', compLog.logId);
      console.log('Status:', compLog.status);
      console.log('KRA Req ID:', compLog.gavaConnectRequestId);
    } else {
      throw new Error('❌ Compliance Log missing! Wiring failed.');
    }

    // 5. Cleanup
    console.log('[5/5] Cleaning up test data...');
    await db.delete(complianceLogs).where(eq(complianceLogs.bookingId, booking.bookingId));
    await db.delete(payments).where(eq(payments.bookingId, booking.bookingId));
    await db.delete(bookings).where(eq(bookings.bookingId, booking.bookingId));
    await db.delete(houses).where(eq(houses.houseId, house.houseId));
    await db.delete(users).where(eq(users.userId, landlord.userId));
    await db.delete(users).where(eq(users.userId, seeker.userId));

    console.log('--- TEST COMPLETED SUCCESSFULLY ---');
  } catch (err: any) {
    console.error('--- TEST FAILED ---');
    console.error(err);
    if (err.stack) console.error(err.stack);
    process.exit(1);
  }
}

testWiring();
