import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import 'jest-enzyme';
import { GlobalWithFetchMock } from 'jest-fetch-mock';

configure({ adapter: new Adapter() });

const customGlobal: GlobalWithFetchMock = global as GlobalWithFetchMock;
// tslint:disable-next-line:no-var-requires
customGlobal.fetch = require('jest-fetch-mock');
customGlobal.fetchMock = customGlobal.fetch;
