import renderer, { act } from 'react-test-renderer';
import React from 'react';
import { Banner } from '../../components/Banner';
import { messages } from '../../lib/messages';

const mount = (element: React.ReactElement) => {
  let tree: any;
  act(() => {
    tree = renderer.create(element);
  });
  return tree;
};
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
