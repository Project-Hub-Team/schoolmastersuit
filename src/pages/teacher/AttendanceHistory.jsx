import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { MdDownload, MdSearch, MdCalendarToday, MdPeople, MdCheckCircle, MdCancel, MdRemoveCircle, MdVisibility, MdClose, MdEdit, MdDelete } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import { readAllRecords, deleteRecord } from '../../utils/database';
import { CLASSES } from '../../constants/ghanaEducation';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const AttendanceHistory = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [students, setStudents] = useState({});
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  const clearFilters = () => {
    setSelectedClass('');
    setStartDate('');
    setEndDate('');
  };

  useEffect(() => {
    loadAttendanceHistory();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [attendanceRecords, selectedClass, startDate, endDate]);

  const loadAttendanceHistory = async () => {
    try {
      setLoading(true);
      const [attendanceResult, usersResult] = await Promise.all([
        readAllRecords('attendance'),
        readAllRecords('users')
      ]);

      if (attendanceResult.success && usersResult.success) {
        // Convert Firebase objects to arrays
        const attendanceData = Object.values(attendanceResult.data || {});
        const usersData = Object.values(usersResult.data || {});

        // Filter attendance records for teacher's classes
        const teacherClasses = userProfile?.classes || [];
        const teacherAttendance = attendanceData.filter(record =>
          teacherClasses.includes(record.classId)
        );

        // Create students lookup
        const studentsLookup = {};
        usersData.filter(user => user.role === 'student').forEach(student => {
          studentsLookup[student.id] = student;
        });

        setStudents(studentsLookup);
        setAttendanceRecords(teacherAttendance);
      }
    } catch (error) {
      console.error('Error loading attendance history:', error);
      toast.error('Failed to load attendance history');
    } finally {
      setLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = attendanceRecords;

    if (selectedClass) {
      filtered = filtered.filter(record => record.classId === selectedClass);
    }

    if (startDate) {
      filtered = filtered.filter(record => record.date >= startDate);
    }

    if (endDate) {
      filtered = filtered.filter(record => record.date <= endDate);
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    setFilteredRecords(filtered);
  };

  const getClassName = (classId) => {
    const classObj = CLASSES.find(cls => cls.id === classId);
    return classObj ? classObj.name : classId;
  };

  const getAttendanceStats = (attendance) => {
    const attendanceValues = Object.values(attendance || {});
    const present = attendanceValues.filter(status => status === 'present').length;
    const absent = attendanceValues.filter(status => status === 'absent').length;
    const total = attendanceValues.length;
    return { present, absent, total };
  };

  const downloadSinglePDF = (record) => {
    const doc = new jsPDF();

    // Page setup
    const marginLeft = 20;
    const marginRight = 190;
    const pageWidth = 210;
    const pageHeight = 297;
    const contentWidth = 170;

    // Blue gradient header (matching modal)
    doc.setFillColor(37, 99, 235); // Blue-600
    doc.rect(0, 0, pageWidth, 40, 'F');

    // Header content
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Attendance Report', marginLeft, 20);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text(`${getClassName(record.classId)} - ${new Date(record.date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })}`, marginLeft, 30);

    let yPos = 50;

    // School header (matching modal)
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('School Management System', pageWidth / 2, yPos, { align: 'center' });

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Daily Attendance Register', pageWidth / 2, yPos + 8, { align: 'center' });

    // Underline
    doc.setDrawColor(209, 213, 219); // Gray-300
    doc.setLineWidth(1);
    doc.line(marginLeft, yPos + 12, marginRight, yPos + 12);

    yPos += 25;

    // Class info grid (matching modal)
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(229, 231, 235); // Gray-200
    doc.setLineWidth(0.5);
    doc.roundedRect(marginLeft, yPos, contentWidth, 20, 2, 2, 'FD');

    // Class
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128); // Gray-600
    doc.text('Class', marginLeft + 15, yPos + 8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55); // Gray-800
    doc.text(getClassName(record.classId), marginLeft + 15, yPos + 15);

    // Date
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text('Date', pageWidth / 2, yPos + 8, { align: 'center' });
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(new Date(record.date).toLocaleDateString(), pageWidth / 2, yPos + 15, { align: 'center' });

    // Teacher
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text('Teacher', marginRight - 15, yPos + 8, { align: 'right' });
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(31, 41, 55);
    doc.text(userProfile?.displayName || 'N/A', marginRight - 15, yPos + 15, { align: 'right' });

    yPos += 35;

    // Table header (matching modal)
    doc.setFillColor(239, 246, 255); // Blue-50
    doc.rect(marginLeft, yPos, contentWidth, 12, 'F');

    doc.setTextColor(30, 64, 175); // Blue-800
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);

    // Table headers
    doc.text('S/N', marginLeft + 6, yPos + 8);
    doc.text('Student Name', marginLeft + 20, yPos + 8);
    doc.text('Student ID', marginLeft + 95, yPos + 8);
    doc.text('Status', marginLeft + 130, yPos + 8);

    yPos += 12;

    // Table data (matching modal exactly)
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);

    Object.entries(record.attendance || {}).forEach(([studentId, status], idx) => {
      const student = students[studentId];
      const studentName = student?.fullName || student?.displayName || 'Unknown Student';
      const studentIdText = student?.studentId || studentId;

      // Alternate row colors
      if (idx % 2 === 0) {
        doc.setFillColor(249, 250, 251); // Gray-50
        doc.rect(marginLeft, yPos, contentWidth, 10, 'F');
      }

      // Row borders
      doc.setDrawColor(229, 231, 235); // Gray-200
      doc.setLineWidth(0.5);
      doc.rect(marginLeft, yPos, contentWidth, 10);

      // Serial number
      doc.setTextColor(17, 24, 39); // Gray-900
      doc.setFont('helvetica', 'normal');
      doc.text(`${idx + 1}`, marginLeft + 6, yPos + 7);

      // Student name
      doc.setFont('helvetica', 'normal');
      const truncatedName = studentName.length > 20 ? studentName.substring(0, 17) + '...' : studentName;
      doc.text(truncatedName, marginLeft + 20, yPos + 7);

      // Student ID
      doc.setTextColor(75, 85, 99); // Gray-600
      doc.text(studentIdText, marginLeft + 95, yPos + 7);

      // Status (exactly matching modal) - using drawn symbols instead of Unicode
      if (status === 'present') {
        // Green circle with drawn checkmark
        doc.setFillColor(220, 252, 231); // Green-100
        doc.setDrawColor(34, 197, 94); // Green-500
        doc.circle(marginLeft + 137, yPos + 5, 3, 'FD');

        // Draw checkmark using lines
        doc.setDrawColor(34, 197, 94);
        doc.setLineWidth(0.8);
        doc.line(marginLeft + 135, yPos + 4, marginLeft + 137, yPos + 6); // First part
        doc.line(marginLeft + 137, yPos + 6, marginLeft + 141, yPos + 2); // Second part

        // Present text
        doc.setTextColor(21, 128, 61); // Green-700
        doc.setFont('helvetica', 'normal');
        doc.text('Present', marginLeft + 145, yPos + 7);
      } else {
        // Red circle with drawn X
        doc.setFillColor(254, 226, 226); // Red-100
        doc.setDrawColor(239, 68, 68); // Red-500
        doc.circle(marginLeft + 137, yPos + 5, 3, 'FD');

        // Draw X using lines
        doc.setDrawColor(239, 68, 68);
        doc.setLineWidth(0.8);
        doc.line(marginLeft + 135, yPos + 3, marginLeft + 141, yPos + 7); // First diagonal
        doc.line(marginLeft + 141, yPos + 3, marginLeft + 135, yPos + 7); // Second diagonal

        // Absent text
        doc.setTextColor(185, 28, 28); // Red-700
        doc.setFont('helvetica', 'normal');
        doc.text('Absent', marginLeft + 145, yPos + 7);
      }

      yPos += 10;

      // Add new page if needed
      if (yPos > 240) {
        doc.addPage();
        yPos = 20;
      }
    });

    yPos += 10;

    // Summary footer (matching modal exactly)
    const stats = getAttendanceStats(record.attendance);

    // Present box
    doc.setFillColor(240, 253, 244); // Green-50
    doc.setDrawColor(34, 197, 94);
    doc.setLineWidth(0.5);
    doc.roundedRect(marginLeft, yPos, 35, 20, 2, 2, 'FD');

    doc.setTextColor(34, 197, 94);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(stats.present.toString(), marginLeft + 17.5, yPos + 10, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Present', marginLeft + 17.5, yPos + 17, { align: 'center' });

    // Absent box
    doc.setFillColor(254, 242, 242); // Red-50
    doc.setDrawColor(239, 68, 68);
    doc.roundedRect(marginLeft + 45, yPos, 35, 20, 2, 2, 'FD');

    doc.setTextColor(239, 68, 68);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(stats.absent.toString(), marginLeft + 62.5, yPos + 10, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Absent', marginLeft + 62.5, yPos + 17, { align: 'center' });

    // Total box
    doc.setFillColor(239, 246, 255); // Blue-50
    doc.setDrawColor(59, 130, 246);
    doc.roundedRect(marginLeft + 90, yPos, 35, 20, 2, 2, 'FD');

    doc.setTextColor(59, 130, 246);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(stats.total.toString(), marginLeft + 107.5, yPos + 10, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Total Students', marginLeft + 107.5, yPos + 17, { align: 'center' });

    // Attendance rate box
    doc.setFillColor(250, 245, 255); // Purple-50
    doc.setDrawColor(147, 51, 234);
    doc.roundedRect(marginLeft + 135, yPos, 35, 20, 2, 2, 'FD');

    doc.setTextColor(147, 51, 234);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    const attendanceRate = stats.total > 0 ? `${((stats.present / stats.total) * 100).toFixed(1)}%` : '0%';
    doc.text(attendanceRate, marginLeft + 152.5, yPos + 10, { align: 'center' });
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Attendance Rate', marginLeft + 152.5, yPos + 17, { align: 'center' });

    yPos += 35;

    // Signature section (matching modal exactly)
    // Teacher signature
    doc.setDrawColor(156, 163, 175); // Gray-400
    doc.setLineWidth(0.5);
    doc.line(marginLeft + 20, yPos, marginLeft + 70, yPos);

    doc.setTextColor(107, 114, 128); // Gray-600
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text("Teacher's Signature", marginLeft + 45, yPos + 8, { align: 'center' });

    doc.setTextColor(31, 41, 55); // Gray-800
    doc.setFont('helvetica', 'normal');
    doc.text(userProfile?.displayName || '', marginLeft + 45, yPos + 15, { align: 'center' });

    // Date signature
    doc.line(marginLeft + 120, yPos, marginLeft + 170, yPos);

    doc.setTextColor(107, 114, 128);
    doc.text('Date', marginLeft + 145, yPos + 8, { align: 'center' });

    doc.setTextColor(31, 41, 55);
    doc.text(new Date().toLocaleDateString(), marginLeft + 145, yPos + 15, { align: 'center' });

    // Save the PDF
    const fileName = `attendance_report_${getClassName(record.classId)}_${record.date}.pdf`;
    doc.save(fileName);
    toast.success('PDF downloaded successfully');
  };

  const handleEdit = (record) => {
    // Navigate to attendance page with edit parameters
    navigate(`/teacher/attendance?editClass=${record.classId}&editDate=${record.date}`);
  };

  const handleDelete = async (record) => {
    // Show confirmation dialog
    const confirmDelete = window.confirm(
      `Are you sure you want to delete the attendance record for ${getClassName(record.classId)} on ${new Date(record.date).toLocaleDateString()}? This action cannot be undone.`
    );

    if (!confirmDelete) return;

    try {
      // Find the record key in the database
      const attendanceResult = await readAllRecords('attendance');
      if (attendanceResult.success) {
        const attendanceData = attendanceResult.data || {};
        const recordKey = Object.keys(attendanceData).find(key =>
          attendanceData[key].classId === record.classId &&
          attendanceData[key].date === record.date &&
          attendanceData[key].teacherId === record.teacherId
        );

        if (recordKey) {
          const deleteResult = await deleteRecord(`attendance/${recordKey}`);
          if (deleteResult.success) {
            toast.success('Attendance record deleted successfully');
            // Reload the attendance history
            loadAttendanceHistory();
          } else {
            toast.error('Failed to delete attendance record');
          }
        } else {
          toast.error('Attendance record not found');
        }
      } else {
        toast.error('Failed to load attendance records');
      }
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      toast.error('Failed to delete attendance record');
    }
  };

  const viewReport = (record) => {
    setSelectedRecord(record);
    setShowReportModal(true);
  };

  const closeReportModal = () => {
    setShowReportModal(false);
    setSelectedRecord(null);
  };

  if (loading) {
    return (
      <DashboardLayout title="Attendance History">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Attendance History">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Attendance History</h2>
            <p className="text-gray-600">View and manage attendance records</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="input w-full"
              >
                <option value="">All Classes</option>
                {CLASSES.filter(cls => userProfile?.classes?.includes(cls.id)).map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="input w-full"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="btn-secondary w-full"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="flex items-center gap-3">
              <MdCalendarToday className="text-blue-500" size={24} />
              <div>
                <p className="text-sm text-gray-600">Total Sessions</p>
                <p className="text-2xl font-bold text-gray-800">{filteredRecords.length}</p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <MdCheckCircle className="text-green-500" size={24} />
              <div>
                <p className="text-sm text-gray-600">Avg Attendance</p>
                <p className="text-2xl font-bold text-gray-800">
                  {filteredRecords.length > 0
                    ? `${(filteredRecords.reduce((acc, record) => {
                        const stats = getAttendanceStats(record.attendance);
                        return acc + (stats.present / stats.total);
                      }, 0) / filteredRecords.length * 100).toFixed(1)}%`
                    : '0%'
                  }
                </p>
              </div>
            </div>
          </div>
          <div className="card">
            <div className="flex items-center gap-3">
              <MdPeople className="text-purple-500" size={24} />
              <div>
                <p className="text-sm text-gray-600">Classes Covered</p>
                <p className="text-2xl font-bold text-gray-800">
                  {new Set(filteredRecords.map(r => r.classId)).size}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Attendance Records Table */}
        <div className="card">
          <div className="overflow-x-auto">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-8">
                <MdCalendarToday className="mx-auto text-gray-400" size={48} />
                <p className="text-gray-500 mt-2">No attendance records found</p>
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Present</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Absent</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendance %</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record, index) => {
                    const stats = getAttendanceStats(record.attendance);
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {new Date(record.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {getClassName(record.classId)}
                        </td>
                        <td className="px-4 py-3 text-sm text-green-600 font-medium">
                          {stats.present}
                        </td>
                        <td className="px-4 py-3 text-sm text-red-600 font-medium">
                          {stats.absent}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {stats.total}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {stats.total > 0 ? `${((stats.present / stats.total) * 100).toFixed(1)}%` : '0%'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => viewReport(record)}
                              className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                              title="View detailed report"
                            >
                              <MdVisibility size={18} />
                            </button>
                            <button
                              onClick={() => downloadSinglePDF(record)}
                              className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50 transition-colors"
                              title="Download PDF report"
                            >
                              <MdDownload size={18} />
                            </button>
                            <button
                              onClick={() => handleEdit(record)}
                              className="text-yellow-600 hover:text-yellow-800 p-2 rounded-lg hover:bg-yellow-50 transition-colors"
                              title="Edit attendance"
                            >
                              <MdEdit size={18} />
                            </button>
                            <button
                              onClick={() => handleDelete(record)}
                              className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete attendance record"
                            >
                              <MdDelete size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Attendance Report Modal */}
        {showReportModal && selectedRecord && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold">Attendance Report</h2>
                    <p className="text-blue-100 mt-1">
                      {getClassName(selectedRecord.classId)} - {new Date(selectedRecord.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <button
                    onClick={closeReportModal}
                    className="text-white hover:bg-blue-700 p-2 rounded-lg transition-colors"
                  >
                    <MdClose size={24} />
                  </button>
                </div>
              </div>

              {/* Report Content */}
              <div className="p-6 bg-gray-50">
                {/* School Header */}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">School Management System</h3>
                  <p className="text-gray-600">Daily Attendance Register</p>
                  <div className="border-b-2 border-gray-300 mt-4"></div>
                </div>

                {/* Class Info */}
                <div className="grid grid-cols-3 gap-4 mb-6 bg-white p-4 rounded-lg shadow-sm">
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Class</p>
                    <p className="font-bold text-lg text-gray-800">{getClassName(selectedRecord.classId)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="font-bold text-lg text-gray-800">{new Date(selectedRecord.date).toLocaleDateString()}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600">Teacher</p>
                    <p className="font-bold text-lg text-gray-800">{userProfile?.displayName || 'N/A'}</p>
                  </div>
                </div>

                {/* Attendance Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-gray-100 px-6 py-3 border-b">
                    <h4 className="font-bold text-gray-800">Student Attendance</h4>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-blue-50">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">S/N</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Student Name</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Student ID</th>
                          <th className="px-6 py-4 text-center text-xs font-bold text-blue-800 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-bold text-blue-800 uppercase tracking-wider">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {Object.entries(selectedRecord.attendance || {}).map(([studentId, status], index) => {
                          const student = students[studentId];
                          return (
                            <tr key={studentId} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {index + 1}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                {student?.fullName || student?.displayName || 'Unknown Student'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {student?.studentId || studentId}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-center">
                                <div className="flex items-center justify-center">
                                  {status === 'present' ? (
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                                        <span className="text-green-600 font-bold text-sm">✓</span>
                                      </div>
                                      <span className="text-sm font-medium text-green-700">Present</span>
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2">
                                      <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center">
                                        <span className="text-red-600 font-bold text-sm">✗</span>
                                      </div>
                                      <span className="text-sm font-medium text-red-700">Absent</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                {status === 'present' ? 'On time' : 'Absent from class'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Summary Footer */}
                <div className="mt-6 grid grid-cols-4 gap-4">
                  {(() => {
                    const stats = getAttendanceStats(selectedRecord.attendance);
                    return (
                      <>
                        <div className="bg-green-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-green-600">{stats.present}</div>
                          <div className="text-sm text-green-700">Present</div>
                        </div>
                        <div className="bg-red-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-red-600">{stats.absent}</div>
                          <div className="text-sm text-red-700">Absent</div>
                        </div>
                        <div className="bg-blue-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                          <div className="text-sm text-blue-700">Total Students</div>
                        </div>
                        <div className="bg-purple-50 p-4 rounded-lg text-center">
                          <div className="text-2xl font-bold text-purple-600">
                            {stats.total > 0 ? `${((stats.present / stats.total) * 100).toFixed(1)}%` : '0%'}
                          </div>
                          <div className="text-sm text-purple-700">Attendance Rate</div>
                        </div>
                      </>
                    );
                  })()}
                </div>

                {/* Signature Section */}
                <div className="mt-8 grid grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="border-b border-gray-400 w-full mb-2"></div>
                    <p className="text-sm text-gray-600">Teacher's Signature</p>
                    <p className="text-sm font-medium text-gray-800 mt-1">{userProfile?.displayName || ''}</p>
                  </div>
                  <div className="text-center">
                    <div className="border-b border-gray-400 w-full mb-2"></div>
                    <p className="text-sm text-gray-600">Date</p>
                    <p className="text-sm font-medium text-gray-800 mt-1">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
