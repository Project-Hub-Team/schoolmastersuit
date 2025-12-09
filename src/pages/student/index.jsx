// Student pages - Full implementations
import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { MdDownload, MdCalendarToday, MdAttachMoney, MdMenuBook, MdTrendingUp, MdEmojiEvents, MdDescription } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import { readAllRecords } from '../../utils/database';
import { GRADING_SCALE, CLASSES } from '../../constants/ghanaEducation';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export const MyResults = () => {
  const { userProfile } = useAuth();
  const [results, setResults] = useState([]);
  const [selectedTerm, setSelectedTerm] = useState('term1');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResults();
  }, []);

  const loadResults = async () => {
    try {
      const result = await readAllRecords('grades');
      if (result.success) {
        // Filter results for this student
        const studentResults = result.data.filter(r => r.studentId === userProfile.uid);
        setResults(studentResults);
      }
    } catch (error) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const calculateGPA = () => {
    if (results.length === 0) return 0;
    const totalPoints = results.reduce((sum, result) => {
      const gradeInfo = GRADING_SCALE.find(g => g.grade === result.grade);
      return sum + (gradeInfo ? gradeInfo.points : 0);
    }, 0);
    return (totalPoints / results.length).toFixed(2);
  };

  if (loading) {
    return (
      <DashboardLayout title="My Results">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Results">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">My Academic Results</h2>
            <p className="text-gray-600">View your examination results and performance</p>
          </div>
          <button className="btn btn-primary flex items-center gap-2">
            <MdDownload size={18} />
            Download Report Card
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="card">
            <p className="text-sm text-gray-600">Current Term</p>
            <p className="text-2xl font-bold text-gray-800">Term {selectedTerm.replace('term', '')}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Class</p>
            <p className="text-2xl font-bold text-gray-800">
              {CLASSES.find(c => c.id === userProfile.class)?.name || 'N/A'}
            </p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">GPA</p>
            <p className="text-2xl font-bold text-primary-600">{calculateGPA()}</p>
          </div>
          <div className="card">
            <p className="text-sm text-gray-600">Total Subjects</p>
            <p className="text-2xl font-bold text-gray-800">{results.length}</p>
          </div>
        </div>

        <div className="card">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-bold">Subject Performance</h3>
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

          {results.length === 0 ? (
            <div className="text-center py-12">
              <MdEmojiEvents className="mx-auto mb-3 text-gray-400" size={48} />
              <p className="text-lg font-medium text-gray-700">No results available</p>
              <p className="text-sm text-gray-500">Your results will appear here once published</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class Score (40%)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Exam (60%)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total (100%)</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.map(result => {
                    const gradeInfo = GRADING_SCALE.find(g => g.grade === result.grade);
                    return (
                      <tr key={result.id}>
                        <td className="px-4 py-3 font-medium">{result.subject}</td>
                        <td className="px-4 py-3">{result.classScore || 0}</td>
                        <td className="px-4 py-3">{result.examScore || 0}</td>
                        <td className="px-4 py-3 font-bold">{result.totalScore || 0}</td>
                        <td className="px-4 py-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            gradeInfo?.grade.startsWith('A') || gradeInfo?.grade.startsWith('B')
                              ? 'bg-green-100 text-green-800'
                              : gradeInfo?.grade.startsWith('C') || gradeInfo?.grade.startsWith('D')
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {result.grade}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{gradeInfo?.interpretation}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card bg-green-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <MdTrendingUp className="text-green-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-green-700">Excellent</p>
                <p className="text-2xl font-bold text-green-600">
                  {results.filter(r => r.grade?.startsWith('A') || r.grade?.startsWith('B')).length}
                </p>
              </div>
            </div>
          </div>
          <div className="card bg-yellow-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <MdEmojiEvents className="text-yellow-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-yellow-700">Average</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {results.filter(r => r.grade?.startsWith('C') || r.grade?.startsWith('D')).length}
                </p>
              </div>
            </div>
          </div>
          <div className="card bg-red-50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <MdDescription className="text-red-600" size={24} />
              </div>
              <div>
                <p className="text-sm text-red-700">Need Improvement</p>
                <p className="text-2xl font-bold text-red-600">
                  {results.filter(r => r.grade?.startsWith('E') || r.grade?.startsWith('F')).length}
                </p>
              </div>
            </div>
          </div>
        </div>
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

