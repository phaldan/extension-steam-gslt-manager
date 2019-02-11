import { observable } from 'mobx';

export default class SelectState {
  public key: string;

  @observable
  public selected: boolean;

  constructor(key: string, selected: boolean) {
    this.key = key;
    this.selected = selected;
  }
}
