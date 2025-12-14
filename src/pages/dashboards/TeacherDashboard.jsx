import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { MdMenuBook, MdPersonAdd, MdDescription, MdPeople, MdTrendingUp } from 'react-icons/md';
import { readAllRecords } from '../../utils/database';
import { useAuth } from '../../contexts/AuthContext';
import { CLASSES } from '../../constants/ghanaEducation';
import LoadingSpinner from '../../components/LoadingSpinner';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const TeacherDashboard = () => {
  const { userProfile } = useAuth();
  const [stats, setStats] = useState({
    myClasses: 0,
    totalStudents: 0,
    totalGrades: 0,
    attendanceSessions: 0
  });
  const [chartData, setChartData] = useState({
    studentDistribution: null,
    attendanceTrend: null
  });
  const [loading, setLoading] = useState(true);

  // Helper function to get class name from ID
  const getClassName = (classId) => {
    const classObj = CLASSES.find(c => c.id === classId);
    return classObj ? classObj.name : classId;
  };

  // Generate chart data
  const generateChartData = (allStudents, myClassIds, attendanceData) => {
    // Student distribution by class (Bar chart)
    const classLabels = myClassIds.map(classId => getClassName(classId));
    const studentCounts = myClassIds.map(classId => {
      const className = getClassName(classId);
      return allStudents.filter(s => s.class === className).length;
    });

    const studentDistributionData = {
      labels: classLabels,
      datasets: [
        {
          label: 'Students per Class',
          data: studentCounts,
          backgroundColor: [
            'rgba(34, 197, 94, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(168, 85, 247, 0.8)',
            'rgba(251, 146, 60, 0.8)',
            'rgba(236, 72, 153, 0.8)',
            'rgba(6, 182, 212, 0.8)',
          ],
          borderColor: [
            'rgba(34, 197, 94, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(168, 85, 247, 1)',
            'rgba(251, 146, 60, 1)',
            'rgba(236, 72, 153, 1)',
            'rgba(6, 182, 212, 1)',
          ],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
        },
      ],
    };

    // Attendance trend over last 4 weeks (Line chart)
    const attendanceRecords = Object.values(attendanceData);
    const last4Weeks = [];
    for (let i = 3; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - (i * 7));
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const weekRecords = attendanceRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= weekStart && recordDate <= weekEnd && myClassIds.includes(record.classId);
      });

      const totalAttendance = weekRecords.reduce((acc, record) => {
        const stats = getAttendanceStats(record.attendance);
        return acc + stats.present;
      }, 0);

      const weekLabel = `Week ${4 - i}`;
      last4Weeks.push({
        week: weekLabel,
        attendance: totalAttendance,
        sessions: weekRecords.length
      });
    }

    const attendanceTrendData = {
      labels: last4Weeks.map(w => w.week),
      datasets: [
        {
          label: 'Total Attendance',
          data: last4Weeks.map(w => w.attendance),
          borderColor: 'rgba(34, 197, 94, 1)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(34, 197, 94, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
        {
          label: 'Sessions Count',
          data: last4Weeks.map(w => w.sessions),
          borderColor: 'rgba(59, 130, 246, 1)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: 'rgba(59, 130, 246, 1)',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8,
        },
      ],
    };

    return {
      studentDistribution: studentDistributionData,
      attendanceTrend: attendanceTrendData
    };
  };

  // Helper function for attendance stats (used in chart generation)
  const getAttendanceStats = (attendance) => {
    const attendanceValues = Object.values(attendance || {});
    const present = attendanceValues.filter(status => status === 'present').length;
    const absent = attendanceValues.filter(status => status === 'absent').length;
    const total = attendanceValues.length;
    return { present, absent, total };
  };

  useEffect(() => {
    loadDashboardData();
  }, [userProfile?.id]);

  const loadDashboardData = async () => {
    if (!userProfile?.id) return;

    try {
      const [studentsResult, gradesResult, attendanceResult] = await Promise.all([
        readAllRecords('users').catch(() => ({ success: true, data: [] })),
        readAllRecords('grades').catch(() => ({ success: true, data: [] })),
        readAllRecords('attendance').catch(() => ({ success: true, data: [] }))
      ]);

      // Get teacher's assigned classes
      const myClasses = userProfile.classes || [];
      const myClassIds = myClasses;

      // Count total students in teacher's classes
      const allStudents = Object.values(studentsResult.data || {}).filter(s => s.role === 'student') || [];
      let totalStudents = 0;
      myClassIds.forEach(classId => {
        const className = getClassName(classId);
        const studentsInClass = allStudents.filter(s => s.class === className);
        totalStudents += studentsInClass.length;
      });

      // Count total grades entered by teacher
      const totalGrades = Object.values(gradesResult.data || {}).filter(
        g => g.teacherId === userProfile.id
      ).length || 0;

      // Calculate attendance sessions count
      const attendanceSessions = Object.values(attendanceResult.data || {}).filter(
        a => a.teacherId === userProfile.id
      ).length || 0;

      // Update the stats state
      setStats({
        myClasses: myClasses.length,
        totalStudents,
        totalGrades,
        attendanceSessions
      });

      // Generate chart data
      const chartData = generateChartData(allStudents, myClassIds, attendanceResult.data || {});
      setChartData(chartData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      // Set default stats on error
      setStats({
        myClasses: 0,
        totalStudents: 0,
        totalGrades: 0,
        attendanceSessions: 0
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="Teacher Dashboard">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Teacher Dashboard">
      <div 
        className="space-y-6 min-h-screen bg-cover bg-center bg-fixed"
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.90), rgba(255, 255, 255, 0.90)), url('/dashboard welcome banner.jpeg')`
        }}
      >
        <div 
          className="bg-gradient-to-r from-green-600 to-green-700 rounded-xl p-6 text-white bg-cover bg-center relative overflow-hidden"
          style={{
            backgroundImage: `linear-gradient(rgba(22, 163, 74, 0.85), rgba(21, 128, 61, 0.85)), url('/dashboard welcome banner.jpeg')`
          }}
        >
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Teacher Dashboard</h2>
            <p className="text-primary-100">Manage your classes, attendance, and grading</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">My Classes</p>
                <p className="text-3xl font-bold text-gray-800">{stats.myClasses}</p>
              </div>
              <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <MdMenuBook className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalStudents}</p>
              </div>
              <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <MdPeople className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Grades</p>
                <p className="text-3xl font-bold text-gray-800">{stats.totalGrades}</p>
              </div>
              <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <MdDescription className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Attendance Sessions</p>
                <p className="text-3xl font-bold text-gray-800">{stats.attendanceSessions}</p>
              </div>
              <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <MdPersonAdd className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Student Distribution Chart */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <MdPeople className="text-green-500" size={24} />
              <div>
                <h3 className="text-lg font-bold text-gray-800">Student Distribution</h3>
                <p className="text-sm text-gray-600">Students across your classes</p>
              </div>
            </div>
            <div className="h-64">
              {chartData.studentDistribution ? (
                <Bar
                  data={chartData.studentDistribution}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        cornerRadius: 8,
                        displayColors: false,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.1)',
                        },
                        ticks: {
                          stepSize: 1,
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                    elements: {
                      bar: {
                        borderRadius: 8,
                      },
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner />
                </div>
              )}
            </div>
          </div>

          {/* Attendance Trend Chart */}
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <MdTrendingUp className="text-blue-500" size={24} />
              <div>
                <h3 className="text-lg font-bold text-gray-800">Attendance Trend</h3>
                <p className="text-sm text-gray-600">Weekly attendance overview</p>
              </div>
            </div>
            <div className="h-64">
              {chartData.attendanceTrend ? (
                <Line
                  data={chartData.attendanceTrend}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'top',
                        labels: {
                          usePointStyle: true,
                          padding: 20,
                        },
                      },
                      tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        cornerRadius: 8,
                      },
                    },
                    scales: {
                      y: {
                        beginAtZero: true,
                        grid: {
                          color: 'rgba(0, 0, 0, 0.1)',
                        },
                      },
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                    },
                    elements: {
                      point: {
                        hoverRadius: 8,
                      },
                    },
                    interaction: {
                      intersect: false,
                      mode: 'index',
                    },
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <LoadingSpinner />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
