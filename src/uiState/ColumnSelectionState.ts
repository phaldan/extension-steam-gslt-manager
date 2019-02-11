import { action, computed, observable } from 'mobx';

export default class ColumnSelectionState {

  @observable
  private checkedAppID = false;

  @observable
  private checkedLastLogon = false;

  @observable
  private checkedMemo = false;

  @observable
  private checkedSteamID = false;

  @observable
  private checkedToken = true;

  @computed
  public get appId(): boolean {
    return this.checkedAppID;
  }

  @computed
  public get lastLogon(): boolean {
    return this.checkedLastLogon;
  }

  @computed
  public get memo(): boolean {
    return this.checkedMemo;
  }

  @computed 
  public get steamId(): boolean {
    return this.checkedSteamID;
  }

  @computed
  public get token(): boolean {
    return this.checkedToken;
  }

  @action
  public toggleAppId(checked: boolean): void {
    this.checkedAppID = checked;
  }

  @action
  public toggleLastLogon(checked: boolean): void {
    this.checkedLastLogon = checked;
  }

  @action
  public toggleMemo(checked: boolean): void {
    this.checkedMemo = checked;
  }

  @action
  public toggleSteamId(checked: boolean): void {
    this.checkedSteamID = checked;
  }

  @action
  public toggleToken(checked: boolean): void {
    this.checkedToken = checked;
  }
}