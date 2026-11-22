import renderer, { act } from 'react-test-renderer';
import React from 'react';
import { TextInput, TouchableOpacity } from '../../tests/mocks/react-native';

jest.mock('../../lib/supabase', () => {
  const { SupabaseClient } = jest.requireMock('../../tests/mocks/supabase');
  return { supabase: SupabaseClient };
});

import LogIn from '../../app/(auth)/log-in';
import { supabase } from '../../lib/supabase';
import { messages } from '../../lib/messages';

const mount = (element: React.ReactElement) => {
  let tree: any;
  act(() => {
    tree = renderer.create(element);
  });
  return tree;
};

const findInput = (tree: any, placeholder: string) =>
  tree.root.findAllByType(TextInput).find((n: any) => n.props.placeholder === placeholder);

const findTouchables = (tree: any) => tree.root.findAllByType(TouchableOpacity);

const toJson = (tree: any) => JSON.stringify(tree.toJSON());

const findButton = (tree: any, text: string) => {
  const touchables = findTouchables(tree);
  const matchText = (node: any): boolean => {
    if (!node) return false;
    if (typeof node === 'string' || typeof node === 'number') return String(node).includes(text);
    if (Array.isArray(node)) return node.some(matchText);
    if (node.props && node.props.children) return matchText(node.props.children);
    return false;
  };
  return touchables.find((t: any) => {
    if (t.props.accessibilityLabel === text) return true;
    return matchText(t.props.children);
  });
};

describe('T-US3 Log In', () => {
  const nav = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
      data: { user: { id: 'u1' }, session: {} },
      error: null,
    });
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({
            data: { nearest_rank_id: null, username: null },
            error: null,
          }),
        }),
      }),
    });
  });

  it('T-US3-1: correct credentials → S4 when no rank set', async () => {
    const tree = mount(<LogIn navigation={nav as any} />);

    act(() => {
      findInput(tree, 'Email').props.onChangeText('lerato@example.com');
      findInput(tree, 'Password').props.onChangeText('Password1');
    });

    const loginBtn = findButton(tree, 'Log in');
    expect(loginBtn).toBeTruthy();

    await act(async () => {
      loginBtn.props.onPress();
    });
    await act(async () => {});
    await act(async () => {});

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'lerato@example.com',
      password: 'Password1',
    });
    expect(nav.navigate).toHaveBeenCalledWith('/set-nearest-rank');
  });

  it('T-US3-2: unverified email → verify message + Resend email link', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Email not confirmed' },
    });

    const tree = mount(<LogIn navigation={nav as any} />);

    act(() => {
      findInput(tree, 'Email').props.onChangeText('lerato@example.com');
      findInput(tree, 'Password').props.onChangeText('Password1');
    });

    const loginBtn = findButton(tree, 'Log in');
    await act(async () => {
      loginBtn.props.onPress();
    });
    await act(async () => {});
    await act(async () => {});

    expect(toJson(tree)).toContain(messages.auth.emailUnverified);
    expect(toJson(tree)).toContain(messages.auth.resendEmail);
  });

  it('T-US3-3: 5 wrong passwords → too many attempts message', async () => {
    (supabase.auth.signInWithPassword as jest.Mock).mockResolvedValueOnce({
      data: { user: null, session: null },
      error: { message: 'Too many attempts' },
    });

    const tree = mount(<LogIn navigation={nav as any} />);

    act(() => {
      findInput(tree, 'Email').props.onChangeText('lerato@example.com');
      findInput(tree, 'Password').props.onChangeText('Password1');
    });

    const loginBtn = findButton(tree, 'Log in');
    await act(async () => {
      loginBtn.props.onPress();
    });
    await act(async () => {});
    await act(async () => {});

    expect(toJson(tree)).toContain(messages.auth.tooManyAttempts);
  });

  it('T-US3-4: Forgot password link navigates to forgot-password', () => {
    const tree = mount(<LogIn navigation={nav as any} />);
    const forgotBtn = findButton(tree, 'Forgot password?');
    expect(forgotBtn).toBeTruthy();
    act(() => {
      forgotBtn.props.onPress();
    });
    expect(nav.navigate).toHaveBeenCalledWith('(auth)/forgot-password');
  });

  it('T-US3-5: Sign up link navigates to sign-up', () => {
    const tree = mount(<LogIn navigation={nav as any} />);
    const signupBtn = findButton(tree, 'Sign up');
    expect(signupBtn).toBeTruthy();
    act(() => {
      signupBtn.props.onPress();
    });
    expect(nav.navigate).toHaveBeenCalledWith('(auth)/sign-up');
  });
});
