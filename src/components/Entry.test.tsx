import { mount, shallow } from 'enzyme';
import * as React from 'react';
import GameServerAccount from '../store/GameServerAccount';
import GsltStore from '../store/GsltStore';
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

class GsltStoreStub implements GsltStore {
  public removeAccountReturn: Promise<GameServerAccount>;
  public removeAccountMock = jest.fn();
  public regenerateTokenReturn: Promise<GameServerAccount>;
  public regenerateTokenMock = jest.fn();

  loadAccounts(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  get tokenAccounts(): GameServerAccount[] {
    throw new Error("Method not implemented.");
  }
  removeAccount(account: GameServerAccount): Promise<GameServerAccount> {
    this.removeAccountMock(account);
    return this.removeAccountReturn;
  }
  removeAccounts(accounts: GameServerAccount[]): Promise<GameServerAccount>[] {
    throw new Error("Method not implemented.");
  }
  regenerateToken(account: GameServerAccount): Promise<GameServerAccount> {
    this.regenerateTokenMock(account);
    return this.regenerateTokenReturn;
  }
  regenerateTokens(accounts: GameServerAccount[]): Promise<GameServerAccount>[] {
    throw new Error("Method not implemented.");
  }
  updateMemo(account: GameServerAccount, memo: string): Promise<GameServerAccount> {
    throw new Error("Method not implemented.");
  }
  createAccounts(amount: number, appid: string, memo: string): Promise<void>[] {
    throw new Error("Method not implemented.");
  }
  get isLoggedIn(): boolean {
    throw new Error("Method not implemented.");
  }
  get isInitialized(): boolean {
    throw new Error("Method not implemented.");
  }
}

describe('<Entry>', () => {
  let store: GsltStoreStub;
  let queue: ActionQueueState;
  const copyToClipboard = require('copy-to-clipboard');

  function expectDisabledButtons(target, remove, regenerate, edit) {
    expect(target.find('.js-remove').props().disabled).toBe(remove);
    expect(target.find('.js-regenerate').props().disabled).toBe(regenerate);
    expect(target.find('Edit').props().disabled).toBe(edit);
  }

  function expectAccountContent(target, token, appid, hasLastLogon, memo) {
    expect(target.find('FormControl').props().value).toBe(token);
    expect(target.find('.js-appid').text()).toBe(appid);
    expect(target.find('FormattedDate').exists()).toBe(hasLastLogon);
    expect(target.find('.js-memo').text()).toBe(memo);
  }

  function expectAccountWithLastLogon(target, token, appid, lastLogon, memo) {
    expectAccountContent(target, token, appid, true, memo);
    expect(target.find('FormattedDate').props().value).toEqual(new Date(lastLogon));
  }

  function expectEdit(target, account) {
    expect(target.find('Edit').props().store).toBe(store);
    expect(target.find('Edit').props().account).toBe(account);
    expect(target.find('Edit').props().actions).toBe(queue);
  }

  function expectSnapshot(target) {
    expect(target.find('Checkbox')).toMatchSnapshot();
    expect(target.find('FormControl')).toMatchSnapshot();
    expect(target.find('FormattedDate')).toMatchSnapshot();
    expect(target.find('Button')).toMatchSnapshot();
  }

  beforeEach(() => {
    copyToClipboard.mockReset();
    store = new GsltStoreStub();
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
      expect(target.find('.js-select').props().checked).toEqual(true);
      expectEdit(target, account);
      expect(queue.running).toHaveLength(0);
      expect(store.removeAccountMock).not.toBeCalled();
      expect(store.regenerateTokenMock).not.toBeCalled();
      expect(copyToClipboard).not.toBeCalled();
      expectSnapshot(target);
    });

    test('unselect', () =>  {
      const callback = jest.fn();
      const target = createComponent(store, account, true, true, queue, callback);
      target.find('.js-select').simulate('change', {target: {checked: false}});
      
      expectDisabledButtons(target, false, false, false);
      expectAccountWithLastLogon(target, '7FJS3VY2273L', '740', '1995-12-17T03:24:00', 'CSGO');
      expect(target.find('.js-select').props().checked).toEqual(true);
      expectEdit(target, account);
      expect(queue.running).toHaveLength(0);
      expect(callback).toBeCalled();
      expect(callback).toHaveBeenCalledWith(false, account);
      expect(store.removeAccountMock).not.toBeCalled();
      expect(store.regenerateTokenMock).not.toBeCalled();
      expect(copyToClipboard).not.toBeCalled();
      expectSnapshot(target);
    });

    test('click remove', async () =>  {
      store.removeAccountReturn = Promise.resolve(account);
      const target = createComponent(store, account, true, true, queue);
      target.find('.js-remove').simulate('click');

      await delay(10);
      expectDisabledButtons(target, true, true, true);
      expectAccountWithLastLogon(target, '7FJS3VY2273L', '740', '1995-12-17T03:24:00', 'CSGO');
      expect(target.find('.js-select').props().checked).toEqual(true);
      expectEdit(target, account);
      expect(queue.running).toHaveLength(0);
      expect(store.removeAccountMock).toBeCalledWith(account);
      expect(store.regenerateTokenMock).not.toBeCalled();
      expect(copyToClipboard).not.toBeCalled();
      expectSnapshot(target);
    });

    test('click remove with locked user', () =>  {
      account.toggleLock(true);
      const target = createComponent(store, account, true, true, queue);
      target.find('.js-remove').simulate('click');

      expectDisabledButtons(target, true, true, true);
      expectAccountWithLastLogon(target, '7FJS3VY2273L', '740', '1995-12-17T03:24:00', 'CSGO');
      expect(target.find('.js-select').props().checked).toEqual(true);
      expectEdit(target, account);
      expect(queue.running).toHaveLength(0);
      expect(store.removeAccountMock).not.toBeCalled();
      expect(store.regenerateTokenMock).not.toBeCalled();
      expect(copyToClipboard).not.toBeCalled();
      expectSnapshot(target);
    });

    test('click regenerate', async () =>  {
      store.regenerateTokenReturn = Promise.resolve(account);
      const target = createComponent(store, account, true, true, queue);
      target.find('.js-regenerate').simulate('click');

      await delay(10);
      expectDisabledButtons(target, false, false, false);
      expectAccountWithLastLogon(target, '7FJS3VY2273L', '740', '1995-12-17T03:24:00', 'CSGO');
      expect(target.find('.js-select').props().checked).toEqual(true);
      expectEdit(target, account);
      expect(queue.running).toHaveLength(0);
      expect(store.removeAccountMock).not.toBeCalled();
      expect(store.regenerateTokenMock).toBeCalledWith(account);
      expect(copyToClipboard).not.toBeCalled();
      expectSnapshot(target);
    });

    test('click copy to clipboard', () =>  {
      const target = createComponent(store, account, true, true, queue);
      target.find('.js-clipboard').simulate('click');

      expectDisabledButtons(target, false, false, false);
      expectAccountWithLastLogon(target, '7FJS3VY2273L', '740', '1995-12-17T03:24:00', 'CSGO');
      expect(target.find('.js-select').props().checked).toEqual(true);
      expectEdit(target, account);
      expect(queue.running).toHaveLength(0);
      expect(store.removeAccountMock).not.toBeCalled();
      expect(store.regenerateTokenMock).not.toBeCalled();
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
      expect(target.find('.js-select').props().checked).toEqual(true);
      expectEdit(target, account);
      expect(queue.running).toHaveLength(0);
      expect(store.removeAccountMock).not.toBeCalled();
      expect(store.regenerateTokenMock).not.toBeCalled();
      expect(copyToClipboard).not.toBeCalled();
      expectSnapshot(target);
    });

    test('click regenerate', () =>  {
      const target = createComponent(store, account, true, false, queue);
      target.find('.js-regenerate').simulate('click');

      expectDisabledButtons(target, false, true, false);
      expectAccountWithLastLogon(target, '7FJS3VY2273L', '740', '1995-12-17T03:24:00', 'CSGO');
      expect(target.find('.js-select').props().checked).toEqual(true);
      expectEdit(target, account);
      expect(queue.running).toHaveLength(0);
      expect(store.removeAccountMock).not.toBeCalled();
      expect(store.regenerateTokenMock).not.toBeCalled();
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
    expect(target.find('.js-select').props().checked).toEqual(false);
    expectEdit(target, account);
    expect(queue.running).toHaveLength(0);
    expect(store.removeAccountMock).not.toBeCalled();
    expect(store.regenerateTokenMock).not.toBeCalled();
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
    });;
    const target = createComponent(store, account, false, false, queue);

    expect(copyToClipboard).not.toBeCalled();
    expectDisabledButtons(target, false, true, false);
    expectAccountContent(target, '7FJS3VY2273L', '740', false, 'CSGO');
    expect(target.find('.js-select').props().checked).toEqual(false);
    expectEdit(target, account);
    expect(queue.running).toHaveLength(0);
    expect(store.removeAccountMock).not.toBeCalled();
    expect(store.regenerateTokenMock).not.toBeCalled();
    expect(copyToClipboard).not.toBeCalled();
    expectSnapshot(target);
  });
});
