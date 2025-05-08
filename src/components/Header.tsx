
import React from 'react';
import { useEditor } from '@/contexts/EditorContext';
import { Code, PanelLeft, Play, Github } from 'lucide-react';

const Header = () => {
  const { currentLanguage, setCurrentLanguage } = useEditor();
  
  return (
    <header className="bg-gray-900 text-white shadow-md">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code className="w-6 h-6 text-blue-400" />
            <h1 className="text-xl font-bold">RunCode</h1>
          </div>
          
          <div className="flex items-center space-x-1 md:space-x-2">
            <button
              onClick={() => setCurrentLanguage('javascript')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentLanguage === 'javascript'
                  ? 'bg-yellow-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              JavaScript
            </button>
            <button
              onClick={() => setCurrentLanguage('html')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentLanguage === 'html'
                  ? 'bg-orange-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              HTML
            </button>
            <button
              onClick={() => setCurrentLanguage('css')}
              className={`px-3 py-1 rounded-md text-sm font-medium ${
                currentLanguage === 'css'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:bg-gray-700 hover:text-white'
              }`}
            >
              CSS
            </button>
          </div>
          
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-white hidden sm:flex items-center gap-1"
          >
            <Github className="h-5 w-5" />
            <span className="text-sm">GitHub</span>
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
