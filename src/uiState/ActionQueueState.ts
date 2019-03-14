import { action, computed, observable } from 'mobx';
import ActionQueue from './ActionQueue';

export default class ActionQueueState {
  private removeDelay = 3000;

  @observable
  private queues: ActionQueue[] = [];

  @action
  public create(description: string, data: string[]): ActionQueue {
    const entry = new ActionQueue(this, this.removeDelay, description, data);
    this.queues.push(entry);
    return entry;
  }

  @computed
  public get running(): ActionQueue[] {
    return this.queues;
  }

  @action
  public async remove(id: string) {
    this.queues = this.queues.filter((q) => q.id !== id);
  }

  public setRemoveDelay(removeDelay: number): void {
    this.removeDelay = removeDelay;
  }
}
