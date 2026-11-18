import renderer from 'react-test-renderer';
import React from 'react';
import { FilterChip } from '../../components/FilterChip';

describe('T-C-6 FilterChip', () => {
  it('Selected state renders without crashing', () => {
    expect(() => renderer.create(<FilterChip selected={true} label="Affordable" onPress={jest.fn()} />)).not.toThrow();
  });

  it('Unselected state renders without crashing', () => {
    expect(() => renderer.create(<FilterChip selected={false} label="All" onPress={jest.fn()} />)).not.toThrow();
  });
});
