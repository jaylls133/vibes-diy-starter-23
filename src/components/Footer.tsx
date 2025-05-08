
import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-400 text-sm py-3 px-4">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="mb-2 sm:mb-0">
          <p>© {new Date().getFullYear()} RunCode. All rights reserved.</p>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-white">About</a>
          <a href="#" className="hover:text-white">Privacy</a>
          <a href="#" className="hover:text-white">Terms</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
