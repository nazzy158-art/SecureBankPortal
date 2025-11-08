const axios = require('axios');

// Configure axios to accept self-signed certificates
const httpsAgent = new (require('https').Agent)({
  rejectUnauthorized: false
});

const API_BASE = 'https://localhost:5000/api';
const api = axios.create({
  httpsAgent: httpsAgent,
  baseURL: API_BASE
});

let authToken = '';

async function testPaymentSystem() {
  try {
    console.log('=== Testing Payment System ===');

    // First, login as a customer
    console.log('\n1. Logging in as customer...');
    const loginResponse = await api.post('/auth/login', {
      username: 'testuser_1760244537186', // Use the user from previous test
      password: 'SecurePass123'
    });
    
    authToken = loginResponse.data.token;
    console.log('✅ Customer login successful');

    // Create a payment
    console.log('\n2. Creating a payment...');
    const paymentData = {
      amount: '1500.00',
      currency: 'USD',
      payee_account_info: 'US123456789012',
      swift_code: 'BOFAUS3N'
    };

    const paymentResponse = await api.post('/payments', paymentData, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Payment created successfully');
    console.log('   Payment ID:', paymentResponse.data.payment.id);
    console.log('   Status:', paymentResponse.data.payment.status);

    // Get user's payments
    console.log('\n3. Getting payment history...');
    const historyResponse = await api.get('/payments/my-payments', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Payment history retrieved');
    console.log('   Number of payments:', historyResponse.data.payments.length);

    // Get pending payments (as employee)
    console.log('\n4. Getting pending payments...');
    const pendingResponse = await api.get('/payments/pending', {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    console.log('✅ Pending payments retrieved');
    console.log('   Pending payments:', pendingResponse.data.payments.length);

    console.log('\n🎉 PAYMENT SYSTEM TESTS COMPLETED!');

  } catch (error) {
    if (error.response) {
      console.log('❌ Error:', error.response.status, error.response.data);
    } else {
      console.log('❌ Error:', error.message);
    }
  }
}

testPaymentSystem();
