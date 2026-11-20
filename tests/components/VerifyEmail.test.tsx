import renderer, { act } from 'react-test-renderer';
import React from 'react';
import { TouchableOpacity } from '../../tests/mocks/react-native';

jest.mock('../../lib/supabase', () => {
  const { SupabaseClient } = jest.requireMock('../../tests/mocks/supabase');
  return { supabase: SupabaseClient };
});

import VerifyEmail from '../../app/(auth)/verify-email';

const mount = (element: React.ReactElement) => {
  let tree: any;
  act(() => {
    tree = renderer.create(element);
  });
  return tree;
};

const findTouchables = (tree: any) => tree.root.findAllByType(TouchableOpacity);

const toJson = (tree: any) => JSON.stringify(tree.toJSON());

describe('Verify Email', () => {
  const nav = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders verify email screen with checkmark, message, email, open email app button, and resend link', () => {
    const tree = mount(<VerifyEmail email="lerato.mokoena@gmail.com" navigation={nav as any} />);
    act(() => {});

    expect(toJson(tree)).toContain('Verify Email');
    expect(toJson(tree)).toContain('Account created. Please verify your email.');
    expect(toJson(tree)).toContain('Check your inbox');
    expect(toJson(tree)).toContain('lerato.mokoena@gmail.com');
    expect(toJson(tree)).toContain('Open email app');
    expect(toJson(tree)).toContain('Resend verification email');
  });

  it('Open email app navigates to log in', () => {
    const tree = mount(<VerifyEmail email="lerato.mokoena@gmail.com" navigation={nav as any} />);
    act(() => {});
    const touchables = findTouchables(tree);
    const openEmailButton = touchables.find((t: any) => {
      const c = t.props.children;
      const arr = Array.isArray(c) ? c : [c];
      const el = arr.find((x) => x && x.props && x.props.children);
      return el && (Array.isArray(el.props.children) ? el.props.children.join('') : String(el.props.children)) === 'Open email app';
    });
    act(() => {
      openEmailButton.props.onPress();
    });
    expect(nav.navigate).toHaveBeenCalledWith('(auth)/log-in');
  });
});
