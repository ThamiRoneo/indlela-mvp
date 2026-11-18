import renderer, { act } from 'react-test-renderer';
import React from 'react';
import NetInfo from '@react-native-community/netinfo';

jest.mock('../../lib/supabase', () => {
  const { SupabaseClient } = jest.requireMock('../../tests/mocks/supabase');
  return { supabase: SupabaseClient };
});
jest.mock('../../lib/api/activity', () => {
  const m = jest.requireMock('../../tests/mocks/activity-api');
  return { viewActivity: m.viewActivity, viewAlerts: m.viewAlerts };
});

import Activity from '../../app/(tabs)/activity';
import { supabase } from '../../lib/supabase';
import { viewActivity } from '../../lib/api/activity';
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

describe('T-S10 Activity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'u1' } } });
    (viewActivity as jest.Mock).mockResolvedValue({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(chainQuery({ data: null, error: null }));
  });

  it('T-S10-1: empty → "No activity yet..."', async () => {
    const tree = mount(<Activity />);
    await flush();
    expect(toJson(tree)).toContain(messages.activity.empty);
  });

  it('T-S10-1: activity list shows descriptions', async () => {
    (viewActivity as jest.Mock).mockResolvedValue({
      data: [
        { id: 'a1', type: 'fare_report', description: 'Fare reported for a route from your nearest rank.', created_at: new Date().toISOString() },
        { id: 'a2', type: 'alert_received', description: 'Fares may increase soon. Check updated fares for your rank.', created_at: new Date().toISOString() },
      ],
      error: null,
    });

    const tree = mount(<Activity />);
    await flush();

    expect(toJson(tree)).toContain('Fare reported for a route from your nearest rank.');
    expect(toJson(tree)).toContain('Fares may increase soon. Check updated fares for your rank.');
  });

  it('T-S10-1: loading shows spinner', async () => {
    let resolve: any;
    const pending = new Promise((r) => { resolve = r; });
    (viewActivity as jest.Mock).mockReturnValue(pending);

    const tree = mount(<Activity />);
    expect(toJson(tree)).toContain('Loading activity...');

    resolve({ data: [], error: null });
    await flush();
    expect(toJson(tree)).toContain(messages.activity.empty);
  });

  it('T-S10-1: error shows "Could not load activity" + Retry', async () => {
    (viewActivity as jest.Mock).mockResolvedValue({ data: null, error: messages.activity.loadError });

    const tree = mount(<Activity />);
    await flush();

    expect(toJson(tree)).toContain(messages.activity.loadError);
    expect(toJson(tree)).toContain('Retry');
  });

  it('T-S10-1: offline → "Offline - showing cached activity"', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({ isConnected: false });

    const tree = mount(<Activity />);
    await flush();

    expect(toJson(tree)).toContain(messages.activity.offlineCached);
  });
});
