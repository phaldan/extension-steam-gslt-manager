import copy from 'copy-to-clipboard';
import { observer } from 'mobx-react';
import * as React from 'react';
import { Button, Checkbox, FormControl, Glyphicon } from 'react-bootstrap';
import { FormattedDate } from 'react-intl';
import GameServerAccount from '../store/GameServerAccount';
import GsltStore from '../store/GsltStore';
import ActionQueueState from '../uiState/ActionQueueState';
import Edit from './Edit';

interface EntryProps {
  account: GameServerAccount;
  actions: ActionQueueState;
  enableRegenerate?: boolean;
  onToggle?: (selected: boolean, account: GameServerAccount) => void;
  selected?: boolean;
  store: GsltStore;
}

interface EntryState {
  enableDelete: boolean;
  enableRegenerate: boolean;
}

@observer
export default class Entry extends React.Component<EntryProps, EntryState> {
  public static defaultProps: Partial<EntryProps> = {
    selected: false,
  };

  constructor(props) {
    super(props);
    this.state = { enableDelete: true, enableRegenerate: true };
  }

  public render() {
    const { account, store, selected, actions } = this.props;
    const { token, appid, lastLogon, memo } = account;
    return (
      <tr className="align-middle">
        <td>
          <div className="form-inline entry-select">
            <Checkbox
              checked={this.props.selected}
              onChange={this.fireToggle}
              className="js-select"
            />
          </div>
        </td>
        <td>
          <FormControl type="text" value={token} readOnly={true} bsSize="small" />
        </td>
        <td className="js-appid">{appid}</td>
        <td className="text-center">
          {lastLogon ? this.formatDate(lastLogon) : <span className="text-danger">Never</span>}
        </td>
        <td className="js-memo">{memo}</td>
        <td className="text-right">
          <Button
            bsStyle="danger"
            bsSize="small"
            title="Remove"
            onClick={this.handleRemove}
            disabled={this.isRemoveDisabled}
            className="js-remove"
          >
            <Glyphicon glyph="trash" />
          </Button>
          <Button
            bsStyle="success"
            bsSize="small"
            title="Regenerate Token"
            onClick={this.handleRegenerate}
            disabled={this.isRegenerateDisabled}
            className="js-regenerate"
          >
            <Glyphicon glyph="refresh" />
          </Button>
          <Edit store={store} account={account} actions={actions} disabled={this.isRemoveDisabled}>
            <Glyphicon glyph="edit" />
          </Edit>
          <Button
            bsStyle="primary"
            bsSize="small"
            title="Copy to clipboard"
            onClick={this.copy}
            className="js-clipboard"
          >
            <Glyphicon glyph="duplicate" />
          </Button>
        </td>
      </tr>
    );
  }

  private fireToggle = (event) => {
    const { onToggle, account } = this.props;
    if (onToggle) {
      onToggle(event.target.checked, account);
    }
  }

  private formatDate(lastLogon) {
    return (
      <FormattedDate value={lastLogon} year="numeric" month="long" day="2-digit" />
    );
  }

  private handleRemove = async () => {
    const { account, store, actions } = this.props;
    if (!this.isRemoveDisabled) {
      this.setState({ enableDelete: false });
      const queue = actions.create('Deleting GSLT:', [account.steamid]);
      await store.removeAccount(account);
      queue.progress(account.steamid);
    }
  }

  private get isRemoveDisabled() {
    const { enableDelete } = this.state;
    const { account } = this.props;
    return !enableDelete || account.locked;
  }

  private handleRegenerate = async () => {
    const { account, store, actions } = this.props;
    if (!this.isRegenerateDisabled) {
      this.setState({ enableRegenerate: false });
      const queue = actions.create('Regenerate token for GSLT:', [account.steamid]);
      await store.regenerateToken(account);
      queue.progress(account.steamid);
      this.setState({ enableRegenerate: true });
    }
  }

  private get isRegenerateDisabled() {
    const { enableDelete, enableRegenerate } = this.state;
    return !enableRegenerate || this.isRemoveDisabled || !this.props.enableRegenerate;
  }

  private copy = () => {
    copy(this.props.account.token);
  }
}
