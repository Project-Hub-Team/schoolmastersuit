import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useSelector } from 'react-redux';
import { selectSettings } from '../store/slices/systemSlice';
import {
  MdDashboard,
  MdPeople,
  MdSchool,
  MdMenuBook,
  MdAttachMoney,
  MdSettings,
  MdLogout,
  MdMenu,
  MdClose,
  MdDescription,
  MdPersonAdd,
  MdBarChart,
  MdSecurity
} from 'react-icons/md';
import { USER_ROLES } from '../constants/ghanaEducation';
import toast from 'react-hot-toast';

/**
 * Dashboard Layout Component
 * Provides sidebar navigation and header for dashboard pages
 */
const DashboardLayout = ({ children, title }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const sidebarRef = React.useRef(null);
  const { userProfile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const settings = useSelector(selectSettings);

  // Close sidebar when clicking outside on mobile
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [sidebarOpen]);

  // Auto-hide sidebar on desktop after navigation
  const handleNavClick = () => {
    if (window.innerWidth >= 1024) {
      // On desktop, close after a short delay
      setTimeout(() => {
        if (!isHovered) {
          setSidebarOpen(false);
        }
      }, 300);
    } else {
      // On mobile, close immediately
      setSidebarOpen(false);
    }
  };

  const handleLogout = async () => {
    const result = await logout();
    if (result.success) {
      toast.success('Logged out successfully');
      navigate('/login');
    }
  };

  // Navigation items based on role
  const getNavigationItems = () => {
    const role = userProfile?.role;

    if (role === USER_ROLES.SUPER_ADMIN) {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: MdDashboard },
        { name: 'Manage Admins', path: '/super-admin/admins', icon: MdSecurity },
        { name: 'Vouchers', path: '/super-admin/vouchers', icon: MdDescription },
        { name: 'Students', path: '/admin/students', icon: MdPeople },
        { name: 'Teachers', path: '/admin/teachers', icon: MdSchool },
        { name: 'Classes', path: '/admin/classes', icon: MdMenuBook },
        { name: 'Reports', path: '/admin/reports', icon: MdBarChart },
        { name: 'System Settings', path: '/super-admin/settings', icon: MdSettings }
      ];
    }

    if (role === USER_ROLES.ADMIN) {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: MdDashboard },
        { name: 'Students', path: '/admin/students', icon: MdPeople },
        { name: 'Teachers', path: '/admin/teachers', icon: MdSchool },
        { name: 'Classes', path: '/admin/classes', icon: MdMenuBook },
        { name: 'Results', path: '/admin/results', icon: MdDescription },
        { name: 'Fees', path: '/admin/fees', icon: MdAttachMoney },
        { name: 'Reports', path: '/admin/reports', icon: MdBarChart }
      ];
    }

    if (role === USER_ROLES.ACCOUNTANT) {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: MdDashboard },
        { name: 'Transactions', path: '/accountant/transactions', icon: MdDescription },
        { name: 'Fee Management', path: '/accountant/fees', icon: MdAttachMoney },
        { name: 'Expenses', path: '/accountant/expenses', icon: MdBarChart },
        { name: 'Budgets', path: '/accountant/budgets', icon: MdMenuBook },
        { name: 'Student Accounts', path: '/accountant/student-accounts', icon: MdPeople },
        { name: 'Reports', path: '/accountant/reports', icon: MdBarChart },
        { name: 'Audit Logs', path: '/accountant/audit-logs', icon: MdSecurity }
      ];
    }

    if (role === USER_ROLES.TEACHER) {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: MdDashboard },
        { name: 'My Classes', path: '/teacher/my-classes', icon: MdMenuBook },
        { name: 'Attendance', path: '/teacher/attendance', icon: MdPersonAdd },
        { name: 'Attendance History', path: '/teacher/attendance-history', icon: MdBarChart },
        { name: 'Grade Entry', path: '/teacher/grades', icon: MdDescription },
        { name: 'Result Slips', path: '/teacher/result-slips', icon: MdDescription },
        { name: 'Lesson Notes', path: '/teacher/lesson-notes', icon: MdMenuBook }
      ];
    }

    if (role === USER_ROLES.STUDENT) {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: MdDashboard },
        { name: 'My Results', path: '/student/results', icon: MdBarChart },
        { name: 'My Fees', path: '/student/fees', icon: MdAttachMoney },
        { name: 'Lesson Notes', path: '/student/lesson-notes', icon: MdMenuBook },
        { name: 'My Attendance', path: '/student/attendance', icon: MdPersonAdd }
      ];
    }

    return [];
  };

  const navigationItems = getNavigationItems();

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        onMouseEnter={() => {
          setIsHovered(true);
          if (window.innerWidth >= 1024) {
            setSidebarOpen(true);
          }
        }}
        onMouseLeave={() => {
          setIsHovered(false);
          if (window.innerWidth >= 1024) {
            setTimeout(() => {
              if (!isHovered) {
                setSidebarOpen(false);
              }
            }, 300);
          }
        }}
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg transform transition-all duration-300 ease-in-out flex flex-col ${
          sidebarOpen ? 'w-64 translate-x-0' : 'w-16 -translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo/Header */}
        <div className={`h-20 flex items-center px-4 border-b border-gray-200 flex-shrink-0 ${!sidebarOpen ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center overflow-hidden">
            <img 
              src="/ALMA logo.png" 
              alt="ALMA Logo" 
              className="w-12 h-12 object-contain flex-shrink-0"
            />
            <div className={`ml-3 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
              <div className="font-bold text-slate-900 text-[10px] leading-tight">
                Administrative & Learning
              </div>
              <div className="font-bold text-slate-900 text-[10px] leading-tight">
                Management Architecture
              </div>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className={`text-gray-500 hover:text-gray-700 ${sidebarOpen ? 'lg:hidden' : 'hidden'}`}
          >
            <MdClose size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className={`p-2 space-y-1 flex-1 overflow-y-auto ${!sidebarOpen ? 'lg:px-1' : ''}`}>
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2.5 rounded-lg transition-all group relative ${
                  isActive
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                } ${!sidebarOpen ? 'lg:justify-center lg:px-2' : ''}`}
                onClick={handleNavClick}
                title={!sidebarOpen ? item.name : ''}
              >
                <Icon size={20} className={`flex-shrink-0 ${sidebarOpen ? 'mr-3' : 'lg:mr-0'}`} />
                <span className={`font-medium text-sm truncate transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
                  {item.name}
                </span>
                {/* Tooltip on hover for collapsed state */}
                {!sidebarOpen && (
                  <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50 hidden lg:block">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className={`p-4 border-t border-gray-200 flex-shrink-0 ${!sidebarOpen ? 'lg:p-2' : ''}`}>
          <div className={`flex items-center mb-3 ${!sidebarOpen ? 'lg:justify-center lg:mb-2' : ''}`}>
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0">
              {userProfile?.displayName?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className={`ml-3 flex-1 transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>
              <p className="text-sm font-medium text-gray-800 truncate">
                {userProfile?.displayName || 'User'}
              </p>
              <p className="text-xs text-gray-500 capitalize">
                {userProfile?.role?.replace('_', ' ') || 'User'}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className={`w-full flex items-center justify-center px-3 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors group relative ${!sidebarOpen ? 'lg:px-2' : ''}`}
            title={!sidebarOpen ? 'Logout' : ''}
          >
            <MdLogout size={18} className={`flex-shrink-0 ${sidebarOpen ? 'mr-2' : 'lg:mr-0'}`} />
            <span className={`font-medium text-sm transition-opacity duration-300 ${sidebarOpen ? 'opacity-100' : 'opacity-0 lg:hidden'}`}>Logout</span>
            {/* Tooltip for collapsed state */}
            {!sidebarOpen && (
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity z-50 hidden lg:block">
                Logout
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : 'lg:pl-16'}`}>
        {/* Top Header */}
        <header className="h-20 bg-white shadow-sm flex items-center justify-between px-6">
          <div className="flex items-center">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
            >
              <MdMenu size={24} />
            </button>
            <h1 className="text-xl font-semibold text-gray-800">{title}</h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600 hidden md:block">
              {new Date().toLocaleDateString('en-GB', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
