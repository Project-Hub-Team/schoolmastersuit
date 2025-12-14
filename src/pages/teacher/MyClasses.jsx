import React, { useState, useEffect } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { MdMenuBook, MdPeople, MdDescription, MdSchool } from 'react-icons/md';
import { useAuth } from '../../contexts/AuthContext';
import { CLASSES, getSubjectsByClass } from '../../constants/ghanaEducation';
import { readAllRecords } from '../../utils/database';
import LoadingSpinner from '../../components/LoadingSpinner';
import toast from 'react-hot-toast';

export const MyClasses = () => {
  const { userProfile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [classData, setClassData] = useState([]);

  useEffect(() => {
    loadClassData();
  }, []);

  const loadClassData = async () => {
    try {
      setLoading(true);
      const myClasses = userProfile?.classes || [];

      if (myClasses.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch students data
      const studentsResult = await readAllRecords('users');
      const allUsers = Object.values(studentsResult.data || {});
      const allStudents = allUsers.filter(user => user.role === 'student');

      // Calculate data for each class
      const classesWithData = myClasses.map(classId => {
        const classInfo = CLASSES.find(c => c.id === classId);
        if (!classInfo) return null;

        // Count students in this class
        const className = classInfo.name;
        const studentCount = allStudents.filter(student => student.class === className).length;

        // Get subjects for this class that are assigned to this teacher
        const allClassSubjects = getSubjectsByClass(classId);
        const teacherSubjects = userProfile?.subjects || [];
        const assignedSubjects = allClassSubjects.filter(subject => 
          teacherSubjects.includes(subject.id) || teacherSubjects.includes(subject.name)
        );
        const subjectCount = assignedSubjects.length;

        return {
          id: classId,
          info: classInfo,
          studentCount,
          subjectCount,
          subjects: assignedSubjects
        };
      }).filter(Boolean);

      setClassData(classesWithData);
    } catch (error) {
      console.error('Error loading class data:', error);
      toast.error('Failed to load class data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout title="My Classes">
        <LoadingSpinner />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="My Classes">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">My Classes</h2>
          <p className="text-gray-600">Classes assigned to you with student and subject information</p>
        </div>

        {classData.length === 0 ? (
          <div className="card text-center py-12">
            <MdMenuBook className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Classes Assigned</h3>
            <p className="text-gray-600">You haven't been assigned to any classes yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classData.map(classItem => (
              <div key={classItem.id} className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-l-4 border-l-blue-500">
                <div className="flex items-center gap-4 mb-4">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
                    <MdSchool className="text-white" size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{classItem.info.name}</h3>
                    <p className="text-sm text-gray-500 uppercase tracking-wide">{classItem.info.level}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <MdPeople className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Students</p>
                        <p className="text-xs text-gray-500">Enrolled</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">{classItem.studentCount}</span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-green-100 p-2 rounded-lg">
                        <MdDescription className="text-green-600" size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700">Subjects</p>
                        <p className="text-xs text-gray-500">Total</p>
                      </div>
                    </div>
                    <span className="text-2xl font-bold text-green-600">{classItem.subjectCount}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-xs text-gray-500 mb-2">Subjects:</p>
                  <div className="flex flex-wrap gap-1">
                    {classItem.subjects.slice(0, 3).map(subject => (
                      <span key={subject.id} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        {subject.name}
                      </span>
                    ))}
                    {classItem.subjects.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                        +{classItem.subjects.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
