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
  return { viewJobFeed: m.viewJobFeed, viewJobDetails: m.viewJobDetails, submitApplication: m.submitApplication };
});

import JobDetails from '../../app/job/[id]';
import { supabase } from '../../lib/supabase';
import { viewJobDetails } from '../../lib/api/jobs';
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

const job = {
  id: 'j1',
  title: 'Retail Assistant',
  company: 'Shoprite',
  wage_zar: 150,
  location: 'Rustenburg CBD',
  description: 'Entry-level retail position.',
  source_url: null,
  rank_id: 'r1',
  route_id: 'rt1',
  transportCost: 90,
  netGain: 60,
  stale: false,
  daysAgo: 2,
  fareSource: 'Rustenburg Taxi Rank → Johannesburg Park Station',
};

describe('T-S8 Job Details', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'u1' } } });
    (viewJobDetails as jest.Mock).mockResolvedValue({ data: null, error: null });
    (supabase.from as jest.Mock).mockReturnValue(
      chainQuery({ data: { nearest_rank_id: 'r1', weekly_transport_budget: null }, error: null }),
    );
  });

  it('T-S8-1: full job details + transport breakdown; fare source, staleness, net gain', async () => {
    (viewJobDetails as jest.Mock).mockResolvedValue({ data: job, error: null });

    const tree = mount(<JobDetails jobId="j1" />);
    await flush();

    const json = toJson(tree);
    expect(json).toContain('Retail Assistant');
    expect(json).toContain('Shoprite');
    expect(json).toContain('150'); // wage
    expect(json).toContain('90'); // transport cost
    expect(json).toContain('60'); // net gain
    expect(json).toContain('Rustenburg Taxi Rank'); // fare source
  });

  it('T-S8-2: error shows details error message plus Retry', async () => {
    (viewJobDetails as jest.Mock).mockResolvedValue({ data: null, error: messages.jobs.detailsError });

    const tree = mount(<JobDetails jobId="j1" />);
    await flush();

    expect(toJson(tree)).toContain(messages.jobs.detailsError);
    expect(toJson(tree)).toContain('Retry');
  });

  it('T-S8-3: offline → transport cost flagged unknown if fare stale/unknown', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValueOnce({ isConnected: false });
    (viewJobDetails as jest.Mock).mockResolvedValue({
      data: { ...job, transportCost: null, netGain: null },
      error: null,
    });

    const tree = mount(<JobDetails jobId="j1" />);
    await flush();

    expect(toJson(tree)).toContain(messages.jobs.transportUnknown);
  });
});
