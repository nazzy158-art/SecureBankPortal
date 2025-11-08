import React, { useState, useEffect } from 'react';
import api from '../../services/api';

const VerifiedPayments = ({ onStatsUpdate }) => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedPayments, setSelectedPayments] = useState([]);

  useEffect(() => {
    fetchVerifiedPayments();
  }, []);

  const fetchVerifiedPayments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await api.get('/payments/pending', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Filter only verified payments
      const verifiedPayments = response.data.payments.filter(p => p.status === 'verified');
      setPayments(verifiedPayments);
      
      // Update stats
      if (onStatsUpdate) {
        const submitted = response.data.payments.filter(p => p.status === 'submitted_to_swift').length;
        onStatsUpdate(prev => ({
          ...prev,
          verified: verifiedPayments.length,
          submitted: submitted
        }));
      }
    } catch (error) {
      setError('Failed to load verified payments');
      console.error('Error fetching verified payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPayment = (paymentId) => {
    setSelectedPayments(prev => {
      if (prev.includes(paymentId)) {
        return prev.filter(id => id !== paymentId);
      } else {
        return [...prev, paymentId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedPayments.length === payments.length) {
      setSelectedPayments([]);
    } else {
      setSelectedPayments(payments.map(p => p.id));
    }
  };

  const handleSubmitToSwift = async () => {
    if (selectedPayments.length === 0) {
      alert('Please select at least one payment to submit');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to submit ${selectedPayments.length} payment(s) to SWIFT?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await api.post('/payments/submit-to-swift', 
        { paymentIds: selectedPayments },
        { headers: { Authorization: `Bearer ${token}` }}
      );
      
      alert(`✅ Successfully submitted ${selectedPayments.length} payment(s) to SWIFT!`);
      setSelectedPayments([]);
      fetchVerifiedPayments(); // Refresh list
    } catch (error) {
      alert('❌ Failed to submit payments: ' + (error.response?.data?.message || error.message));
    } finally {
      setSubmitting(false);
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
          <div className="text-lg text-gray-600">Loading verified payments...</div>
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

      {/* Bulk Action Bar */}
      {payments.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <input
              type="checkbox"
              checked={selectedPayments.length === payments.length && payments.length > 0}
              onChange={handleSelectAll}
              className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              {selectedPayments.length} of {payments.length} selected
            </span>
          </div>
          
          <button
            onClick={handleSubmitToSwift}
            disabled={selectedPayments.length === 0 || submitting}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Submitting...
              </>
            ) : (
              <>
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                Submit to SWIFT
              </>
            )}
          </button>
        </div>
      )}

      {payments.length === 0 ? (
        <div className="bg-white p-12 rounded-lg shadow-md text-center">
          <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No verified payments</h3>
          <p className="mt-2 text-sm text-gray-500">Verified payments ready for SWIFT submission will appear here.</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedPayments.length === payments.length}
                    onChange={handleSelectAll}
                    className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payee Account
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  SWIFT Code
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verified On
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedPayments.includes(payment.id)}
                      onChange={() => handleSelectPayment(payment.id)}
                      className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    #{payment.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{payment.full_name}</div>
                    <div className="text-sm text-gray-500">{payment.user_account_number}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-bold text-gray-900">
                      {formatCurrency(payment.amount, payment.currency)}
                    </div>
                    <div className="text-sm text-gray-500">{payment.currency}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.payee_account_info}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                    {payment.swift_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(payment.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VerifiedPayments;