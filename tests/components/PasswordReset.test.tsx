import renderer, { act } from 'react-test-renderer';
import React from 'react';
import { TextInput, TouchableOpacity } from '../../tests/mocks/react-native';
import NetInfo from '@react-native-community/netinfo';

jest.mock('../../lib/supabase', () => {
  const { SupabaseClient } = jest.requireMock('../../tests/mocks/supabase');
  return { supabase: SupabaseClient };
});

import PasswordReset from '../../app/(auth)/forgot-password';
import { supabase } from '../../lib/supabase';
import { messages } from '../../lib/messages';

const mount = (element: React.ReactElement) => {
  let tree: any;
  act(() => {
    tree = renderer.create(element);
  });
  return tree;
};

const flush = () => act(async () => {});

const findInput = (tree: any, placeholder: string) =>
  tree.root.findAllByType(TextInput).find((n: any) => n.props.placeholder === placeholder);

const findTouchables = (tree: any) => tree.root.findAllByType(TouchableOpacity);

const toJson = (tree: any) => JSON.stringify(tree.toJSON());

describe('T-S13 / T-US2-4 Password Reset', () => {
  const nav = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.resetPasswordForEmail as jest.Mock).mockResolvedValue({ error: null });
    (supabase.auth.updateUser as jest.Mock).mockResolvedValue({ error: null });
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
  });

  it('T-S13-1: reset form visible, submit with empty email → error message', () => {
    const tree = mount(<PasswordReset navigation={nav as any} />);
    expect(findInput(tree, 'Email')).toBeTruthy();

    const touchables = findTouchables(tree);
    act(() => {
      touchables[0].props.onPress();
    });
    expect(toJson(tree)).toContain(messages.passwordReset.submitError);
  });

  it('T-S13-2: success → Password reset. Please log in. → S3', async () => {
    const tree = mount(<PasswordReset navigation={nav as any} />);
    act(() => {
      findInput(tree, 'Email').props.onChangeText('lerato@example.com');
    });
    let touchables = findTouchables(tree);
    act(() => {
      touchables[0].props.onPress();
    });
    await flush();
    await flush();

    expect(toJson(tree)).toContain(messages.passwordReset.success);

    touchables = findTouchables(tree);
    act(() => {
      touchables[0].props.onPress();
    });
    expect(nav.navigate).toHaveBeenCalledWith('(auth)/log-in');
  });

  it('T-S13-3: offline → No connection warning + disabled inputs', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    const tree = mount(<PasswordReset navigation={nav as any} />);
    await flush();
    expect(toJson(tree)).toContain('No connection. Please check your internet.');
    expect(toJson(tree)).toContain('"disabled":true');
    const touchables = findTouchables(tree);
    const sendButton = touchables.find((t: any) => t.props.disabled === true);
    expect(sendButton).toBeTruthy();
  });

  it('T-US2-4: set new password from reset link: rules enforced, logged in after', async () => {
    const tree = mount(<PasswordReset navigation={nav as any} mode="reset" />);

    act(() => {
      findInput(tree, 'New password').props.onChangeText('abc');
      findInput(tree, 'Confirm password').props.onChangeText('abc');
    });
    let touchables = findTouchables(tree);
    act(() => {
      touchables[0].props.onPress();
    });
    expect(toJson(tree)).toContain(messages.auth.passwordTooShort);

    act(() => {
      findInput(tree, 'New password').props.onChangeText('Password1');
      findInput(tree, 'Confirm password').props.onChangeText('Password1');
    });
    touchables = findTouchables(tree);
    act(() => {
      touchables[0].props.onPress();
    });
    await flush();
    await flush();
    expect(supabase.auth.updateUser).toHaveBeenCalledWith({ password: 'Password1' });
    expect(nav.navigate).toHaveBeenCalledWith('(auth)/log-in');
  });
});
