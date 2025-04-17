'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

const NavLink = ({ href, children, className = '' }: NavLinkProps) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive
          ? 'bg-blue-700 text-white'
          : 'text-gray-300 hover:bg-blue-600 hover:text-white'
      } ${className}`}
    >
      {children}
    </Link>
  );
};

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  const handleLogin = () => {
    router.push('/login');
  };

  return (
    <nav className="bg-blue-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2 text-white font-bold text-xl">
                <img src="/iiit-manipur-logo.png" alt="IIIT Manipur Logo" className="h-10 w-14 mr-2 inline-block align-middle" />
                <span>IIIT Manipur</span>
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
  <NavLink href="/">Home</NavLink>

                {user && user.role === 'student' && (
                  <>
                    <NavLink href="/student/attendance">My Attendance</NavLink>
                    <NavLink href="/student/profile">Profile</NavLink>
                    <NavLink href="/student/face">Face Recognition</NavLink>
                    <NavLink href="/student/reports">Reports</NavLink>
                  </>
                )}

                {user && user.role === 'faculty' && (
                  <>
                    <NavLink href="/faculty/start-session">Start Session</NavLink>
                    <NavLink href="/faculty/classes">My Classes</NavLink>
                    <NavLink href="/faculty/reports">Reports</NavLink>
                    <NavLink href="/faculty/analytics">Analytics</NavLink>
                  </>
                )}

                {user && user.role === 'admin' && (
                  <>
                    <NavLink href="/admin/dashboard">Dashboard</NavLink>
                    <NavLink href="/admin/users">Users</NavLink>
                    <NavLink href="/admin/courses">Courses</NavLink>
                    <NavLink href="/admin/settings">Settings</NavLink>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              {!user ? (
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => handleLogin()}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-500"
                  >
                    Student Login
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLogin()}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-indigo-600 text-white hover:bg-blue-500"
                  >
                    Faculty Login
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="text-white text-sm">
                    {user.name} ({user.role})
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-3 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-500"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            <button
              type="button"
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-blue-800 focus:ring-white"
            >
              <span className="sr-only">Open main menu</span>
              {!isOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${isOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            href="/"
            className="block px-3 py-2 rounded-md text-base font-medium text-white bg-blue-700"
          >
            Home
          </Link>

          {user && user.role === 'student' && (
            <>
              <Link
                href="/student/attendance"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-blue-600 hover:text-white"
              >
                My Attendance
              </Link>
              <Link
                href="/student/profile"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-blue-600 hover:text-white"
              >
                Profile
              </Link>
              <Link
                href="/student/face"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-blue-600 hover:text-white"
              >
                Face Recognition
              </Link>
              <Link
                href="/student/reports"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-blue-600 hover:text-white"
              >
                Reports
              </Link>
            </>
          )}

          {user && user.role === 'faculty' && (
            <>
              <Link
                href="/faculty/start-session"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-blue-600 hover:text-white"
              >
                Start Session
              </Link>
              <Link
                href="/faculty/classes"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-blue-600 hover:text-white"
              >
                My Classes
              </Link>
              <Link
                href="/faculty/reports"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-blue-600 hover:text-white"
              >
                Reports
              </Link>
              <Link
                href="/faculty/analytics"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:bg-blue-600 hover:text-white"
              >
                Analytics
              </Link>
            </>
          )}
        </div>
        <div className="pt-4 pb-3 border-t border-blue-700">
          <div className="px-2 space-y-1">
            {!user ? (
              <div className="space-y-1">
                <button
                  type="button"
                  onClick={() => handleLogin()}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-blue-600 text-white hover:bg-blue-500"
                >
                  Student Login
                </button>
                <button
                  type="button"
                  onClick={() => handleLogin()}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-indigo-600 text-white hover:bg-indigo-500"
                >
                  Faculty Login
                </button>
              </div>
            ) : (
              <>
                <div className="block w-full text-left px-3 py-2 text-base font-medium text-gray-300">
                  {user.name} ({user.role})
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 rounded-md text-base font-medium bg-red-600 text-white hover:bg-red-500"
                >
                  Logout
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
