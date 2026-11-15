import renderer from 'react-test-renderer';
import React from 'react';
import { EmptyState } from '../../components/EmptyState';

describe('T-C-9 EmptyState', () => {
  it('Renders with text and action button without crashing', () => {
    expect(() => renderer.create(<EmptyState text="No data" actionLabel="Retry" onAction={jest.fn()} />)).not.toThrow();
  });
});
