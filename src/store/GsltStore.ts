import GameServerAccount from './GameServerAccount';

export default interface GsltStore {

  /**
   * Return current list of GameServerAccount.
   */
  readonly tokenAccounts: GameServerAccount[];

  readonly isLoggedIn: boolean;

  readonly isInitialized: boolean;

  /**
   * Load token accounts from steam.
   */
  loadAccounts(): Promise<void>;

  /**
   * Remove GSLT account.
   * @param account GameServerAccount instance
   */
  removeAccount(account: GameServerAccount): Promise<GameServerAccount>;

  /**
   * Remove GSLT accounts.
   * @param accounts List of GameServerAccount instances
   */
  removeAccounts(accounts: GameServerAccount[]): Array<Promise<GameServerAccount>>;

  /**
   * Create a new token for GSLT account.
   * @param account GameServerAccount instance
   */
  regenerateToken(account: GameServerAccount): Promise<GameServerAccount>;

  /**
   * Create a new token for GSLT accounts.
   * @param accounts List of GameServerAccount instances.
   */
  regenerateTokens(accounts: GameServerAccount[]): Array<Promise<GameServerAccount>>;

  /**
   * Change memo of GSLT account.
   * @param account GameServerAccount instance
   * @param memo Description for a GSLT
   */
  updateMemo(account: GameServerAccount, memo: string): Promise<GameServerAccount>;

  /**
   * Create multiple GSLT accounts.
   * @param amount Number of GSLT to create
   * @param appid Steam AppID
   * @param memo Description for a GSLT
   */
  createAccounts(amount: number, appid: string, memo: string): Array<Promise<void>>;
}
