import renderer, { act } from 'react-test-renderer';
import React from 'react';
import { TouchableOpacity } from '../../tests/mocks/react-native';
import NetInfo from '@react-native-community/netinfo';

jest.mock('../../lib/supabase', () => {
  const { SupabaseClient } = jest.requireMock('../../tests/mocks/supabase');
  return { supabase: SupabaseClient };
});

import SetNearestRank from '../../app/set-nearest-rank';
import { supabase } from '../../lib/supabase';
import { messages } from '../../lib/messages';

const mount = (element: React.ReactElement) => {
  let tree: any;
  act(() => {
    tree = renderer.create(element);
  });
  return tree;
};

const findTouchables = (tree: any) => tree.root.findAllByType(TouchableOpacity);

const toJson = (tree: any) => JSON.stringify(tree.toJSON());

const ranksQuery = (data: any[]) => {
  const base: any = {
    select: jest.fn(),
    order: jest.fn().mockResolvedValue({ data, error: null }),
    update: jest.fn(),
    eq: jest.fn(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
    insert: jest.fn(),
    delete: jest.fn(),
  };
  base.select.mockReturnValue(base);
  base.update.mockReturnValue(base);
  base.eq.mockReturnValue(base);
  return base;
};

describe('T-US1 / T-S4 Set Nearest Rank', () => {
  const nav = { navigate: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({
      data: { user: { id: 'u1' } },
    });
  });

  it('T-US1-1: prompted on onboarding; saved → S7', async () => {
    (supabase.from as jest.Mock).mockReturnValue(ranksQuery([
      { id: 'r1', name: 'Rustenburg Taxi Rank' },
      { id: 'r2', name: 'Boitekong Taxi Rank' },
    ]));

    const tree = mount(<SetNearestRank navigation={nav as any} />);
    await act(async () => {});

    const touchables = findTouchables(tree);
    act(() => {
      touchables[0].props.onPress(); // select rank r1
    });
    const confirm = findTouchables(tree)[findTouchables(tree).length - 1];
    expect(confirm.props.disabled).toBe(false);

    await act(async () => {
      confirm.props.onPress();
    });
    await act(async () => {});
    await act(async () => {});

    expect(nav.navigate).toHaveBeenCalledWith('/(tabs)/index');
  });

  it('T-S4-1: empty → no ranks message + Retry', async () => {
    (supabase.from as jest.Mock).mockReturnValue(ranksQuery([]));

    const tree = mount(<SetNearestRank navigation={nav as any} />);
    await act(async () => {});

    expect(toJson(tree)).toContain(messages.rank.empty);
    expect(toJson(tree)).toContain('Retry');
  });

  it('T-S4-2: error → load error message + Retry', async () => {
    (supabase.from as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockRejectedValue(new Error('down')),
      }),
    });

    const tree = mount(<SetNearestRank navigation={nav as any} />);
    await act(async () => {});

    expect(toJson(tree)).toContain(messages.rank.loadError);
    expect(toJson(tree)).toContain('Retry');
  });

  it('T-S4-3: offline → no connection message', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({ isConnected: false });

    const tree = mount(<SetNearestRank navigation={nav as any} />);
    await act(async () => {});

    expect(toJson(tree)).toContain(messages.rank.offline);
  });
});
