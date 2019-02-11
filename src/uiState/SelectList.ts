import { action, computed, observable } from 'mobx';
import SelectState from './SelectState';

export default class SelectList {
  @observable
  private checkboxChecked = false;

  @observable
  private items: SelectState[] = [];

  @observable
  private selectAllActive = false;

  @computed
  public get all(): SelectState[] {
    return this.items.slice();
  }

  @computed
  public get selected(): SelectState[] {
    return this.items.filter((s) => s.selected === true);
  }

  @action
  public set(key: string, selected: boolean) {
    const entry = this.items.find((s) => s.key === key);
    if (entry) {
      entry.selected = selected;
    } else {
      this.add(key, selected);
    }
  }

  @action
  public add(key: string, selected: boolean) {
    this.items.push(new SelectState(key, selected));
  }

  @action
  public clearSelections() {
    this.items = [];
  }

  @computed
  public get checked() {
    return this.checkboxChecked;
  }

  @computed
  public get selectAll() {
    return this.selectAllActive;
  }

  @action
  public toggleChecked(checked: boolean) {
    this.checkboxChecked = checked;
  }

  @action
  public toggleSelectAll(selectAll: boolean) {
    this.selectAllActive = selectAll;
  }
}
