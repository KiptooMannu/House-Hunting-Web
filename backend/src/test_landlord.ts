import axios from 'axios';

async function testLogin() {
  const credentials = {
    email: 'grace@example.com',
    password: 'Temp@123'
  };

  console.log('--- LANDLORD LOGIN TEST ---');
  try {
    const response = await axios.post('http://localhost:3000/api/auth/login', credentials);
    console.log('✅ LANDLORD LOGIN SUCCESS!');
    console.log('User Role:', response.data.user.role);
    process.exit(0);
  } catch (error: any) {
    console.error('❌ LANDLORD LOGIN FAILED!');
    console.error('Error:', error.response?.data || error.message);
    process.exit(1);
  }
}

testLogin();
