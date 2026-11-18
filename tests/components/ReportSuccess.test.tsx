import renderer, { act } from 'react-test-renderer';
import React from 'react';
import { TouchableOpacity } from '../../tests/mocks/react-native';
import ReportSuccess from '../../app/modals/report-success';
import { messages } from '../../lib/messages';

const mount = (element: React.ReactElement) => {
  let tree: any;
  act(() => {
    tree = renderer.create(element);
  });
  return tree;
};
const toJson = (tree: any) => JSON.stringify(tree.toJSON());

describe('T-M2-1 Report Success modal', () => {
  it('renders "Thanks! Fare reported for [Route]." with OK button; dismiss calls onDismiss', () => {
    const onDismiss = jest.fn();
    const tree = mount(<ReportSuccess route="Johannesburg Park Station" onDismiss={onDismiss} />);

    expect(toJson(tree)).toContain(messages.fares.reportSuccess('Johannesburg Park Station'));
    expect(toJson(tree)).toContain('OK');

    const touchables = tree.root.findAllByType(TouchableOpacity);
    act(() => {
      touchables[touchables.length - 1].props.onPress();
    });
    expect(onDismiss).toHaveBeenCalled();
  });
});
