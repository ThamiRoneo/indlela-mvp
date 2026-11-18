import renderer from 'react-test-renderer';
import React from 'react';
import { Card } from '../../components/Card';

describe('T-C-3 Card', () => {
  it('Job card renders without crashing', () => {
    expect(() =>
      renderer.create(<Card type="job" title="Retail Assistant" company="Shoprite" wage={150} transportCost={450} netGain={-300} />)
    ).not.toThrow();
  });

  it('Fare card renders without crashing', () => {
    expect(() =>
      renderer.create(<Card type="fare" route="Rustenburg → Johannesburg" amount={180} staleness="Last reported 2 days ago (stale)" />)
    ).not.toThrow();
  });
});
