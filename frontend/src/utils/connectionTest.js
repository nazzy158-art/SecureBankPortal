import { testConnection } from '../services/api';

export const checkBackendConnection = async () => {
  console.log('Testing backend connection...');
  const result = await testConnection();
  
  if (result.success) {
    console.log('✅ Backend connection successful:', result.data);
    return true;
  } else {
    console.error('❌ Backend connection failed:', result.error);
    console.log('💡 Troubleshooting tips:');
    console.log('   1. Make sure backend is running: cd backend && npm run dev');
    console.log('   2. Check if port 5000 is available');
    console.log('   3. Verify no firewall is blocking the connection');
    return false;
  }
};