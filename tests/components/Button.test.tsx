import renderer from 'react-test-renderer';
import React from 'react';
import { Button } from '../../components/Button';

describe('T-C-1 Button', () => {
  it('renders primary variant without crashing', () => {
    expect(() => renderer.create(<Button variant="primary">Primary</Button>)).not.toThrow();
  });

  it('renders secondary variant without crashing', () => {
    expect(() => renderer.create(<Button variant="secondary">Secondary</Button>)).not.toThrow();
  });

  it('renders text variant without crashing', () => {
    expect(() => renderer.create(<Button variant="text">Text</Button>)).not.toThrow();
  });

  it('renders disabled variant without crashing', () => {
    expect(() => renderer.create(<Button disabled>Primary</Button>)).not.toThrow();
  });

  it('renders loading variant without crashing', () => {
    expect(() => renderer.create(<Button loading>Loading</Button>)).not.toThrow();
  });
});
