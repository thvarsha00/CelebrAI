import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import axe from 'axe-core';
import { App } from './App';

describe('Application accessibility', () => {
  it('has no automatically detected accessibility violations', async () => {
    const { container } = render(<App />);

    await screen.findByRole('main');

    const results = await axe.run(container);

    expect(results.violations).toEqual([]);
  });
});
