import { mount, shallow, ShallowWrapper } from 'enzyme';
import * as React from 'react';
import GameServerAccount from '../store/GameServerAccount';
import GsltStore from '../store/GsltStore';
import ActionQueueState from '../uiState/ActionQueueState';
import delay from '../utils/delay';
import List from './List';

class GsltStoreStub implements GsltStore {
  public removeAccountsMock = jest.fn();
  public removeAccountsReturn: Promise<GameServerAccount>[];
  public regenerateTokensMock = jest.fn();
  public regenerateTokensReturn: Promise<GameServerAccount>[];

  loadAccounts(): Promise<void> {
    throw new Error("Method not implemented.");
  }
  get tokenAccounts(): GameServerAccount[] {
    throw new Error("Method not implemented.");
  }
  removeAccount(account: GameServerAccount): Promise<GameServerAccount> {
    throw new Error("Method not implemented.");
  }
  removeAccounts(accounts: GameServerAccount[]): Promise<GameServerAccount>[] {
    this.removeAccountsMock(accounts);
    return this.removeAccountsReturn;
  }
  regenerateToken(account: GameServerAccount): Promise<GameServerAccount> {
    throw new Error("Method not implemented.");
  }
  regenerateTokens(accounts: GameServerAccount[]): Promise<GameServerAccount>[] {
    this.regenerateTokensMock(accounts);
    return this.regenerateTokensReturn;
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

describe('<List>', () => {
  let store: GsltStoreStub;
  let queue: ActionQueueState;

  function createComponent(items, regenerate) {
    const element = (
      <List store={store} actions={queue} items={items} enableRegenerate={regenerate} />
    );
    return shallow(element);
  }

  function expectExport(target, accounts) {
    expect(target.find('Export').props().accounts).toEqual(accounts);
  }

  function expectCreate(target) {
    expect(target.find('Entry').exists()).not.toBeTruthy();
    expect(target.find('Create').props().store).toBe(store);
    expect(target.find('Create').props().actions).toBe(queue);
  }

  function expectCsv(target, rows = '') {
    const href = 'data:text/csv;charset=UTF-8,\uFEFF%22SteamID%22%2C%22Token%22%2C%22AppID%22%2C%22Last-Logon%22%2C%22Memo%22%0A';
    expect(target.find('.js-csv').props().href).toEqual(href + rows);
  }

  function expectEmptyListOfItems(target, disabledRegenerate: boolean, checkedSelectAll: boolean) {
    expect(target.find('.js-select-checkbox').props().checked).toEqual(checkedSelectAll);
    expect(target.find('.js-regenerate').props().disabled).toEqual(disabledRegenerate);
    expectCsv(target);
    expect(target.find('Button')).toMatchSnapshot();
    expectExport(target, []);
    expectCreate(target);
    expect(store.removeAccountsMock).not.toBeCalled();
    expect(store.regenerateTokensMock).not.toBeCalled();
    expect(queue.running).toHaveLength(0);
  }

  function expectEntry(target, account, isSelected) {
    expect(target.find('Create').exists()).not.toBeTruthy();
    const entry = target.find('Entry');
    expect(entry.props().store).toBe(store);
    expect(entry.props().account).toBe(account);
    expect(entry.props().selected).toBe(isSelected);
    expect(entry.props().enableRegenerate).toBe(true);
    expect(entry.props().actions).toBe(queue);
    
  }

  function expectWithAccount(target, account, checkedSelectAll, csv, isSelected, isLocked, selectedAccounts) {
    expect(target.find('.js-select-checkbox').props().checked).toEqual(checkedSelectAll);
    expect(target.find('.js-regenerate').props().disabled).toEqual(false);
    expectCsv(target, csv);
    expect(target.find('Button')).toMatchSnapshot();

    expectExport(target, selectedAccounts);
    expectEntry(target, account, isSelected);

    expect(account.locked).toEqual(isLocked);
    expect(queue.running).toHaveLength(0);
  }

  beforeEach(() => {
    store = new GsltStoreStub();
    queue = new ActionQueueState();
    queue.setRemoveDelay(0);
  });

  describe('empty items', () => {
    test('regenerate enabled', () => {
      const target = createComponent([], true);
      target.find('.js-regenerate').simulate('click');

      expectEmptyListOfItems(target, false, false);
    });

    test('regenerate disabled', () => {
      const target = createComponent([], false);
      target.find('.js-regenerate').simulate('click');

      expectEmptyListOfItems(target, true, false);
    });

    test('click remove', () => {
      const target = createComponent([], false);
      target.find('.js-remove').simulate('click');

      expectEmptyListOfItems(target, true, false);
    });

    test('select all via button click', () => {
      const target = createComponent([], false);
      target.find('.js-select-button').simulate('click');

      expectEmptyListOfItems(target, true, true);
    });
  });

  describe('with a single account', () => {
    let account: GameServerAccount;
    let target: ShallowWrapper;

    beforeEach(() => {
      account = new GameServerAccount({
        appid: 740,
        expired: false,
        lastLogon: '1995-12-17T03:24:00',
        memo: 'CSGO',
        steamid: '212V16ECZ4HE',
        token: '7FJS3VY2273L',
      });
      target = createComponent([account], true);
    });

    test('select all', () => {
      target.find('.js-select-button').simulate('click');

      const csv = '%22212V16ECZ4HE%22%2C%227FJS3VY2273L%22%2C740%2C%221995-12-17T03%3A24%3A00.000Z%22%2C%22CSGO%22';
      expectWithAccount(target, account, true, csv, true, false, [account]);
      expect(store.removeAccountsMock).not.toBeCalled();
      expect(store.regenerateTokensMock).not.toBeCalled();
    });

    test('deselect by entry', () => {
      target.find('.js-select-button').simulate('click');
      target.find('Entry').simulate('toggle', false, account);

      expectWithAccount(target, account, false, '', false, false, []);
      expect(store.removeAccountsMock).not.toBeCalled();
      expect(store.regenerateTokensMock).not.toBeCalled();
    });

    test('remove all', async () => {
      store.removeAccountsReturn = [Promise.resolve(account)];
      target.find('.js-select-button').simulate('click');
      target.find('.js-remove').simulate('click');

      await delay(10); // Waiting for ActionQueueState to finish
      expectWithAccount(target.update(), account, false, '', false, true, []);
      expect(store.removeAccountsMock).toBeCalledWith([account]);
      expect(store.regenerateTokensMock).not.toBeCalled();
    });

    test('regenerate all', async () => {
      store.regenerateTokensReturn = [Promise.resolve(account)];
      target.find('.js-select-button').simulate('click');
      target.find('.js-regenerate').simulate('click');
      await delay(10); // Waiting for ActionQueueState to finish
      expectWithAccount(target.update(), account, false, '', false, false, []);
      expect(store.removeAccountsMock).not.toBeCalled();
      expect(store.regenerateTokensMock).toBeCalledWith([account]);
    });
  });

  test('with undefined lastLogon', () => {
    const account = new GameServerAccount({
      appid: 740,
      expired: false,
      lastLogon: undefined,
      memo: 'CSGO',
      steamid: '212V16ECZ4HE',
      token: '7FJS3VY2273L',
    });
    const target = createComponent([account], true);
    target.find('.js-select-button').simulate('click');

    const csv = '%22212V16ECZ4HE%22%2C%227FJS3VY2273L%22%2C740%2C%2C%22CSGO%22';
    expectWithAccount(target.update(), account, true, csv, true, false, [account]);
    expect(store.removeAccountsMock).not.toBeCalled();
    expect(store.regenerateTokensMock).not.toBeCalled();
  });
});
