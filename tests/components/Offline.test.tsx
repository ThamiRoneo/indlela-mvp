import renderer, { act } from 'react-test-renderer';
import React from 'react';
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

describe('T-US9-1 Offline cached fares with staleness indicator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'u1' } } });
    (viewFares as jest.Mock).mockResolvedValue({ data: [], error: null });
    (getCachedFares as jest.Mock).mockResolvedValue(null);
    (supabase.from as jest.Mock).mockReturnValue(
      chainQuery({ data: { nearest_rank_id: 'r1', fuel_alert_active: false }, error: null }),
    );
  });

  it('offline mode shows cached fares with staleness indicator', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({ isConnected: false });
    (getCachedFares as jest.Mock).mockResolvedValue([
      {
        id: 'f1',
        route_id: 'rt1',
        destination: 'Brits',
        amount_zar: 45,
        created_at: new Date().toISOString(),
        stale: false,
        days_ago: 0,
      },
      {
        id: 'f2',
        route_id: 'rt2',
        destination: 'Sun City',
        amount_zar: 60,
        created_at: '2026-01-01T00:00:00Z',
        stale: true,
        days_ago: 20,
      },
    ]);

    const tree = mount(<Fares />);
    await flush();

    const json = toJson(tree);
    expect(json).toContain(messages.fares.offlineCached);
    expect(json).toContain('Brits');
    expect(json).toContain('Sun City');
    expect(json).toContain(messages.fares.stale(20));
  });

  it('offline with no cache shows "No cached fares available"', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({ isConnected: false });
    (getCachedFares as jest.Mock).mockResolvedValue(null);

    const tree = mount(<Fares />);
    await flush();

    expect(toJson(tree)).toContain(messages.fares.offlineNoCache);
  });
});
