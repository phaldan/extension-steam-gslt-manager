import { shallow } from 'enzyme';
import * as React from 'react';
import GameServerAccount from '../store/GameServerAccount';
import GsltStore from '../store/GsltStore';
import GsltStoreDummy from '../store/GsltStoreDummy';
import ActionQueueState from '../uiState/ActionQueueState';
import Create from './Create';

function createComponent(store) {
    return shallow(<Create store={store} actions={new ActionQueueState()} />);
}

function expectComponent(target, method, calls) {
    expect(method).toHaveBeenCalledTimes(calls);
    expect(target).toMatchSnapshot();
}

describe('<Create>', () => {
    let store: GsltStore;
    let target;
    let createMock;

    function expectSuccesfullCreate(amount, appid, memo) {
        expectComponent(target.update(), createMock, 1);
        expect(createMock).toHaveBeenCalledWith(amount, appid, memo);
    }

    beforeEach(() => {
        store = new GsltStoreDummy();
        createMock = jest.fn(() => [Promise.resolve()]);
        store.createAccounts = createMock;
        target = createComponent(store);
    });

    test('fail to create account', () =>  {
        expectComponent(target, createMock, 0);
    });

    test('succesful create account', () =>  {
        target.find('ActionModal').simulate('action');
        expectSuccesfullCreate(1, '', '');
    });

    test('succesful change and create account', () =>  {
        target.find('.js-amount').simulate('change', {target: {value: 42}});
        target.find('.js-appid').simulate('change', {target: {value: '740'}});
        target.find('.js-memo').simulate('change', {target: {value: 'CSGO'}});
        target.find('ActionModal').simulate('action');
        expectSuccesfullCreate(42, '740', 'CSGO');
    });

    test('successfull reset of form data', () => {
        target.find('.js-amount').simulate('change', {target: {value: 42}});
        target.find('.js-appid').simulate('change', {target: {value: '740'}});
        target.find('.js-memo').simulate('change', {target: {value: 'CSGO'}});
        target.find('ActionModal').simulate('open');
        target.find('ActionModal').simulate('action');
        expectSuccesfullCreate(1, '', '');
    });
});
