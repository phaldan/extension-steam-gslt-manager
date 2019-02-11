export interface ResponseJson {
  sessionId: string;
  tokens: GsltJson[];
}

export interface GsltJson {
  appid: number;
  expired: boolean;
  lastLogon?: string;
  memo: string;
  steamid: string;
  token: string;
}

export interface Transport {

  /**
   * Request all GSLT from Steam
   */
  getAll(): Promise<ResponseJson>;

  /**
   * Remove GSLT from the Steam user.
   * @param sessionid Unique identifier for the Steam user session
   * @param steamid Unique identifier for the GSLT
   */
  remove(sessionid: string, steamid: string): Promise<Response>;

  /**
   * Reactivate an expired GSLT by creating a new token for the given steamid.
   * @param sessionid Unique identifier for the Steam user session
   * @param steamid Unique identifier for the GSLT
   */
  regenerate(sessionid: string, steamid: string): Promise<Response>;

  /**
   * Modify a memo of a GSLT.
   * @param sessionid Unique identifier for the Steam user session
   * @param steamid Unique identifier for the GSLT
   * @param memo Memo of a GSLT
   */
  changeMemo(sessionid: string, steamid: string, memo: string): Promise<Response>;

  /**
   * Creates a new GSLT.
   * @param sessionid Unique identifier for the Steam user session
   * @param appid Unique identifier for a Steam game
   * @param memo Optional description or note for a GSLT
   */
  create(sessionid: string, appid: string, memo: string): Promise<Response>;
}
