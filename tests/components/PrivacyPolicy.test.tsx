import renderer, { act } from 'react-test-renderer';
import React from 'react';
import { Spinner } from '../../components/Spinner';

jest.mock('../../lib/supabase', () => {
  const { SupabaseClient } = jest.requireMock('../../tests/mocks/supabase');
  return { supabase: SupabaseClient };
});

import PrivacyPolicy from '../../app/privacy-policy';

const mount = (element: React.ReactElement) => {
  let tree: any;
  act(() => {
    tree = renderer.create(element);
  });
  return tree;
};

const flush = () => act(async () => {});

const toJson = (tree: any) => JSON.stringify(tree.toJSON());

const findSpinners = (tree: any) => tree.root.findAllByType(Spinner);

describe('T-S12 Privacy Policy', () => {
  it('T-S12-1: spinner while loading, then policy text visible', async () => {
    const tree = mount(<PrivacyPolicy />);

    // Initially loading → spinner shown
    expect(findSpinners(tree).length).toBeGreaterThan(0);

    await flush();

    // After loading → policy text visible, no spinner
    expect(findSpinners(tree).length).toBe(0);
    expect(toJson(tree)).toContain('Privacy Policy');
    expect(toJson(tree)).toContain('Indlela');
    expect(toJson(tree)).toContain('delete your account');
  });
});
