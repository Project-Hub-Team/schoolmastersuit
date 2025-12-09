import React from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { MdBarChart, MdAttachMoney, MdMenuBook, MdPersonAdd } from 'react-icons/md';

const StudentDashboard = () => {
  return (
    <DashboardLayout title="Student Dashboard">
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-xl p-6 text-white">
          <h2 className="text-2xl font-bold mb-2">Student Dashboard</h2>
          <p className="text-primary-100">View your academic progress and information</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Current Average</p>
                <p className="text-3xl font-bold text-gray-800">78.5%</p>
              </div>
              <div className="bg-blue-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <MdBarChart className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Fee Balance</p>
                <p className="text-3xl font-bold text-gray-800">GH₵ 250</p>
              </div>
              <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <MdAttachMoney className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Lesson Notes</p>
                <p className="text-3xl font-bold text-gray-800">45</p>
              </div>
              <div className="bg-green-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <MdMenuBook className="text-white" size={24} />
              </div>
            </div>
          </div>

          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Attendance</p>
                <p className="text-3xl font-bold text-gray-800">96%</p>
              </div>
              <div className="bg-purple-500 w-12 h-12 rounded-lg flex items-center justify-center">
                <MdPersonAdd className="text-white" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <h3 className="card-header">Recent Results</h3>
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Subject</th>
                  <th>Class Score</th>
                  <th>Exam Score</th>
                  <th>Total</th>
                  <th>Grade</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Mathematics</td>
                  <td>25/30</td>
                  <td>65/70</td>
                  <td>90</td>
                  <td><span className="badge badge-success">A1</span></td>
                </tr>
                <tr>
                  <td>English Language</td>
                  <td>24/30</td>
                  <td>50/70</td>
                  <td>74</td>
                  <td><span className="badge badge-success">B2</span></td>
                </tr>
                <tr>
                  <td>Integrated Science</td>
                  <td>22/30</td>
                  <td>48/70</td>
                  <td>70</td>
                  <td><span className="badge badge-success">B2</span></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
