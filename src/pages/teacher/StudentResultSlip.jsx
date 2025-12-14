import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { MdDescription, MdDownload, MdSearch, MdPerson, MdSchool, MdCalendarToday, MdGrade, MdEdit, MdSave, MdCancel, MdDelete, MdRefresh, MdPublish } from 'react-icons/md'; // Added MdRefresh, MdPublish
import { useAuth } from '../../contexts/AuthContext';
import { CLASSES, getSubjectsByClass } from '../../constants/ghanaEducation';
import { readAllRecords, updateRecord, deleteRecord } from '../../utils/database';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const StudentResultSlip = () => {
  const { userProfile } = useAuth();
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [selectedTerm, setSelectedTerm] = useState('');
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('');
  const [students, setStudents] = useState([]);
  const [studentGrades, setStudentGrades] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedGrades, setEditedGrades] = useState({});

  // Report generation state
  const [showReportModal, setShowReportModal] = useState(false);
  const [studentReportData, setStudentReportData] = useState(null);
  const [selectedStudentForReport, setSelectedStudentForReport] = useState(null);

  // All students report status
  const [allStudentsReports, setAllStudentsReports] = useState([]);

  // Class status
  const [classStatus, setClassStatus] = useState('pending');

  // Tab state
  const [activeTab, setActiveTab] = useState('history'); // 'history' or 'report'

  // Ghanaian school terms
  const TERMS = [
    { id: 'term1', name: 'Term 1', label: 'First Term' },
    { id: 'term2', name: 'Term 2', label: 'Second Term' },
    { id: 'term3', name: 'Term 3', label: 'Third Term' }
  ];

  // Generate academic years
  const currentYear = new Date().getFullYear();
  const ACADEMIC_YEARS = [
    { id: `${currentYear-1}-${currentYear}`, name: `${currentYear-1}/${currentYear}` },
    { id: `${currentYear}-${currentYear+1}`, name: `${currentYear}/${currentYear+1}` },
    { id: `${currentYear+1}-${currentYear+2}`, name: `${currentYear+1}/${currentYear+2}` }
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

  // Add loadStudents function
  const loadStudents = async () => {
    if (!selectedClass) {
      setStudents([]);
      return;
    }

    try {
      const usersResult = await readAllRecords('users');
      if (usersResult.success) {
        const allUsers = Object.values(usersResult.data || {});
        const className = CLASSES.find(cls => cls.id === selectedClass)?.name;
        
        const classStudents = allUsers.filter(user => 
          user.role === 'student' && 
          user.class === className
        );
        
        setStudents(classStudents);
        
        // Reset selected student if they're not in the current class
        if (selectedStudent) {
          const studentStillInClass = classStudents.find(s => s.id === selectedStudent);
          if (!studentStillInClass) {
            setSelectedStudent('');
            setStudentInfo(null);
            setStudentGrades([]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading students:', error);
      toast.error('Failed to load students');
    }
  };

  const loadClassStatus = async () => {
    if (!selectedClass || !selectedTerm || !selectedAcademicYear) return;

    try {
      const gradesResult = await readAllRecords('grades');
      if (gradesResult.success) {
        const allGrades = Object.values(gradesResult.data || {});
        const classGrades = allGrades.filter(grade => 
          grade.classId === selectedClass && 
          (!selectedTerm || grade.term === selectedTerm) &&
          (!selectedAcademicYear || grade.academicYear === selectedAcademicYear)
        );

        const statuses = classGrades.map(grade => grade.status || 'pending');
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
        setClassStatus(overallStatus);
      }
    } catch (error) {
      console.error('Error loading class status:', error);
    }
  };

  const loadStudentResults = async () => {
    if (!selectedStudent || !selectedTerm || !selectedAcademicYear) return;

    setLoading(true);
    try {
      const [gradesResult, usersResult] = await Promise.all([
        readAllRecords('grades'),
        readAllRecords('users')
      ]);

      if (gradesResult.success && usersResult.success) {
        // Get student info
        const student = Object.values(usersResult.data || {}).find(u => u.id === selectedStudent);
        setStudentInfo(student);

        // Get student grades for the selected term and year
        const allGrades = Object.entries(gradesResult.data || {});
        const studentClassId = CLASSES.find(cls => cls.name === student?.class)?.id;
        
        // Only proceed if we have a valid class ID
        if (!studentClassId) {
          setStudentGrades([]);
          setLoading(false);
          return;
        }
        
        const studentGradesForTerm = allGrades.filter(([gradeId, grade]) => {
          // Filter by class and student data
          const classMatch = grade.classId === studentClassId;
          const hasStudentData = grade.grades && grade.grades[selectedStudent];
          
          // Filter by term if selected
          const termMatch = !selectedTerm || grade.term === selectedTerm;
          
          // Filter by academic year if selected
          const yearMatch = !selectedAcademicYear || grade.academicYear === selectedAcademicYear;
          
          return classMatch && hasStudentData && termMatch && yearMatch;
        });

        // Transform grades to include detailed CA breakdown
        const transformedGrades = studentGradesForTerm.map(([gradeId, grade]) => ({
          id: gradeId,
          ...grade,
          studentData: grade.grades[selectedStudent],
          subjectName: getSubjectsByClass(student.class).find(s => s.id === grade.subject)?.name || grade.subject
        }));

        setStudentGrades(transformedGrades);
      }
    } catch (error) {
      console.error('Error loading student results:', error);
      toast.error('Failed to load student results');
    } finally {
      setLoading(false);
    }
  };

  const handleAssessmentChange = (gradeIndex, component, score) => {
    const numScore = parseFloat(score) || 0;
    const maxScore = ASSESSMENT_COMPONENTS.find(c => c.id === component)?.maxScore || 100;

    // Validate score doesn't exceed maximum
    if (numScore > maxScore) {
      toast.error(`${component} score cannot exceed ${maxScore}`);
      return;
    }

    setEditedGrades(prev => ({
      ...prev,
      [gradeIndex]: {
        ...prev[gradeIndex],
        continuousAssessment: {
          ...prev[gradeIndex]?.continuousAssessment,
          [component]: numScore
        }
      }
    }));
  };

  const handleExamChange = (gradeIndex, score) => {
    const numScore = parseFloat(score) || 0;

    // Validate exam score
    if (numScore > 70) {
      toast.error('Exam score cannot exceed 70');
      return;
    }

    setEditedGrades(prev => ({
      ...prev,
      [gradeIndex]: {
        ...prev[gradeIndex],
        examScore: numScore
      }
    }));
  };

  const calculateContinuousScore = (assessment) => {
    let total = 0;
    ASSESSMENT_COMPONENTS.forEach(component => {
      const score = assessment[component.id] || 0;
      total += (score / component.maxScore) * component.weight;
    });
    return Math.round(total * 10) / 10; // Round to 1 decimal place
  };

  const calculateFinalScore = (continuousScore, examScore) => {
    return Math.round(continuousScore + examScore);
  };

  const getGradeFromScore = (score) => {
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    if (score >= 40) return 'E';
    return 'F';
  };

  const saveEditedGrades = async () => {
    try {
      setLoading(true);

      for (const [gradeIndex, editedData] of Object.entries(editedGrades)) {
        const grade = studentGrades[gradeIndex];
        const continuousAssessment = {
          ...grade.studentData?.continuousAssessment,
          ...editedData.continuousAssessment
        };
        const examScore = editedData.examScore !== undefined ? editedData.examScore : grade.studentData?.examScore || 0;
        const continuousScore = calculateContinuousScore(continuousAssessment);
        const finalScore = calculateFinalScore(continuousScore, examScore);
        const gradeLetter = getGradeFromScore(finalScore);

        const updatedStudentData = {
          ...grade.studentData,
          continuousAssessment,
          examScore,
          continuousScore,
          score: finalScore,
          grade: gradeLetter,
          remarks: finalScore >= 50 ? 'Pass' : 'Fail'
        };

        // Update the grade record
        const path = `grades/${grade.id}/grades/${selectedStudent}`;
        await updateRecord(path, updatedStudentData);
      }

      toast.success('Grades updated successfully');
      setIsEditMode(false);
      setEditedGrades({});
      await loadStudentResults(); // Reload to show updated data
    } catch (error) {
      console.error('Error saving grades:', error);
      toast.error('Failed to save grades');
    } finally {
      setLoading(false);
    }
  };

  const deleteGrade = async (gradeId) => {
    if (!confirm('Are you sure you want to delete this grade record? This action cannot be undone.')) {
      return;
    }

    try {
      setLoading(true);
      await deleteRecord(`grades/${gradeId}`);
      toast.success('Grade record deleted successfully');
      await loadStudentResults(); // Reload to refresh the list
    } catch (error) {
      console.error('Error deleting grade:', error);
      toast.error('Failed to delete grade record');
    } finally {
      setLoading(false);
    }
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      setEditedGrades({});
    }
    setIsEditMode(!isEditMode);
  };

  const runMigration = async () => {
    try {
      setLoading(true);
      toast.loading('Running migration...', { id: 'migration' });
      
      const gradesResult = await readAllRecords('grades');
      if (!gradesResult.success) {
        toast.error('Failed to read grades for migration');
        return;
      }

      const allGrades = gradesResult.data || {};
      const updates = [];
      let count = 0;

      for (const [gradeId, gradeData] of Object.entries(allGrades)) {
        if (!gradeData.term || !gradeData.academicYear) {
          const updatedGrade = {
            ...gradeData,
            term: gradeData.term || 'term1',
            academicYear: gradeData.academicYear || '2024-2025'
          };
          updates.push(updateRecord(`grades/${gradeId}`, updatedGrade));
          count++;
        }
      }

      if (updates.length > 0) {
        await Promise.all(updates);
        toast.success(`Successfully migrated ${count} grade records`, { id: 'migration' });
        // Reload the student results after migration
        await loadStudentResults();
      } else {
        toast.success('No records needed migration', { id: 'migration' });
      }
    } catch (error) {
      console.error('Migration failed:', error);
      toast.error('Migration failed', { id: 'migration' });
    } finally {
      setLoading(false);
    }
  };

  const publishStudentResults = async (student) => {
    try {
      setLoading(true);
      
      // Get all grade records for this student
      const gradesResult = await readAllRecords('grades');
      if (gradesResult.success) {
        const allGrades = Object.values(gradesResult.data || {});
        const studentGradeRecords = allGrades.filter(grade =>
          grade.classId === selectedClass &&
          grade.term === selectedTerm &&
          grade.academicYear === selectedAcademicYear &&
          grade.grades && grade.grades[student.id]
        );

        // Update status to published for all grade records of this student
        const updates = studentGradeRecords.map(grade => 
          updateRecord(`grades/${grade.id}`, {
            ...grade,
            status: 'published',
            publishedAt: new Date().toISOString(),
            publishedBy: userProfile?.fullName || 'Teacher'
          })
        );

        await Promise.all(updates);
        toast.success(`Results published for ${student.fullName}`);
        
        // Reload the reports
        await loadAllStudentsReports();
      }
    } catch (error) {
      console.error('Error publishing results:', error);
      toast.error('Failed to publish results');
    } finally {
      setLoading(false);
    }
  };

  const loadAllStudentsReports = async () => {
    if (!selectedClass || !selectedTerm || !selectedAcademicYear) return;

    setLoading(true);
    try {
      const [gradesResult, usersResult] = await Promise.all([
        readAllRecords('grades'),
        readAllRecords('users')
      ]);

      if (gradesResult.success && usersResult.success) {
        const allUsers = Object.values(usersResult.data || {});
        const className = CLASSES.find(cls => cls.id === selectedClass)?.name || selectedClass;
        const classStudents = allUsers.filter(u => u.role === 'student' && u.class === className);

        // Get all grades for this class, term, and academic year
        const allGrades = Object.values(gradesResult.data || {});
        const classGrades = allGrades.filter(grade =>
          grade.classId === selectedClass &&
          grade.term === selectedTerm &&
          grade.academicYear === selectedAcademicYear
        );

        // Calculate report status for each student
        const studentsReports = classStudents.map(student => {
          const studentGradeRecords = classGrades.filter(grade =>
            grade.grades && grade.grades[student.id]
          );

          // Check if student has grades for all subjects
          const totalSubjects = getSubjectsByClass(selectedClass).length;
          const hasAllSubjects = studentGradeRecords.length >= totalSubjects;

          // Determine status
          let status = 'pending'; // pending, submitted, reviewed, completed
          let canPublish = false;

          if (hasAllSubjects) {
            // Check if any grade record has status
            const gradeStatuses = studentGradeRecords.map(grade => grade.status || 'pending');
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

        setAllStudentsReports(studentsReports);
      }
    } catch (error) {
      console.error('Error loading students reports:', error);
      toast.error('Failed to load students reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents();
    // Clear selected student when filters change
    setSelectedStudent('');
    if (selectedClass && selectedTerm && selectedAcademicYear) {
      loadAllStudentsReports();
      loadClassStatus();
    }
  }, [selectedClass, selectedTerm, selectedAcademicYear]);

  useEffect(() => {
    const handleFocus = () => {
      if (selectedClass && selectedTerm && selectedAcademicYear) {
        loadStudentResults();
        loadAllStudentsReports();
        loadClassStatus();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden && selectedClass && selectedTerm && selectedAcademicYear) {
        loadStudentResults();
        loadAllStudentsReports();
        loadClassStatus();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [selectedClass, selectedTerm, selectedAcademicYear]);

  const calculateOverallPerformance = () => {
    if (studentGrades.length === 0) return { average: 0, grade: 'F', remarks: 'No grades available' };

    const totalScore = studentGrades.reduce((sum, grade, index) => {
      const caData = grade.studentData?.continuousAssessment || {};
      const editedCaData = editedGrades[index]?.continuousAssessment || {};
      const currentCaData = { ...caData, ...editedCaData };
      const caTotal = calculateContinuousScore(currentCaData);
      const examScore = editedGrades[index]?.examScore !== undefined ? editedGrades[index].examScore : grade.studentData?.examScore || 0;
      const finalScore = calculateFinalScore(caTotal, examScore);
      return sum + finalScore;
    }, 0);
    const average = Math.round(totalScore / studentGrades.length);

    let grade = 'F';
    let remarks = 'Fail';

    if (average >= 80) {
      grade = 'A';
      remarks = 'Excellent';
    } else if (average >= 70) {
      grade = 'B';
      remarks = 'Very Good';
    } else if (average >= 60) {
      grade = 'C';
      remarks = 'Good';
    } else if (average >= 50) {
      grade = 'D';
      remarks = 'Credit';
    } else if (average >= 40) {
      grade = 'E';
      remarks = 'Pass';
    }

    return { average, grade, remarks };
  };

  const generatePDF = () => {
    if (!studentInfo || studentGrades.length === 0) {
      toast.error('No data available to generate report');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    let yPos = 30;

    // Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('GHANAIAN SCHOOL MANAGEMENT SYSTEM', pageWidth / 2, yPos, { align: 'center' });

    const titleText = 'STUDENT GRADE HISTORY';
    doc.text(titleText, pageWidth / 2, yPos + 10, { align: 'center' });

    yPos += 30;

    // Student Information
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    const termLabel = selectedTerm ? 
      (TERMS.find(t => t.id === selectedTerm)?.label || selectedTerm) : 
      'All Terms';
    const academicYearLabel = selectedAcademicYear ? 
      (ACADEMIC_YEARS.find(y => y.id === selectedAcademicYear)?.name || selectedAcademicYear) : 
      'All Years';

    doc.text(`Academic Year: ${academicYearLabel}`, margin, yPos);
    doc.text(`Term: ${termLabel}`, pageWidth - margin, yPos, { align: 'right' });

    yPos += 15;
    doc.text(`Student Name: ${studentInfo.fullName}`, margin, yPos);
    doc.text(`Student ID: ${studentInfo.studentId}`, pageWidth - margin, yPos, { align: 'right' });

    yPos += 10;
    doc.text(`Class: ${studentInfo.class}`, margin, yPos);

    yPos += 20;

    // Subject Results Table with detailed CA breakdown
    const tableData = studentGrades.map((grade, index) => {
      const caData = grade.studentData?.continuousAssessment || {};
      const editedCaData = editedGrades[index]?.continuousAssessment || {};
      const currentCaData = { ...caData, ...editedCaData };
      const caTotal = calculateContinuousScore(currentCaData);
      const examScore = editedGrades[index]?.examScore !== undefined ? editedGrades[index].examScore : grade.studentData?.examScore || 0;
      const finalScore = calculateFinalScore(caTotal, examScore);
      const gradeLetter = getGradeFromScore(finalScore);
      
      return [
        grade.subjectName,
        grade.term || 'N/A',
        grade.academicYear || 'N/A',
        currentCaData.classTest1 || 0,
        currentCaData.classTest2 || 0,
        currentCaData.quiz || 0,
        currentCaData.homework || 0,
        currentCaData.project || 0,
        currentCaData.attendance || 0,
        caTotal.toFixed(1),
        examScore,
        finalScore,
        gradeLetter,
        finalScore >= 50 ? 'Pass' : 'Fail'
      ];
    });

    doc.autoTable({
      startY: yPos,
      head: [['Subject', 'Term', 'Year', 'CT1', 'CT2', 'Quiz', 'HW', 'Proj', 'Att', 'CA Total', 'Exam', 'Final', 'Grade', 'Remarks']],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 25 },
        1: { cellWidth: 15, halign: 'center' },
        2: { cellWidth: 20, halign: 'center' },
        3: { cellWidth: 12, halign: 'center' },
        4: { cellWidth: 12, halign: 'center' },
        5: { cellWidth: 12, halign: 'center' },
        6: { cellWidth: 12, halign: 'center' },
        7: { cellWidth: 12, halign: 'center' },
        8: { cellWidth: 12, halign: 'center' },
        9: { cellWidth: 15, halign: 'center' },
        10: { cellWidth: 12, halign: 'center' },
        11: { cellWidth: 12, halign: 'center' },
        12: { cellWidth: 12, halign: 'center' },
        13: { cellWidth: 20 }
      },
    });

    yPos = doc.lastAutoTable.finalY + 20;

    // Overall Performance
    const overall = calculateOverallPerformance();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`Overall Average: ${overall.average}%`, margin, yPos);
    doc.text(`Overall Grade: ${overall.grade}`, margin, yPos + 10);
    doc.text(`Remarks: ${overall.remarks}`, margin, yPos + 20);

    // Footer
    yPos = pageHeight - 30;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text('Generated by Ghanaian School Management System', pageWidth / 2, yPos, { align: 'center' });
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, pageWidth / 2, yPos + 5, { align: 'center' });

    // Save PDF
    const filterInfo = '_all';
    const fileName = `grade_history_${studentInfo.studentId}${filterInfo}.pdf`;
    doc.save(fileName);
    toast.success('Result slip downloaded successfully');
  };

  // Report generation functions
  const loadAttendanceData = async () => {
    try {
      const attendanceResult = await readAllRecords('attendance');
      if (attendanceResult.success) {
        const attendanceData = attendanceResult.data || {};
        
        // Calculate attendance stats for each student (present days / total days)
        const attendanceStats = {};
        
        students.forEach(student => {
          const studentAttendanceRecords = Object.values(attendanceData).filter(record =>
            record.classId === CLASSES.find(cls => cls.name === studentInfo.class)?.id &&
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

  const calculateClassRanking = async (studentId) => {
    try {
      const gradesResult = await readAllRecords('grades');
      if (gradesResult.success) {
        const allGrades = Object.values(gradesResult.data || {});
        
        // Get all students in the class
        const classStudents = students.map(s => s.id);
        
        // Calculate average scores for all students
        const studentAverages = classStudents.map(studentId => {
          const studentGrades = allGrades.filter(grade =>
            grade.classId === CLASSES.find(cls => cls.name === studentInfo.class)?.id &&
            grade.term === selectedTerm &&
            grade.academicYear === selectedAcademicYear &&
            grade.grades && grade.grades[studentId]
          );
          
          const averageScore = studentGrades.length > 0 ?
            studentGrades.reduce((sum, grade) => {
              const studentGradeData = grade.grades[studentId];
              return sum + (studentGradeData?.score || 0);
            }, 0) / studentGrades.length : 0;
          
          return {
            studentId,
            averageScore: Math.round(averageScore)
          };
        });
        
        // Sort by average score (descending)
        studentAverages.sort((a, b) => b.averageScore - a.averageScore);
        
        // Find position of target student
        const position = studentAverages.findIndex(s => s.studentId === studentId) + 1;
        
        return {
          position,
          totalStudents: studentAverages.length
        };
      }
    } catch (error) {
      console.error('Error calculating class ranking:', error);
    }
    
    return { position: 0, totalStudents: 0 };
  };

  const generateStudentReport = async (student) => {
    try {
      // Load all grades for this student in the current term/year across ALL subjects
      const gradesResult = await readAllRecords('grades');
      const attendanceStats = await loadAttendanceData();

      if (gradesResult.success) {
        const allGrades = Object.values(gradesResult.data || {});
        const studentGrades = allGrades.filter(grade =>
          grade.classId === CLASSES.find(cls => cls.name === student.class)?.id &&
          grade.term === selectedTerm &&
          grade.academicYear === selectedAcademicYear &&
          grade.grades && grade.grades[student.id]
        );

        // Calculate overall performance across all subjects
        const subjectResults = studentGrades.map(grade => {
          const studentGradeData = grade.grades[student.id];
          return {
            subject: getSubjectsByClass(student.class).find(s => s.id === grade.subject)?.name || grade.subject,
            continuousAssessment: studentGradeData?.continuousScore || 0,
            examinationScore: studentGradeData?.examScore || 0,
            finalScore: studentGradeData?.score || 0,
            grade: studentGradeData?.grade || 'F',
            remarks: studentGradeData?.remarks || 'Fail'
          };
        });

        // Calculate class ranking based on all subjects
        const classRanking = await calculateClassRanking(student.id);

        const reportData = {
          student: {
            ...student,
            attendance: attendanceStats[student.id]?.percentage || 0
          },
          term: TERMS.find(t => t.id === selectedTerm)?.label || selectedTerm,
          academicYear: selectedAcademicYear ? new Date(selectedAcademicYear).getFullYear().toString() : 'Unknown',
          class: student.class,
          subjects: subjectResults,
          overall: {
            averageScore: subjectResults.length > 0 ?
              Math.round(subjectResults.reduce((sum, subj) => sum + subj.finalScore, 0) / subjectResults.length) : 0,
            position: classRanking.position,
            totalStudents: classRanking.totalStudents,
            attendance: attendanceStats[student.id]?.percentage || 0,
            attendanceDetails: attendanceStats[student.id] || { present: 0, total: 0, percentage: 0 }
          },
          teacherRemarks: '', // Will be populated from teacher remarks if available
          generatedAt: new Date().toLocaleDateString()
        };

        setStudentReportData(reportData);
        setSelectedStudentForReport(student);
        setShowReportModal(true);
      }
    } catch (error) {
      console.error('Error generating student report:', error);
      toast.error('Failed to generate report');
    }
  };

  const overall = calculateOverallPerformance();

  return (
    <DashboardLayout title="Student Results Management">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Student Results Management</h2>
          <p className="text-gray-600">View grade history, edit scores, and generate official student reports</p>
        </div>

        {/* Selection Panel - Updated with student dropdown */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="input w-full"
              >
                <option value="">Select Class</option>
                {CLASSES.filter(cls => userProfile?.classes?.includes(cls.id)).map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Student</label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="input w-full"
                disabled={!selectedClass}
              >
                <option value="">Select Student</option>
                {students.map(student => (
                  <option key={student.id} value={student.id}>
                    {student.fullName} ({student.studentId})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
              <select
                value={selectedAcademicYear}
                onChange={(e) => setSelectedAcademicYear(e.target.value)}
                className="input w-full"
              >
                <option value="">Select Year</option>
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
                className="input w-full"
              >
                <option value="">Select Term</option>
                {TERMS.map(term => (
                  <option key={term.id} value={term.id}>{term.label}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSelectedClass('');
                  setSelectedStudent('');
                  setSelectedTerm('');
                  setSelectedAcademicYear('');
                  setStudents([]);
                  setAllStudentsReports([]);
                }}
                className="btn btn-secondary w-full"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>

        {/* Class Status Indicator */}
        {selectedClass && selectedTerm && selectedAcademicYear && (
          <div className="border rounded-lg p-4 bg-gray-50 border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  classStatus === 'published' ? 'bg-green-500' :
                  classStatus === 'completed' ? 'bg-blue-500' :
                  classStatus === 'review' ? 'bg-yellow-500' :
                  'bg-gray-500'
                }`}></div>
                <div>
                  <h3 className="font-semibold text-gray-800">
                    Class Status: {
                      classStatus === 'completed' ? 'Approved - Ready to Publish' :
                      classStatus === 'published' ? 'Published' :
                      classStatus === 'review' ? 'Under Review' :
                      'Pending'
                    }
                  </h3>
                  <p className="text-sm text-gray-600">
                    {CLASSES.find(c => c.id === selectedClass)?.name} • {TERMS.find(t => t.id === selectedTerm)?.label} • {selectedAcademicYear}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    loadClassStatus();
                    loadAllStudentsReports();
                    loadStudents();
                    if (selectedStudent) loadStudentResults();
                  }}
                  className="btn btn-outline btn-sm flex items-center gap-1"
                  title="Refresh status"
                >
                  <MdRefresh size={16} />
                  Refresh
                </button>
                {classStatus === 'completed' && (
                  <button
                    onClick={async () => {
                      try {
                        setLoading(true);
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
                          setClassStatus('published');
                          await loadClassStatus();
                          await loadAllStudentsReports();
                        }
                      } catch (error) {
                        console.error('Error publishing results:', error);
                        toast.error('Failed to publish results');
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    Publish All Results
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <LoadingSpinner />
        ) : !selectedStudent && selectedClass && selectedTerm && selectedAcademicYear ? (
          /* All Students Table View */
          <div className="space-y-6">
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-gray-800">Student Reports Overview</h3>
                  <p className="text-gray-600">
                    {CLASSES.find(c => c.id === selectedClass)?.name || selectedClass} • 
                    {TERMS.find(t => t.id === selectedTerm)?.label || selectedTerm} • 
                    {ACADEMIC_YEARS.find(y => y.id === selectedAcademicYear)?.name || selectedAcademicYear}
                  </p>
                </div>
                <div className="text-sm text-gray-500">
                  {allStudentsReports.length} students
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Subjects Completed</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {allStudentsReports.map((report) => (
                      <tr key={report.student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold text-primary-600">
                                {report.student.fullName?.charAt(0)}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 text-sm">{report.student.fullName}</p>
                              <p className="text-xs text-gray-600">ID: {report.student.studentId}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center text-sm">
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            {report.subjectsCount}/{report.totalSubjects}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            report.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            report.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                            report.status === 'submitted' ? 'bg-green-100 text-green-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {report.status === 'completed' ? 'Ready to Publish' :
                             report.status === 'review' ? 'Under Review' :
                             report.status === 'submitted' ? 'Submitted' :
                             'Pending'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedStudent(report.student.id);
                              }}
                              className="btn btn-sm btn-outline flex items-center gap-1"
                              title="View Student Results"
                            >
                              <MdGrade size={14} />
                              View Results
                            </button>
                            <button
                              onClick={() => generateStudentReport(report.student)}
                              className="btn btn-sm btn-primary flex items-center gap-1"
                              title="Generate Report"
                            >
                              <MdDescription size={14} />
                              Report
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {allStudentsReports.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <MdPerson size={48} className="mx-auto mb-4 text-gray-300" />
                  <p>No students found in this class</p>
                </div>
              )}
            </div>
          </div>
        ) : studentInfo && studentGrades.length > 0 ? (
          <div className="space-y-6">
            {/* Student Info Card */}
            <div className="card">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                    <MdPerson className="text-primary-600" size={32} />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-800">{studentInfo.fullName}</h3>
                    <p className="text-gray-600">Student ID: {studentInfo.studentId}</p>
                    <p className="text-gray-600">Class: {studentInfo.class}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedStudent('');
                      setStudentInfo(null);
                      setStudentGrades([]);
                    }}
                    className="btn btn-outline flex items-center gap-2"
                    title="Back to all students"
                  >
                    Back to List
                  </button>
                  {!isEditMode ? (
                    <button
                      onClick={toggleEditMode}
                      className="btn btn-secondary flex items-center gap-2"
                    >
                      <MdEdit size={18} />
                      Edit Grades
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={saveEditedGrades}
                        className="btn btn-primary flex items-center gap-2"
                      >
                        <MdSave size={18} />
                        Save Changes
                      </button>
                      <button
                        onClick={toggleEditMode}
                        className="btn btn-outline flex items-center gap-2"
                      >
                        <MdCancel size={18} />
                        Cancel
                      </button>
                    </>
                  )}
                  <button
                    onClick={generatePDF}
                    className="btn btn-primary flex items-center gap-2"
                    disabled={isEditMode}
                  >
                    <MdDownload size={18} />
                    Download PDF
                  </button>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="card">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('history')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'history'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Grade History & Editor
                  </button>
                  <button
                    onClick={() => setActiveTab('report')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === 'report'
                        ? 'border-primary-500 text-primary-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Student Report
                  </button>
                </nav>
              </div>

              <div className="mt-6">
                {activeTab === 'history' ? (
                  <>
                    {/* Overall Performance */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="card text-center">
                        <div className="text-3xl font-bold text-blue-600">{overall.average}%</div>
                        <div className="text-gray-600">Overall Average</div>
                      </div>
                      <div className="card text-center">
                        <div className="text-3xl font-bold text-blue-600">{overall.grade}</div>
                        <div className="text-gray-600">Overall Grade</div>
                      </div>
                      <div className="card text-center">
                        <div className="text-lg font-medium text-gray-800">{overall.remarks}</div>
                        <div className="text-gray-600">Remarks</div>
                      </div>
                    </div>

                    {/* Subject Results */}
                    <div className="card">
                      <h3 className="text-lg font-bold text-gray-800 mb-4">
                        Grade History - All Subjects & Terms
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Term</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Year</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase" title="Class Test 1">CT1</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase" title="Class Test 2">CT2</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase" title="Quiz">Quiz</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase" title="Homework">HW</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase" title="Project">Proj</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase" title="Attendance">Att</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">CA Total</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Exam</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Final</th>
                              <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Grade</th>
                              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Remarks</th>
                              {isEditMode && <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>}
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {studentGrades.map((grade, index) => {
                              const caData = grade.studentData?.continuousAssessment || {};
                              const editedCaData = editedGrades[index]?.continuousAssessment || {};
                              const currentCaData = { ...caData, ...editedCaData };
                              const caTotal = calculateContinuousScore(currentCaData);
                              const examScore = editedGrades[index]?.examScore !== undefined ? editedGrades[index].examScore : grade.studentData?.examScore || 0;
                              const finalScore = calculateFinalScore(caTotal, examScore);
                              const gradeLetter = getGradeFromScore(finalScore);
                              
                              return (
                                <tr key={index} className="hover:bg-gray-50">
                                  <td className="px-3 py-2 font-medium text-gray-800">{grade.subjectName}</td>
                                  <td className="px-3 py-2 text-center text-gray-600">{grade.term || 'N/A'}</td>
                                  <td className="px-3 py-2 text-center text-gray-600">{grade.academicYear || 'N/A'}</td>
                                  {isEditMode ? (
                                    <>
                                      <td className="px-3 py-2 text-center">
                                        <input
                                          type="number"
                                          min="0"
                                          max="20"
                                          step="0.1"
                                          value={currentCaData.classTest1 || ''}
                                          onChange={(e) => handleAssessmentChange(index, 'classTest1', e.target.value)}
                                          className="w-12 text-center border rounded px-1 py-0.5 text-xs"
                                        />
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <input
                                          type="number"
                                          min="0"
                                          max="20"
                                          step="0.1"
                                          value={currentCaData.classTest2 || ''}
                                          onChange={(e) => handleAssessmentChange(index, 'classTest2', e.target.value)}
                                          className="w-12 text-center border rounded px-1 py-0.5 text-xs"
                                        />
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <input
                                          type="number"
                                          min="0"
                                          max="20"
                                          step="0.1"
                                          value={currentCaData.quiz || ''}
                                          onChange={(e) => handleAssessmentChange(index, 'quiz', e.target.value)}
                                          className="w-12 text-center border rounded px-1 py-0.5 text-xs"
                                        />
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <input
                                          type="number"
                                          min="0"
                                          max="20"
                                          step="0.1"
                                          value={currentCaData.homework || ''}
                                          onChange={(e) => handleAssessmentChange(index, 'homework', e.target.value)}
                                          className="w-12 text-center border rounded px-1 py-0.5 text-xs"
                                        />
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <input
                                          type="number"
                                          min="0"
                                          max="20"
                                          step="0.1"
                                          value={currentCaData.project || ''}
                                          onChange={(e) => handleAssessmentChange(index, 'project', e.target.value)}
                                          className="w-12 text-center border rounded px-1 py-0.5 text-xs"
                                        />
                                      </td>
                                      <td className="px-3 py-2 text-center">
                                        <input
                                          type="number"
                                          min="0"
                                          max="10"
                                          step="0.1"
                                          value={currentCaData.attendance || ''}
                                          onChange={(e) => handleAssessmentChange(index, 'attendance', e.target.value)}
                                          className="w-12 text-center border rounded px-1 py-0.5 text-xs"
                                        />
                                      </td>
                                      <td className="px-3 py-2 text-center font-semibold text-blue-700">{caTotal.toFixed(1)}</td>
                                      <td className="px-3 py-2 text-center">
                                        <input
                                          type="number"
                                          min="0"
                                          max="70"
                                          step="0.1"
                                          value={examScore || ''}
                                          onChange={(e) => handleExamChange(index, e.target.value)}
                                          className="w-12 text-center border rounded px-1 py-0.5 text-xs"
                                        />
                                      </td>
                                    </>
                                  ) : (
                                    <>
                                      <td className="px-3 py-2 text-center text-blue-600">{caData.classTest1 || 0}</td>
                                      <td className="px-3 py-2 text-center text-blue-600">{caData.classTest2 || 0}</td>
                                      <td className="px-3 py-2 text-center text-blue-600">{caData.quiz || 0}</td>
                                      <td className="px-3 py-2 text-center text-blue-600">{caData.homework || 0}</td>
                                      <td className="px-3 py-2 text-center text-blue-600">{caData.project || 0}</td>
                                      <td className="px-3 py-2 text-center text-blue-600">{caData.attendance || 0}</td>
                                      <td className="px-3 py-2 text-center font-semibold text-blue-700">{caTotal.toFixed(1)}</td>
                                      <td className="px-3 py-2 text-center text-green-600">{grade.studentData?.examScore || 0}</td>
                                    </>
                                  )}
                                  <td className="px-3 py-2 text-center font-bold text-purple-600">{finalScore}</td>
                                  <td className="px-3 py-2 text-center">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                      gradeLetter === 'A' ? 'bg-green-100 text-green-800' :
                                      gradeLetter === 'B' ? 'bg-blue-100 text-blue-800' :
                                      gradeLetter === 'C' ? 'bg-yellow-100 text-yellow-800' :
                                      gradeLetter === 'D' ? 'bg-orange-100 text-orange-800' :
                                      gradeLetter === 'E' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {gradeLetter}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-gray-600">{finalScore >= 50 ? 'Pass' : 'Fail'}</td>
                                  {isEditMode && (
                                    <td className="px-3 py-2 text-center">
                                      <button
                                        onClick={() => deleteGrade(grade.id)}
                                        className="text-red-600 hover:text-red-800 text-sm"
                                        title="Delete this grade record"
                                      >
                                        <MdDelete size={16} />
                                      </button>
                                    </td>
                                  )}
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                ) : (
                  /* Student Report Tab */
                  <div className="text-center py-12">
                    <MdDescription size={64} className="mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Official Student Report</h3>
                    <p className="text-gray-600 mb-6">
                      Generate a comprehensive report card showing all subjects for the selected term and academic year.
                    </p>
                    <button
                      onClick={() => generateStudentReport(studentInfo)}
                      className="btn btn-primary flex items-center gap-2 mx-auto"
                    >
                      <MdDescription size={18} />
                      Generate Official Report
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : selectedStudent && selectedTerm && selectedAcademicYear ? (
          <div className="card text-center py-12">
            <MdGrade className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h3>
            <p className="text-gray-600">No grades have been submitted for this student in the selected term.</p>
          </div>
        ) : (
          <div className="card text-center py-12">
            <MdSearch className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Select Student and Term</h3>
            <p className="text-gray-600">Choose a student, term, and academic year to view their result slip.</p>
          </div>
        )}
      </div>

      {/* Student Report Modal */}
      {showReportModal && studentReportData && (
        (() => {
          const report = allStudentsReports.find(r => r.student.id === studentInfo.id);
          return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold">Student Report Card</h2>
                  <p className="text-blue-100 mt-1">
                    {studentReportData.term} • {studentReportData.academicYear}
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
              {/* Status and Publish Section */}
              <div className="bg-gray-50 px-6 py-4 border-b mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-gray-700">Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      report?.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                      report?.status === 'review' ? 'bg-yellow-100 text-yellow-800' :
                      report?.status === 'submitted' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {report?.status === 'completed' ? 'Ready to Publish' :
                       report?.status === 'review' ? 'Under Review' :
                       report?.status === 'submitted' ? 'Submitted' :
                       'Pending'}
                    </span>
                  </div>
                  <button
                    onClick={() => publishStudentResults(studentInfo)}
                    className="btn btn-primary flex items-center gap-2"
                    disabled={report?.status === 'submitted'}
                  >
                    <MdPublish size={18} />
                    Publish Results
                  </button>
                </div>
              </div>
              {/* School Header */}
              <div className="text-center mb-6 border-b-2 border-blue-600 pb-4">
                <h1 className="text-2xl font-bold text-blue-800 mb-1">GHANAIAN SCHOOL MANAGEMENT SYSTEM</h1>
                <p className="text-sm text-gray-600">Academic Report Card</p>
                <div className="mt-2 text-xs text-gray-500">
                  <p>Ministry of Education - Ghana Education Service</p>
                  <p>Report for {studentReportData.term} - {studentReportData.academicYear}</p>
                </div>
              </div>

              {/* Student Information Card */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-lg p-6 mb-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-2xl font-bold text-blue-600">
                        {studentReportData.student.fullName?.charAt(0)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">Student</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block">FULL NAME</label>
                    <p className="font-bold text-gray-800 text-sm">{studentReportData.student.fullName}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block">STUDENT ID</label>
                    <p className="font-bold text-gray-800 text-sm">{studentReportData.student.studentId}</p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block">CLASS</label>
                    <p className="font-bold text-gray-800 text-sm">{studentReportData.class}</p>
                  </div>
                </div>
              </div>

              {/* Grading Scale Key */}
              <div className="mb-6">
                <h3 className="text-sm font-bold text-gray-800 mb-3 text-center">GRADING SCALE (Ghana Education Service Standard)</h3>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
                  <div className="bg-green-100 text-green-800 p-2 rounded text-center font-medium">A: 80-100 (Excellent)</div>
                  <div className="bg-blue-100 text-blue-800 p-2 rounded text-center font-medium">B: 70-79 (Very Good)</div>
                  <div className="bg-yellow-100 text-yellow-800 p-2 rounded text-center font-medium">C: 60-69 (Good)</div>
                  <div className="bg-orange-100 text-orange-800 p-2 rounded text-center font-medium">D: 50-59 (Credit)</div>
                  <div className="bg-red-100 text-red-800 p-2 rounded text-center font-medium">E: 40-49 (Pass)</div>
                  <div className="bg-gray-100 text-gray-800 p-2 rounded text-center font-medium">F: 0-39 (Fail)</div>
                </div>
              </div>

              {/* Subject Results - Ghanaian School Format */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 text-center border-b border-gray-300 pb-2">ACADEMIC PERFORMANCE</h3>
                <div className="overflow-x-auto">
                  <table className="w-full border-2 border-gray-300">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-3 py-3 text-left text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: '35%'}}>SUBJECT</th>
                        <th className="px-3 py-3 text-center text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: '15%'}}>CLASS SCORE<br/>(30%)</th>
                        <th className="px-3 py-3 text-center text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: '15%'}}>EXAM SCORE<br/>(70%)</th>
                        <th className="px-3 py-3 text-center text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: '15%'}}>TOTAL<br/>(100%)</th>
                        <th className="px-3 py-3 text-center text-sm font-bold text-gray-800 border-r border-gray-300" style={{width: '10%'}}>GRADE</th>
                        <th className="px-3 py-3 text-left text-sm font-bold text-gray-800" style={{width: '10%'}}>REMARKS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentReportData.subjects && studentReportData.subjects.map((subject, index) => (
                        <tr key={index} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} border-b border-gray-200`}>
                          <td className="px-3 py-3 font-medium text-gray-800 border-r border-gray-300">
                            {subject.subject}
                          </td>
                          <td className="px-3 py-3 text-center text-blue-700 font-medium border-r border-gray-300">
                            {subject.continuousAssessment.toFixed(1)}
                          </td>
                          <td className="px-3 py-3 text-center text-green-700 font-medium border-r border-gray-300">
                            {subject.examinationScore}
                          </td>
                          <td className="px-3 py-3 text-center font-bold text-purple-700 border-r border-gray-300">
                            {subject.finalScore}
                          </td>
                          <td className="px-3 py-3 text-center border-r border-gray-300">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-bold ${
                              !subject.grade ? 'bg-gray-100 text-gray-500' :
                              subject.grade === 'A' ? 'bg-green-500 text-white' :
                              subject.grade === 'B' ? 'bg-blue-500 text-white' :
                              subject.grade === 'C' ? 'bg-yellow-500 text-white' :
                              subject.grade === 'D' ? 'bg-orange-500 text-white' :
                              subject.grade === 'E' ? 'bg-red-500 text-white' :
                              'bg-gray-500 text-white'
                            }`}>
                              {subject.grade || 'N/A'}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-700 font-medium">
                            {subject.remarks}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Overall Performance Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-700 mb-1">{studentReportData.overall?.averageScore || 0}%</div>
                  <div className="text-sm font-medium text-green-800">AVERAGE SCORE</div>
                  <div className="text-xs text-green-600 mt-1">Overall Performance</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-blue-700 mb-1">{studentReportData.overall?.position || 0}</div>
                  <div className="text-sm font-medium text-blue-800">CLASS POSITION</div>
                  <div className="text-xs text-blue-600 mt-1">Out of {studentReportData.overall?.totalStudents || 0} students</div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-purple-700 mb-1">{studentReportData.overall?.attendanceDetails?.percentage || 0}%</div>
                  <div className="text-sm font-medium text-purple-800">ATTENDANCE</div>
                  <div className="text-xs text-purple-600 mt-1">
                    {studentReportData.overall?.attendanceDetails?.present || 0}/{studentReportData.overall?.attendanceDetails?.total || 0} days
                  </div>
                </div>
              </div>

              {/* Teacher Comments Section */}
              <div className="border-2 border-gray-300 rounded-lg p-4 mb-6">
                <h4 className="font-bold text-gray-800 mb-3">CLASS TEACHER'S REMARKS</h4>
                <div className="min-h-[60px] border border-gray-200 rounded p-3 bg-gray-50">
                  {studentReportData.teacherRemarks ? (
                    <p className="text-gray-700 italic">"{studentReportData.teacherRemarks}"</p>
                  ) : (
                    <p className="text-gray-400 italic">No remarks provided</p>
                  )}
                </div>
                <div className="mt-4 flex justify-between items-end">
                  <div>
                    <div className="border-b border-gray-400 w-48 mb-1"></div>
                    <p className="text-xs text-gray-600">Class Teacher's Signature</p>
                  </div>
                  <div>
                    <div className="border-b border-gray-400 w-48 mb-1"></div>
                    <p className="text-xs text-gray-600">Date</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center text-xs text-gray-500 border-t border-gray-300 pt-4">
                <p className="font-medium">Report Generated: {studentReportData.generatedAt}</p>
                <p>Ghana Education Service - Standard Assessment Format</p>
                <p className="mt-2 text-xs italic">This report is an official academic record</p>
              </div>
            </div>

            {/* Print Button */}
            <div className="bg-gray-50 px-6 py-4 border-t">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowReportModal(false)}
                  className="btn btn-outline"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <MdDescription size={18} />
                  Print Report
                </button>
              </div>
            </div>
          </div>
        </div>
          );
        })()
      )}
    </DashboardLayout>
  );
};