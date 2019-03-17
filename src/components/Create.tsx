import React from 'react';
import { ControlLabel, FormControl, FormGroup } from 'react-bootstrap/';
import GsltStore from '../store/GsltStore';
import ActionQueueState from '../uiState/ActionQueueState';
import ActionModal from './ActionModal';

interface CreateProps {
  store: GsltStore;
  text?: string;
  actions: ActionQueueState;
}

export default class Create extends React.Component<CreateProps> {
  public static defaultProps: Partial<CreateProps> = {
    text: 'New',
  };

  private amount: number = 1;
  private appid: string = '';
  private memo: string = '';

  public render() {
    const { text } = this.props;
    return (
      <ActionModal
        buttonIcon="plus"
        buttonText={text}
        title="Create GSLT"
        action="Create"
        onAction={this.save}
        onOpen={this.reset}
      >
        <FormGroup>
          <ControlLabel>
            Amount
          </ControlLabel>
          <FormControl
            type="number"
            defaultValue="1"
            onChange={this.setAmount}
            className="js-amount"
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>
            Game
          </ControlLabel>
          <FormControl
            type="text"
            placeholder="App-ID like 440 for TF2, 730 for CS:GO"
            onChange={this.setAppId}
            className="js-appid"
          />
        </FormGroup>
        <FormGroup>
          <ControlLabel>
            Memo
          </ControlLabel>
          <FormControl
            componentClass="textarea"
            placeholder="Optional short description"
            rows="10"
            maxLength="256"
            onChange={this.setMemo}
            className="js-memo"
          />
        </FormGroup>
      </ActionModal>
    );
  }

  private reset = () => {
    this.amount = 1;
    this.appid = '';
    this.memo = '';
  }

  private save = async () => {
    const { store, actions } = this.props;
    const amount = Number(this.amount);
    const list = Array.from(Array(Number(amount)), (_, i) => i.toString());
    const queue = actions.create(`Create ${amount} GSLTs:`, list);
    const promises = store.createAccounts(this.amount, this.appid, this.memo);
    const result = promises.map(async (promise, i: number) => {
      await promise;
      queue.progress(i.toString());
    });
    return Promise.all(result);
  }

  private setAmount = (event) => {
    this.amount = event.target.value;
  }

  private setAppId = (event) => {
    this.appid = event.target.value;
  }

  private setMemo = (event) => {
    this.memo = event.target.value;
  }
}
