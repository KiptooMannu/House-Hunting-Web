import { db } from '../db/db.js';
import { bookings, payments, jobs, complianceLogs, houses } from '../db/schema.js';
import { handleMpesaCallback } from '../payments/payments.service.js';
import { runWorker } from '../utils/jobs.service.js';
import { eq, and, sql } from 'drizzle-orm';
import logger from '../utils/logger.js';

// Mock Env Vars for Testing
process.env.KRA_PIN = 'A000TEST123X';
process.env.KRA_APIGEE_APP_ID = '00000000-0000-0000-0000-000000000000';
process.env.KRA_SANDBOX_URL = 'http://localhost:9999';

// Setup Mock for fetch (GavaConnect)
(global as any).fetch = async (url: string) => {
  return {
    ok: true,
    json: async () => ({ transactionId: `MOCK_KRA_${Date.now()}` }),
  };
};

async function runIntegrationTest() {
  console.log('--- STARTING TRANSACTION LIFECYCLE INTEGRATION TEST ---');

  try {
    // 1. Setup Test Data
    const seekerId = 72;
    const houseId = 170;

    // Cleanup: Avoid unique constraint violation
    await db.delete(bookings).where(and(eq(bookings.seekerId, seekerId), eq(bookings.houseId, houseId)));
    console.log('✅ Cleaned up old test bookings');

    const checkoutId = `TEST_MPESA_${Date.now()}`;
    
    // Create a pending booking
    const [booking] = await db.insert(bookings).values({
      seekerId: seekerId,
      houseId: houseId,
      status: 'pending_payment',
      mpesaCheckoutRequestId: checkoutId,
      bookingFee: "1500",
    }).returning();

    console.log(`✅ Created pending booking ${booking.bookingId}`);

    // 2. Simulate M-Pesa Callback (The Trigger)
    const mockCallbackBody = {
      Body: {
        stkCallback: {
          CheckoutRequestID: checkoutId,
          ResultCode: 0,
          ResultDesc: "The service was accepted successfully",
          CallbackMetadata: { Item: [] }
        }
      }
    };

    console.log('⏳ Processing M-Pesa Callback...');
    await handleMpesaCallback(mockCallbackBody);

    // 3. Verify Database State (Atomicity Check)
    const confirmedBooking = await db.query.bookings.findFirst({
       where: eq(bookings.bookingId, booking.bookingId)
    });
    const payment = await db.query.payments.findFirst({
        where: eq(payments.bookingId, booking.bookingId)
    });
    const job = await db.query.jobs.findFirst({
        where: and(eq(jobs.type, 'kra_etims_sync'), eq(sql`${jobs.payload}->>'bookingId'`, booking.bookingId.toString()))
    } as any);

    if (confirmedBooking?.status !== 'confirmed') throw new Error('Booking status update failed');
    if (!payment) throw new Error('Payment record not created');
    if (!job) throw new Error('Transactional Job Outbox failed - no job found');

    console.log('✅ Atomicity Verified: Booking Updated, Payment Logged, Job Enqueued.');

    // 4. Simulate Worker Process
    console.log('⏳ Running Job Worker (Simulation)...');
    // We'll manually call the process logic for the specific job
    const { runWorker } = await import('../utils/jobs.service.js');
    // Note: In real life runWorker() loops. Here we just want to verify one pass.
    
    // For test purposes, we'll wait a bit or just trigger the sync function directly
    const { sendRevenueToGava } = await import('../compliance/compliance.service.js');
    await sendRevenueToGava(job.payload as any);

    // 5. Verify Compliance Audit Trail
    const log = await db.query.complianceLogs.findFirst({
        where: eq(complianceLogs.bookingId, booking.bookingId)
    });

    if (!log) throw new Error('Compliance log NOT generated after job process');
    console.log(`✅ Lifecycle Complete: Compliance Log #${log.logId} verified with status ${log.status}`);

    console.log('--- ALL INTEGRATION LIFECYCLE TESTS PASSED ---');
    process.exit(0);
  } catch (error: any) {
    console.error('--- INTEGRATION TEST FAILED ---');
    console.error(error.message);
    process.exit(1);
  }
}

// Helper imports consolidated at top of file

runIntegrationTest();
