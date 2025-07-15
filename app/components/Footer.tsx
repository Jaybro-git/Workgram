import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 py-7 px-6 text-center text-sm text-gray-600">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <p>&copy; {new Date().getFullYear()} WorkGram. All rights reserved.</p>
        <div className="flex flex-wrap items-center gap-4 justify-center text-blue-600">
          <a href="/privacy" className="hover:underline">Privacy Policy</a>
          <a href="/terms" className="hover:underline">Terms of Service</a>
          <a href="/contact" className="hover:underline">Contact</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;