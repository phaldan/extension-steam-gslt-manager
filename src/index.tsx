import { useStrict } from 'mobx';
import React from 'react';
import { render } from 'react-dom';
import { IntlProvider } from 'react-intl';
import App from './components/App';
import GsltStoreMobx from './store/GsltStoreMobx';
import TransportFetch from './store/TransportFetch';

useStrict(true);
const gsltState = new GsltStoreMobx(new TransportFetch());
gsltState.loadAccounts();

render(
  <IntlProvider locale="en">
    <App store={gsltState} searchDelay={300} />
  </IntlProvider>,
  document.getElementById('root'),
);
