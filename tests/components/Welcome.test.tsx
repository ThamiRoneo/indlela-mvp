import renderer from 'react-test-renderer';
import React from 'react';
import Welcome from '../../app/(auth)/welcome';

describe('T-S1-1 Welcome', () => {
  it('S1 renders without crashing', () => {
    expect(() => renderer.create(<Welcome />)).not.toThrow();
  });
});
