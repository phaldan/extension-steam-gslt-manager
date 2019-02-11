import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-15';
import fetchMock from 'jest-fetch-mock';

configure({ adapter: new Adapter() });

window.fetch = fetchMock;