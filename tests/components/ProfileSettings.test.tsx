import renderer, { act } from 'react-test-renderer';
import React from 'react';
import { TextInput, TouchableOpacity } from '../../tests/mocks/react-native';
import NetInfo from '@react-native-community/netinfo';

jest.mock('../../lib/supabase', () => {
  const { SupabaseClient } = jest.requireMock('../../tests/mocks/supabase');
  return { supabase: SupabaseClient };
});

import ProfileSettings from '../../app/(tabs)/profile';
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

const findInputs = (tree: any) => tree.root.findAllByType(TextInput);

const findTouchables = (tree: any) => tree.root.findAllByType(TouchableOpacity);

const toJson = (tree: any) => JSON.stringify(tree.toJSON());

const queryBuilder = (overrides: any = {}) => {
  const base: any = {
    select: jest.fn(),
    eq: jest.fn(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    update: jest.fn(),
  };
  const mock = { ...base, ...overrides };
  if (!overrides.select) mock.select.mockReturnValue(mock);
  if (!overrides.eq) mock.eq.mockReturnValue(mock);
  if (!overrides.update) mock.update.mockReturnValue(mock);
  return mock;
};

const profileRow = () => ({
  id: 'u1',
  email: 'lerato@example.com',
  username: 'lerato',
  nearest_rank_id: 'r1',
  weekly_transport_budget: null,
});

const loadProfileMock = (row: any) =>
  queryBuilder({ single: jest.fn().mockResolvedValue({ data: row, error: null }) });

const findSaveButton = (touchables: any[]): any => {
  const search = (node: any): boolean => {
    if (!node) return false;
    if (typeof node === 'string') return node.includes('Save');
    if (Array.isArray(node)) return node.some(search);
    if (node.props && node.props.children) return search(node.props.children);
    return false;
  };
  return touchables.find((t: any) => search(t.props.children));
};

describe('T-S11 Profile/Settings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'u1' } },
    });
  });

  it('T-S11-1: email shown as read-only, budget input editable', async () => {
    (supabase.from as jest.Mock).mockReturnValue(loadProfileMock(profileRow()));
    const tree = mount(<ProfileSettings />);
    await flush();

    const inputs = findInputs(tree);
    expect(inputs.length).toBe(1);
    expect(toJson(tree)).toContain('lerato@example.com');
    expect(toJson(tree)).toContain(messages.profile.budgetLabel);
    expect(toJson(tree)).toContain('Save');
  });

  it('T-S11-5: weekly transport budget input (ZAR)', async () => {
    (supabase.from as jest.Mock).mockReturnValue(loadProfileMock(profileRow()));
    const tree = mount(<ProfileSettings />);
    await flush();

    const inputs = findInputs(tree);
    act(() => {
      inputs[0].props.onChangeText('500');
    });
    expect(inputs[0].props.value).toBe('500');
    expect(toJson(tree)).toContain(messages.profile.budgetLabel);
  });

  it('T-S11-4: save success → Saved confirmation toast', async () => {
    (supabase.from as jest.Mock)
      .mockReturnValueOnce(loadProfileMock(profileRow()))
      .mockReturnValue(queryBuilder({ update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: null }) }) }));
    const tree = mount(<ProfileSettings />);
    await flush();

    const inputs = findInputs(tree);
    act(() => {
      inputs[0].props.onChangeText('500');
    });
    const touchables = findTouchables(tree);
    const saveButton = findSaveButton(touchables);
    expect(saveButton).toBeTruthy();
    act(() => {
      saveButton.props.onPress();
    });
    await flush();
    await flush();
    expect(toJson(tree)).toContain('Saved.');
  });

  it('T-S11-2: error → Could not save + Retry', async () => {
    (supabase.from as jest.Mock)
      .mockReturnValueOnce(loadProfileMock(profileRow()))
      .mockReturnValue(queryBuilder({ update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ error: new Error('down') }) }) }));
    const tree = mount(<ProfileSettings />);
    await flush();

    const inputs = findInputs(tree);
    act(() => {
      inputs[0].props.onChangeText('500');
    });
    const touchables = findTouchables(tree);
    const saveButton = findSaveButton(touchables);
    expect(saveButton).toBeTruthy();
    act(() => {
      saveButton.props.onPress();
    });
    await flush();
    await flush();
    expect(toJson(tree)).toContain(messages.profile.saveError);
    expect(toJson(tree)).toContain('Retry');
  });

  it('T-S11-3: offline → No connection. Changes will not be saved.', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({ isConnected: false });
    (supabase.from as jest.Mock).mockReturnValue(loadProfileMock(profileRow()));
    const tree = mount(<ProfileSettings />);
    await flush();
    expect(toJson(tree)).toContain(messages.profile.offline);
    const inputs = findInputs(tree);
    expect(inputs[0].props.editable).toBe(false);
  });
});
