import { observer } from 'mobx-react';
import React from 'react';
import { Button, ControlLabel, FormControl, FormGroup, InputGroup, Nav, NavItem, Tab } from 'react-bootstrap';
import GameServerAccount from '../store/GameServerAccount';
import GsltStore from '../store/GsltStore';
import ActionQueueState from '../uiState/ActionQueueState';
import Create from './Create';
import List from './List';
import Login from './Login';
import Notification from './Notification';
import Readme from './Readme';

interface AppProps {
  store: GsltStore;
  searchDelay: number;
}

interface AppState {
  searchTerm: string;
  searchFilter: string;
}

@observer
export default class App extends React.Component<AppProps, AppState> {
  private searchDebounce?: number;
  private actionQueue: ActionQueueState;

  constructor(props) {
    super(props);
    this.state = { searchTerm: '', searchFilter: '' };
    this.actionQueue = new ActionQueueState();
  }

  public render() {
    const { store } = this.props;
    const { searchTerm } = this.state;
    const activeAccounts = this.activeAccounts;
    const expiredAccounts = this.expiredAccounts;
    const actionQueue = this.actionQueue;

    return (
      <div className="container">
        <Notification actions={actionQueue} />
        <Login show={!store.isLoggedIn} />
        <div className="page-header">
          <FormGroup className="pull-right">
            <Create store={store} actions={actionQueue} />
            <Readme />
            <Button href="https://github.com/phaldan/steam-gslt-manager">
              <i className="fa fa-github" /> Github
            </Button>
          </FormGroup>
          <h1>Steam GSLT manager</h1>
        </div>
        <Tab.Container id="gslt-tabs" defaultActiveKey="activeGslt">
          <div>
            <div className="form-inline pull-right">
              <FormGroup className="pull-right">
                <ControlLabel>Filter:</ControlLabel>
                <InputGroup>
                  <FormControl
                    type="text"
                    placeholder="Memo, Game"
                    value={searchTerm}
                    onChange={this.handleSearch}
                    className="js-filter"
                  />
                  <InputGroup.Button>
                    <Button onClick={this.clearSearch} className="js-clear">
                      <span aria-hidden="true" className="close" />
                    </Button>
                  </InputGroup.Button>
                </InputGroup>
              </FormGroup>
            </div>
            <Nav bsStyle="tabs">
              <NavItem eventKey="activeGslt">
                Active {store.isInitialized && <span className="badge">{activeAccounts.length}</span>}
              </NavItem>
              <NavItem eventKey="expiredGslt">
                Expired {store.isInitialized && <span className="badge">{expiredAccounts.length}</span>}
              </NavItem>
            </Nav>
            <Tab.Content animation={true}>
              <Tab.Pane eventKey="activeGslt">
                {store.isInitialized ? this.createList(activeAccounts, false) : this.loader}
              </Tab.Pane>
              <Tab.Pane eventKey="expiredGslt">
                {store.isInitialized ? this.createList(expiredAccounts, true) : this.loader}
              </Tab.Pane>
            </Tab.Content>
          </div>
        </Tab.Container>
      </div>
    );
  }

  private handleSearch = (event) => {
    const value = event.target.value;
    this.setState({ searchTerm: value });

    if (this.searchDebounce) {
      window.clearTimeout(this.searchDebounce);
    }

    this.searchDebounce = window.setTimeout(() => {
      this.setState({ searchFilter: value });
    }, this.props.searchDelay);
  }

  private clearSearch = () => {
    this.setState({ searchTerm: '', searchFilter: '' });
  }

  private get activeAccounts() {
    return this.filteredAccounts.filter((a) => !a.expired);
  }

  private get expiredAccounts() {
    return this.filteredAccounts.filter((a) => a.expired);
  }

  private get filteredAccounts() {
    const { store } = this.props;
    return store.tokenAccounts.filter((a) => this.filter(a, this.state.searchFilter));
  }

  private filter(account, searchTerm: string) {
    return this.filterByMemo(account, searchTerm) || account.appid.toString(10) === searchTerm;
  }

  private filterByMemo(account, searchTerm: string) {
    return account.memo.toLowerCase().includes(searchTerm.toLowerCase());
  }

  private get loader() {
    return (
      <div className="text-center">
        <span className="loader" />
      </div>
    );
  }

  private createList(gameserver, regenerate: boolean) {
    const { store } = this.props;
    return (
      <List store={store} actions={this.actionQueue} items={gameserver} enableRegenerate={regenerate} />
    );
  }
}
