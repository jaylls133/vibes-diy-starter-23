
import React, { useRef, useEffect } from 'react';
import { useEditor } from '@/contexts/EditorContext';
import { Terminal } from 'lucide-react';

const OutputConsole = () => {
  const { currentLanguage, output, code } = useEditor();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const outputRef = useRef<HTMLDivElement>(null);

  // Update iframe content when HTML or CSS changes
  useEffect(() => {
    if (currentLanguage === 'html' || currentLanguage === 'css') {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        const htmlContent = `
          <!DOCTYPE html>
          <html>
            <head>
              <style>${code.css}</style>
            </head>
            <body>${code.html}</body>
          </html>
        `;
        iframe.contentWindow.document.open();
        iframe.contentWindow.document.write(htmlContent);
        iframe.contentWindow.document.close();
      }
    }
  }, [code.html, code.css, currentLanguage]);

  // Auto scroll to bottom when output changes
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Render correct output type based on language
  const renderOutput = () => {
    if (currentLanguage === 'javascript') {
      return (
        <div 
          ref={outputRef}
          className="h-full overflow-auto p-4 font-mono text-sm whitespace-pre-wrap"
        >
          {output.length === 0 ? (
            <p className="text-gray-500 italic">Run your code to see output here</p>
          ) : (
            output.map((line, index) => (
              <div key={index} className="py-1">
                {line}
              </div>
            ))
          )}
        </div>
      );
    } else {
      // HTML and CSS output in iframe
      return (
        <iframe 
          ref={iframeRef}
          title="HTML & CSS Output"
          className="h-full w-full border-0"
        />
      );
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="bg-gray-800 text-white p-2 flex items-center">
        <Terminal className="w-4 h-4 mr-2" />
        <span className="text-sm font-medium">
          {currentLanguage === 'javascript' ? 'Console' : 'Preview'}
        </span>
      </div>
      <div className="flex-grow overflow-hidden bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
        {renderOutput()}
      </div>
    </div>
  );
};

export default OutputConsole;
