import { calculateBookingFees } from '../utils/pricing';

function assertEqual(actual: any, expected: any, message: string) {
  if (JSON.stringify(actual) !== JSON.stringify(expected)) {
    throw new Error(`❌ ${message}\nExpected: ${JSON.stringify(expected)}\nActual: ${JSON.stringify(actual)}`);
  }
  console.log(`✅ ${message}`);
}

async function runTests() {
  console.log('--- STARTING PRICING UNIT TESTS ---');

  try {
    // Case 1: Standard rent (85,000)
    // 5% of 85,000 = 4,250 (> 1500)
    const result1 = calculateBookingFees(85000);
    assertEqual(result1.platformFee, 4250, 'Standard rent fee calculation');

    // Case 2: Low rent (20,000)
    // 5% of 20,000 = 1,000 (< 1500, should floor to 1500)
    const result2 = calculateBookingFees(20000);
    assertEqual(result2.platformFee, 1500, 'Minimum floor fee calculation');

    // Case 3: Zero rent (Invalid but for edge case check)
    const result3 = calculateBookingFees(0);
    assertEqual(result3.platformFee, 1500, 'Zero rent floor check');

    console.log('--- ALL PRICING TESTS PASSED ---');
  } catch (e: any) {
    console.error('--- TESTS FAILED ---');
    console.error(e.message);
    process.exit(1);
  }
}

runTests();
