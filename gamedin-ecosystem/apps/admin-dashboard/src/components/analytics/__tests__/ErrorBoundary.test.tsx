/**
 * @file ErrorBoundary Component Tests
 * @description Unit tests for the ErrorBoundary component
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ErrorBoundary from '../ErrorBoundary';

// A component that throws an error
const ErrorComponent: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = false }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>Normal content</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console errors for expected error throwing
  const originalConsoleError = console.error;
  beforeAll(() => {
    console.error = jest.fn(); // Suppress error logs in test output
  });

  afterAll(() => {
    console.error = originalConsoleError; // Restore original console.error
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test Content</div>
      </ErrorBoundary>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('displays error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/Oops! Something went wrong/i)).toBeInTheDocument();
    expect(screen.getByText(/Try Again/i)).toBeInTheDocument();
  });

  it('displays component name when provided', () => {
    render(
      <ErrorBoundary componentName="TestComponent">
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/TestComponent/i)).toBeInTheDocument();
  });

  it('calls onReset when Try Again is clicked', () => {
    const handleReset = jest.fn();
    
    render(
      <ErrorBoundary onReset={handleReset}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    fireEvent.click(screen.getByText(/Try Again/i));
    expect(handleReset).toHaveBeenCalledTimes(1);
  });

  it('toggles error details when Show Details is clicked', () => {
    render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Details should be hidden by default
    expect(screen.queryByText(/Test error/i)).not.toBeInTheDocument();
    
    // Click show details
    fireEvent.click(screen.getByText(/Show Details/i));
    expect(screen.getByText(/Test error/i)).toBeInTheDocument();
    
    // Click hide details
    fireEvent.click(screen.getByText(/Hide Details/i));
    expect(screen.queryByText(/Test error/i)).not.toBeInTheDocument();
  });

  it('renders custom fallback when provided', () => {
    const CustomFallback = () => <div>Custom Error UI</div>;
    
    render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Custom Error UI')).toBeInTheDocument();
    expect(screen.queryByText(/Oops! Something went wrong/i)).not.toBeInTheDocument();
  });

  it('resets error state when reset is triggered', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Should show error UI
    expect(screen.getByText(/Oops! Something went wrong/i)).toBeInTheDocument();
    
    // Rerender with shouldThrow=false
    rerender(
      <ErrorBoundary>
        <ErrorComponent shouldThrow={false} />
      </ErrorBoundary>
    );
    
    // Should show normal content after reset
    expect(screen.getByText('Normal content')).toBeInTheDocument();
  });
});
