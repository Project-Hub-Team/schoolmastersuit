// Student pages - Full implementations
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { MdDownload, MdCalendarToday, MdAttachMoney, MdMenuBook, MdTrendingUp, MdEmojiEvents, MdDescription } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import { readAllRecords } from '../../utils/database';
import { GRADING_SCALE, CLASSES, getSubjectsByClass } from '../../constants/ghanaEducation';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export const MyResults = () => {
  const { userProfile } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');

  // Ghanaian school terms
  const TERMS = [
    { id: 'term1', name: 'Term 1', label: 'First Term' },
    { id: 'term2', name: 'Term 2', label: 'Second Term' },
    { id: 'term3', name: 'Term 3', label: 'Third Term' }
  ];

  // Generate academic years dynamically
  const currentYear = new Date().getFullYear();
  const ACADEMIC_YEARS = [];
  for (let i = -1; i <= 3; i++) {
    const startYear = currentYear + i;
    const endYear = startYear + 1;
    ACADEMIC_YEARS.push({
      id: `${startYear}-${endYear}`,
      name: `${startYear}/${endYear}`
    });
  }

  useEffect(() => {
    loadStudentResults();
  }, [userProfile, selectedTerm, selectedAcademicYear]);

  const loadStudentResults = async () => {
    if (!userProfile?.id) return;

    try {
      const gradesResult = await readAllRecords('grades');
      if (gradesResult.success) {
        const allGrades = Object.values(gradesResult.data || {});

        // Filter grades for this student that are published (published status)
        const studentResults = [];

        allGrades.forEach(grade => {
          if (grade.status === 'published' && grade.grades && grade.grades[userProfile.id]) {
            // Apply filters
            if (selectedTerm && grade.term !== selectedTerm) return;
            if (selectedAcademicYear && grade.academicYear !== selectedAcademicYear) return;

            const studentGrade = grade.grades[userProfile.id];
            const subjectName = getSubjectsByClass(grade.classId).find(s => s.id === grade.subject)?.name || grade.subject;
            const className = CLASSES.find(c => c.id === grade.classId)?.name || grade.classId;
            const termName = TERMS.find(t => t.id === grade.term)?.label || grade.term;

            studentResults.push({
              id: `${grade.id}-${userProfile.id}`,
              subject: grade.subject,
              subjectName,
              classId: grade.classId,
              className,
              term: grade.term,
              termName,
              academicYear: grade.academicYear,
              ...studentGrade,
              publishedAt: grade.reviewedAt
            });
          }
        });

        // Sort by academic year and term (most recent first)
        studentResults.sort((a, b) => {
          if (a.academicYear !== b.academicYear) {
            return b.academicYear.localeCompare(a.academicYear);
          }
          return b.term.localeCompare(a.term);
        });

        setResults(studentResults);
      }
    } catch (error) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const downloadResult = (result) => {
    // This would generate and download a PDF for the individual result
    toast.info('Individual result download coming soon');
  };

  const getGradeColor = (grade) => {
    switch (grade) {
      case 'A': return 'bg-green-100 text-green-800';
      case 'B': return 'bg-blue-100 text-blue-800';
      case 'C': return 'bg-yellow-100 text-yellow-800';
      case 'D': return 'bg-orange-100 text-orange-800';
      case 'E': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">My Results</h1>
            <p className="text-gray-600 mt-1">View your published academic results</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Years</option>
                {ACADEMIC_YEARS.map(year => (
                  <option key={year.id} value={year.id}>{year.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Term</label>
              <select
                value={selectedTerm}
                onChange={(e) => setSelectedTerm(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Terms</option>
                {TERMS.map(term => (
                  <option key={term.id} value={term.id}>{term.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedAcademicYear('');
                  setSelectedTerm('');
                }}
                className="btn btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        {results.length > 0 ? (
          <div className="grid gap-6">
            {results.map(result => (
              <div key={result.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                      <MdGrade className="text-primary-600" size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-800">{result.subjectName}</h3>
                      <p className="text-gray-600">
                        {result.className} • {result.termName} • {result.academicYear}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => downloadResult(result)}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <MdDownload size={18} />
                    Download
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{result.continuousScore?.toFixed(1) || '0.0'}</div>
                      <div className="text-sm text-blue-800">CA Score (30%)</div>
                    </div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{result.examScore || 0}</div>
                      <div className="text-sm text-green-800">Exam Score (70%)</div>
                    </div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{result.score || 0}</div>
                      <div className="text-sm text-purple-800">Final Score</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <div className="text-center">
                      <div className={`text-2xl font-bold px-3 py-1 rounded-full inline-block ${getGradeColor(result.grade)}`}>
                        {result.grade || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-800 mt-1">Grade</div>
                    </div>
                  </div>
                </div>

                {result.remarks && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">Teacher Remarks</h4>
                    <p className="text-yellow-700">{result.remarks}</p>
                  </div>
                )}

                <div className="mt-4 text-sm text-gray-500 border-t pt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <MdCalendarToday size={16} />
                      <span>Published: {result.publishedAt ? new Date(result.publishedAt).toLocaleDateString() : 'N/A'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card text-center py-12">
            <MdGrade className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results available</h3>
            <p className="text-gray-600">
              {selectedTerm || selectedAcademicYear
                ? 'No results found for the selected filters. Try adjusting your search criteria.'
                : 'Your published results will appear here once they are approved by the administration.'
              }
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export const MyFees = () => {
  const { userProfile } = useAuth();
  const [feeRecord, setFeeRecord] = useState(null);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFees();
  }, []);

  const loadFees = async () => {
    try {
      const result = await readAllRecords('fees');
      if (result.success) {
        const studentFee = result.data.find(f => f.studentId === userProfile.uid);
        setFeeRecord(studentFee || { amount: 0, paid: 0 });
        
        const paymentResult = await readAllRecords('payments');
        if (paymentResult.success) {
          const studentPayments = paymentResult.data.filter(p => p.studentId === userProfile.uid);
          setPayments(studentPayments);
        }
      }
    } catch (error) {
      toast.error('Failed to load fee information');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = feeRecord?.amount || 0;
  const totalPaid = payments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const balance = totalAmount - totalPaid;

  if (loading) {
    return (
      <DashboardLayout title="My Fees">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Fees">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Fee Information</h2>
          <p className="text-gray-600">View your fee balance and payment history</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <p className="text-sm text-gray-600">Total Fee</p>
            <p className="text-2xl font-bold text-gray-800">GH₵ {totalAmount.toLocaleString()}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Amount Paid</p>
            <p className="text-2xl font-bold text-green-600">GH₵ {totalPaid.toLocaleString()}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Balance</p>
            <p className={`text-2xl font-bold ${balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
              GH₵ {balance.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="card">
          {balance > 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <MdAttachMoney className="text-yellow-600 mt-1" size={24} />
                <div>
                  <h4 className="font-bold text-yellow-800 mb-1">Outstanding Balance</h4>
                  <p className="text-sm text-yellow-700">
                    You have an outstanding balance of GH₵ {balance.toLocaleString()}. 
                    Please contact the accounts office for payment.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <MdEmojiEvents className="text-green-600 mt-1" size={24} />
                <div>
                  <h4 className="font-bold text-green-800 mb-1">Fees Fully Paid</h4>
                  <p className="text-sm text-green-700">
                    All your fees have been paid. Thank you!
                  </p>
                </div>
              </div>
            </div>
          )}

          <h3 className="text-lg font-bold mb-4">Payment History</h3>
          
          {payments.length === 0 ? (
            <div className="text-center py-12">
              <MdAttachMoney className="mx-auto mb-3 text-gray-400" size={48} />
              <p className="text-lg font-medium text-gray-700">No payments recorded</p>
              <p className="text-sm text-gray-500">Your payment history will appear here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reference</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {payments.map(payment => (
                    <tr key={payment.id}>
                      <td className="px-4 py-3 text-sm">
                        {new Date(payment.date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-bold text-green-600">
                        GH₵ {payment.amount.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm">{payment.method || 'Cash'}</td>
                      <td className="px-4 py-3 text-sm font-mono">{payment.reference}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Confirmed
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

export const MyLessonNotes = () => {
  const { userProfile } = useAuth();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const result = await readAllRecords('lessonNotes');
      if (result.success) {
        // Filter notes for student's class
        const classNotes = result.data.filter(n => n.class === userProfile.class);
        setNotes(classNotes);
      }
    } catch (error) {
      toast.error('Failed to load lesson notes');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Lesson Notes">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Lesson Notes">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Lesson Notes</h2>
          <p className="text-gray-600">Access teaching materials for your class</p>
        </div>

        {notes.length === 0 ? (
          <div className="card text-center py-12">
            <MdMenuBook className="mx-auto mb-3 text-gray-400" size={48} />
            <p className="text-lg font-medium text-gray-700">No lesson notes available</p>
            <p className="text-sm text-gray-500">Lesson notes will appear here when uploaded by teachers</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map(note => (
              <div key={note.id} className="card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <MdMenuBook className="text-primary-600" size={24} />
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(note.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="font-bold text-lg mb-2">{note.title}</h3>
                <p className="text-sm text-gray-600 mb-2">{note.subject}</p>
                <p className="text-sm text-gray-500 mb-4">By: {note.teacherName}</p>
                <button className="btn btn-primary w-full flex items-center justify-center gap-2">
                  <MdDownload size={18} />
                  Download
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export const MyAttendance = () => {
  const { userProfile } = useAuth();
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

  useEffect(() => {
    loadAttendance();
  }, []);

  const loadAttendance = async () => {
    try {
      const result = await readAllRecords('attendance');
      if (result.success) {
        // Filter attendance for this student
        const studentAttendance = result.data.filter(a => 
          a.attendance && a.attendance[userProfile.uid]
        );
        setAttendance(studentAttendance);
      }
    } catch (error) {
      toast.error('Failed to load attendance');
    } finally {
      setLoading(false);
    }
  };

  const presentDays = attendance.filter(a => a.attendance[userProfile.uid] === 'present').length;
  const absentDays = attendance.filter(a => a.attendance[userProfile.uid] === 'absent').length;
  const totalDays = attendance.length;
  const attendanceRate = totalDays > 0 ? Math.round((presentDays / totalDays) * 100) : 0;

  if (loading) {
    return (
      <DashboardLayout title="My Attendance">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Attendance">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Attendance Record</h2>
          <p className="text-gray-600">View your attendance history and statistics</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-gray-600">Total Days</p>
            <p className="text-2xl font-bold text-gray-800">{totalDays}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Present</p>
            <p className="text-2xl font-bold text-green-600">{presentDays}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Absent</p>
            <p className="text-2xl font-bold text-red-600">{absentDays}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Attendance Rate</p>
            <p className={`text-2xl font-bold ${attendanceRate >= 80 ? 'text-green-600' : 'text-orange-600'}`}>
              {attendanceRate}%
            </p>
          </div>
        </div>

        {attendanceRate < 80 && (
          <div className="card bg-orange-50 border border-orange-200">
            <div className="flex items-start gap-3">
              <MdCalendarToday className="text-orange-600 mt-1" size={24} />
              <div>
                <h4 className="font-bold text-orange-800 mb-1">Attendance Warning</h4>
                <p className="text-sm text-orange-700">
                  Your attendance rate is below 80%. Regular attendance is important for academic success.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="card">
          <h3 className="text-lg font-bold mb-4">Attendance History</h3>

          {attendance.length === 0 ? (
            <div className="text-center py-12">
              <MdCalendarToday className="mx-auto mb-3 text-gray-400" size={48} />
              <p className="text-lg font-medium text-gray-700">No attendance records</p>
              <p className="text-sm text-gray-500">Your attendance will be recorded here</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Day</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {attendance.map(record => {
                    const date = new Date(record.date);
                    const status = record.attendance[userProfile.uid];
                    
                    return (
                      <tr key={record.id}>
                        <td className="px-4 py-3 text-sm">
                          {date.toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {date.toLocaleDateString('en-US', { weekday: 'long' })}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            status === 'present'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {status === 'present' ? 'Present' : 'Absent'}
                          </span>
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

