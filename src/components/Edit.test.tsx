import { mount, shallow } from 'enzyme';
import 'jest-enzyme';
import React from 'react';
import GameServerAccount from '../store/GameServerAccount';
import GsltStore from '../store/GsltStore';
import GsltStoreDummy from '../store/GsltStoreDummy';
import ActionQueueState from '../uiState/ActionQueueState';
import delay from '../utils/delay';
import Edit from './Edit';

describe('<Edit>', () => {
  let account: GameServerAccount;
  let store: GsltStore;
  let queue: ActionQueueState;
  let updateMock;

  function createComponent(accountState, state, disabled) {
    return shallow(<Edit account={accountState} store={state} actions={queue} disabled={disabled} />);
  }

  function expectEdit(target, modalIsDisabled) {
    expect(target.find('ActionModal')).toHaveProp('disabled', modalIsDisabled);
    expect(target.find('.js-memo')).toHaveProp('defaultValue', 'Awesome');
    expect(account.memo).toEqual('Awesome');
    expect(queue.running).toHaveLength(0);
    expect(target).toMatchSnapshot();
  }

  beforeEach(() => {
    account = new GameServerAccount({
      appid: 730,
      expired: false,
      lastLogon: undefined,
      memo: 'Awesome',
      steamid: '',
      token: '',
    });

    store = new GsltStoreDummy();
    updateMock = jest.fn();
    store.updateMemo = updateMock;

    queue = new ActionQueueState();
    queue.setRemoveDelay(1);
  });

  test('disabled ActionModal', () =>  {
    const target = createComponent(account, store, true);

    expectEdit(target, true);
    expect(updateMock).not.toHaveBeenCalled();
  });

  describe('enabled ActionModal', () => {
    let target;
    beforeEach(() => {
      updateMock = jest.fn(() => Promise.resolve(account));
      store.updateMemo = updateMock;

      target = createComponent(account, store, false);
    });

    test('save memo', async () =>  {
      await target.find('ActionModal').simulate('action');

      await delay(10);

      expectEdit(target, false);
      expect(updateMock).toHaveBeenCalledWith(account, 'Awesome');
    });

    test('change and save memo', async () =>  {
      target.find('.js-memo').simulate('change', {target: {value: 'Changed'}});
      target.find('ActionModal').simulate('action');

      await delay(10);
      expectEdit(target, false);
      expect(updateMock).toHaveBeenCalledWith(account, 'Changed');
    });
  });
});
