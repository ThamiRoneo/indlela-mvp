import renderer, { act } from 'react-test-renderer';
import React from 'react';
import { TouchableOpacity, TextInput } from '../../tests/mocks/react-native';
import NetInfo from '@react-native-community/netinfo';

jest.mock('../../lib/supabase', () => {
  const { SupabaseClient } = jest.requireMock('../../tests/mocks/supabase');
  return { supabase: SupabaseClient };
});
jest.mock('../../lib/api/fares', () => {
  const m = jest.requireMock('../../tests/mocks/fares-api');
  return { viewFares: m.viewFares, getCachedFares: m.getCachedFares, reportFare: m.reportFare, viewFareAlerts: m.viewFareAlerts };
});

import ReportFare from '../../app/(tabs)/report-fare';
import { supabase } from '../../lib/supabase';
import { reportFare } from '../../lib/api/fares';
import { messages } from '../../lib/messages';

const mount = (element: React.ReactElement) => {
  let tree: any;
  act(() => {
    tree = renderer.create(element);
  });
  return tree;
};
const flush = () => act(async () => {});
const toJson = (tree: any) => JSON.stringify(tree.toJSON());

const ranksQuery = (data: any[]) => {
  const base: any = {
    select: jest.fn().mockReturnThis(),
    order: jest.fn().mockResolvedValue({ data, error: null }),
    eq: jest.fn(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  };
  return base;
};

const routesQuery = (data: any[]) => {
  const base: any = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockResolvedValue({ data, error: null }),
  };
  return base;
};

let currentRanks: any[] = [];
let currentRoutes: any[] = [];

describe('T-US5 / T-S6 Report Fare', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'u1' } } });
    (reportFare as jest.Mock).mockResolvedValue({ error: null });
    currentRanks = [];
    currentRoutes = [];
    (supabase.from as jest.Mock).mockImplementation((_table: string) => {
      if (_table === 'ranks') return ranksQuery(currentRanks);
      if (_table === 'routes') return routesQuery(currentRoutes);
      return ranksQuery([]);
    });
  });

  it('T-US5-1: submit under daily limit → success → "Thanks! Fare reported for [Route]."', async () => {
    currentRanks = [{ id: 'r1', name: 'Rustenburg Taxi Rank' }];
    currentRoutes = [{ id: 'rt1', destination: 'Johannesburg Park Station' }];

    const tree = mount(<ReportFare />);
    await flush();

    act(() => {
      tree.root.findAllByType(TouchableOpacity)[0].props.onPress();
    });
    await flush();

    act(() => {
      tree.root.findAllByType(TouchableOpacity)[0].props.onPress();
    });
    await flush();

    const input = tree.root.findAllByType(TextInput)[0];
    act(() => { input.props.onChangeText('180'); });
    await flush();

    const touchables = tree.root.findAllByType(TouchableOpacity);
    const submit = touchables[touchables.length - 1];
    expect(submit.props.disabled).toBe(false);
    act(() => { submit.props.onPress(); });
    await flush();
    await flush();

    expect(reportFare).toHaveBeenCalledWith('r1', 'rt1', 180);
    expect(toJson(tree)).toContain(messages.fares.reportSuccess('Johannesburg Park Station'));
  });

  it('T-S6-1: offline → "No connection. Connect to internet to report fares."', async () => {
    currentRanks = [{ id: 'r1', name: 'Rustenburg Taxi Rank' }];
    currentRoutes = [{ id: 'rt1', destination: 'Johannesburg Park Station' }];
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

    const tree = mount(<ReportFare />);
    await flush();

    act(() => {
      tree.root.findAllByType(TouchableOpacity)[0].props.onPress();
    });
    await flush();

    act(() => {
      tree.root.findAllByType(TouchableOpacity)[0].props.onPress();
    });
    await flush();

    const input = tree.root.findAllByType(TextInput)[0];
    act(() => { input.props.onChangeText('180'); });
    await flush();

    const touchables = tree.root.findAllByType(TouchableOpacity);
    act(() => { touchables[touchables.length - 1].props.onPress(); });
    await flush();
    await flush();

    expect(toJson(tree)).toContain(messages.fares.offlineSubmit);
  });

  it('T-S6-2: submit error → "Failed to submit. Try again."', async () => {
    currentRanks = [{ id: 'r1', name: 'Rustenburg Taxi Rank' }];
    currentRoutes = [{ id: 'rt1', destination: 'Pretoria CBD' }];
    (reportFare as jest.Mock).mockResolvedValue({ error: messages.fares.submitError });

    const tree = mount(<ReportFare />);
    await flush();

    act(() => {
      tree.root.findAllByType(TouchableOpacity)[0].props.onPress();
    });
    await flush();

    act(() => {
      tree.root.findAllByType(TouchableOpacity)[0].props.onPress();
    });
    await flush();

    const input = tree.root.findAllByType(TextInput)[0];
    act(() => { input.props.onChangeText('150'); });
    await flush();

    const touchables = tree.root.findAllByType(TouchableOpacity);
    act(() => { touchables[touchables.length - 1].props.onPress(); });
    await flush();
    await flush();

    expect(toJson(tree)).toContain(messages.fares.submitError);
  });
});
