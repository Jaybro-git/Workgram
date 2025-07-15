'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import LogoutButton from '@/app/components/LogoutButton';

export default function Navbar() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-60 backdrop-blur-lg bg-transparent transition-all">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="text-xl font-extrabold text-blue-600 dark:text-blue-600 hover:text-blue-400"
        >
          WorkGram
        </Link>

        {/* Nav Links */}
        <div className="flex gap-6 items-center text-sm font-medium">
            <img
            src="https://assets.streamlinehq.com/image/private/w_512,h_512,ar_1/f_auto/v1/icons/1/bust-in-silhouette-zlo2d19emq2va9u8cx80r.png/bust-in-silhouette-smw1wq26h6dy80uzy4wkg.png?_a=DATAdtXyZAA0"
            alt="Profile"
            className="w-10 h-10 object-cover rounded-full"
            />

          {/* Profile Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 rounded-full hover:ring-2 ring-blue-500 transition"
            >
              <ChevronDown className="w-4 h-4 text-gray-600" />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-4 w-20 bg-white rounded-xl shadow-lg border border-gray-200 z-10">
                <Link
                  href="/dashboard/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-t-xl"
                >
                  Profile
                </Link>
                <Link
                  href="/dashboard/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </Link>
                <LogoutButton />
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
