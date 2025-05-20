import React from 'react';

interface CodeExampleViewProps {
  code: string;
  language: string;
}

const CodeExampleView: React.FC<CodeExampleViewProps> = ({ code, language }) => (
  <pre data-testid="code-block" className={`lang-${language}`}>{code}</pre>
);

export default CodeExampleView;
export { CodeExampleView };
