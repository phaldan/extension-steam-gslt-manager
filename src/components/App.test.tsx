import { shallow } from 'enzyme';
import { action, computed, observable } from 'mobx';
import * as React from 'react';
import GameServerAccount from '../store/GameServerAccount';
import GsltStore from '../store/GsltStore';
import GsltStoreDummy from '../store/GsltStoreDummy';
import delay from '../utils/delay';
import App from './App';

function createGetAllJson() {
  return {
    sessionId: '3D6M733LPVJ1',
    tokens: [
      {
        appid: 730,
        expired: false,
        lastLogon: undefined,
        memo: 'CSGO',
        steamid: '212V16ECZ4HE',
        token: '7FJS3VY2273L',
      },
    ],
  };
}

function createAccount() {
  return new GameServerAccount({
    appid: 730,
    expired: false,
    lastLogon: undefined,
    memo: 'CSGO',
    steamid: '212V16ECZ4HE',
    token: '7FJS3VY2273L',
  });
}

class GsltStoreStub extends GsltStoreDummy {
  @observable
  private accounts: GameServerAccount[] = [];

  @observable
  private initialized: boolean = false;

  @computed
  public get isInitialized(): boolean {
    return this.initialized;
  }

  @computed
  public get isLoggedIn(): boolean {
    return true;
  }

  @computed
  public get tokenAccounts(): GameServerAccount[] {
    return this.accounts;
  }

  @action
  public setAccounts(accounts: GameServerAccount[]): void {
    this.accounts = accounts;
  }

  @action
  public setInitialized(initialized: boolean): void {
    this.initialized = initialized;
  }
}

describe('<App>', () => {
  let state: GsltStoreStub;
  let target;

  beforeEach(() => {
    state = new GsltStoreStub();
    target = shallow(<App store={state} searchDelay={0} />);
  });

  test('empty no accounts', () => {
    expect(target).toMatchSnapshot();
  });

  test('with empty list of accounts', async () => {
    state.setAccounts([]);
    state.setInitialized(true);
    expect(target.update()).toMatchSnapshot();
  });

  test('success filter by memo', async () => {
    state.setAccounts([createAccount()]);
    state.setInitialized(true);
    target.find('.js-filter').simulate('change', { target: { value: 'CSGO' } });
    await delay(0); // Needed because of debounce for search delay
    expect(target.update()).toMatchSnapshot();
  });

  test('success filter by appid', async () => {
    state.setAccounts([createAccount()]);
    state.setInitialized(true);
    target.find('.js-filter').simulate('change', { target: { value: '730' } });
    await delay(0); // Need because of debounce for search delay
    expect(target.update()).toMatchSnapshot();
  });

  test('fail to filter', async () => {
    state.setAccounts([createAccount()]);
    state.setInitialized(true);
    target.find('.js-filter').simulate('change', { target: { value: '1337' } });
    await delay(0); // Need because of debounce for search delay
    expect(target.update()).toMatchSnapshot();
  });

  test('success multiple filter', async () => {
    state.setAccounts([createAccount()]);
    state.setInitialized(true);
    target.find('.js-filter').simulate('change', { target: { value: 'CSGO' } });
    target.find('.js-filter').simulate('change', { target: { value: 'CSGO' } });
    await delay(0); // Need because of debounce for search delay
    expect(target.update()).toMatchSnapshot();
  });

  test('clear search-term', async () => {
    state.setAccounts([createAccount()]);
    state.setInitialized(true);
    target.find('.js-filter').simulate('change', { target: { value: '1337' } });
    await delay(0); // Need because of debounce for search delay
    target.find('.js-clear').simulate('click');
    expect(target).toMatchSnapshot();
  });
});
