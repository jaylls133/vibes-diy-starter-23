
import React, { createContext, useState, useContext, ReactNode } from 'react';

type Language = 'javascript' | 'html' | 'css';

interface EditorContextType {
  code: {
    javascript: string;
    html: string;
    css: string;
  };
  currentLanguage: Language;
  output: string[];
  isRunning: boolean;
  setCode: (language: Language, value: string) => void;
  setCurrentLanguage: (language: Language) => void;
  setOutput: (output: string[]) => void;
  clearOutput: () => void;
  setIsRunning: (isRunning: boolean) => void;
}

const initialCode = {
  javascript: `// Write your JavaScript code here\nconsole.log("Hello, world!");\n\n// You can use functions\nfunction greet(name) {\n  return "Hello, " + name + "!";\n}\n\nconsole.log(greet("Developer"));`,
  html: `<!-- Write your HTML code here -->\n<div class="container">\n  <h1>Hello, HTML!</h1>\n  <p>This is a paragraph.</p>\n</div>`,
  css: `/* Write your CSS code here */\nbody {\n  font-family: 'Arial', sans-serif;\n  line-height: 1.6;\n  color: #333;\n  padding: 20px;\n}\n\n.container {\n  max-width: 800px;\n  margin: 0 auto;\n  padding: 20px;\n  border: 1px solid #ddd;\n  border-radius: 5px;\n}`
};

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider = ({ children }: { children: ReactNode }) => {
  const [code, setCodeState] = useState(initialCode);
  const [currentLanguage, setCurrentLanguage] = useState<Language>('javascript');
  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const setCode = (language: Language, value: string) => {
    setCodeState(prevState => ({
      ...prevState,
      [language]: value
    }));
  };

  const clearOutput = () => {
    setOutput([]);
  };

  return (
    <EditorContext.Provider
      value={{
        code,
        currentLanguage,
        output,
        isRunning,
        setCode,
        setCurrentLanguage,
        setOutput,
        clearOutput,
        setIsRunning
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = (): EditorContextType => {
  const context = useContext(EditorContext);
  if (context === undefined) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
