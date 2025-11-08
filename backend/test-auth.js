const axios = require('axios');

// Configure axios to accept self-signed certificates for development
const httpsAgent = new (require('https').Agent)({
  rejectUnauthorized: false // Ignore self-signed certificate error
});

const API_BASE = 'https://localhost:5000/api';

// Create axios instance with SSL bypass for development
const api = axios.create({
  httpsAgent: httpsAgent,
  baseURL: API_BASE
});

// Test data
const testUser = {
  full_name: "Test User",
  id_number: "1234567890123",
  account_number: "123456789",
  username: "testuser_" + Date.now(), // Unique username each test
  password: "SecurePass123"
};

async function testAuthentication() {
  try {
    console.log('=== Testing User Registration ===');
    
    // Test registration
    const registerResponse = await api.post('/auth/register', testUser);
    console.log('✅ Registration successful:', registerResponse.data.message);
    console.log('   User ID:', registerResponse.data.user.id);

    // Test login
    console.log('\n=== Testing User Login ===');
    const loginResponse = await api.post('/auth/login', {
      username: testUser.username,
      password: testUser.password
    });
    console.log('✅ Login successful:', loginResponse.data.message);
    console.log('   Token received:', loginResponse.data.token ? 'Yes' : 'No');

    // Test protected route
    console.log('\n=== Testing Protected Route ===');
    const token = loginResponse.data.token;
    const profileResponse = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('✅ Protected route access successful');
    console.log('   User profile:', profileResponse.data.user);

    console.log('\n🎉 ALL AUTHENTICATION TESTS PASSED!');

  } catch (error) {
    if (error.response) {
      console.log('❌ API Error:', error.response.status, error.response.data);
    } else if (error.request) {
      console.log('❌ Network Error:', error.message);
      console.log('   Make sure the server is running on https://localhost:5000');
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

// First, test if server is reachable
async function testServerConnection() {
  try {
    console.log('🔍 Testing server connection...');
    const healthResponse = await api.get('/health');
    console.log('✅ Server is running:', healthResponse.data.message);
    console.log('   Environment:', healthResponse.data.environment);
    return true;
  } catch (error) {
    console.log('❌ Cannot connect to server. Make sure it\'s running with: npm run dev');
    return false;
  }
}

async function runTests() {
  const serverReady = await testServerConnection();
  if (serverReady) {
    await testAuthentication();
  }
}

runTests();