import copy from 'copy-to-clipboard';
import { observer } from 'mobx-react';
import * as React from 'react';
import { Checkbox, FormControl, FormGroup } from 'react-bootstrap';
import GameServerAccount from '../store/GameServerAccount';
import ColumnSelectionState from '../uiState/ColumnSelectionState';
import ActionModal from './ActionModal';

interface ExportProps {
  accounts: GameServerAccount[];
}

@observer
export default class Export extends React.Component<ExportProps> {
  private checked: ColumnSelectionState;

  constructor(props) {
    super(props);
    this.checked = new ColumnSelectionState();
  }

  public render() {
    return (
      <ActionModal
        title="Export"
        buttonIcon="export"
        buttonStyle="primary"
        buttonText="Export"
        size="large"
        action="Copy to clipboard"
        onAction={this.copy}
      >
        <FormGroup>
          {this.createCheckBox(this.checked.steamId, 'js-steamid', 'SteamID', this.setSteamId)}
          {this.createCheckBox(this.checked.token, 'js-token', 'Token', this.setToken)}
          {this.createCheckBox(this.checked.appId, 'js-appid', 'AppID', this.setAppId)}
          {this.createCheckBox(this.checked.lastLogon, 'js-logon', 'Last logon', this.setLogon)}
          {this.createCheckBox(this.checked.memo, 'js-memo', 'Memo', this.setMemo)}
        </FormGroup>

        <FormGroup>
          <FormControl
            componentClass="textarea"
            rows="10"
            readOnly={true}
            value={this.content}
            className="js-output"
          />
        </FormGroup>
      </ActionModal>
    );
  }

  private copy = () => {
    copy(this.content);
  }

  private get content() {
    const { accounts } = this.props;
    return accounts.map((account) => {
      return this.buildColumns(account).join(',');
    }).join('\n');
  }

  private buildColumns(account: GameServerAccount): string[] {
    const columns: string[] = [];
    if (this.checked.steamId) {
        columns.push(account.steamid);
    }
    if (this.checked.token) {
        columns.push(account.token);
    }
    if (this.checked.appId) {
        columns.push(account.appid.toString());
    }
    if (this.checked.lastLogon) {
        columns.push((account.lastLogon) ? account.lastLogon.toISOString() : '');
    }
    if (this.checked.memo) {
        columns.push(account.memo);
    }
    return columns;
  }

  private setSteamId = (event) => {
    this.checked.toggleSteamId(event.target.checked);
  }

  private setToken = (event) => {
    this.checked.toggleToken(event.target.checked);
  }

  private setAppId = (event) => {
    this.checked.toggleAppId(event.target.checked);
  }

  private setLogon = (event) => {
    this.checked.toggleLastLogon(event.target.checked);
  }

  private setMemo = (event) => {
    this.checked.toggleMemo(event.target.checked);
  }

  private createCheckBox(checked: boolean, className: string, text: string, callback) {
    return (
      <Checkbox
        inline={true}
        checked={checked}
        onChange={callback}
        className={className}
      >
       {text}
      </Checkbox>
    );
  }
}
