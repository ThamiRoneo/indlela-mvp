import renderer from 'react-test-renderer';
import React from 'react';
import { TopAppBar } from '../../components/TopAppBar';

describe('T-C-10 TopAppBar', () => {
  it('Renders with title without crashing', () => {
    expect(() => renderer.create(<TopAppBar title="Welcome" onBack={jest.fn()} />)).not.toThrow();
  });

  it('Renders with optional action without crashing', () => {
    expect(() => renderer.create(<TopAppBar title="Welcome" action={jest.fn()} />)).not.toThrow();
  });
});
