import axios from 'axios';
import { createHouseSchema } from './validators/validators.js';
import fs from 'fs';
import path from 'path';

const API_BASE = 'http://127.0.0.1:3000/api';

async function runTests() {
  console.log('--- STARTING PLATFORM API INTEGRATION TESTS ---');

  let token = '';

  // 1. Authenticate as Landlord
  try {
    console.log('\n[1] Authenticating as Landlord (grace@example.com)...');
    const authRes = await axios.post(`${API_BASE}/auth/login`, {
      email: 'grace@example.com',
      password: 'Temp@123'
    });
    token = authRes.data.accessToken;
    console.log('✅ Authentication successful! Token acquired.');
  } catch (err: any) {
    console.error('❌ Authentication failed:', err.response?.data || err.message);
    process.exit(1);
  }


  // 2. Test Creating a Listing (Multip-part Form Data with Zod Enum Values)
  try {
    console.log('\n[2] Testing POST /api/houses (Create Listing)...');
    
    // We send payload exactly as CreateListing.tsx would
    const rawData = {
        title: 'Test Penthouse View',
        description: 'A beautiful new test house.',
        houseType: 'mansion',
        monthlyRent: '150000',
        bedrooms: '4',
        bathrooms: '4',
        bookingFee: '15000',
        county: 'Nairobi',
        locationName: 'Nairobi - Westlands',
        amenities: ['wifi', 'security']
    };
    
    console.log("Local Zod Parse:");
    try {
        const validatedData = createHouseSchema.parse({
          ...rawData,
          bedrooms: rawData.bedrooms ? Number(rawData.bedrooms) : undefined,
          bathrooms: rawData.bathrooms ? Number(rawData.bathrooms) : undefined,
          monthlyRent: rawData.monthlyRent ? Number(rawData.monthlyRent) : undefined,
        });
        console.log("✅ Zod Passed");
    } catch(e: any) {
        console.log("❌ Zod Failed:", e);
    }

    console.log('\n[2] Testing POST /api/houses (Create Listing)...');
    
    // We send payload exactly as CreateListing.tsx would
    const formData = new FormData();
    formData.append('title', 'Test Penthouse View');
    formData.append('description', 'A beautiful new test house.');
    formData.append('houseType', 'mansion'); // Valid enum
    formData.append('rent', '150000'); // Rent mapping
    formData.append('bedrooms', '4');
    formData.append('bathrooms', '4');
    formData.append('bookingFee', '15000');
    formData.append('county', 'Nairobi');
    formData.append('locationName', 'Nairobi - Westlands');
    formData.append('amenities[]', 'wifi');
    formData.append('amenities[]', 'security');

    const houseRes = await axios.post(`${API_BASE}/houses`, formData, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    console.log('✅ House Creation Successful!', houseRes.data.house ? `ID: ${houseRes.data.house.houseId}` : '');
  } catch (err: any) {
    console.error('❌ House Creation Failed:');
    console.error(JSON.stringify(err.response?.data, null, 2));
  }

  // 3. Test Compliance API Route (Ensure no 404)
  try {
    console.log('\n[3] Testing GET /api/compliance (Checking compliance logs)...');
    const compRes = await axios.get(`${API_BASE}/compliance`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`✅ Compliance API reachable! Returned ${compRes.data.total || 0} logs. Status: ${compRes.status}`);
  } catch (err: any) {
    console.error('❌ Compliance API Failed (Should not be 404):', err.response?.status, err.response?.data || err.message);
  }

  console.log('\n--- TESTS COMPLETED ---');
}

runTests();
