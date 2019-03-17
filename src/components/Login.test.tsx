import { shallow } from 'enzyme';
import React from 'react';
import Login from './Login';

function createComponent(show) {
    return shallow(<Login show={show} />);
}

describe('<Login>', () => {
    test('show modal', () =>  {
        const target = createComponent(true);
        expect(target).toMatchSnapshot();
    });

    test('hidden modal', () =>  {
        const target = createComponent(false);
        expect(target).toMatchSnapshot();
    });
});
