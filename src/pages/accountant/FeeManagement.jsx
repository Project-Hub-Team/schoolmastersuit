/**
 * Fee Management Page
 * Manage fee structures and student fee accounts
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import DashboardLayout from '../../components/DashboardLayout';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  getFeeStructures,
  createFeeStructure,
  updateFeeStructure,
  getStudentAccountBalance,
  createAuditLog
} from '../../utils/accounting.database';

const FeeManagement = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [feeStructures, setFeeStructures] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingFee, setEditingFee] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'tuition',
    academicYear: '',
    term: '1',
    description: '',
    isActive: true
  });

  useEffect(() => {
    loadFeeStructures();
  }, []);

  const loadFeeStructures = async () => {
    setLoading(true);
    try {
      const result = await getFeeStructures();
      if (result.success) {
        setFeeStructures(result.data);
      }
    } catch (error) {
      console.error('Error loading fee structures:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const feeData = {
        ...formData,
        amount: parseFloat(formData.amount),
        createdBy: userProfile.uid
      };

      let result;
      if (editingFee) {
        result = await updateFeeStructure(editingFee.id, feeData);
        await createAuditLog({
          action: 'UPDATE_FEE_STRUCTURE',
          userId: userProfile.uid,
          userName: userProfile.displayName,
          details: `Updated fee structure: ${editingFee.name}`
        });
      } else {
        result = await createFeeStructure(feeData);
        await createAuditLog({
          action: 'CREATE_FEE_STRUCTURE',
          userId: userProfile.uid,
          userName: userProfile.displayName,
          details: `Created fee structure: ${feeData.name}`
        });
      }

      if (result.success) {
        alert('Fee structure saved successfully!');
        setShowModal(false);
        resetForm();
        loadFeeStructures();
      }
    } catch (error) {
      console.error('Error saving fee structure:', error);
      alert('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      category: 'tuition',
      academicYear: '',
      term: '1',
      description: '',
      isActive: true
    });
    setEditingFee(null);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-GH', {
      style: 'currency',
      currency: 'GHS'
    }).format(amount || 0);
  };

  if (loading && feeStructures.length === 0) {
    return <LoadingSpinner />;
  }

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Fee Management</h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            + New Fee Structure
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feeStructures.map((fee) => (
            <div key={fee.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-900">{fee.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${
                  fee.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {fee.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-600 mb-2">{formatCurrency(fee.amount)}</p>
              <p className="text-sm text-gray-600 mb-4">{fee.description}</p>
              <div className="space-y-2 text-sm text-gray-500">
                <p><span className="font-medium">Category:</span> {fee.category}</p>
                <p><span className="font-medium">Academic Year:</span> {fee.academicYear}</p>
                <p><span className="font-medium">Term:</span> {fee.term}</p>
              </div>
              <button
                onClick={() => {
                  setEditingFee(fee);
                  setFormData({
                    name: fee.name,
                    amount: fee.amount.toString(),
                    category: fee.category,
                    academicYear: fee.academicYear,
                    term: fee.term,
                    description: fee.description,
                    isActive: fee.isActive
                  });
                  setShowModal(true);
                }}
                className="mt-4 w-full px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50"
              >
                Edit
              </button>
            </div>
          ))}
        </div>

        {feeStructures.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No fee structures found</p>
          </div>
        )}

        {/* Fee Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingFee ? 'Edit Fee Structure' : 'New Fee Structure'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="tuition">Tuition</option>
                      <option value="books">Books</option>
                      <option value="uniform">Uniform</option>
                      <option value="transport">Transport</option>
                      <option value="meals">Meals</option>
                      <option value="activities">Activities</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
                    <input
                      type="text"
                      value={formData.academicYear}
                      onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
                      required
                      placeholder="e.g., 2024/2025"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Term *</label>
                    <select
                      value={formData.term}
                      onChange={(e) => setFormData({ ...formData, term: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="1">Term 1</option>
                      <option value="2">Term 2</option>
                      <option value="3">Term 3</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">Active</label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {loading ? 'Saving...' : (editingFee ? 'Update' : 'Create')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default FeeManagement;
