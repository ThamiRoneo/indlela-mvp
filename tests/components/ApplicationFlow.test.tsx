import renderer, { act } from 'react-test-renderer';
import React from 'react';
import { TextInput, TouchableOpacity } from '../../tests/mocks/react-native';
import NetInfo from '@react-native-community/netinfo';

jest.mock('../../lib/supabase', () => {
  const { SupabaseClient } = jest.requireMock('../../tests/mocks/supabase');
  return { supabase: SupabaseClient };
});
jest.mock('../../lib/api/jobs', () => {
  const m = jest.requireMock('../../tests/mocks/jobs-api');
  return { viewJobFeed: m.viewJobFeed, viewJobDetails: m.viewJobDetails, submitApplication: m.submitApplication };
}, { virtual: true });

import ApplicationFlow from '../../app/apply/[id]';
import { supabase } from '../../lib/supabase';
import { submitApplication } from '../../lib/api/jobs';
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

describe('T-S14 Application Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: true });
    (supabase.auth.getUser as jest.Mock).mockResolvedValue({ data: { user: { id: 'u1' } } });
    (submitApplication as jest.Mock).mockResolvedValue({ error: null });
    (supabase.from as jest.Mock).mockReturnValue(
      chainQuery({ data: { id: 'j1', title: 'Retail Assistant', source_url: null }, error: null }),
    );
  });

  it('T-S14-1: application form visible, submit → "Application submitted." → S8', async () => {
    const tree = mount(<ApplicationFlow jobId="j1" />);
    await flush();

    const json = toJson(tree);
    expect(json).toContain('Apply');
    expect(json).toContain('Name');
    expect(json).toContain('Phone');
    expect(json).toContain('Email');

    const inputs = tree.root.findAllByType(TextInput);
    act(() => { inputs[0].props.onChangeText('Lerato Mokoena'); });
    act(() => { inputs[1].props.onChangeText('0820000000'); });
    act(() => { inputs[2].props.onChangeText('lerato@example.com'); });
    await flush();

    const touchables = tree.root.findAllByType(TouchableOpacity);
    const submit = touchables[touchables.length - 1];
    act(() => { submit.props.onPress(); });
    await flush();
    await flush();

    expect(submitApplication).toHaveBeenCalledWith('j1', 'Lerato Mokoena', '0820000000', 'lerato@example.com');
    expect(toJson(tree)).toContain(messages.jobs.submitSuccess);
  });

  it('T-S14-2: error shows submit error message plus Retry', async () => {
    (submitApplication as jest.Mock).mockResolvedValue({ error: messages.jobs.submitError });

    const tree = mount(<ApplicationFlow jobId="j1" />);
    await flush();

    const inputs = tree.root.findAllByType(TextInput);
    act(() => { inputs[0].props.onChangeText('Lerato'); });
    act(() => { inputs[1].props.onChangeText('0820000000'); });
    act(() => { inputs[2].props.onChangeText('lerato@example.com'); });
    await flush();

    const touchables = tree.root.findAllByType(TouchableOpacity);
    const submit = touchables[touchables.length - 1];
    act(() => { submit.props.onPress(); });
    await flush();
    await flush();

    expect(toJson(tree)).toContain(messages.jobs.submitError);
    expect(toJson(tree)).toContain('Retry');
  });

  it('T-S14-2: offline → "No connection. Please check your internet."', async () => {
    (NetInfo.fetch as jest.Mock).mockResolvedValue({ isConnected: false });

    const tree = mount(<ApplicationFlow jobId="j1" />);
    await flush();

    expect(toJson(tree)).toContain(messages.jobs.offlineSubmit);
  });
});
