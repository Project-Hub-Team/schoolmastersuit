// Admin Pages - Full implementations

import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { Plus, Search, Edit, Trash2, Download, Upload, Eye, UserPlus, DollarSign, Users, GraduationCap, UserCheck, BookOpen, TrendingUp } from 'lucide-react';
import { getAllStudents, createStudent, updateStudent, deleteStudent, getAllTeachers, readAllRecords } from '../../utils/database';
import { CLASSES, getSubjectsByClass } from '../../constants/ghanaEducation';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const result = await getAllStudents();
      if (result.success) {
        setStudents(result.data || []);
      }
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = () => {
    setEditingStudent(null);
    setShowAddModal(true);
  };

  const handleEditStudent = (student) => {
    setEditingStudent(student);
    setShowAddModal(true);
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm('Are you sure you want to delete this student?')) {
      try {
        await deleteStudent(studentId);
        toast.success('Student deleted successfully');
        loadStudents();
      } catch (error) {
        toast.error('Failed to delete student');
      }
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = selectedClass === 'all' || student.class === selectedClass;
    return matchesSearch && matchesClass;
  });

  if (loading) {
    return (
      <DashboardLayout title="Student Management">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Student Management">
      <div className="space-y-6">
        {/* Header with Actions */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Students</h2>
            <p className="text-gray-600">Manage student records and enrollment</p>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-secondary flex items-center gap-2">
              <Download size={18} />
              Export
            </button>
            <button onClick={handleAddStudent} className="btn btn-primary flex items-center gap-2">
              <Plus size={18} />
              Add Student
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10 w-full"
              />
            </div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="input"
            >
              <option value="all">All Classes</option>
              {CLASSES.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Students Table */}
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                      <UserPlus className="mx-auto mb-3 text-gray-400" size={48} />
                      <p className="text-lg font-medium">No students found</p>
                      <p className="text-sm">Add your first student to get started</p>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {student.studentId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{student.fullName}</div>
                        <div className="text-sm text-gray-500">{student.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {CLASSES.find(c => c.id === student.class)?.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.gender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          student.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {student.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button onClick={() => handleEditStudent(student)} className="text-blue-600 hover:text-blue-900">
                            <Edit size={18} />
                          </button>
                          <button onClick={() => handleDeleteStudent(student.id)} className="text-red-600 hover:text-red-900">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-gray-600">Total Students</p>
            <p className="text-2xl font-bold text-gray-800">{students.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {students.filter(s => s.status === 'active').length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Male</p>
            <p className="text-2xl font-bold text-blue-600">
              {students.filter(s => s.gender === 'Male').length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Female</p>
            <p className="text-2xl font-bold text-pink-600">
              {students.filter(s => s.gender === 'Female').length}
            </p>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal - Placeholder for now */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold mb-4">
              {editingStudent ? 'Edit Student' : 'Add New Student'}
            </h3>
            <p className="text-gray-600 mb-4">
              Student registration form coming soon. Use voucher registration or Firebase console for now.
            </p>
            <button onClick={() => setShowAddModal(false)} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export const Teachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    try {
      const result = await getAllTeachers();
      if (result.success) {
        setTeachers(result.data || []);
      }
    } catch (error) {
      toast.error('Failed to load teachers');
    } finally {
      setLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <DashboardLayout title="Teacher Management">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Teacher Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Teachers</h2>
            <p className="text-gray-600">Manage teacher records and assignments</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary flex items-center gap-2">
            <Plus size={18} />
            Add Teacher
          </button>
        </div>

        <div className="card">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search teachers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTeachers.length === 0 ? (
            <div className="col-span-full text-center py-12 card">
              <UserPlus className="mx-auto mb-3 text-gray-400" size={48} />
              <p className="text-lg font-medium text-gray-700">No teachers found</p>
              <p className="text-sm text-gray-500">Add your first teacher to get started</p>
            </div>
          ) : (
            filteredTeachers.map(teacher => (
              <div key={teacher.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-600">
                      {teacher.fullName?.charAt(0)}
                    </span>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    teacher.status === 'active' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {teacher.status || 'active'}
                  </span>
                </div>
                <h3 className="font-bold text-lg text-gray-800">{teacher.fullName}</h3>
                <p className="text-sm text-gray-600">{teacher.email}</p>
                <p className="text-sm text-gray-600 mt-2">
                  Subjects: {teacher.subjects?.join(', ') || 'Not assigned'}
                </p>
                <div className="mt-4 flex gap-2">
                  <button className="btn btn-secondary flex-1 text-sm">
                    <Eye size={16} className="inline mr-1" />
                    View
                  </button>
                  <button className="btn btn-primary flex-1 text-sm">
                    <Edit size={16} className="inline mr-1" />
                    Edit
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-sm text-gray-600">Total Teachers</p>
            <p className="text-2xl font-bold text-gray-800">{teachers.length}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Active</p>
            <p className="text-2xl font-bold text-green-600">
              {teachers.filter(t => t.status === 'active').length}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">On Leave</p>
            <p className="text-2xl font-bold text-orange-600">
              {teachers.filter(t => t.status === 'leave').length}
            </p>
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4">
            <h3 className="text-xl font-bold mb-4">Add New Teacher</h3>
            <p className="text-gray-600 mb-4">
              Teacher registration form coming soon. Use Firebase console for now.
            </p>
            <button onClick={() => setShowAddModal(false)} className="btn btn-secondary">
              Close
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export const Classes = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    try {
      const result = await readAllRecords('classes');
      if (result.success) {
        setClasses(result.data || []);
      }
    } catch (error) {
      toast.error('Failed to load classes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Class Management">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Class Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Classes</h2>
            <p className="text-gray-600">Manage class assignments and schedules</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2">
            <Plus size={18} />
            Create Class
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CLASSES.map(classInfo => {
            const classData = classes.find(c => c.classId === classInfo.id) || {};
            const studentCount = classData.studentCount || 0;
            
            return (
              <div key={classInfo.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{classInfo.name}</h3>
                    <p className="text-sm text-gray-600">{classInfo.level}</p>
                  </div>
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    {studentCount} students
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Class Teacher:</span>
                    <span className="font-medium">{classData.teacher || 'Not assigned'}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subjects:</span>
                    <span className="font-medium">{classInfo.subjects?.length || 0}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="btn btn-secondary flex-1 text-sm">
                    <Eye size={16} className="inline mr-1" />
                    View
                  </button>
                  <button className="btn btn-primary flex-1 text-sm">
                    <Edit size={16} className="inline mr-1" />
                    Manage
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
};

export const Fees = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState('term1');

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      const result = await readAllRecords('fees');
      if (result.success) {
        setFees(result.data || []);
      }
    } catch (error) {
      toast.error('Failed to load fees');
    } finally {
      setLoading(false);
    }
  };

  const totalExpected = fees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
  const totalPaid = fees.reduce((sum, fee) => sum + (fee.paidAmount || 0), 0);
  const totalOutstanding = totalExpected - totalPaid;

  if (loading) {
    return (
      <DashboardLayout title="Fee Management">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Fee Management">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Fee Management</h2>
            <p className="text-gray-600">Track fees, payments, and outstanding balances</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2">
            <Plus size={18} />
            Record Payment
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-gray-600">Total Expected</p>
            <p className="text-2xl font-bold text-gray-800">GH₵ {totalExpected.toLocaleString()}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Total Paid</p>
            <p className="text-2xl font-bold text-green-600">GH₵ {totalPaid.toLocaleString()}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Outstanding</p>
            <p className="text-2xl font-bold text-red-600">GH₵ {totalOutstanding.toLocaleString()}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Collection Rate</p>
            <p className="text-2xl font-bold text-blue-600">
              {totalExpected > 0 ? Math.round((totalPaid / totalExpected) * 100) : 0}%
            </p>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Payment Records</h3>
            <select
              value={selectedTerm}
              onChange={(e) => setSelectedTerm(e.target.value)}
              className="input w-auto"
            >
              <option value="term1">Term 1</option>
              <option value="term2">Term 2</option>
              <option value="term3">Term 3</option>
            </select>
          </div>

          {fees.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="mx-auto mb-3 text-gray-400" size={48} />
              <p className="text-lg font-medium text-gray-700">No fee records found</p>
              <p className="text-sm text-gray-500">Fee records will appear here once payments are recorded</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Balance</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {fees.map(fee => (
                    <tr key={fee.id}>
                      <td className="px-4 py-3 text-sm">{fee.studentName}</td>
                      <td className="px-4 py-3 text-sm">{fee.class}</td>
                      <td className="px-4 py-3 text-sm">GH₵ {fee.amount}</td>
                      <td className="px-4 py-3 text-sm text-green-600">GH₵ {fee.paidAmount || 0}</td>
                      <td className="px-4 py-3 text-sm text-red-600">
                        GH₵ {fee.amount - (fee.paidAmount || 0)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          fee.paidAmount >= fee.amount
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {fee.paidAmount >= fee.amount ? 'Paid' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export const Reports = () => {
  const [reportType, setReportType] = useState('students');
  const [loading, setLoading] = useState(false);

  const generateReport = () => {
    toast.success(`Generating ${reportType} report...`);
    // Report generation logic here
  };

  return (
    <DashboardLayout title="Reports & Analytics">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reports & Analytics</h2>
          <p className="text-gray-600">Generate comprehensive reports and analytics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setReportType('students')}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2">Student Reports</h3>
            <p className="text-sm text-gray-600 mb-4">Enrollment, demographics, and performance reports</p>
            <button className="btn btn-secondary w-full text-sm">Generate Report</button>
          </div>

          <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setReportType('academic')}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <GraduationCap className="text-green-600" size={24} />
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2">Academic Reports</h3>
            <p className="text-sm text-gray-600 mb-4">Class performance, grades, and assessments</p>
            <button className="btn btn-secondary w-full text-sm">Generate Report</button>
          </div>

          <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setReportType('attendance')}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <UserCheck className="text-purple-600" size={24} />
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2">Attendance Reports</h3>
            <p className="text-sm text-gray-600 mb-4">Student and teacher attendance analytics</p>
            <button className="btn btn-secondary w-full text-sm">Generate Report</button>
          </div>

          <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setReportType('financial')}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <DollarSign className="text-yellow-600" size={24} />
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2">Financial Reports</h3>
            <p className="text-sm text-gray-600 mb-4">Fee collection, payments, and revenue</p>
            <button className="btn btn-secondary w-full text-sm">Generate Report</button>
          </div>

          <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setReportType('teacher')}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <BookOpen className="text-red-600" size={24} />
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2">Teacher Reports</h3>
            <p className="text-sm text-gray-600 mb-4">Teaching assignments and performance</p>
            <button className="btn btn-secondary w-full text-sm">Generate Report</button>
          </div>

          <div className="card hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setReportType('custom')}>
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="text-indigo-600" size={24} />
              </div>
            </div>
            <h3 className="font-bold text-lg mb-2">Custom Reports</h3>
            <p className="text-sm text-gray-600 mb-4">Build your own custom analytics</p>
            <button className="btn btn-secondary w-full text-sm">Create Custom</button>
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-bold mb-4">Quick Export</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="btn btn-primary flex items-center justify-center gap-2">
              <Download size={18} />
              Export to PDF
            </button>
            <button className="btn btn-primary flex items-center justify-center gap-2">
              <Download size={18} />
              Export to Excel
            </button>
            <button className="btn btn-primary flex items-center justify-center gap-2">
              <Download size={18} />
              Export to CSV
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
