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

    await act(async () => {
      findTouchables(tree)[0].props.onPress();
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

    await act(async () => {
      findTouchables(tree)[0].props.onPress();
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

    await act(async () => {
      findTouchables(tree)[0].props.onPress();
    });
    await act(async () => {});
    await act(async () => {});

    expect(toJson(tree)).toContain(messages.auth.tooManyAttempts);
  });
});
