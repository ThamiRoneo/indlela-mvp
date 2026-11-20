import renderer, { act } from 'react-test-renderer';
import React from 'react';
import { TextInput, TouchableOpacity } from '../../tests/mocks/react-native';

jest.mock('../../lib/supabase', () => {
  const { SupabaseClient } = jest.requireMock('../../tests/mocks/supabase');
  return { supabase: SupabaseClient };
});

import SignUp from '../../app/(auth)/sign-up';
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

describe('T-US2 Sign Up', () => {
  const nav = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.signUp as jest.Mock).mockResolvedValue({
      data: { user: { id: 'u1' } },
      error: null,
    });
  });

  it('T-US2-1: valid form + both boxes ticked → account created → navigate to log-in', async () => {
    const tree = mount(<SignUp navigation={nav as any} />);

    const button = findTouchables(tree)[2];
    expect(button.props.disabled).toBe(true);

    act(() => {
      findInput(tree, 'Email').props.onChangeText('lerato@example.com');
      findInput(tree, 'Password').props.onChangeText('Password1');
    });
    act(() => {
      findTouchables(tree)[0].props.onPress();
      findTouchables(tree)[1].props.onPress();
    });

    expect(findTouchables(tree)[2].props.disabled).toBe(false);

    await act(async () => {
      findTouchables(tree)[2].props.onPress();
    });
    await act(async () => {});
    await act(async () => {});

    expect(supabase.auth.signUp).toHaveBeenCalledWith({
      email: 'lerato@example.com',
      password: 'Password1',
    });
    expect(nav.navigate).toHaveBeenCalledWith('/verify-email');
  });

  it('T-US2-2: existing email → duplicate message with Log in link', async () => {
    (supabase.auth.signUp as jest.Mock).mockResolvedValueOnce({
      data: { user: null },
      error: { message: 'User already registered' },
    });

    const tree = mount(<SignUp navigation={nav as any} />);

    act(() => {
      findInput(tree, 'Email').props.onChangeText('lerato@example.com');
      findInput(tree, 'Password').props.onChangeText('Password1');
      findTouchables(tree)[0].props.onPress();
      findTouchables(tree)[1].props.onPress();
    });

    await act(async () => {
      findTouchables(tree)[2].props.onPress();
    });
    await act(async () => {});
    await act(async () => {});

    expect(toJson(tree)).toContain(messages.auth.duplicateEmail);
    expect(toJson(tree)).toContain('Log in instead?');
  });

  it('T-US2-3: invalid password → Sign up disabled; password error shown', async () => {
    const tree = mount(<SignUp navigation={nav as any} />);

    act(() => {
      findInput(tree, 'Email').props.onChangeText('lerato@example.com');
      findInput(tree, 'Password').props.onChangeText('abcdefgh');
      findTouchables(tree)[0].props.onPress();
      findTouchables(tree)[1].props.onPress();
    });

    expect(findTouchables(tree)[2].props.disabled).toBe(true);
    expect(toJson(tree)).toContain(messages.auth.passwordTooShort);
  });
});
