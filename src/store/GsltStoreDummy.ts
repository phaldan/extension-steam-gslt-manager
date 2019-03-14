import GameServerAccount from './GameServerAccount';
import GsltStore from './GsltStore';

export default class GsltStoreDummy implements GsltStore {
  public get isInitialized(): boolean {
    throw new Error('Method not implemented.');
  }

  public get isLoggedIn(): boolean {
    throw new Error('Method not implemented.');
  }

  public get tokenAccounts(): GameServerAccount[] {
    throw new Error('Method not implemented.');
  }

  public loadAccounts(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  public createAccounts(amount: number, appid: string, memo: string): Array<Promise<void>> {
    throw new Error('Method not implemented.');
  }

  public regenerateToken(account: GameServerAccount): Promise<GameServerAccount> {
    throw new Error('Method not implemented.');
  }

  public regenerateTokens(accounts: GameServerAccount[]): Array<Promise<GameServerAccount>> {
    throw new Error('Method not implemented.');
  }

  public removeAccount(account: GameServerAccount): Promise<GameServerAccount> {
    throw new Error('Method not implemented.');
  }

  public removeAccounts(accounts: GameServerAccount[]): Array<Promise<GameServerAccount>> {
    throw new Error('Method not implemented.');
  }

  public updateMemo(account: GameServerAccount, memo: string): Promise<GameServerAccount> {
    throw new Error('Method not implemented.');
  }
}
