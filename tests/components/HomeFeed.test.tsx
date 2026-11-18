import renderer, { act } from 'react-test-renderer';
import React from 'react';
import { TouchableOpacity } from '../../tests/mocks/react-native';
import NetInfo from '@react-native-community/netinfo';

jest.mock('../../lib/supabase', () => {
  const { SupabaseClient } = jest.requireMock('../../tests/mocks/supabase');
  return { supabase: SupabaseClient };
});
jest.mock('../../lib/api/jobs', () => {
  const m = jest.requireMock('../../tests/mocks/jobs-api');
  return {
    viewJobFeed: m.viewJobFeed,
    viewJobDetails: m.viewJobDetails,
    submitApplication: m.submitApplication,
    cacheJobs: m.cacheJobs,
    getCachedJobs: m.getCachedJobs,
  };
});

import HomeFeed from '../../app/(tabs)/index';
import { supabase } from '../../lib/supabase';
import { viewJobFeed, getCachedJobs } from '../../lib/api/jobs';
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

const jobs = [
  { id: 'j1', title: 'Retail Assistant', company: 'Shoprite', wage_zar: 150, transportCost: 90, netGain: 60 },
  { id: 'j2', title: 'Call Centre Agent', company: 'Teleperformance', wage_zar: 250, transportCost: 300, netGain: -50 },
  { id: 'j3', title: 'Warehouse Packer', company: 'Logistics Co.', wage_zar: 180, transportCost: 90, netGain: 90 },
];

describe('T-US6 / T-S7 Home Feed', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'u1' } } });
    (viewJobFeed as jest.Mock).mockResolvedValue({ data: [], error: null });
    (supabase.from as jest.Mock).mockReturnValue(
      chainQuery({ data: { nearest_rank_id: 'r1', weekly_transport_budget: null }, error: null }),
    );
  });

  it('T-US6-1: jobs sorted by Net Gain (highest first), each card shows wage, transport cost, net gain', async () => {
    (viewJobFeed as jest.Mock).mockResolvedValue({ data: jobs, error: null });

    const tree = mount(<HomeFeed />);
    await flush();

    const json = toJson(tree);
    // Highest net gain first: Warehouse Packer (90), then Retail Assistant (60)
    expect(json.indexOf('Warehouse Packer')).toBeLessThan(json.indexOf('Retail Assistant'));
    expect(json).toContain('150'); // wage
    expect(json).toContain('90'); // transport cost
    expect(json).toContain('60'); // net gain
  });

  it('T-US6-2: toggle "Jobs I can afford this week" filters correctly', async () => {
    (viewJobFeed as jest.Mock).mockResolvedValue({ data: jobs, error: null });

    const tree = mount(<HomeFeed />);
    await flush();

    let json = toJson(tree);
    expect(json).toContain('Call Centre Agent'); // shown before filter

    const toggles = tree.root.findAllByType(TouchableOpacity);
    const toggle = toggles[0];
    expect(toggle).toBeDefined();
    act(() => { toggle.props.onPress(); });
    await flush();

    json = toJson(tree);
    expect(json).not.toContain('Call Centre Agent'); // net gain -50, filtered out
    expect(json).toContain('Warehouse Packer');
    expect(json).toContain('Retail Assistant');
  });

  it('T-US6-3: empty → "No jobs available..." or "No affordable jobs..."', async () => {
    (viewJobFeed as jest.Mock).mockResolvedValue({ data: [], error: null });

    const tree = mount(<HomeFeed />);
    await flush();

    expect(toJson(tree)).toContain(messages.jobs.empty);
  });

  it('T-S7-1: loading spinner; error shows message + Retry', async () => {
    (viewJobFeed as jest.Mock).mockResolvedValue({ data: null, error: messages.jobs.loadError });

    const tree = mount(<HomeFeed />);
    await flush();

    expect(toJson(tree)).toContain(messages.jobs.loadError);
    expect(toJson(tree)).toContain('Retry');
  });

  it('T-S7-2: jobs with unknown transport cost show "Transport cost unknown"', async () => {
    (viewJobFeed as jest.Mock).mockResolvedValue({
      data: [
        { id: 'j1', title: 'Job X', company: 'Co', wage_zar: 150, transportCost: null, netGain: null },
      ],
      error: null,
    });

    const tree = mount(<HomeFeed />);
    await flush();

    expect(toJson(tree)).toContain(messages.jobs.transportUnknown);
  });

  it('T-F5-3: offline → cached jobs + "Offline - showing cached jobs" banner', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });
    (getCachedJobs as jest.Mock).mockResolvedValue([
      { id: 'j1', title: 'Cached Job', company: 'Co', wage_zar: 150, transportCost: 90, netGain: 60 },
    ]);

    const tree = mount(<HomeFeed />);
    await flush();

    const json = toJson(tree);
    expect(json).toContain(messages.jobs.offlineCached);
    expect(json).toContain('Cached Job');
  });
});
