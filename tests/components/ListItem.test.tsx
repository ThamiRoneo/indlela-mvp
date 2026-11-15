import renderer from 'react-test-renderer';
import React from 'react';
import { ListItem } from '../../components/ListItem';

describe('T-C-7 ListItem', () => {
  it('Default state renders without crashing', () => {
    expect(() => renderer.create(<ListItem state="default" label="Default" onPress={jest.fn()} />)).not.toThrow();
  });

  it('Selected state renders without crashing', () => {
    expect(() => renderer.create(<ListItem state="selected" label="Selected" onPress={jest.fn()} />)).not.toThrow();
  });

  it('Disabled state renders without crashing', () => {
    expect(() => renderer.create(<ListItem state="disabled" label="Disabled" onPress={jest.fn()} />)).not.toThrow();
  });
});
