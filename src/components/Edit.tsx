import { observer } from 'mobx-react';
import * as React from 'react';
import { FormControl } from 'react-bootstrap';
import GameServerAccount from '../store/GameServerAccount';
import GsltStore from '../store/GsltStore';
import ActionQueueState from '../uiState/ActionQueueState';
import ActionModal from './ActionModal';

interface EditProps {
  store: GsltStore;
  account: GameServerAccount;
  disabled: boolean;
  actions: ActionQueueState;
}

interface EditState {
  value: string;
}

@observer
export default class Edit extends React.Component<EditProps, EditState> {
  constructor(props) {
    super(props);
    this.state = { value: this.props.account.memo };
  }

  public render() {
    const { account, disabled } = this.props;
    return (
      <ActionModal
        buttonStyle="primary"
        buttonSize="small"
        buttonIcon="edit"
        title="GSLT Memo"
        action="Update"
        onAction={this.save}
        disabled={disabled}
      >
        <FormControl
          componentClass="textarea"
          className="js-memo"
          defaultValue={account.memo}
          rows="10"
          maxLength="256"
          onChange={this.updateMemo}
        />
      </ActionModal>
    );
  }

  private save = async (): Promise<void> => {
    const { value } = this.state;
    const { store, account, actions } = this.props;
    const queue = actions.create('Update memo:', [account.steamid]);
    await store.updateMemo(account, value);
    queue.progress(account.steamid);
  }

  private updateMemo = (event): void => {
    this.setState({ value: event.target.value });
  }
}
