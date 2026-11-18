import renderer from 'react-test-renderer';
import React from 'react';
import { Banner } from '../../components/Banner';

describe('T-C-4 Banner', () => {
  it('Alert variant renders without crashing', () => {
    expect(() => renderer.create(<Banner variant="alert">Alert banner</Banner>)).not.toThrow();
  });

  it('Info variant renders without crashing', () => {
    expect(() => renderer.create(<Banner variant="info">Info banner</Banner>)).not.toThrow();
  });

  it('Error variant renders without crashing', () => {
    expect(() => renderer.create(<Banner variant="error">Error banner</Banner>)).not.toThrow();
  });

  it('Success variant renders without crashing', () => {
    expect(() => renderer.create(<Banner variant="success">Success banner</Banner>)).not.toThrow();
  });
});
