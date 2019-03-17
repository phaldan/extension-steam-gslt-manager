import { observer } from 'mobx-react';
import React from 'react';
import { Button, Checkbox, ControlLabel, FormGroup, Glyphicon } from 'react-bootstrap';
import GameServerAccount from '../store/GameServerAccount';
import GsltStore from '../store/GsltStore';
import ActionQueueState from '../uiState/ActionQueueState';
import SelectList from '../uiState/SelectList';
import Create from './Create';
import Entry from './Entry';
import Export from './Export';

interface ListProps {
  store: GsltStore;
  actions: ActionQueueState;
  items: GameServerAccount[];
  enableRegenerate?: boolean;
}

@observer
export default class List extends React.Component<ListProps> {
  public static defaultProps: Partial<ListProps> = {
    enableRegenerate: false,
  };

  private selections: SelectList;

  constructor(props) {
    super(props);
    this.selections = new SelectList();
  }

  public render() {
    const { store, items, enableRegenerate } = this.props;
    const { checked } = this.selections;
    return (
      <div>
        <div className="form-inline list-form-actions">
          <Button
            onClick={this.handleButtonSelect}
            className="js-select-button"
          >
            <Checkbox
              checked={checked}
              className="js-select-checkbox"
            />
          </Button>

          <FormGroup>
            <ControlLabel>
              Actions:
            </ControlLabel>
            <Button
              bsStyle="danger"
              title="Remove"
              onClick={this.handleRemove}
              className="js-remove"
            >
              <Glyphicon glyph="trash" /> Remove
            </Button>
            <Button
              bsStyle="success"
              title="Regenerate Token"
              onClick={this.handleRegenerate}
              disabled={!enableRegenerate}
              className="js-regenerate"
            >
              <Glyphicon glyph="refresh" /> Regenerate Token
            </Button>
            <Button
              bsStyle="primary"
              title="CSV"
              href={this.csv}
              download="gslt.csv"
              className="js-csv"
            >
              <Glyphicon glyph="download" /> CSV
            </Button>
            <Export accounts={this.selectedAccounts} />
          </FormGroup>
        </div>

        <table className="table table-striped table-hover table-responsive table-condensed">
          <thead>
            <tr>
              <th/>
              <th className="text-center">Token</th>
              <th className="text-center">Game</th>
              <th className="text-center">Last logon</th>
              <th className="text-center">Memo</th>
              <th/>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? this.createEntries : this.createMessage}
          </tbody>
        </table>
      </div>
    );
  }

  private isSelected(account: GameServerAccount) {
    const selection = this.selections.all.find((s) => s.key === account.steamid);
    return (selection === undefined) ? false : selection.selected;
  }

  private handleEntryToggle = (checked: boolean, account: GameServerAccount) => {
    this.selections.set(account.steamid, checked);

    if (this.selections.checked && !checked) {
      this.selections.toggleChecked(false);
    }
  }

  private handleButtonSelect = () => {
    const { checked } = this.selections;
    this.handleCheckboxToggle(!checked);
  }

  private handleCheckboxToggle(checked: boolean) {
    const { selectAll } = this.selections;
    this.toggleSelectAll(selectAll === checked ? !checked : checked);
  }

  private toggleSelectAll(checked: boolean) {
    const { items } = this.props;

    this.selections.clearSelections();
    for (const account of items) {
      this.selections.add(account.steamid, checked);
    }

    this.selections.toggleChecked(checked);
    this.selections.toggleSelectAll(checked);
  }

  private get selectedAccounts() {
    const { items } = this.props;
    const steamids = this.selections.selected.map((s) => s.key);
    const selected = items.filter((a) => steamids.indexOf(a.steamid) >= 0);
    return selected;
  }

  private handleRemove = async () => {
    const { store } = this.props;
    const selected = this.selectedAccounts;
    if (selected.length === 0) {
      return;
    }
    selected.forEach((s) => s.toggleLock(true));
    this.resetSelectAll();

    const queue = this.createQueue(selected, `Deleting ${selected.length} GSLT:`);
    const promises = store.removeAccounts(selected);
    const actions = this.handleQueueProgress(promises, queue);
    return Promise.all(actions);
  }

  private createQueue(selected, description) {
    const { actions } = this.props;
    const steamids = selected.map((e) => e.steamid);
    return actions.create(description, steamids);
  }

  private handleQueueProgress(promises, queue) {
    return promises.map(async (action) => {
      const gslt = await action;
      queue.progress(gslt.steamid);
    });
  }

  private handleRegenerate = async () => {
    const { store, items } = this.props;
    if (!this.props.enableRegenerate) {
      return;
    }
    const selected = this.selectedAccounts;
    if (selected.length === 0) {
      return;
    }
    this.resetSelectAll();

    const queue = this.createQueue(selected, `Regenerate token for ${selected.length} GSLT:`);
    const promises = store.regenerateTokens(selected);
    const actions = this.handleQueueProgress(promises, queue);
    return Promise.all(actions);
  }

  private resetSelectAll() {
    const { items } = this.props;
    if (items.length === this.selections.selected.length) {
      this.toggleSelectAll(false);
    }
  }

  private get csv() {
    const lines = this.selectedAccounts.map((account) => this.createCsvLine(account));
    const content = lines.join('\n');
    const encoded = encodeURIComponent(this.createCsvHeadline() + content);
    return 'data:text/csv;charset=UTF-8,' + '\uFEFF' + encoded;
  }

  private createCsvHeadline() {
    return `"SteamID","Token","AppID","Last-Logon","Memo"\n`;
  }

  private createCsvLine(account: GameServerAccount) {
    const logon = (account.lastLogon ? `"${account.lastLogon.toISOString()}"` : '');
    return `"${account.steamid}","${account.token}",${account.appid},${logon},"${account.memo}"`;
  }

  private get createEntries() {
    const { store, items, enableRegenerate, actions } = this.props;
    return items.map((account) => (
      <Entry
        key={account.steamid}
        store={store}
        account={account}
        selected={this.isSelected(account)}
        onToggle={this.handleEntryToggle}
        enableRegenerate={enableRegenerate}
        actions={actions}
      />
    ));
  }

  private get createMessage() {
    const { store, actions } = this.props;
    return (
      <tr>
        <td colSpan={6}>
          <div className="panel panel-info" style={{margin: 0}}>
            <div className="panel-heading">
              <div className="page-header text-center">
                <h2>Nothing found!</h2>
                <Create store={store} text="Create new" actions={actions} />
              </div>
            </div>
          </div>
        </td>
      </tr>
    );
  }
}
