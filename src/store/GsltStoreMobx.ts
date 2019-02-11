import { action, computed, observable, runInAction } from 'mobx';
import delay from '../utils/delay';
import GameServerAccount from './GameServerAccount';
import GsltStore from './GsltStore';
import { Transport } from './Transport';

const loggedinCheckInterval = 3000; // in ms

export default class GsltStoreMobx implements GsltStore {
  private transportLayer: Transport;

  @observable
  private accounts: GameServerAccount[] = [];

  @observable
  private sessionid: string = '';

  @observable
  private searchTerm: string = '';

  @observable
  private loggedIn = true;

  @observable
  private initialized = false;

  /**
   * Initial load of token accounts.
   * @param transportLayer Transport layer to handle request to Steam.
   */
  constructor(transportLayer: Transport) {
    this.transportLayer = transportLayer;
  }

  public async loadAccounts(): Promise<void> {
    try {
      return await this.updateAccounts();
    } catch (error) {
      return this.handLoadAccountError(error);
    }
  }

  @computed
  public get tokenAccounts(): GameServerAccount[] {
    return this.accounts;
  }

  public async removeAccount(account: GameServerAccount): Promise<GameServerAccount> {
    await Promise.all(this.removeAccounts([account]));
    return account;
  }

  public removeAccounts(accounts: GameServerAccount[]): Array<Promise<GameServerAccount>> {
    return this.loadAccountsOnResolveAll(accounts, async (account) => {
      await this.transportLayer.remove(this.sessionid, account.steamid);
      runInAction(() => {
        this.accounts = this.accounts.filter((a) => a.steamid !== account.steamid);
      });
      return account;
    });
  }

  public async regenerateToken(account: GameServerAccount): Promise<GameServerAccount> {
    await Promise.all(this.regenerateTokens([account]));
    return account;
  }

  public regenerateTokens(accounts: GameServerAccount[]): Array<Promise<GameServerAccount>> {
    return this.loadAccountsOnResolveAll(accounts, async (account) => {
      await this.transportLayer.regenerate(this.sessionid, account.steamid);
      return account;
    });
  }

  public async updateMemo(account: GameServerAccount, memo: string): Promise<GameServerAccount> {
    await this.transportLayer.changeMemo(this.sessionid, account.steamid, memo);
    await this.loadAccounts();
    return account;
  }

  public createAccounts(amount: number, appid: string, memo: string): Array<Promise<void>> {
    const list = Array.from(Array(Number(amount)), (_, x) => x);
    return this.loadAccountsOnResolveAll(list, async () => {
      await this.transportLayer.create(this.sessionid, appid, memo);
    });
  }

  @computed
  public get isLoggedIn() {
    return this.loggedIn;
  }

  @computed
  public get isInitialized() {
    return this.initialized;
  }

  private async updateAccounts() {
    const response = await this.transportLayer.getAll();
    this.sessionid = response.sessionId;
    response.tokens.forEach((e) => this.updateAccountFromJson(e));
    runInAction(() => {
      this.initialized = true;
      this.loggedIn = true;
    });
  }

  @action
  private updateAccountFromJson(json) {
    const result = this.accounts.find((a) => a.steamid === json.steamid);
    if (result) {
      result.updateFromJson(json);
    } else {
      const account = new GameServerAccount(json);
      this.accounts.push(account);
    }
  }

  @action
  private async handLoadAccountError(error) {
    if (error.message !== 'Need login') {
      throw error;
    } else {
      this.loggedIn = false;
      await delay(loggedinCheckInterval);
      return this.loadAccounts();
    }
  }

  private loadAccountsOnResolveAll(list, callback) {
    let progress = 0;
    return list.map(async (entry) => {
      const result = await callback(entry);
      if (++progress === list.length) {
        await this.loadAccounts();
      }
      return result;
    });
  }
}
