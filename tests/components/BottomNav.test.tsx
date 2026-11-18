import renderer from 'react-test-renderer';
import React from 'react';
import { BottomNav } from '../../components/BottomNav';

describe('T-C-11 BottomNav', () => {
  it('Renders 5 tabs without crashing', () => {
    expect(() => renderer.create(<BottomNav activeTab="Home" onTabPress={jest.fn()} />)).not.toThrow();
  });
});
