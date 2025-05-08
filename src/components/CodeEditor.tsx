
import React, { useEffect } from 'react';
import { useEditor } from '@/contexts/EditorContext';
import { executeJavaScript, executeHtmlCss } from '@/utils/executeCode';
import { Play, Trash } from 'lucide-react';
import CodeEditorTextarea from '@uiw/react-textarea-code-editor';

const CodeEditor = () => {
  const { 
    code, 
    setCode, 
    currentLanguage, 
    setOutput, 
    clearOutput, 
    isRunning, 
    setIsRunning 
  } = useEditor();

  // Map language to language for the code editor
  const languageMap = {
    javascript: 'js',
    html: 'html',
    css: 'css'
  };

  const handleRun = async () => {
    clearOutput();
    setIsRunning(true);
    
    try {
      if (currentLanguage === 'javascript') {
        const result = executeJavaScript(code.javascript);
        setOutput(result);
      }
      // HTML and CSS execution is handled differently in OutputConsole.tsx
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-800 text-white p-2 flex justify-between items-center">
        <div className="flex items-center">
          <span className="text-sm font-medium">
            {currentLanguage === 'javascript' && 'JavaScript'}
            {currentLanguage === 'html' && 'HTML'}
            {currentLanguage === 'css' && 'CSS'}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={clearOutput}
            className="text-gray-300 hover:text-white p-1 rounded"
            aria-label="Clear output"
          >
            <Trash className="w-4 h-4" />
          </button>
          <button
            onClick={handleRun}
            disabled={isRunning}
            className={`flex items-center gap-1 bg-green-600 hover:bg-green-700 px-3 py-1 rounded text-white text-sm ${
              isRunning ? 'opacity-70 cursor-not-allowed' : ''
            }`}
          >
            <Play className="w-4 h-4" />
            Run
          </button>
        </div>
      </div>
      
      <div className="flex-grow overflow-auto">
        <CodeEditorTextarea
          value={code[currentLanguage]}
          language={languageMap[currentLanguage]}
          onChange={(e) => setCode(currentLanguage, e.target.value)}
          padding={15}
          style={{
            fontSize: '0.9rem',
            fontFamily: '"Fira code", "Fira Mono", monospace',
            minHeight: '100%',
            backgroundColor: '#282c34',
            color: '#abb2bf'
          }}
          className="min-h-full w-full"
        />
      </div>
    </div>
  );
};

export default CodeEditor;
