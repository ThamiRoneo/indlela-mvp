import renderer, { act } from 'react-test-renderer';
import React from 'react';
import { TouchableOpacity } from '../../tests/mocks/react-native';

jest.mock('../../lib/supabase', () => {
  const { SupabaseClient } = jest.requireMock('../../tests/mocks/supabase');
  return { supabase: SupabaseClient };
});

import DeleteAccount from '../../app/modals/delete-account';
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

const findTouchables = (tree: any) => tree.root.findAllByType(TouchableOpacity);

const toJson = (tree: any) => JSON.stringify(tree.toJSON());

describe('T-M1 Delete Account', () => {
  const onDismiss = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    onDismiss.mockClear();
  });

  it('T-M1-1: confirmation dialog, spinner on delete, success → Account deleted.', async () => {
    let resolveInvoke: any;
    const invokePromise = new Promise((res) => { resolveInvoke = res; });
    (supabase.functions.invoke as jest.Mock).mockReturnValue(invokePromise);

    const tree = mount(<DeleteAccount onDismiss={onDismiss} />);
    expect(toJson(tree)).toContain('Delete account');
    expect(toJson(tree)).toContain(messages.deleteAccount.confirm);

    const touchables = findTouchables(tree);
    act(() => {
      touchables[1].props.onPress(); // Delete
    });
    await flush();
    // Deleting spinner shown before promise resolves
    expect(toJson(tree)).toContain('Deleting');
    expect(toJson(tree)).toContain('Please wait');

    resolveInvoke({ error: null });
    await flush();
    await flush();
    expect(toJson(tree)).toContain(messages.deleteAccount.success);

    const touchables2 = findTouchables(tree);
    act(() => {
      touchables2[0].props.onPress(); // OK
    });
    expect(onDismiss).toHaveBeenCalled();
  });

  it('T-M1-2: delete fails → error message + Retry', async () => {
    let resolveInvoke: any;
    const invokePromise = new Promise((res) => { resolveInvoke = res; });
    (supabase.functions.invoke as jest.Mock).mockReturnValue(invokePromise);

    const tree = mount(<DeleteAccount onDismiss={onDismiss} />);
    const touchables = findTouchables(tree);
    act(() => {
      touchables[1].props.onPress(); // Delete
    });
    await flush();
    expect(toJson(tree)).toContain('Please wait');

    resolveInvoke({ error: new Error('down') } as any);
    await flush();
    await flush();
    expect(toJson(tree)).toContain(messages.deleteAccount.deleteError);

    const touchables2 = findTouchables(tree);
    const retry = touchables2.find((t: any) => {
      const c = t.props.children;
      const arr = Array.isArray(c) ? c : [c];
      const el = arr.find((x) => x && x.props && x.props.children);
      return el && (Array.isArray(el.props.children) ? el.props.children.join('') : String(el.props.children)) === 'Retry';
    });
    act(() => {
      retry.props.onPress();
    });
    await flush();
    expect(supabase.functions.invoke).toHaveBeenCalledTimes(2);
  });
});
