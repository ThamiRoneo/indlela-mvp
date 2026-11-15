import renderer from 'react-test-renderer';
import React from 'react';
import { Modal } from '../../components/Modal';

describe('T-C-12 Modal', () => {
  it('Renders with title, text, and buttons without crashing', () => {
    expect(() =>
      renderer.create(
        <Modal
          title="Confirm"
          text="Are you sure?"
          buttons={[
            { label: 'Cancel', onPress: jest.fn() },
            { label: 'Delete', onPress: jest.fn() },
          ]}
        />
      )
    ).not.toThrow();
  });
});
