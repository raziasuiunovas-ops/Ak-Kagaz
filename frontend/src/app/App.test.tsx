import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('renders the home page content', () => {
    render(<App />);
    const elements = screen.getAllByText(/AK KAGAZ/i);
    expect(elements.length).toBeGreaterThan(0);
  });
});
