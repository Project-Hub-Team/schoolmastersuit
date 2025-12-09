import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { BookOpen, UserCheck, FileText, Users } from 'lucide-react';

const TeacherDashboard = () => {
  return (
    <DashboardLayout title="Teacher Dashboard">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Teacher Dashboard</h2>
          <p className="text-primary-100">Manage your classes, attendance, and grading</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">My Classes</p>
                <p className="text-3xl font-bold text-gray-800">3</p>
              </div>
              <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <BookOpen className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Students</p>
                <p className="text-3xl font-bold text-gray-800">85</p>
              </div>
              <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <Users className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending Grades</p>
                <p className="text-3xl font-bold text-gray-800">12</p>
              </div>
              <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <FileText className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
                <p className="text-3xl font-bold text-gray-800">94%</p>
              </div>
              <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <UserCheck className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TeacherDashboard;
