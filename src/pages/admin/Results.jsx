import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { MdSearch, MdDownload, MdCheck, MdClose, MdSchedule, MdSchool, MdPerson, MdGrade, MdRemoveRedEye } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import { CLASSES, getSubjectsByClass } from '../../constants/ghanaEducation';
import { readAllRecords, updateRecord } from '../../utils/database';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export const AdminResults = () => {
  const { userProfile } = useAuth();
  const [results, setResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  // Ghanaian school terms
  const TERMS = [
    { id: 'term1', name: 'Term 1', label: 'First Term' },
    { id: 'term2', name: 'Term 2', label: 'Second Term' },
    { id: 'term3', name: 'Term 3', label: 'Third Term' }
  ];

  const STATUS_OPTIONS = [
    { id: 'pending', label: 'Pending Review', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'review', label: 'Under Review', color: 'bg-blue-100 text-blue-800' },
    { id: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
    { id: 'published', label: 'Published', color: 'bg-purple-100 text-purple-800' }
  ];

  useEffect(() => {
    loadResults();
  }, []);

  useEffect(() => {
    filterResults();
  }, [results, searchTerm, selectedClass, selectedTerm, selectedStatus]);

  const loadResults = async () => {
    try {
      const [gradesResult, usersResult] = await Promise.all([
        readAllRecords('grades'),
        readAllRecords('users')
      ]);

      if (gradesResult.success && usersResult.success) {
        const allGrades = Object.values(gradesResult.data || {});
        const allUsers = Object.values(usersResult.data || {});

        // Group grades by class, term, and academic year for complete reports
        const groupedReports = {};

        allGrades.forEach(grade => {
          const key = `${grade.classId}-${grade.term}-${grade.academicYear}`;
          if (!groupedReports[key]) {
            const className = CLASSES.find(c => c.id === grade.classId)?.name || grade.classId;
            const termName = TERMS.find(t => t.id === grade.term)?.label || grade.term;

            // Get all students in this class
            const classStudents = allUsers.filter(u => u.role === 'student' && u.class === className);

            // Calculate report status for this class/term/year
            const studentReports = classStudents.map(student => {
              const studentGradeRecords = allGrades.filter(g =>
                g.classId === grade.classId &&
                g.term === grade.term &&
                g.academicYear === grade.academicYear &&
                g.grades && g.grades[student.id]
              );

              const totalSubjects = getSubjectsByClass(grade.classId).length;
              const hasAllSubjects = studentGradeRecords.length >= totalSubjects;

              let status = 'pending';
              let canPublish = false;

              if (hasAllSubjects) {
                const gradeStatuses = studentGradeRecords.map(g => g.status || 'pending');
                if (gradeStatuses.includes('completed')) {
                  status = 'completed';
                  canPublish = true;
                } else if (gradeStatuses.includes('review')) {
                  status = 'review';
                } else if (gradeStatuses.includes('pending')) {
                  status = 'submitted';
                }
              }

              return {
                student,
                gradeRecords: studentGradeRecords,
                status,
                canPublish,
                subjectsCount: studentGradeRecords.length,
                totalSubjects
              };
            });

            // Overall class status
            const completedCount = studentReports.filter(r => r.status === 'completed').length;
            const reviewCount = studentReports.filter(r => r.status === 'review').length;
            const submittedCount = studentReports.filter(r => r.status === 'submitted').length;

            let overallStatus = 'pending';
            if (completedCount > 0) {
              overallStatus = 'completed';
            } else if (reviewCount > 0) {
              overallStatus = 'review';
            } else if (submittedCount > 0) {
              overallStatus = 'submitted';
            }

            groupedReports[key] = {
              id: key,
              classId: grade.classId,
              className,
              term: grade.term,
              termName,
              academicYear: grade.academicYear,
              status: overallStatus,
              studentReports,
              totalStudents: classStudents.length,
              completedStudents: completedCount,
              submittedBy: grade.submittedBy,
              submittedAt: grade.submittedAt,
              reviewedBy: grade.reviewedBy,
              reviewedAt: grade.reviewedAt
            };
          }
        });

        setResults(Object.values(groupedReports));
      }
    } catch (error) {
      toast.error('Failed to load results');
    } finally {
      setLoading(false);
    }
  };

  const filterResults = () => {
    let filtered = results;

    if (searchTerm) {
      filtered = filtered.filter(result =>
        result.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.termName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        result.submittedBy?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedClass) {
      filtered = filtered.filter(result => result.classId === selectedClass);
    }

    if (selectedTerm) {
      filtered = filtered.filter(result => result.term === selectedTerm);
    }

    if (selectedStatus) {
      filtered = filtered.filter(result => result.status === selectedStatus);
    }

    setFilteredResults(filtered);
  };

  const updateStatus = async (result, newStatus) => {
    try {
      const resultId = result.id;
      // Update all grade records for this class/term/year
      const gradesResult = await readAllRecords('grades');
      if (gradesResult.success) {
        const allGrades = Object.values(gradesResult.data || {});
        const relevantGrades = allGrades.filter(grade => {
          const key = `${grade.classId}-${grade.term}-${grade.academicYear}`;
          return key === resultId;
        });

        const updates = relevantGrades.map(grade =>
          updateRecord(`grades/${grade.id}`, {
            ...grade,
            status: newStatus,
            reviewedBy: userProfile?.fullName || 'Admin',
            reviewedAt: new Date().toISOString()
          })
        );

        await Promise.all(updates);

        // Update local state
        setResults(prev => prev.map(result =>
          result.id === resultId
            ? { ...result, status: newStatus, reviewedBy: userProfile?.fullName || 'Admin', reviewedAt: new Date().toISOString() }
            : result
        ));

        toast.success(`Status updated to ${newStatus}`);
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const downloadPDF = async (result) => {
    // This would integrate with a PDF generation library
    toast('PDF download feature coming soon');
  };

  const viewReport = (result) => {
    setSelectedReport(result);
    setShowReportModal(true);
  };

  const downloadClassReport = (result) => {
    // TODO: Implement class report download
    toast('Class report download coming soon');
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
            <h1 className="text-3xl font-bold text-gray-800">Results Management</h1>
            <p className="text-gray-600 mt-1">Review and approve student results from all classes</p>
          </div>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <MdSearch className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by subject, class, or teacher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Classes</option>
                {CLASSES.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">All Status</option>
                {STATUS_OPTIONS.map(status => (
                  <option key={status.id} value={status.id}>{status.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedClass('');
                  setSelectedTerm('');
                  setSelectedStatus('');
                }}
                className="btn btn-secondary"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Results Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class & Term</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Academic Year</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Submitted By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredResults.map((result, index) => (
                  <tr key={`result-${index}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <MdSchool className="text-primary-600 mr-2" size={20} />
                        <div>
                          <div className="font-medium text-gray-900">{result.className}</div>
                          <div className="text-sm text-gray-500">{result.termName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{result.academicYear}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <MdPerson className="text-green-600 mr-2" size={20} />
                        <div>
                          <div className="font-medium text-gray-900">{result.completedStudents}/{result.totalStudents}</div>
                          <div className="text-sm text-gray-500">completed</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{result.submittedBy}</div>
                        <div className="text-sm text-gray-500">
                          {result.submittedAt ? new Date(result.submittedAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        STATUS_OPTIONS.find(s => s.id === result.status)?.color || 'bg-gray-100 text-gray-800'
                      }`}>
                        {STATUS_OPTIONS.find(s => s.id === result.status)?.label || result.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => viewReport(result)}
                          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                          title="View Report"
                        >
                          View
                        </button>
                        <button
                          onClick={() => downloadClassReport(result)}
                          className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          title="Download Class Report"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => updateStatus(result, 'review')}
                          className="px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
                          title="Mark as Under Review"
                        >
                          Review
                        </button>
                        <button
                          onClick={() => updateStatus(result, 'completed')}
                          className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                          title="Approve Results"
                        >
                          Complete
                        </button>
                        <button
                          onClick={() => updateStatus(result, 'published')}
                          disabled={userProfile?.role !== 'admin' && (result.status !== 'completed' || userProfile?.role !== 'teacher')}
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            (userProfile?.role === 'admin') || (result.status === 'completed' && userProfile?.role === 'teacher')
                              ? 'bg-purple-600 text-white hover:bg-purple-700'
                              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Publish
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredResults.length === 0 && (
          <div className="text-center py-12">
            <MdGrade className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600">Try adjusting your search criteria</p>
          </div>
        )}
      </div>

      {/* Student Reports Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Class Results Overview</h2>
                  <p className="text-blue-100 mt-1">
                    {selectedReport.className} • {selectedReport.termName} • {selectedReport.academicYear}
                  </p>
                </div>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="text-white hover:text-blue-200 p-2"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Report Content */}
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              <div className="space-y-4">
                {selectedReport.studentReports.map((studentReport) => (
                  <div key={studentReport.student.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-600">
                            {studentReport.student.fullName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-800">{studentReport.student.fullName}</h4>
                          <p className="text-sm text-gray-600">ID: {studentReport.student.studentId}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          studentReport.status === 'completed' ? 'bg-green-100 text-green-800' :
                          studentReport.status === 'review' ? 'bg-blue-100 text-blue-800' :
                          studentReport.status === 'submitted' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {studentReport.status === 'completed' ? 'Ready to Publish' :
                           studentReport.status === 'review' ? 'Under Review' :
                           studentReport.status === 'submitted' ? 'Submitted' :
                           'Pending'}
                        </span>
                        <span className="text-sm text-gray-600">
                          {studentReport.subjectsCount}/{studentReport.totalSubjects} subjects
                        </span>
                      </div>
                    </div>

                    {/* Subject Results */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm border-collapse border border-gray-300">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="border border-gray-300 px-2 py-1 text-left">Subject</th>
                            <th className="border border-gray-300 px-2 py-1 text-left">Score</th>
                            <th className="border border-gray-300 px-2 py-1 text-left">Grade</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentReport.gradeRecords.map((grade) => (
                            <tr key={grade.id}>
                              <td className="border border-gray-300 px-2 py-1">{grade.subject}</td>
                              <td className="border border-gray-300 px-2 py-1">{grade.grades[studentReport.student.id]?.score || 'N/A'}</td>
                              <td className="border border-gray-300 px-2 py-1">{grade.grades[studentReport.student.id]?.grade || 'N/A'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 border-t flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedReport.completedStudents}/{selectedReport.totalStudents} students completed
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => updateStatus(selectedReport, 'completed')}
                  className="btn btn-primary"
                >
                  Mark All as Completed
                </button>
                <button
                  onClick={() => updateStatus(selectedReport, 'published')}
                  className="btn btn-success"
                >
                  Publish All Results
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};