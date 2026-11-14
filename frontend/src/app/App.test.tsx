import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App', () => {
  it('renders without crashing', () => {
    const { container } = render(<App />);
    expect(container).toBeTruthy();
  });

  it('renders the home page content', async () => {
    render(<App />);
    const elements = await screen.findAllByText(/AK KAGAZ/i, {}, { timeout: 15_000 });
    expect(elements.length).toBeGreaterThan(0);
  });
});
