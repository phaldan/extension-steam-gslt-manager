import { mount, shallow } from 'enzyme';
import 'jest-enzyme';
import * as React from 'react';
import GameServerAccount from '../store/GameServerAccount';
import GsltStore from '../store/GsltStore';
import GsltStoreDummy from '../store/GsltStoreDummy';
import ActionQueueState from '../uiState/ActionQueueState';
import delay from '../utils/delay';
import Entry from './Entry';

jest.mock('copy-to-clipboard');

function createComponent(state, account, selected, regenerate, queue, callback = jest.fn()) {
  const element = (
    <Entry
      store={state}
      account={account}
      selected={selected}
      enableRegenerate={regenerate}
      onToggle={callback}
      actions={queue}
    />
  );
  return shallow(element);
}

describe('<Entry>', () => {
  let store: GsltStore;
  let queue: ActionQueueState;
  let removeAccountMock;
  let regenerateTokenMock;
  const copyToClipboard = require('copy-to-clipboard');

  function expectDisabledButtons(target, remove, regenerate, edit) {
    expect(target.find('.js-remove')).toHaveProp('disabled', remove);
    expect(target.find('.js-regenerate')).toHaveProp('disabled', regenerate);
    expect(target.find('Edit')).toHaveProp('disabled', edit);
  }

  function expectAccountContent(target, token, appid, hasLastLogon, memo) {
    expect(target.find('FormControl')).toHaveProp('value', token);
    expect(target.find('.js-appid').text()).toBe(appid);
    expect(target.find('FormattedDate').exists()).toBe(hasLastLogon);
    expect(target.find('.js-memo').text()).toBe(memo);
  }

  function expectAccountWithLastLogon(target, token, appid, lastLogon, memo) {
    expectAccountContent(target, token, appid, true, memo);
    expect(target.find('FormattedDate')).toHaveProp('value', new Date(lastLogon));
  }

  function expectEdit(target, account) {
    expect(target.find('Edit')).toHaveProp('store', store);
    expect(target.find('Edit')).toHaveProp('account', account);
    expect(target.find('Edit')).toHaveProp('actions', queue);
  }

  function expectSnapshot(target) {
    expect(target.find('Checkbox')).toMatchSnapshot();
    expect(target.find('FormControl')).toMatchSnapshot();
    expect(target.find('FormattedDate')).toMatchSnapshot();
    expect(target.find('Button')).toMatchSnapshot();
  }

  beforeEach(() => {
    copyToClipboard.mockReset();
    store = new GsltStoreDummy();

    removeAccountMock = jest.fn();
    store.removeAccount = removeAccountMock;
    regenerateTokenMock = jest.fn();
    store.regenerateToken = regenerateTokenMock;

    queue = new ActionQueueState();
    queue.setRemoveDelay(0);
  });

  describe('selected and enabled regenerate', () => {
    let account: GameServerAccount;

    beforeEach(() => {
      account = new GameServerAccount({
        appid: 740,
        expired: false,
        lastLogon: '1995-12-17T03:24:00',
        memo: 'CSGO',
        steamid: '',
        token: '7FJS3VY2273L',
      });
    });

    test('initial state', () =>  {
      const target = createComponent(store, account, true, true, queue);

      expectDisabledButtons(target, false, false, false);
      expectAccountWithLastLogon(target, '7FJS3VY2273L', '740', '1995-12-17T03:24:00', 'CSGO');
      expect(target.find('.js-select')).toHaveProp('checked', true);
      expectEdit(target, account);
      expect(queue.running).toHaveLength(0);
      expect(removeAccountMock).not.toBeCalled();
      expect(regenerateTokenMock).not.toBeCalled();
      expect(copyToClipboard).not.toBeCalled();
      expectSnapshot(target);
    });

    test('unselect', () =>  {
      const callback = jest.fn();
      const target = createComponent(store, account, true, true, queue, callback);
      target.find('.js-select').simulate('change', {target: {checked: false}});

      expectDisabledButtons(target, false, false, false);
      expectAccountWithLastLogon(target, '7FJS3VY2273L', '740', '1995-12-17T03:24:00', 'CSGO');
      expect(target.find('.js-select')).toHaveProp('checked', true);
      expectEdit(target, account);
      expect(queue.running).toHaveLength(0);
      expect(callback).toBeCalled();
      expect(callback).toHaveBeenCalledWith(false, account);
      expect(removeAccountMock).not.toBeCalled();
      expect(regenerateTokenMock).not.toBeCalled();
      expect(copyToClipboard).not.toBeCalled();
      expectSnapshot(target);
    });

    test('click remove', async () =>  {
      const target = createComponent(store, account, true, true, queue);
      target.find('.js-remove').simulate('click');

      await delay(10);
      expectDisabledButtons(target, true, true, true);
      expectAccountWithLastLogon(target, '7FJS3VY2273L', '740', '1995-12-17T03:24:00', 'CSGO');
      expect(target.find('.js-select')).toHaveProp('checked', true);
      expectEdit(target, account);
      expect(queue.running).toHaveLength(0);
      expect(removeAccountMock).toBeCalledWith(account);
      expect(regenerateTokenMock).not.toBeCalled();
      expect(copyToClipboard).not.toBeCalled();
      expectSnapshot(target);
    });

    test('click remove with locked user', () =>  {
      account.toggleLock(true);
      const target = createComponent(store, account, true, true, queue);
      target.find('.js-remove').simulate('click');

      expectDisabledButtons(target, true, true, true);
      expectAccountWithLastLogon(target, '7FJS3VY2273L', '740', '1995-12-17T03:24:00', 'CSGO');
      expect(target.find('.js-select')).toHaveProp('checked', true);
      expectEdit(target, account);
      expect(queue.running).toHaveLength(0);
      expect(removeAccountMock).not.toBeCalled();
      expect(regenerateTokenMock).not.toBeCalled();
      expect(copyToClipboard).not.toBeCalled();
      expectSnapshot(target);
    });

    test('click regenerate', async () =>  {
      const target = createComponent(store, account, true, true, queue);
      target.find('.js-regenerate').simulate('click');

      await delay(10);
      expectDisabledButtons(target, false, false, false);
      expectAccountWithLastLogon(target, '7FJS3VY2273L', '740', '1995-12-17T03:24:00', 'CSGO');
      expect(target.find('.js-select')).toHaveProp('checked', true);
      expectEdit(target, account);
      expect(queue.running).toHaveLength(0);
      expect(removeAccountMock).not.toBeCalled();
      expect(regenerateTokenMock).toBeCalledWith(account);
      expect(copyToClipboard).not.toBeCalled();
      expectSnapshot(target);
    });

    test('click copy to clipboard', () =>  {
      const target = createComponent(store, account, true, true, queue);
      target.find('.js-clipboard').simulate('click');

      expectDisabledButtons(target, false, false, false);
      expectAccountWithLastLogon(target, '7FJS3VY2273L', '740', '1995-12-17T03:24:00', 'CSGO');
      expect(target.find('.js-select')).toHaveProp('checked', true);
      expectEdit(target, account);
      expect(queue.running).toHaveLength(0);
      expect(removeAccountMock).not.toBeCalled();
      expect(regenerateTokenMock).not.toBeCalled();
      expect(copyToClipboard).toHaveBeenCalledWith('7FJS3VY2273L');
      expectSnapshot(target);
    });
  });

  describe('selected and disabled regenerate', () => {
    let account: GameServerAccount;
    beforeEach(() => {
      account = new GameServerAccount({
        appid: 740,
        expired: false,
        lastLogon: '1995-12-17T03:24:00',
        memo: 'CSGO',
        steamid: '',
        token: '7FJS3VY2273L',
      });
    });

    test('initial state', () =>  {
      const target = createComponent(store, account, true, false, queue);

      expectDisabledButtons(target, false, true, false);
      expectAccountWithLastLogon(target, '7FJS3VY2273L', '740', '1995-12-17T03:24:00', 'CSGO');
      expect(target.find('.js-select')).toHaveProp('checked', true);
      expectEdit(target, account);
      expect(queue.running).toHaveLength(0);
      expect(removeAccountMock).not.toBeCalled();
      expect(regenerateTokenMock).not.toBeCalled();
      expect(copyToClipboard).not.toBeCalled();
      expectSnapshot(target);
    });

    test('click regenerate', () =>  {
      const target = createComponent(store, account, true, false, queue);
      target.find('.js-regenerate').simulate('click');

      expectDisabledButtons(target, false, true, false);
      expectAccountWithLastLogon(target, '7FJS3VY2273L', '740', '1995-12-17T03:24:00', 'CSGO');
      expect(target.find('.js-select')).toHaveProp('checked', true);
      expectEdit(target, account);
      expect(queue.running).toHaveLength(0);
      expect(removeAccountMock).not.toBeCalled();
      expect(regenerateTokenMock).not.toBeCalled();
      expect(copyToClipboard).not.toBeCalled();
      expectSnapshot(target);
    });
  });

  test('not selected and enabled regenerate', () =>  {
    const account = new GameServerAccount({
      appid: 740,
      expired: false,
      lastLogon: '1995-12-17T03:24:00',
      memo: 'CSGO',
      steamid: '',
      token: '7FJS3VY2273L',
    });
    const target = createComponent(store, account, false, true, queue);

    expectDisabledButtons(target, false, false, false);
    expectAccountWithLastLogon(target, '7FJS3VY2273L', '740', '1995-12-17T03:24:00', 'CSGO');
    expect(target.find('.js-select')).toHaveProp('checked', false);
    expectEdit(target, account);
    expect(queue.running).toHaveLength(0);
    expect(removeAccountMock).not.toBeCalled();
    expect(regenerateTokenMock).not.toBeCalled();
    expect(copyToClipboard).not.toBeCalled();
    expectSnapshot(target);
  });

  test('not selected and disabled regenerate', () => {
    const account = new GameServerAccount({
      appid: 740,
      expired: false,
      lastLogon: undefined,
      memo: 'CSGO',
      steamid: '',
      token: '7FJS3VY2273L',
    });
    const target = createComponent(store, account, false, false, queue);

    expect(copyToClipboard).not.toBeCalled();
    expectDisabledButtons(target, false, true, false);
    expectAccountContent(target, '7FJS3VY2273L', '740', false, 'CSGO');
    expect(target.find('.js-select')).toHaveProp('checked', false);
    expectEdit(target, account);
    expect(queue.running).toHaveLength(0);
    expect(removeAccountMock).not.toBeCalled();
    expect(regenerateTokenMock).not.toBeCalled();
    expect(copyToClipboard).not.toBeCalled();
    expectSnapshot(target);
  });
});
