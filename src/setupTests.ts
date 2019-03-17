import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import 'jest-enzyme';
import { GlobalWithFetchMock } from 'jest-fetch-mock';

configure({ adapter: new Adapter() });

const customGlobal: GlobalWithFetchMock = global as GlobalWithFetchMock;
customGlobal.fetch = require('jest-fetch-mock'); // tslint:disable-line:no-var-requires
customGlobal.fetchMock = customGlobal.fetch;

const error = console.error; // tslint:disable-line:no-console
console.error = (message) => { // tslint:disable-line:no-console
  error.apply(console, arguments); // keep default behaviour
  throw (message instanceof Error ? message : new Error(message));
};
