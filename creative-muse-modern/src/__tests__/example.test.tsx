import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Simple test to verify Jest setup
describe('Example Test', () => {
  it('should render a simple component', () => {
    const TestComponent = () => <div>Hello Test</div>;

    render(<TestComponent />);

    expect(screen.getByText('Hello Test')).toBeInTheDocument();
  });
});
