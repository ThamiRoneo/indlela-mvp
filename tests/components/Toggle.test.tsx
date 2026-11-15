import renderer from 'react-test-renderer';
import React from 'react';
import { Toggle } from '../../components/Toggle';

describe('T-C-5 Toggle', () => {
  it('On state renders without crashing', () => {
    expect(() => renderer.create(<Toggle value={true} onChange={jest.fn()} />)).not.toThrow();
  });

  it('Off state renders without crashing', () => {
    expect(() => renderer.create(<Toggle value={false} onChange={jest.fn()} />)).not.toThrow();
  });
});
