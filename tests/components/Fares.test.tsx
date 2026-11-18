import renderer, { act } from 'react-test-renderer';
import React from 'react';
import { TouchableOpacity } from '../../tests/mocks/react-native';
import NetInfo from '@react-native-community/netinfo';

jest.mock('../../lib/supabase', () => {
  const { SupabaseClient } = jest.requireMock('../../tests/mocks/supabase');
  return { supabase: SupabaseClient };
});
jest.mock('../../lib/api/fares', () => {
  const m = jest.requireMock('../../tests/mocks/fares-api');
  return { viewFares: m.viewFares, getCachedFares: m.getCachedFares, reportFare: m.reportFare, viewFareAlerts: m.viewFareAlerts };
});

import Fares from '../../app/(tabs)/fares';
import { supabase } from '../../lib/supabase';
import { viewFares, getCachedFares } from '../../lib/api/fares';
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
    select: jest.fn(),
    order: jest.fn().mockResolvedValue({ data, error: null }),
    eq: jest.fn(),
    single: jest.fn().mockResolvedValue({ data: null, error: null }),
  };
  base.select.mockReturnValue(base);
  base.eq.mockReturnValue(base);
  return base;
};

const chainQuery = (resolved: any) => {
  const chain: any = {
    select: jest.fn(),
    eq: jest.fn(),
    single: jest.fn().mockResolvedValue(resolved),
  };
  chain.select.mockReturnValue(chain);
  chain.eq.mockReturnValue(chain);
  return chain;
};

describe('T-US4 / T-S5 Fares', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'u1' } } });
    (viewFares as jest.Mock).mockResolvedValue({ data: [], error: null });
    (getCachedFares as jest.Mock).mockResolvedValue(null);
    // users -> nearest_rank_id; ranks -> fuel_alert_active
    (supabase.from as jest.Mock).mockReturnValue(chainQuery({ data: { nearest_rank_id: 'r1', fuel_alert_active: false }, error: null }));
  });

  it('T-US4-1: fares shown with staleness', async () => {
    (viewFares as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 'f1',
          route_id: 'rt1',
          destination: 'Johannesburg Park Station',
          amount_zar: 180,
          created_at: new Date().toISOString(),
          stale: false,
          days_ago: 0,
        },
      ],
      error: null,
    });

    const tree = mount(<Fares />);
    await flush();

    expect(toJson(tree)).toContain('Johannesburg Park Station');
    expect(toJson(tree)).toContain('180');
  });

  it('T-BR2-2: stale fare shows "Last reported X days ago (stale)"', async () => {
    (viewFares as jest.Mock).mockResolvedValue({
      data: [
        {
          id: 'f1',
          route_id: 'rt1',
          destination: 'Pretoria CBD',
          amount_zar: 150,
          created_at: '2026-01-01T00:00:00Z',
          stale: true,
          days_ago: 20,
        },
      ],
      error: null,
    });

    const tree = mount(<Fares />);
    await flush();

    expect(toJson(tree)).toContain(messages.fares.stale(20));
  });

  it('T-BR7-1: fuel-aware alert banner shown when rank fuel_alert_active', async () => {
    (viewFares as jest.Mock).mockResolvedValue({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(
      chainQuery({ data: { nearest_rank_id: 'r1', fuel_alert_active: true }, error: null })
    );

    const tree = mount(<Fares />);
    await flush();

    expect(toJson(tree)).toContain(messages.alerts.fuelIncrease);
  });

  it('T-S5-1: empty → "No fares reported..." + "Report fare"', async () => {
    (viewFares as jest.Mock).mockResolvedValue({ data: [], error: null });

    const tree = mount(<Fares />);
    await flush();

    expect(toJson(tree)).toContain(messages.fares.empty);
    expect(toJson(tree)).toContain('Report fare');
  });

  it('T-S5-2: error shows load error message and Retry', async () => {
    (viewFares as jest.Mock).mockResolvedValue({ data: null, error: messages.fares.loadError });

    const tree = mount(<Fares />);
    await flush();

    expect(toJson(tree)).toContain(messages.fares.loadError);
    expect(toJson(tree)).toContain('Retry');
  });

  it('T-S5-3: offline, no cache → "No cached fares available..."', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({ isConnected: false });
    (getCachedFares as jest.Mock).mockResolvedValue(null);

    const tree = mount(<Fares />);
    await flush();

    expect(toJson(tree)).toContain(messages.fares.offlineNoCache);
  });

  it('T-S5-3: offline with cache → "Offline - showing cached fares"', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({ isConnected: false });
    (getCachedFares as jest.Mock).mockResolvedValue([
      { id: 'f1', route_id: 'rt1', destination: 'Brits', amount_zar: 45, created_at: new Date().toISOString(), stale: false, days_ago: 0 },
    ]);

    const tree = mount(<Fares />);
    await flush();

    expect(toJson(tree)).toContain(messages.fares.offlineCached);
    expect(toJson(tree)).toContain('Brits');
  });
});
