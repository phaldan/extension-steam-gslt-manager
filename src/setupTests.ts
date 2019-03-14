import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import { GlobalWithFetchMock } from "jest-fetch-mock";
import 'jest-enzyme';

configure({ adapter: new Adapter() });

const customGlobal: GlobalWithFetchMock = global as GlobalWithFetchMock;
customGlobal.fetch = require('jest-fetch-mock');
customGlobal.fetchMock = customGlobal.fetch;
