
const axios = require('axios');

async function testCompliance() {
  const baseUrl = 'http://localhost:3000/api';
  console.log('🚀 [Test] Starting Compliance Verification Test');

  try {
    // 1. Register a test landlord
    const landlordPayload = {
      fullName: 'Test Landlord ' + Date.now(),
      email: `landlord_${Date.now()}@test.com`,
      password: 'password123',
      role: 'landlord',
      phone: '2547' + Math.floor(Math.random() * 100000000),
      kraPin: 'A000' + Math.floor(Math.random() * 1000000) + 'X',
      agencyName: 'Test Agency'
    };

    console.log('📝 [Test] Registering landlord...', landlordPayload.email);
    const regRes = await axios.post(`${baseUrl}/users`, landlordPayload);
    console.log('✅ [Test] Landlord registered. ID:', regRes.data.user.userId);

    // 2. Login
    console.log('🔐 [Test] Logging in...');
    const loginRes = await axios.post(`${baseUrl}/auth/login`, {
      email: landlordPayload.email,
      password: 'password123'
    });
    const token = loginRes.data.accessToken;
    console.log('✅ [Test] Logged in successfully.');

    // 3. Verify Compliance
    console.log('🏛️ [Test] Verifying KRA Compliance...');
    const verifyRes = await axios.post(`${baseUrl}/compliance/gava/verify`, {
      kraPin: landlordPayload.kraPin,
      userId: regRes.data.user.userId
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ [Test] Compliance result:', verifyRes.data);

    if (verifyRes.data.valid && verifyRes.data.status === 'ACTIVATED') {
        console.log('🎊 [Test] COMPLIANCE FLOW VERIFIED SUCCESSFULLY');
    } else {
        console.error('❌ [Test] Compliance flow failed or was not activated.');
    }

  } catch (err) {
    console.error('❌ [Test] Test failed:', err.response ? err.response.data : err.message);
  }
}

testCompliance();
