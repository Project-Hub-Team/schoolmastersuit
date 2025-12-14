import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { MdDescription, MdSave, MdCheck, MdCalculate, MdAssessment, MdSchool, MdGrade, MdEdit, MdViewList, MdCalendarToday, MdClose, MdRefresh } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import { CLASSES, GRADING_SCALE, getSubjectsByClass } from '../../constants/ghanaEducation';
import { readAllRecords, createRecord, updateRecord } from '../../utils/database';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export const GradeEntry = () => {
  const { userProfile } = useAuth();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [students, setStudents] = useState([]);
  const [continuousAssessment, setContinuousAssessment] = useState({});
  const [examinationScores, setExaminationScores] = useState({});
  const [finalScores, setFinalScores] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('continuous');
  const [existingGrades, setExistingGrades] = useState(null);
  const [teacherRemarks, setTeacherRemarks] = useState({});
  const [isEditMode, setIsEditMode] = useState(false);
  const [resultStatus, setResultStatus] = useState(null);

  // Ghanaian school terms
  const TERMS = [
    { id: 'term1', name: 'Term 1', label: 'First Term' },
    { id: 'term2', name: 'Term 2', label: 'Second Term' },
    { id: 'term3', name: 'Term 3', label: 'Third Term' }
  ];

  // Academic years
  const ACADEMIC_YEARS = [
    `${new Date().getFullYear() - 1}-${new Date().getFullYear()}`,
    `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`,
    `${new Date().getFullYear() + 1}-${new Date().getFullYear() + 2}`
  ];

  // Continuous assessment components with weights
  const ASSESSMENT_COMPONENTS = [
    { id: 'classTest1', name: 'Class Test 1', weight: 15, maxScore: 20 },
    { id: 'classTest2', name: 'Class Test 2', weight: 15, maxScore: 20 },
    { id: 'quiz', name: 'Quiz', weight: 20, maxScore: 20 },
    { id: 'homework', name: 'Homework', weight: 20, maxScore: 20 },
    { id: 'project', name: 'Project', weight: 20, maxScore: 20 },
    { id: 'attendance', name: 'Attendance', weight: 10, maxScore: 10 }
  ];

  const loadStudents = async () => {
    if (!selectedClass || !selectedSubject || !selectedTerm || !selectedAcademicYear) return;
    setLoading(true);
    try {
      const result = await readAllRecords('users');
      if (result.success) {
        const allUsers = Object.values(result.data || {});
        const className = CLASSES.find(cls => cls.id === selectedClass)?.name || selectedClass;
        const classStudents = allUsers.filter(s => s.role === 'student' && s.class === className);
        setStudents(classStudents);

        // Load existing grades for this subject/term/year
        await loadExistingGrades(classStudents);
      }
    } catch (error) {
      toast.error('Failed to load students');
    } finally {
      setLoading(false);
    }
  };

  const loadExistingGrades = async (classStudents) => {
    try {
      const gradesResult = await readAllRecords('grades');
      if (gradesResult.success) {
        const allGrades = Object.values(gradesResult.data || {});
        const existingGradesForClass = allGrades.filter(grade =>
          grade.classId === selectedClass &&
          grade.term === selectedTerm &&
          grade.academicYear === selectedAcademicYear
        );

        setExistingGrades(existingGradesForClass);

        // Calculate overall status
        const statuses = existingGradesForClass.map(g => g.status || 'pending');
        let overallStatus = 'pending';
        if (statuses.every(s => s === 'published')) {
          overallStatus = 'published';
        } else if (statuses.every(s => s === 'completed')) {
          overallStatus = 'completed';
        } else if (statuses.some(s => s === 'completed')) {
          overallStatus = 'review';
        } else if (statuses.some(s => s === 'review')) {
          overallStatus = 'review';
        }
        setResultStatus(overallStatus);

        // Initialize with existing data for the selected subject
        const existingGradesForSubject = existingGradesForClass.filter(grade => grade.subject === selectedSubject);
        if (existingGradesForSubject.length > 0) {
          // Initialize with existing data
          const assessmentState = {};
          const examState = {};
          const finalState = {};
          const remarksState = {};

          classStudents.forEach(student => {
            const existingGradeRecord = existingGradesForSubject[0]; // Take the first record for the subject
            const studentGrade = existingGradeRecord.grades?.[student.id];

            if (studentGrade) {
              assessmentState[student.id] = studentGrade.continuousAssessment || {};
              examState[student.id] = studentGrade.examScore || 0;
              finalState[student.id] = {
                score: studentGrade.score || 0,
                grade: studentGrade.grade || '',
                remarks: studentGrade.remarks || '',
                continuousScore: studentGrade.continuousScore || 0,
                examScore: studentGrade.examScore || 0
              };
              remarksState[student.id] = studentGrade.remarks || '';
            } else {
              assessmentState[student.id] = {};
              examState[student.id] = 0;
              finalState[student.id] = { score: 0, grade: '', remarks: '', continuousScore: 0, examScore: 0 };
              remarksState[student.id] = '';
            }
          });

          setContinuousAssessment(assessmentState);
          setExaminationScores(examState);
          setFinalScores(finalState);
          setTeacherRemarks(remarksState);

          // Recalculate all final scores
          classStudents.forEach(student => {
            calculateFinalScore(student.id);
          });
        } else {
          setExistingGrades(null);
          // Initialize empty state
          const assessmentState = {};
          const examState = {};
          const finalState = {};
          const remarksState = {};

          classStudents.forEach(student => {
            assessmentState[student.id] = {};
            examState[student.id] = 0;
            finalState[student.id] = { score: 0, grade: '', remarks: '', continuousScore: 0, examScore: 0 };
            remarksState[student.id] = '';
          });

          setContinuousAssessment(assessmentState);
          setExaminationScores(examState);
          setFinalScores(finalState);
          setTeacherRemarks(remarksState);
        }
      }
    } catch (error) {
      console.error('Error loading existing grades:', error);
      toast.error('Failed to load existing grades');
    }
  };

  useEffect(() => {
    loadStudents();
  }, [selectedClass, selectedSubject, selectedTerm, selectedAcademicYear]);

  useEffect(() => {
    const handleFocus = () => {
      if (selectedClass && selectedSubject && selectedTerm && selectedAcademicYear && students.length > 0) {
        loadExistingGrades(students);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [selectedClass, selectedSubject, selectedTerm, selectedAcademicYear, students]);

  useEffect(() => {
    if (!selectedClass || !selectedSubject || !selectedTerm || !selectedAcademicYear || students.length === 0) return;

    const interval = setInterval(() => {
      loadExistingGrades(students);
    }, 30000); // Reload every 30 seconds

    return () => clearInterval(interval);
  }, [selectedClass, selectedSubject, selectedTerm, selectedAcademicYear, students]);

  const handleAssessmentChange = (studentId, component, score) => {
    const numScore = parseFloat(score) || 0;
    const maxScore = ASSESSMENT_COMPONENTS.find(c => c.id === component)?.maxScore || 100;

    // Validate score doesn't exceed maximum
    if (numScore > maxScore) {
      toast.error(`${component} score cannot exceed ${maxScore}`);
      return;
    }

    setContinuousAssessment(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [component]: numScore
      }
    }));

    // Recalculate final score
    setTimeout(() => calculateFinalScore(studentId), 100);
  };

  const handleExamChange = (studentId, score) => {
    const numScore = parseFloat(score) || 0;

    // Validate exam score
    if (numScore > 70) {
      toast.error('Exam score cannot exceed 70');
      return;
    }

    setExaminationScores(prev => ({
      ...prev,
      [studentId]: numScore
    }));

    // Recalculate final score
    setTimeout(() => calculateFinalScore(studentId), 100);
  };

  const calculateContinuousScore = (studentAssessment) => {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    ASSESSMENT_COMPONENTS.forEach(component => {
      const score = studentAssessment[component.id] || 0;
      const maxScore = component.maxScore;
      const weight = component.weight;

      // Calculate percentage for this component
      const percentage = maxScore > 0 ? (score / maxScore) * 100 : 0;
      totalWeightedScore += (percentage * weight) / 100;
      totalWeight += weight;
    });

    // Return the weighted score (out of 30)
    return totalWeight > 0 ? (totalWeightedScore / totalWeight) * 30 : 0;
  };

  const calculateFinalScore = (studentId) => {
    const continuousScore = calculateContinuousScore(continuousAssessment[studentId] || {});
    const examScore = examinationScores[studentId] || 0;

    // Only calculate if there's actual data
    const hasData = continuousScore > 0 || examScore > 0;

    if (!hasData) {
      setFinalScores(prev => ({
        ...prev,
        [studentId]: {
          score: 0,
          grade: '',
          remarks: '',
          continuousScore: 0,
          examScore: 0
        }
      }));
      return;
    }

    // Final Score = CA (30%) + Exam (70%)
    const finalScore = continuousScore + examScore;
    const roundedScore = Math.round(finalScore);

    // Determine grade based on Ghanaian grading system
    let grade = 'F';
    let remarks = 'Fail';

    if (roundedScore >= 80) {
      grade = 'A';
      remarks = 'Excellent';
    } else if (roundedScore >= 70) {
      grade = 'B';
      remarks = 'Very Good';
    } else if (roundedScore >= 60) {
      grade = 'C';
      remarks = 'Good';
    } else if (roundedScore >= 50) {
      grade = 'D';
      remarks = 'Credit';
    } else if (roundedScore >= 40) {
      grade = 'E';
      remarks = 'Pass';
    }

    setFinalScores(prev => ({
      ...prev,
      [studentId]: {
        score: roundedScore,
        grade,
        remarks,
        continuousScore: Math.round(continuousScore * 100) / 100,
        examScore
      }
    }));
  };

  const validateScores = () => {
    const errors = [];

    students.forEach(student => {
      const assessment = continuousAssessment[student.id] || {};
      const examScore = examinationScores[student.id] || 0;

      // Check continuous assessment scores
      ASSESSMENT_COMPONENTS.forEach(component => {
        const score = assessment[component.id] || 0;
        const maxScore = component.maxScore;
        if (score < 0 || score > maxScore) {
          errors.push(`${student.fullName}: ${component.name} must be between 0-${maxScore}`);
        }
      });

      // Check exam score
      if (examScore < 0 || examScore > 70) {
        errors.push(`${student.fullName}: Exam score must be between 0-70`);
      }
    });

    return errors;
  };

  const saveGrades = async () => {
    const validationErrors = validateScores();
    if (validationErrors.length > 0) {
      toast.error(`Validation errors: ${validationErrors.join(', ')}`);
      return;
    }

    try {
      // Group grades by class/subject/term/academicYear
      const gradesData = {};
      students.forEach(student => {
        const studentId = student.id;
        gradesData[studentId] = {
          continuousAssessment: continuousAssessment[studentId] || {},
          examScore: examinationScores[studentId] || 0,
          score: finalScores[studentId]?.score || 0,
          grade: finalScores[studentId]?.grade || '',
          remarks: teacherRemarks[studentId] || '',
          continuousScore: finalScores[studentId]?.continuousScore || 0
        };
      });

      const gradeRecord = {
        classId: selectedClass,
        subject: selectedSubject,
        term: selectedTerm,
        academicYear: selectedAcademicYear,
        grades: gradesData,
        status: 'pending', // pending, review, completed, declined
        submittedBy: userProfile?.fullName || 'Unknown Teacher',
        submittedAt: new Date().toISOString(),
        reviewedBy: null,
        reviewedAt: null,
        teacherId: userProfile?.uid || ''
      };

      if (existingGrades && existingGrades.length > 0) {
        // Update existing record
        await updateRecord(`grades/${existingGrades[0].id}`, {
          ...gradeRecord,
          submittedAt: new Date().toISOString() // Update timestamp
        });
        toast.success('Grades updated successfully and submitted for review');
      } else {
        // Create new record
        await createRecord('grades', gradeRecord);
        toast.success('Grades saved successfully and submitted for review');
      }

      // Reload to refresh existing grades
      await loadExistingGrades(students);
    } catch (error) {
      console.error('Error saving grades:', error);
      toast.error('Failed to save grades');
    }
  };

  const loadAttendanceData = async () => {
    try {
      const attendanceResult = await readAllRecords('attendance');
      if (attendanceResult.success) {
        const attendanceData = attendanceResult.data || {};
        
        // Calculate attendance stats for each student (present days / total days)
        const attendanceStats = {};
        
        students.forEach(student => {
          const studentAttendanceRecords = Object.values(attendanceData).filter(record =>
            record.classId === selectedClass &&
            record.attendance && 
            record.attendance[student.id] !== undefined
          );
          
          if (studentAttendanceRecords.length > 0) {
            const presentCount = studentAttendanceRecords.filter(record => 
              record.attendance[student.id] === 'present'
            ).length;
            
            attendanceStats[student.id] = {
              present: presentCount,
              total: studentAttendanceRecords.length,
              percentage: Math.round((presentCount / studentAttendanceRecords.length) * 100)
            };
          } else {
            attendanceStats[student.id] = {
              present: 0,
              total: 0,
              percentage: 0
            };
          }
        });
        
        return attendanceStats;
      }
    } catch (error) {
      console.error('Error loading attendance data:', error);
    }
    return {};
  };

  const handleRemarksChange = (studentId, remarks) => {
    setTeacherRemarks(prev => ({
      ...prev,
      [studentId]: remarks
    }));
  };

  const myClasses = userProfile?.classes || [];

  return (
    <DashboardLayout title="Comprehensive Grade Entry">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Grade Records Viewer</h2>
          <p className="text-gray-600">View saved continuous assessment and examination scores</p>
        </div>

        {/* Selection Panel */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Choose academic year...</option>
                {ACADEMIC_YEARS.map(year => (
                  <option key={year} value={year}>{year}</option>
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
                <option value="">Choose term...</option>
                {TERMS.map(term => (
                  <option key={term.id} value={term.id}>{term.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Choose class...</option>
                {CLASSES.filter(cls => myClasses.includes(cls.id)).map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Choose subject...</option>
                {selectedClass && getSubjectsByClass(selectedClass).map(subject => (
                  <option key={subject.id} value={subject.id}>{subject.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedClass('');
                  setSelectedSubject('');
                  setSelectedTerm('');
                  setSelectedAcademicYear('');
                  setExistingGrades(null);
                }}
                className="btn btn-secondary w-full"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : students.length > 0 && selectedClass && selectedSubject && selectedTerm && selectedAcademicYear ? (
          <div className="space-y-6">
            {/* Status Indicator */}
            {existingGrades && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <MdDescription className="text-blue-600" size={20} />
                  <span className="text-blue-800 font-medium">Grade Entry - {existingGrades.length} existing records loaded</span>
                  <span className="text-blue-600 text-sm">You can update scores and save changes</span>
                </div>
              </div>
            )}

            {/* Subject Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold">
                    {getSubjectsByClass(selectedClass).find(s => s.id === selectedSubject)?.name || selectedSubject}
                  </h3>
                  <p className="text-indigo-100 mt-1">
                    {CLASSES.find(c => c.id === selectedClass)?.name || selectedClass} • 
                    {TERMS.find(t => t.id === selectedTerm)?.label || selectedTerm} • 
                    {selectedAcademicYear ? new Date(selectedAcademicYear).getFullYear() : 'Select Year'}
                  </p>
                </div>
                <div className="text-right flex items-center gap-4">
                  <button
                    onClick={() => loadExistingGrades(students)}
                    className="btn bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                  >
                    <MdRefresh size={18} />
                    Refresh Status
                  </button>
                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`btn ${isEditMode ? 'bg-red-600 hover:bg-red-700' : 'bg-white hover:bg-gray-100'} text-gray-800 flex items-center gap-2`}
                  >
                    <MdEdit size={18} />
                    {isEditMode ? 'Exit Edit' : 'Edit Mode'}
                  </button>
                  <div>
                    <div className="text-2xl font-bold">{students.length}</div>
                    <div className="text-sm text-indigo-100">Students</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Indicator */}
            {resultStatus && (
              <div className={`border rounded-lg p-4 ${
                resultStatus === 'completed' ? 'bg-green-50 border-green-200' :
                resultStatus === 'declined' ? 'bg-red-50 border-red-200' :
                resultStatus === 'review' ? 'bg-blue-50 border-blue-200' :
                'bg-yellow-50 border-yellow-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <MdDescription className={`${
                      resultStatus === 'completed' ? 'text-green-600' :
                      resultStatus === 'declined' ? 'text-red-600' :
                      resultStatus === 'review' ? 'text-blue-600' :
                      'text-yellow-600'
                    }`} size={20} />
                    <div>
                      <span className={`font-medium ${
                        resultStatus === 'completed' ? 'text-green-800' :
                        resultStatus === 'declined' ? 'text-red-800' :
                        resultStatus === 'review' ? 'text-blue-800' :
                        'text-yellow-800'
                      }`}>
                        Status: {
                          resultStatus === 'completed' ? 'Approved - Ready to Publish' :
                          resultStatus === 'declined' ? 'Declined' :
                          resultStatus === 'review' ? 'Under Review' :
                          'Pending Review'
                        }
                      </span>
                      {existingGrades && existingGrades[0]?.reviewedAt && (
                        <p className="text-sm text-gray-600 mt-1">
                          Last reviewed: {new Date(existingGrades[0].reviewedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={async () => {
                          try {
                            const gradeToUpdate = existingGrades.find(g => g.subject === selectedSubject);
                            if (gradeToUpdate) {
                              await updateRecord(`grades/${gradeToUpdate.id}`, {
                                ...gradeToUpdate,
                                status: 'review',
                                reviewedBy: userProfile?.fullName || 'Teacher',
                                reviewedAt: new Date().toISOString()
                              });
                              toast.success('Status updated to Under Review');
                              await loadExistingGrades(students);
                            }
                          } catch (error) {
                            console.error('Error updating status:', error);
                            toast.error('Failed to update status');
                          }
                        }}
                        className="btn btn-secondary text-xs"
                        disabled={resultStatus === 'review' || resultStatus === 'completed' || resultStatus === 'published'}
                      >
                        Mark Review
                      </button>
                      <button
                        onClick={async () => {
                          try {
                            const gradeToUpdate = existingGrades.find(g => g.subject === selectedSubject);
                            if (gradeToUpdate) {
                              await updateRecord(`grades/${gradeToUpdate.id}`, {
                                ...gradeToUpdate,
                                status: 'completed',
                                reviewedBy: userProfile?.fullName || 'Teacher',
                                reviewedAt: new Date().toISOString()
                              });
                              toast.success('Status updated to Completed');
                              await loadExistingGrades(students);
                            }
                          } catch (error) {
                            console.error('Error updating status:', error);
                            toast.error('Failed to update status');
                          }
                        }}
                        className="btn btn-primary text-xs"
                        disabled={resultStatus === 'completed' || resultStatus === 'published'}
                      >
                        Mark Completed
                      </button>
                    </div>
                  </div>
                  {resultStatus === 'completed' && (
                    <button
                      onClick={async () => {
                        try {
                          // Update all grade records for this class/term/year to published
                          const gradesResult = await readAllRecords('grades');
                          if (gradesResult.success) {
                            const allGrades = Object.values(gradesResult.data || {});
                            const relevantGrades = allGrades.filter(grade =>
                              grade.classId === selectedClass &&
                              grade.term === selectedTerm &&
                              grade.academicYear === selectedAcademicYear
                            );

                            const updates = relevantGrades.map(grade =>
                              updateRecord(`grades/${grade.id}`, {
                                ...grade,
                                status: 'published',
                                publishedBy: userProfile?.fullName || 'Teacher',
                                publishedAt: new Date().toISOString()
                              })
                            );

                            await Promise.all(updates);
                            toast.success('Results published successfully');
                            setResultStatus('published');
                          }
                        } catch (error) {
                          console.error('Error publishing results:', error);
                          toast.error('Failed to publish results');
                        }
                      }}
                      className="btn btn-primary flex items-center gap-2"
                    >
                      Publish Results
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Tab Navigation */}
            <div className="card">
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('continuous')}
                  className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'continuous'
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <MdAssessment size={18} />
                  Continuous Assessment (30%)
                </button>
                <button
                  onClick={() => setActiveTab('examination')}
                  className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'examination'
                      ? 'border-green-500 text-green-600 bg-green-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <MdSchool size={18} />
                  End-of-Term Exam (70%)
                </button>
                <button
                  onClick={() => setActiveTab('results')}
                  className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'results'
                      ? 'border-purple-500 text-purple-600 bg-purple-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <MdCalculate size={18} />
                  Final Results
                </button>
                <button
                  onClick={() => setActiveTab('reports')}
                  className={`flex items-center gap-2 px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                    activeTab === 'reports'
                      ? 'border-orange-500 text-orange-600 bg-orange-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <MdViewList size={18} />
                  Student Reports
                </button>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'continuous' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <MdAssessment className="text-blue-600" size={24} />
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Continuous Assessment - {getSubjectsByClass(selectedClass).find(s => s.id === selectedSubject)?.name || selectedSubject}</h3>
                        <p className="text-gray-600">Enter scores for class tests, quizzes, homework, projects, and attendance</p>
                      </div>
                    </div>

                    {/* Assessment Components Header */}
                    <div className="grid grid-cols-8 gap-2 mb-4 p-3 bg-blue-50 rounded-lg font-medium text-sm">
                      <div className="col-span-2">Student</div>
                      {ASSESSMENT_COMPONENTS.map(component => (
                        <div key={component.id} className="text-center">
                          {component.name}<br/>
                          <span className="text-xs text-gray-600">({component.weight}% - Max: {component.maxScore})</span>
                        </div>
                      ))}
                      <div className="text-center">CA Total (30%)</div>
                    </div>

                    {/* Student Assessment Rows */}
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {students.map(student => {
                        const studentAssessment = continuousAssessment[student.id] || {};
                        const caTotal = calculateContinuousScore(studentAssessment);

                        return (
                          <div key={student.id} className="grid grid-cols-8 gap-2 p-3 bg-gray-50 rounded-lg items-center">
                            <div className="col-span-2">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-bold text-primary-600">
                                    {student.fullName?.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-800 text-sm">{student.fullName}</p>
                                  <p className="text-xs text-gray-600">{student.studentId}</p>
                                </div>
                              </div>
                            </div>

                            {ASSESSMENT_COMPONENTS.map(component => (
                              <div key={component.id} className="text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max={component.maxScore}
                                  value={studentAssessment[component.id] || ''}
                                  onChange={(e) => handleAssessmentChange(student.id, component.id, e.target.value)}
                                  className="w-16 text-center text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                                  placeholder="0"
                                />
                              </div>
                            ))}

                            <div className="text-center">
                              <span className="font-medium text-blue-600">{caTotal.toFixed(1)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {activeTab === 'examination' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <MdSchool className="text-green-600" size={24} />
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">End-of-Term Examination - {getSubjectsByClass(selectedClass).find(s => s.id === selectedSubject)?.name || selectedSubject}</h3>
                        <p className="text-gray-600">Enter examination scores (maximum 70 points)</p>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {students.map(student => (
                        <div key={student.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-primary-600">
                                {student.fullName?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">{student.fullName}</p>
                              <p className="text-sm text-gray-600">{student.studentId}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <input
                              type="number"
                              min="0"
                              max="70"
                              value={examinationScores[student.id] || ''}
                              onChange={(e) => handleExamChange(student.id, e.target.value)}
                              className="w-24 text-center border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              placeholder="0"
                            />
                            <span className="text-sm text-gray-600">/70</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeTab === 'results' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <MdCalculate className="text-purple-600" size={24} />
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Final Term Results</h3>
                        <p className="text-gray-600">Automatic calculation: 30% CA + 70% Exam = Final Score</p>
                      </div>
                    </div>

                    {/* Grading Scale Reference */}
                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium text-gray-800 mb-2">Ghanaian Grading Scale (GES Standard):</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-sm">
                        <div className="text-center p-2 bg-green-100 rounded">
                          <div className="font-bold text-green-800">A: 80-100</div>
                          <div className="text-green-600">Excellent</div>
                        </div>
                        <div className="text-center p-2 bg-blue-100 rounded">
                          <div className="font-bold text-blue-800">B: 70-79</div>
                          <div className="text-blue-600">Very Good</div>
                        </div>
                        <div className="text-center p-2 bg-yellow-100 rounded">
                          <div className="font-bold text-yellow-800">C: 60-69</div>
                          <div className="text-yellow-600">Good</div>
                        </div>
                        <div className="text-center p-2 bg-orange-100 rounded">
                          <div className="font-bold text-orange-800">D: 50-59</div>
                          <div className="text-orange-600">Credit</div>
                        </div>
                        <div className="text-center p-2 bg-red-100 rounded">
                          <div className="font-bold text-red-800">E: 40-49</div>
                          <div className="text-red-600">Pass</div>
                        </div>
                        <div className="text-center p-2 bg-gray-100 rounded">
                          <div className="font-bold text-gray-800">F: 0-39</div>
                          <div className="text-gray-600">Fail</div>
                        </div>
                      </div>
                    </div>

                    {/* Final Results Table */}
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Subject</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">CA Score (30%)</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Exam Score (70%)</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Final Score</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Grade</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {students.map(student => {
                            const finalResult = finalScores[student.id] || {};

                            return (
                              <tr key={student.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                                      <span className="text-xs font-bold text-primary-600">
                                        {student.fullName?.charAt(0)}
                                      </span>
                                    </div>
                                    <div>
                                      <p className="font-medium text-gray-800 text-sm">{student.fullName}</p>
                                      <p className="text-xs text-gray-600">{student.studentId}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-3 text-center text-sm font-medium text-gray-800">
                                  {getSubjectsByClass(selectedClass).find(s => s.id === selectedSubject)?.name || selectedSubject}
                                </td>
                                <td className="px-4 py-3 text-center text-sm font-medium text-blue-600">
                                  {finalResult.continuousScore?.toFixed(1) || '0.0'}
                                </td>
                                <td className="px-4 py-3 text-center text-sm font-medium text-green-600">
                                  {finalResult.examScore || 0}
                                </td>
                                <td className="px-4 py-3 text-center text-sm font-bold text-purple-600">
                                  {finalResult.score || 0}
                                </td>
                                <td className="px-4 py-3 text-center">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    !finalResult.grade ? 'bg-gray-100 text-gray-500' :
                                    finalResult.grade === 'A' ? 'bg-green-100 text-green-800' :
                                    finalResult.grade === 'B' ? 'bg-blue-100 text-blue-800' :
                                    finalResult.grade === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                    finalResult.grade === 'D' ? 'bg-orange-100 text-orange-800' :
                                    finalResult.grade === 'E' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {finalResult.grade || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600">
                                  {finalResult.remarks || 'No data'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'reports' && (
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <MdViewList className="text-orange-600" size={24} />
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">Student Report Cards</h3>
                        <p className="text-gray-600">Generate comprehensive report cards with rankings and attendance</p>
                      </div>
                    </div>

                    <div className="grid gap-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <h3 className="text-lg font-bold text-blue-800">
                          {getSubjectsByClass(selectedClass).find(s => s.id === selectedSubject)?.name || selectedSubject} - Student Reports
                        </h3>
                        <p className="text-blue-600 text-sm">Generate comprehensive report cards for all students</p>
                      </div>
                      
                      {students.map(student => (
                        <div key={student.id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                <span className="text-lg font-bold text-primary-600">
                                  {student.fullName?.charAt(0)}
                                </span>
                              </div>
                              <div>
                                <h4 className="font-semibold text-gray-800">{student.fullName}</h4>
                                <p className="text-sm text-gray-600">ID: {student.studentId}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              {/* Report generation moved to StudentResultSlip page */}
                            </div>
                          </div>
                          
                          {/* Teacher Remarks */}
                          <div className="mt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Teacher Remarks
                            </label>
                            <textarea
                              value={teacherRemarks[student.id] || ''}
                              onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                              placeholder="Enter remarks about the student's performance, behavior, etc."
                              className="w-full h-20 resize-none border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                              rows={3}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end gap-4">
              <button
                onClick={saveGrades}
                className="btn btn-primary flex items-center gap-2 px-8 py-3"
              >
                <MdSave size={20} />
                {existingGrades ? 'Update All Grades' : 'Save All Grades'}
              </button>
            </div>
          </div>
        ) : (
          <div className="card text-center py-12">
            <MdGrade className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Complete Selection Required</h3>
            <p className="text-gray-600">Please select Academic Year, Term, Class, and Subject to enter grades.</p>
          </div>
        )}
      </div>

    </DashboardLayout>
  );
};
