import { db } from '../db/db.js';
import { users, auth } from '../db/schema.js';
import { createUser } from '../users/users.service.js';
import { loginService, verifyAccessToken } from '../auth/auth.service.js';
import { eq } from 'drizzle-orm';

async function testLoginFlow() {
    console.log('--- TESTING FULL LOGIN FLOW & TOKEN INTEGRITY ---');
    
    // 1. Setup: Register a fresh user to test login
    const testEmail = `login_test_${Date.now()}@nestfind.co.ke`;
    const password = 'TestSecurePassword123!';
    const role = 'landlord';

    try {
        await createUser({
            fullName: 'Login Test User',
            email: testEmail,
            role: role,
            phone: `254${Math.floor(Math.random() * 899999999) + 100000000}`,
            password: password
        });
        console.log('✅ Test User Registered');

        // 2. Execute Login
        console.log(`⏳ Attempting login for ${testEmail}...`);
        const loginResult = await loginService(testEmail, password);
        
        // 3. Verify Response Structure
        if (!loginResult.accessToken) throw new Error('No access token returned');
        if (!loginResult.user) throw new Error('No user object returned');
        if (loginResult.user.role !== role) throw new Error(`Role mismatch in response: ${loginResult.user.role}`);
        
        console.log('✅ Login Response structure and role verified');

        // 4. Verify Token Payload (The "Wire" between FE and BE)
        console.log('⏳ Decoding Access Token for role interpretation check...');
        const decoded = verifyAccessToken(loginResult.accessToken);
        
        if (decoded.role !== role) throw new Error(`Token Payload Mismatch: Expected ${role}, got ${decoded.role}`);
        if (decoded.userId !== loginResult.user.id) throw new Error('Token UID mismatch');

        console.log('✅ Token Payload Verified: Role is correctly encoded for frontend permission checks.');

        // 5. Verify Audit Metadata resets
        const userAuth = await db.query.auth.findFirst({
            where: eq(auth.userId, loginResult.user.id)
        });
        if (userAuth?.loginAttempts !== 0) throw new Error('Login attempts not reset');

        console.log('✅ Backend State Verified: Login attempts reset and audit trail ready.');
        console.log('--- ALL LOGIN FLOW TESTS PASSED ---');
        process.exit(0);
    } catch (error: any) {
        console.error('❌ LOGIN TEST FAILED:', error.message);
        process.exit(1);
    }
}

testLoginFlow();
