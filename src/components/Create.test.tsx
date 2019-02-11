import { shallow } from 'enzyme';
import * as React from 'react';
import ActionQueueState from 'uiState/ActionQueueState';
import GameServerAccount from 'store/GameServerAccount';
import GsltStore from 'store/GsltStore';
import Create from './Create';

function createComponent(store) {
    return shallow(<Create store={store} actions={new ActionQueueState()} />);
}

function expectComponent(target, method, calls) {
    expect(method).toHaveBeenCalledTimes(calls);
    expect(target).toMatchSnapshot();
}

describe('<Create>', () => {
    let store;
    let target;
    let createMock;
    let callback;

    function expectSuccesfullCreate(amount, appid, memo) {
        expectComponent(target.update(), createMock, 1);
        expect(createMock).toHaveBeenCalledWith(amount, appid, memo);
    }

    beforeEach(() => {
        store = new class implements GsltStore {
            loadAccounts(): Promise<void> {
                throw new Error("Method not implemented.");
            }
            get tokenAccounts(): GameServerAccount[] {
                throw new Error("Method not implemented.");
            }
            removeAccount(account: GameServerAccount): Promise<GameServerAccount> {
                throw new Error("Method not implemented.");
            }
            removeAccounts(accounts: GameServerAccount[]): Promise<GameServerAccount>[] {
                throw new Error("Method not implemented.");
            }
            regenerateToken(account: GameServerAccount): Promise<GameServerAccount> {
                throw new Error("Method not implemented.");
            }
            regenerateTokens(accounts: GameServerAccount[]): Promise<GameServerAccount>[] {
                throw new Error("Method not implemented.");
            }
            updateMemo(account: GameServerAccount, memo: string): Promise<GameServerAccount> {
                throw new Error("Method not implemented.");
            }
            createAccounts(amount: number, appid: string, memo: string): Promise<void>[] {
                createMock(amount, appid, memo);
                return [Promise.resolve(null)];
            }
            get isLoggedIn(): boolean {
                throw new Error("Method not implemented.");
            }
            get isInitialized(): boolean {
                throw new Error("Method not implemented.");
            }
        };
        createMock = jest.fn();
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
