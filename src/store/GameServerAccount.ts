import { action, observable } from 'mobx';

export default class GameServerAccount {
  public steamid: string;
  public appid: number;

  @observable
  public expired: boolean = false;

  @observable
  public lastLogon?: Date;

  @observable
  public memo: string;

  @observable
  public token: string;

  @observable
  public locked: boolean = false;

  constructor({ steamid, appid, token, memo, lastLogon, expired }) {
    this.steamid = steamid;
    this.appid = appid;
    this.token = token;
    this.memo = memo;
    this.lastLogon = lastLogon ? new Date(lastLogon) : undefined;
    this.expired = expired;
  }

  @action
  public toggleLock(locked: boolean) {
    this.locked = locked;
  }

  @action
  public updateFromJson({ appid, token, memo, lastLogon, expired }) {
    this.appid = appid;
    this.token = token;
    this.memo = memo;
    this.lastLogon = lastLogon;
    this.expired = expired;
  }
}
