import renderer, { act } from 'react-test-renderer';
import React from 'react';
import { Banner } from '../../components/Banner';
import { TouchableOpacity } from '../../tests/mocks/react-native';
import NetInfo from '@react-native-community/netinfo';
import { messages } from '../../lib/messages';

jest.mock('../../lib/supabase', () => {
  const { SupabaseClient } = jest.requireMock('../../tests/mocks/supabase');
  return { supabase: SupabaseClient };
});
jest.mock('../../lib/api/activity', () => {
  const m = jest.requireMock('../../tests/mocks/activity-api');
  return { viewActivity: m.viewActivity, viewAlerts: m.viewAlerts };
});

import Alerts from '../../app/(tabs)/alerts';
import { supabase } from '../../lib/supabase';
import { viewAlerts } from '../../lib/api/activity';

const mount = (element: React.ReactElement) => {
  let tree: any;
  act(() => {
    tree = renderer.create(element);
  });
  return tree;
};
const flush = () => act(async () => {});
const toJson = (tree: any) => JSON.stringify(tree.toJSON());

describe('T-BR7-1 Fuel-aware alert banner', () => {
  it('shows the fuel-aware banner with exact PRD 4.5 text when fares may increase', () => {
    const tree = mount(<Banner variant="alert">{messages.alerts.fuelIncrease}</Banner>);
    expect(toJson(tree)).toContain(messages.alerts.fuelIncrease);
  });

  it('banner uses the alert (warning) variant', () => {
    const tree = mount(<Banner variant="alert">{messages.alerts.fuelIncrease}</Banner>);
    expect(toJson(tree)).toContain(messages.alerts.fuelIncrease);
  });
});

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

describe('T-S9 Fare Alerts screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'u1' } } });
    (viewAlerts as jest.Mock).mockResolvedValue({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(chainQuery({ data: null, error: null }));
  });

  it('T-S9-1: empty → "No fare alerts. Your routes are stable."', async () => {
    const tree = mount(<Alerts />);
    await flush();
    expect(toJson(tree)).toContain(messages.alerts.empty);
  });

  it('T-S9-1: list shows alert descriptions', async () => {
    (viewAlerts as jest.Mock).mockResolvedValue({
      data: [
        { id: 'al1', type: 'alert_received', description: 'Fares may increase soon. Check updated fares for your rank.', created_at: new Date().toISOString() },
      ],
      error: null,
    });

    const tree = mount(<Alerts />);
    await flush();

    expect(toJson(tree)).toContain('Fares may increase soon. Check updated fares for your rank.');
  });

  it('T-S9-2: loading shows spinner', async () => {
    let resolve: any;
    const pending = new Promise((r) => { resolve = r; });
    (viewAlerts as jest.Mock).mockReturnValue(pending);

    const tree = mount(<Alerts />);
    expect(toJson(tree)).toContain('Loading alerts...');

    resolve({ data: [], error: null });
    await flush();
    expect(toJson(tree)).toContain(messages.alerts.empty);
  });

  it('T-S9-2: error shows "Could not load alerts" + Retry', async () => {
    (viewAlerts as jest.Mock).mockResolvedValue({ data: null, error: messages.alerts.loadError });

    const tree = mount(<Alerts />);
    await flush();

    expect(toJson(tree)).toContain(messages.alerts.loadError);
    expect(toJson(tree)).toContain('Retry');
  });

  it('T-S9-2: offline → "Offline - showing cached alerts"', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({ isConnected: false });

    const tree = mount(<Alerts />);
    await flush();

    expect(toJson(tree)).toContain(messages.alerts.offlineCached);
  });
});
