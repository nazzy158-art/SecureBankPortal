const { validateRegistration } = require('./middleware/validationMiddleware');

// Mock request, response, next for testing
const mockRequest = (body) => ({
  body
});

const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const mockNext = jest.fn();

// Test cases
console.log('Testing Registration Validation:\n');

// Test 1: Valid data
console.log('1. Testing VALID data:');
const validReq = mockRequest({
  full_name: "John Smith",
  id_number: "1234567890123",
  account_number: "123456789",
  username: "john_123",
  password: "SecurePass123"
});

const res1 = mockResponse();
validateRegistration[0](validReq, res1, mockNext); // Test first validator
// This should call next() without errors

// Test 2: Invalid data
console.log('\n2. Testing INVALID data:');
const invalidReq = mockRequest({
  full_name: "John123", // Numbers not allowed
  id_number: "123", // Too short
  account_number: "123abc", // Letters not allowed
  username: "ab", // Too short
  password: "weak" // Too weak
});

const res2 = mockResponse();
validateRegistration[0](invalidReq, res2, mockNext); // Test first validator
// This should return validation errors

console.log('Validation middleware test completed. Check your API endpoints to see it in action.');