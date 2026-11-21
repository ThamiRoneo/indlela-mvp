import renderer, { act } from 'react-test-renderer';
import React from 'react';
import Welcome from '../../app/(auth)/welcome';
import { tokens } from '../../theme/tokens';

const mount = (element: React.ReactElement) => {
  let tree: any;
  act(() => {
    tree = renderer.create(element);
  });
  return tree;
};

const toJson = (tree: any) => JSON.stringify(tree.toJSON());

describe('T-S1-1 Welcome', () => {
  it('S1 renders without crashing', () => {
    expect(() => mount(<Welcome />)).not.toThrow();
  });

  it('T-S1-2: shows lowercase "ndlela" after the blue dot-and-stem mark at top and middle', () => {
    const tree = mount(<Welcome />);
    const json = toJson(tree);

    // Stitch S1: the blue mark is the "i", so the word itself is "ndlela".
    expect(json).toContain('ndlela');
    expect(json).not.toContain('indlela');

    // Blue dot uses the primary brand colour
    expect(json).toContain(tokens.color.primary);

    // Two logo instances (top + middle)
    const logoCount = (json.match(/ndlela/g) || []).length;
    expect(logoCount).toBeGreaterThanOrEqual(2);
  });

  it('T-S1-3: shows pitch text, Sign up button, Log in button', () => {
    const tree = mount(<Welcome />);
    const json = toJson(tree);

    expect(json).toContain('Find jobs you can afford to reach. Track');
    expect(json).toContain('minibus taxi fares from your rank.');
    expect(json).toContain('Sign up');
    expect(json).toContain('Log in');
  });
});
