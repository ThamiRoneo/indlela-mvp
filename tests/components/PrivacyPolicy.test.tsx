import renderer, { act } from 'react-test-renderer';
import React from 'react';

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

describe('T-S12 Privacy Policy', () => {
  it('T-S12-1: policy text visible immediately (static content, no loading)', () => {
    const tree = mount(<PrivacyPolicy />);
    act(() => {});
    expect(toJson(tree)).toContain('Privacy Policy');
    expect(toJson(tree)).toContain('Indlela');
    expect(toJson(tree)).toContain('delete your account');
    expect(toJson(tree)).toContain('weekly transport budget');
  });
});
