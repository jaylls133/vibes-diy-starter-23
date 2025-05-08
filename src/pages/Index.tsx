
import React from 'react';
import { EditorProvider } from '@/contexts/EditorContext';
import Header from '@/components/Header';
import CodeEditor from '@/components/CodeEditor';
import OutputConsole from '@/components/OutputConsole';
import Footer from '@/components/Footer';

const Index = () => {
  return (
    <EditorProvider>
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header />
        
        <main className="flex-grow container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-12rem)]">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <CodeEditor />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
              <OutputConsole />
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </EditorProvider>
  );
};

export default Index;
