import React, { useState } from 'react';
import { paymentsAPI } from '../../services/api';

const PaymentForm = ({ onPaymentCreated }) => {
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'USD',
    payee_account_info: '',
    swift_code: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const currencies = [
    { code: 'USD', name: 'US Dollar' },
    { code: 'EUR', name: 'Euro' },
    { code: 'GBP', name: 'British Pound' },
    { code: 'ZAR', name: 'South African Rand' },
    { code: 'JPY', name: 'Japanese Yen' },
    { code: 'AUD', name: 'Australian Dollar' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Client-side validation
    if (parseFloat(formData.amount) <= 0) {
      setError('Amount must be greater than 0');
      setLoading(false);
      return;
    }

    try {
      const response = await paymentsAPI.create(formData);
      setSuccess('Payment created successfully! It is now pending verification.');
      setFormData({
        amount: '',
        currency: 'USD',
        payee_account_info: '',
        swift_code: ''
      });
      
      if (onPaymentCreated) {
        onPaymentCreated(response.data.payment);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Create International Payment</h2>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700">
            Amount *
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            step="0.01"
            min="0.01"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="0.00"
            value={formData.amount}
            onChange={handleChange}
          />
        </div>

        <div>
          <label htmlFor="currency" className="block text-sm font-medium text-gray-700">
            Currency *
          </label>
          <select
            id="currency"
            name="currency"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            value={formData.currency}
            onChange={handleChange}
          >
            {currencies.map(currency => (
              <option key={currency.code} value={currency.code}>
                {currency.code} - {currency.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="payee_account_info" className="block text-sm font-medium text-gray-700">
            Payee Account Information *
          </label>
          <input
            type="text"
            id="payee_account_info"
            name="payee_account_info"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter payee account number or IBAN"
            value={formData.payee_account_info}
            onChange={handleChange}
          />
          <p className="text-xs text-gray-500 mt-1">Alphanumeric characters and spaces only (5-34 characters)</p>
        </div>

        <div>
          <label htmlFor="swift_code" className="block text-sm font-medium text-gray-700">
            SWIFT/BIC Code *
          </label>
          <input
            type="text"
            id="swift_code"
            name="swift_code"
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., BOFAUS3N"
            value={formData.swift_code}
            onChange={handleChange}
          />
          <p className="text-xs text-gray-500 mt-1">8 or 11 alphanumeric characters</p>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Creating Payment...' : 'Create Payment'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PaymentForm;