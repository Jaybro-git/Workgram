'use client';

import { useEffect, useState } from 'react';

export default function Navbar() {
  const [showNavbar, setShowNavbar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowNavbar(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!showNavbar) return null;

  return (
    <nav className="fixed top-0 left-0 w-full z-50 backdrop-blur-lg bg-transparent transition-all">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <a
          href="/"
          className="text-xl font-extrabold text-blue-600 dark:text-blue-600 hover:text-blue-400"
        >
          WorkGram
        </a>

        <div className="flex gap-4">
          <a
            href="/login"
            className="px-4 py-2 bg-white dark:bg-black text-black dark:text-white border border-gray-300 dark:border-gray-700 rounded-md shadow-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition font-semibold text-sm"
          >
            Login
          </a>
          <a
            href="/signup"
            className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700 transition font-semibold text-sm"
          >
            Sign Up
          </a>
        </div>
      </div>
    </nav>
  );
}
