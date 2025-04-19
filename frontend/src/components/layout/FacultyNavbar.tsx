'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function FacultyNavbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const navLinks = [
    { path: '/faculty/start-session', label: 'Start Session' },
    { path: '/faculty/classes', label: 'My Classes' },
    { path: '/faculty/reports', label: 'Reports' },
    { path: '/faculty/analytics', label: 'Analytics' }
  ];

  return (
    <nav className="bg-blue-800 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <img src="/iiit-manipur-logo.png" alt="IIIT Manipur Logo" className="h-10 w-auto" />
              <span className="ml-2 text-white font-bold text-xl">IIIT Manipur</span>
            </div>
            <div className="hidden md:ml-6 md:flex md:space-x-4">
              <Link 
                href="/faculty"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive('/faculty') 
                    ? 'bg-blue-900 text-white' 
                    : 'text-gray-300 hover:bg-blue-700 hover:text-white'
                }`}
              >
                Home
              </Link>
              
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  href={link.path}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    isActive(link.path)
                      ? 'bg-blue-900 text-white'
                      : 'text-gray-300 hover:bg-blue-700 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          <div className="hidden md:flex md:items-center">
            <div className="flex items-center">
              <span className="text-gray-300 text-sm mr-4">
                {user?.name} ({user?.role})
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 rounded-md text-sm font-medium bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
          
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-blue-700 focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMobileMenuOpen ? (
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
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/faculty"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive('/faculty')
                  ? 'bg-blue-900 text-white'
                  : 'text-gray-300 hover:bg-blue-700 hover:text-white'
              }`}
            >
              Home
            </Link>
            
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`block px-3 py-2 rounded-md text-base font-medium ${
                  isActive(link.path)
                    ? 'bg-blue-900 text-white'
                    : 'text-gray-300 hover:bg-blue-700 hover:text-white'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
          
          <div className="pt-4 pb-3 border-t border-blue-700">
            <div className="flex items-center px-5">
              <div className="text-base font-medium text-white">
                {user?.name}
              </div>
              <div className="ml-3 text-sm font-medium text-gray-400">
                {user?.role}
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <button
                onClick={handleLogout}
                className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-400 hover:text-white hover:bg-blue-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
