import { db } from '../db/db.js';
import { users, auth } from '../db/schema.js';
import { createUser } from '../users/users.service.js';
import { eq } from 'drizzle-orm';

async function testRegistrationWiring() {
    console.log('--- TESTING LANDLORD REGISTRATION WIRING ---');
    
    const testEmail = `landlord_test_${Date.now()}@nestfind.co.ke`;
    const payload = {
        fullName: 'Test Landlord',
        email: testEmail,
        password: 'Password123!',
        role: 'landlord',
        phone: `254${Math.floor(Math.random() * 899999999) + 100000000}`,
        kraPin: `PIN_${Date.now()}`,
        agencyName: 'Architectural Assets Ltd'
    };

    try {
        const result = await createUser(payload);
        console.log('✅ Registration Service Call Success');

        const dbUser = await db.query.users.findFirst({
            where: eq(users.email, testEmail)
        });

        if (!dbUser) throw new Error('User not found in DB after registration');
        if (dbUser.role !== 'landlord') throw new Error(`Role mismatch: expected landlord, got ${dbUser.role}`);
        if (!dbUser.kraPin) throw new Error('KRA PIN not persisted');
        if (!dbUser.agencyName) throw new Error('Agency Name not persisted');

        console.log('✅ DB Verification Success: Landlord role and Fintech fields persisted.');

        const userAuth = await db.query.auth.findFirst({
            where: eq(auth.userId, dbUser.userId)
        });

        if (!userAuth) throw new Error('Auth record missing');
        if (userAuth.isTemporaryPassword) throw new Error('Password should NOT be temporary when provided');
        
        console.log('✅ Auth Verification Success: Custom password stored correctly.');
        console.log('--- ALL REGISTRATION WIRING TESTS PASSED ---');
        process.exit(0);
    } catch (error: any) {
        console.error('❌ TEST FAILED:', error.message);
        process.exit(1);
    }
}

testRegistrationWiring();
