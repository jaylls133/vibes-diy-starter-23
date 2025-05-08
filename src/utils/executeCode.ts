
// Execute JavaScript code in a safe way
export const executeJavaScript = (code: string): string[] => {
  const output: string[] = [];
  const originalConsole = { ...console };
  
  // Capture console output
  console.log = (...args) => {
    output.push(args.map(arg => 
      typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
    ).join(' '));
    originalConsole.log(...args);
  };
  
  console.error = (...args) => {
    output.push(`Error: ${args.map(arg => String(arg)).join(' ')}`);
    originalConsole.error(...args);
  };
  
  console.warn = (...args) => {
    output.push(`Warning: ${args.map(arg => String(arg)).join(' ')}`);
    originalConsole.warn(...args);
  };
  
  console.info = (...args) => {
    output.push(`Info: ${args.map(arg => String(arg)).join(' ')}`);
    originalConsole.info(...args);
  };

  try {
    // Execute the code
    new Function(code)();
  } catch (error) {
    output.push(`Error: ${error.message}`);
  } finally {
    // Restore original console methods
    Object.assign(console, originalConsole);
  }
  
  return output;
};

// Execute HTML and CSS together
export const executeHtmlCss = (htmlCode: string, cssCode: string): string => {
  return `
    <html>
      <head>
        <style>${cssCode}</style>
      </head>
      <body>${htmlCode}</body>
    </html>
  `;
};
