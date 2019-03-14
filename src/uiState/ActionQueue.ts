import { action, computed, observable } from 'mobx';
import uuid from 'uuid/v4';
import delay from '../utils/delay';
import ActionQueueState from './ActionQueueState';

export default class ActionQueue {
  private state: ActionQueueState;
  private uuid: string;
  private desc: string;
  private finishDelay: number;

  @observable
  private queue: string[] = [];

  @observable
  private finished: boolean[] = [];

  constructor(state: ActionQueueState, finishDelay: number, description: string, keys: string[]) {
    this.state = state;
    this.uuid = uuid();
    this.desc = description;
    this.queue = keys.slice();
    this.finished = Array(keys.length).fill(false);
    this.finishDelay = finishDelay;
  }

  @computed
  public get id() {
    return this.uuid;
  }

  @computed
  public get description() {
    return this.desc;
  }

  @computed
  public get max() {
    return this.queue.length;
  }

  @computed
  public get now() {
    return this.finished.filter((e) => e === true).length;
  }

  @computed
  public get isFinished() {
    return this.now === this.max;
  }

  @action
  public async progress(key: string) {
    const index = this.queue.indexOf(key);
    if (index >= 0) {
      this.finished[index] = true;
      await this.finishing();
    }
  }

  private async finishing() {
    if (this.isFinished) {
      await delay(this.finishDelay);
      await this.state.remove(this.id);
    }
  }
}
