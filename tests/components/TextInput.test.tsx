import renderer from 'react-test-renderer';
import React from 'react';
import { TextInput } from '../../components/TextInput';

describe('T-C-2 TextInput', () => {
  it('renders without error state without crashing', () => {
    expect(() => renderer.create(<TextInput placeholder="Enter text" />)).not.toThrow();
  });

  it('renders with error state without crashing', () => {
    expect(() => renderer.create(<TextInput error="Invalid" placeholder="Enter text" />)).not.toThrow();
  });

  it('renders secure text entry without crashing', () => {
    expect(() => renderer.create(<TextInput secureTextEntry placeholder="Password" />)).not.toThrow();
  });
});
