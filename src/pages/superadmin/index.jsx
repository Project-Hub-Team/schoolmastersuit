// Super Admin pages - Full implementations
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Save, UserPlus, Trash2, Shield, Ticket, Plus, Copy, Settings as SettingsIcon, Download } from 'lucide-react';
import { readAllRecords, createRecord, updateRecord, deleteRecord } from '../../utils/database';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export const SystemSettings = () => {
  const [settings, setSettings] = useState({
    schoolName: 'Ghana School Management System',
    academicYear: '2024/2025',
    currentTerm: 'Term 1',
    schoolEmail: 'info@ghanaschool.edu.gh',
    schoolPhone: '+233 XX XXX XXXX',
    schoolAddress: 'Accra, Ghana',
    currency: 'GH₵',
    termStartDate: '',
    termEndDate: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const result = await readAllRecords('settings');
      if (result.success && result.data.length > 0) {
        setSettings(result.data[0]);
      }
    } catch (error) {
      console.error('Failed to load settings');
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const result = await createRecord('settings', settings);
      if (result.success) {
        toast.success('Settings saved successfully');
      }
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="System Settings">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">System Settings</h2>
            <p className="text-gray-600">Configure system-wide settings and preferences</p>
          </div>
          <button onClick={handleSave} disabled={loading} className="btn btn-primary flex items-center gap-2">
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <SettingsIcon size={20} />
              School Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">School Name</label>
                <input
                  type="text"
                  value={settings.schoolName}
                  onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={settings.schoolEmail}
                  onChange={(e) => setSettings({ ...settings, schoolEmail: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={settings.schoolPhone}
                  onChange={(e) => setSettings({ ...settings, schoolPhone: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea
                  value={settings.schoolAddress}
                  onChange={(e) => setSettings({ ...settings, schoolAddress: e.target.value })}
                  className="input"
                  rows="3"
                />
              </div>
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <SettingsIcon size={20} />
              Academic Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year</label>
                <input
                  type="text"
                  value={settings.academicYear}
                  onChange={(e) => setSettings({ ...settings, academicYear: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Term</label>
                <select
                  value={settings.currentTerm}
                  onChange={(e) => setSettings({ ...settings, currentTerm: e.target.value })}
                  className="input"
                >
                  <option value="Term 1">Term 1</option>
                  <option value="Term 2">Term 2</option>
                  <option value="Term 3">Term 3</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Term Start Date</label>
                <input
                  type="date"
                  value={settings.termStartDate}
                  onChange={(e) => setSettings({ ...settings, termStartDate: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Term End Date</label>
                <input
                  type="date"
                  value={settings.termEndDate}
                  onChange={(e) => setSettings({ ...settings, termEndDate: e.target.value })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <input
                  type="text"
                  value={settings.currency}
                  onChange={(e) => setSettings({ ...settings, currency: e.target.value })}
                  className="input"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export const ManageAdmins = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadAdmins();
  }, []);

  const loadAdmins = async () => {
    try {
      const result = await readAllRecords('users');
      if (result.success) {
        const adminUsers = result.data.filter(u => u.role === 'admin' || u.role === 'super_admin');
        setAdmins(adminUsers);
      }
    } catch (error) {
      toast.error('Failed to load administrators');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdminStatus = async (admin) => {
    try {
      const newStatus = admin.status === 'active' ? 'inactive' : 'active';
      const result = await updateRecord('users', admin.id, { status: newStatus });
      if (result.success) {
        toast.success(`Admin ${newStatus === 'active' ? 'activated' : 'deactivated'} successfully`);
        loadAdmins();
      }
    } catch (error) {
      toast.error('Failed to update admin status');
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Manage Admins">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Manage Admins">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Manage Administrators</h2>
            <p className="text-gray-600">Add, edit, or remove administrator accounts</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary flex items-center gap-2">
            <UserPlus size={18} />
            Add Admin
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-sm text-gray-600">Total Admins</p>
            <p className="text-2xl font-bold text-gray-800">{admins.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {admins.filter(a => a.status === 'active').length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Super Admins</p>
            <p className="text-2xl font-bold text-primary-600">
              {admins.filter(a => a.role === 'super_admin').length}
            </p>
          </div>
        </div>

        <div className="card">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {admins.map(admin => (
                  <tr key={admin.id}>
                    <td className="px-4 py-3 font-medium">{admin.fullName}</td>
                    <td className="px-4 py-3 text-sm">{admin.email}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        admin.role === 'super_admin'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {admin.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        admin.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {admin.status || 'active'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {admin.createdAt ? new Date(admin.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleAdminStatus(admin)}
                        className={`px-3 py-1 rounded text-sm ${
                          admin.status === 'active'
                            ? 'bg-red-50 text-red-600 hover:bg-red-100'
                            : 'bg-green-50 text-green-600 hover:bg-green-100'
                        }`}
                      >
                        {admin.status === 'active' ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {showAddModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-xl font-bold mb-4">Add New Administrator</h3>
              <p className="text-sm text-gray-600 mb-4">
                Note: Use the create-super-admins.js script or Firebase console to create admin accounts.
              </p>
              <button
                onClick={() => setShowAddModal(false)}
                className="btn btn-secondary w-full"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export const Vouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [voucherCount, setVoucherCount] = useState(10);

  useEffect(() => {
    loadVouchers();
  }, []);

  const loadVouchers = async () => {
    try {
      const result = await readAllRecords('vouchers');
      if (result.success) {
        setVouchers(result.data);
      }
    } catch (error) {
      toast.error('Failed to load vouchers');
    } finally {
      setLoading(false);
    }
  };

  const generatePIN = () => {
    // Generate 6-digit PIN
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const generateVouchers = async () => {
    setGenerating(true);
    try {
      const newVouchers = [];
      for (let i = 0; i < voucherCount; i++) {
        const timestamp = Date.now() + i; // Add index to prevent duplicates
        const code = `GH${timestamp}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
        const pin = generatePIN();
        const voucher = {
          code,
          pin,
          status: 'unused',
          createdAt: new Date().toISOString(),
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        };
        const result = await createRecord('vouchers', voucher);
        if (result.success) {
          newVouchers.push({ ...voucher, id: result.id });
        }
      }
      toast.success(`${newVouchers.length} vouchers generated successfully`);
      loadVouchers();
    } catch (error) {
      console.error('Voucher generation error:', error);
      toast.error('Failed to generate vouchers');
    } finally {
      setGenerating(false);
    }
  };

  const copyVoucher = (code, pin) => {
    const text = `Voucher Code: ${code}\nPIN: ${pin}`;
    navigator.clipboard.writeText(text);
    toast.success('Voucher details copied to clipboard');
  };

  const exportToPDF = () => {
    const unusedVouchers = vouchers.filter(v => v.status === 'unused' && new Date(v.expiresAt) > new Date());
    
    if (unusedVouchers.length === 0) {
      toast.error('No unused vouchers available to export');
      return;
    }

    // Create printable content
    const printWindow = window.open('', '_blank');
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Student Registration Vouchers</title>
          <style>
            @page {
              size: A4;
              margin: 20mm;
            }
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #D97706;
              padding-bottom: 20px;
            }
            .header h1 {
              color: #D97706;
              margin: 0;
              font-size: 24px;
            }
            .header p {
              color: #666;
              margin: 5px 0;
            }
            .voucher-grid {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 15px;
              margin-bottom: 20px;
            }
            .voucher {
              border: 2px solid #D97706;
              border-radius: 8px;
              padding: 15px;
              background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
              page-break-inside: avoid;
            }
            .voucher-title {
              font-weight: bold;
              color: #92400E;
              font-size: 14px;
              margin-bottom: 10px;
              text-align: center;
              border-bottom: 1px solid #D97706;
              padding-bottom: 5px;
            }
            .voucher-detail {
              margin: 8px 0;
              font-size: 12px;
            }
            .voucher-label {
              color: #92400E;
              font-weight: 600;
              display: inline-block;
              width: 100px;
            }
            .voucher-value {
              color: #000;
              font-weight: bold;
              font-family: 'Courier New', monospace;
            }
            .footer {
              margin-top: 30px;
              padding-top: 20px;
              border-top: 2px solid #D97706;
              text-align: center;
              font-size: 11px;
              color: #666;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🇬🇭 Ghana School Management System</h1>
            <p>Student Registration Vouchers</p>
            <p>Generated: ${new Date().toLocaleString()}</p>
          </div>
          
          <div class="voucher-grid">
            ${unusedVouchers.map(v => `
              <div class="voucher">
                <div class="voucher-title">STUDENT REGISTRATION VOUCHER</div>
                <div class="voucher-detail">
                  <span class="voucher-label">Code:</span>
                  <span class="voucher-value">${v.code}</span>
                </div>
                <div class="voucher-detail">
                  <span class="voucher-label">PIN:</span>
                  <span class="voucher-value">${v.pin}</span>
                </div>
                <div class="voucher-detail">
                  <span class="voucher-label">Valid Until:</span>
                  <span class="voucher-value">${new Date(v.expiresAt).toLocaleDateString()}</span>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="footer">
            <p><strong>Instructions:</strong> Use this voucher code and PIN to register as a student.</p>
            <p>Keep this voucher safe and confidential. Do not share with unauthorized persons.</p>
            <p>Each voucher can only be used once and expires on the date shown.</p>
          </div>
          
          <div class="no-print" style="margin-top: 20px; text-align: center;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #D97706; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px;">
              Print Vouchers
            </button>
            <button onclick="window.close()" style="padding: 10px 20px; background: #6B7280; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 16px; margin-left: 10px;">
              Close
            </button>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <DashboardLayout title="Vouchers">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Vouchers">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">E-Voucher Management</h2>
            <p className="text-gray-600">Generate and manage student registration vouchers</p>
          </div>
          <button
            onClick={exportToPDF}
            disabled={vouchers.filter(v => v.status === 'unused').length === 0}
            className="btn btn-primary flex items-center gap-2"
          >
            <Download size={18} />
            Export to PDF
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-gray-600">Total Vouchers</p>
            <p className="text-2xl font-bold text-gray-800">{vouchers.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Unused</p>
            <p className="text-2xl font-bold text-green-600">
              {vouchers.filter(v => v.status === 'unused').length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Used</p>
            <p className="text-2xl font-bold text-blue-600">
              {vouchers.filter(v => v.status === 'used').length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Expired</p>
            <p className="text-2xl font-bold text-red-600">
              {vouchers.filter(v => new Date(v.expiresAt) < new Date()).length}
            </p>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold mb-4">Generate New Vouchers</h3>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Number of Vouchers</label>
              <input
                type="number"
                value={voucherCount}
                onChange={(e) => setVoucherCount(parseInt(e.target.value) || 1)}
                min="1"
                max="100"
                className="input"
              />
            </div>
            <button
              onClick={generateVouchers}
              disabled={generating}
              className="btn btn-primary flex items-center gap-2"
            >
              <Plus size={18} />
              {generating ? 'Generating...' : 'Generate Vouchers'}
            </button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold mb-4">Voucher List</h3>
          
          {vouchers.length === 0 ? (
            <div className="text-center py-12">
              <Ticket className="mx-auto mb-3 text-gray-400" size={48} />
              <p className="text-lg font-medium text-gray-700">No vouchers generated</p>
              <p className="text-sm text-gray-500">Generate vouchers to allow student registration</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Voucher Code</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PIN</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expires</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Used By</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {vouchers.map(voucher => {
                    const isExpired = new Date(voucher.expiresAt) < new Date();
                    return (
                      <tr key={voucher.id}>
                        <td className="px-4 py-3 font-mono text-sm font-bold">{voucher.code}</td>
                        <td className="px-4 py-3 font-mono text-sm font-bold text-primary-600">{voucher.pin}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            voucher.status === 'used'
                              ? 'bg-blue-100 text-blue-800'
                              : isExpired
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {voucher.status === 'used' ? 'Used' : isExpired ? 'Expired' : 'Unused'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(voucher.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {new Date(voucher.expiresAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm">{voucher.usedBy || 'N/A'}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => copyVoucher(voucher.code, voucher.pin)}
                            className="text-primary-600 hover:text-primary-800"
                            title="Copy voucher details"
                          >
                            <Copy size={18} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
