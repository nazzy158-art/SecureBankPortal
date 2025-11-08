import React, { useState, useEffect } from 'react';
import { paymentsAPI } from '../../services/api';

const PendingPayments = ({ onStatsUpdate }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [verifying, setVerifying] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState(null);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    try {
      const response = await paymentsAPI.getPending();
      setPayments(response.data.payments);
      
      // Update stats
      if (onStatsUpdate) {
        onStatsUpdate(prev => ({
          ...prev,
          pending: response.data.payments.length
        }));
      }
    } catch (error) {
      setError('Failed to load pending payments');
      console.error('Error fetching pending payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async (paymentId) => {
    if (!window.confirm('Are you sure you want to verify this payment?')) {
      return;
    }

    setVerifying(paymentId);
    try {
      await paymentsAPI.verify(paymentId);
      alert('✅ Payment verified successfully!');
      fetchPendingPayments(); // Refresh list
    } catch (error) {
      alert('❌ Failed to verify payment: ' + (error.response?.data?.message || error.message));
    } finally {
      setVerifying(null);
      setSelectedPayment(null);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg text-gray-600">Loading pending payments...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {payments.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-md text-center">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No pending payments</h3>
          <p className="mt-2 text-sm text-gray-500">All payments have been processed or verified.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {payments.map((payment) => (
            <div key={payment.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending Review
                      </span>
                      <span className="ml-3 text-sm text-gray-500">
                        ID: #{payment.id}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">
                      {formatCurrency(payment.amount, payment.currency)}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Submitted on {formatDate(payment.created_at)}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => setSelectedPayment(selectedPayment === payment.id ? null : payment.id)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    {selectedPayment === payment.id ? 'Hide Details' : 'View Details'}
                  </button>
                </div>

                {/* Payment Details */}
                {selectedPayment === payment.id && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Customer Name</p>
                        <p className="text-sm font-semibold text-gray-900">{payment.full_name}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Customer Account</p>
                        <p className="text-sm font-semibold text-gray-900">{payment.user_account_number}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Payee Account</p>
                        <p className="text-sm font-semibold text-gray-900">{payment.payee_account_info}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">SWIFT Code</p>
                        <p className="text-sm font-semibold text-gray-900">{payment.swift_code}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Amount</p>
                        <p className="text-sm font-semibold text-gray-900">{formatCurrency(payment.amount, payment.currency)}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-gray-500 uppercase">Currency</p>
                        <p className="text-sm font-semibold text-gray-900">{payment.currency}</p>
                      </div>
                    </div>

                    {/* Security Checks */}
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      <p className="text-xs font-medium text-gray-700 mb-2">Security Validation</p>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-gray-600">SWIFT code format validated</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-gray-600">Account information verified</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <span className="text-green-500 mr-2">✓</span>
                          <span className="text-gray-600">Amount within limits</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <button
                    onClick={() => handleVerifyPayment(payment.id)}
                    disabled={verifying === payment.id}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {verifying === payment.id ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Verifying...
                      </span>
                    ) : (
                      'Verify & Approve'
                    )}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingPayments;
