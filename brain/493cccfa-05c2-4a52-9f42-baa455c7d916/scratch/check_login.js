const axios = require('axios');

async function testLogin() {
  const credentials = {
    email: 'admin@example.com',
    password: 'Admin@123'
  };

  console.log('--- LOGIN TEST ---');
  console.log(`Target: http://localhost:3000/api/auth/login`);
  console.log(`User: ${credentials.email}`);

  try {
    const startTime = Date.now();
    const response = await axios.post('http://localhost:3000/api/auth/login', credentials);
    const endTime = Date.now();
    
    console.log('✅ LOGIN SUCCESS!');
    console.log('Time:', endTime - startTime, 'ms');
    console.log('Status Code:', response.status);
    console.log('Access Token (Start):', response.data.accessToken.substring(0, 20) + '...');
    process.exit(0);
  } catch (error) {
    console.error('❌ LOGIN FAILED!');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error('Error Message:', error.message);
    }
    process.exit(1);
  }
}

testLogin();
