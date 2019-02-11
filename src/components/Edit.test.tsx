import { mount, shallow } from 'enzyme';
import * as React from 'react';
import GameServerAccount from '../store/GameServerAccount';
import GsltStore from '../store/GsltStore';
import ActionQueueState from '../uiState/ActionQueueState';
import delay from '../utils/delay';
import Edit from './Edit';

class GsltStoreStub implements GsltStore {
  public updateReturn: Promise<GameServerAccount>;
  public updateMock = jest.fn();

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
    throw new Error("Method not implemented.");
  }
  regenerateToken(account: GameServerAccount): Promise<GameServerAccount> {
    throw new Error("Method not implemented.");
  }
  regenerateTokens(accounts: GameServerAccount[]): Promise<GameServerAccount>[] {
    throw new Error("Method not implemented.");
  }
  updateMemo(account: GameServerAccount, memo: string): Promise<GameServerAccount> {
    this.updateMock(account, memo);
    return this.updateReturn;
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

describe('<Edit>', () => {
  let account: GameServerAccount;
  let store: GsltStoreStub;
  let queue: ActionQueueState;

  function createComponent(account, state, disabled) {
    return shallow(<Edit account={account} store={state} actions={queue} disabled={disabled} />);
  }

  function expectEdit(target, modalIsDisabled) {
    expect(target.find('ActionModal').props().disabled).toEqual(modalIsDisabled);
    expect(target.find('.js-memo').props().defaultValue).toEqual('Awesome');
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
    store = new GsltStoreStub();
    queue = new ActionQueueState();
    queue.setRemoveDelay(0);
  });

  test('disabled ActionModal', () =>  {
    const target = createComponent(account, store, true);

    expectEdit(target, true);
    expect(store.updateMock).not.toHaveBeenCalled();
  });

  describe('enabled ActionModal', () => {
    let target;
    beforeEach(() => {
      target = createComponent(account, store, false);
    });

    test('save memo', async () =>  {
      target.find('ActionModal').simulate('action');

      await delay(10);
      expectEdit(target, false);
      expect(store.updateMock).toHaveBeenCalledWith(account, 'Awesome');
    });

    test('change and save memo', async () =>  {
      target.find('.js-memo').simulate('change', {target: {value: 'Changed'}});
      target.find('ActionModal').simulate('action');

      await delay(10);
      expectEdit(target, false);
      expect(store.updateMock).toHaveBeenCalledWith(account, 'Changed');
    });
  });
});
