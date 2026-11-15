import renderer from 'react-test-renderer';
import React from 'react';
import { Spinner } from '../../components/Spinner';

describe('T-C-8 Spinner', () => {
  it('Small variant renders without crashing', () => {
    expect(() => renderer.create(<Spinner size="small" />)).not.toThrow();
  });

  it('Large variant renders without crashing', () => {
    expect(() => renderer.create(<Spinner size="large" />)).not.toThrow();
  });
});
