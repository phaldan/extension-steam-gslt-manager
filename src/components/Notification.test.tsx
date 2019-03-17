import { shallow } from 'enzyme';
import 'jest-enzyme';
import React from 'react';
import ActionQueue from '../uiState/ActionQueue';
import ActionQueueState from '../uiState/ActionQueueState';
import { stubObject } from '../utils/mocked';
import Notification from './Notification';

describe('<Notification>', () => {
  let actions: ActionQueueState;
  let queues: ActionQueue[];

  beforeEach(() => {
    queues = [];
    actions = stubObject(new ActionQueueState(), { running: queues });
  });

  test('should render without any alerts', () =>  {
    const target = createComponent({ actions });
    expect(target.find('AlertTimer')).toHaveLength(0);
  });

  describe('should render a single alert', () => {
    const testSingleAlert = (numberOfEntries, finishedEntries, progress: string) => {
      test(`with ${progress} progress`, () =>  {
        stubQueue('Some action', numberOfEntries, finishedEntries);

        const target = createComponent({ actions });
        expect(target).toContainExactlyOneMatchingElement('AlertTimer');
        const alertNode = target.find('AlertTimer').first();
        expect(alertNode).toHaveProp('showIcon', false);
        expect(alertNode).toHaveProp('headline', 'Some action');
        expectProgressBar(alertNode, numberOfEntries, finishedEntries, progress);
      });
    };

    testSingleAlert(1, 0, '0%');
    testSingleAlert(1, 1, '100%');
    testSingleAlert(2, 1, '50%');
    testSingleAlert(3, 2, '67%');
  });

  test('should render two alerts', () =>  {
    stubQueue('First action', 200, 16);
    stubQueue('Second action', 3, 1);

    const target = createComponent({ actions });
    expect(target).toContainMatchingElements(2, 'AlertTimer');
    const alertNodes = target.find('AlertTimer');

    const firstAlert = alertNodes.at(0);
    expect(firstAlert).toHaveProp('showIcon', false);
    expect(firstAlert).toHaveProp('headline', 'First action');
    expectProgressBar(firstAlert, 200, 16, '8%');

    const secondAlert = alertNodes.at(1);
    expect(secondAlert).toHaveProp('showIcon', false);
    expect(secondAlert).toHaveProp('headline', 'Second action');
    expectProgressBar(secondAlert, 3, 1, '33%');
  });

 test('should update render after mobx state change', () =>  {
    actions = new ActionQueueState();
    const target = createComponent({ actions });

    expect(target).toContainMatchingElements(0, 'AlertTimer');
    actions.create('Some action', []);
    expect(target).toContainExactlyOneMatchingElement('AlertTimer');
  });

  const createComponent = (props) => {
    return shallow(<Notification {...props} />);
  }

  const stubQueue = (desc: string, numberOfEntries, finishedEntries) => {
    const instance = new ActionQueue(actions, 0, desc, []);
    const queue = stubObject(instance, { now: finishedEntries, max: numberOfEntries });
    queues.push(queue);
  };

  const expectProgressBar = (alertNode, max, now, label: string) => {
    expect(alertNode).toContainExactlyOneMatchingElement('ProgressBar');
    const progressElement = alertNode.find('ProgressBar').first();
    expect(progressElement).toHaveProp('active', true);
    expect(progressElement).toHaveProp('label', label);
    expect(progressElement).toHaveProp('now', now);
    expect(progressElement).toHaveProp('max', max);
  };
});
