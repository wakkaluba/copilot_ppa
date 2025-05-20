import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import CodeExampleView from '../../../src/ui/CodeExampleView';

describe('CodeExampleView', () => {
  it('renders code with correct language class', () => {
    render(<CodeExampleView code="console.log('Hello, world!');" language="js" />);
    const codeBlock = screen.getByTestId('code-block');
    expect(codeBlock).toHaveClass('lang-js');
    expect(codeBlock).toHaveTextContent("console.log('Hello, world!');");
  });

  it('renders code for Python', () => {
    render(<CodeExampleView code="print('Hello, world!')" language="python" />);
    const codeBlock = screen.getByTestId('code-block');
    expect(codeBlock).toHaveClass('lang-python');
    expect(codeBlock).toHaveTextContent("print('Hello, world!')");
  });
});
