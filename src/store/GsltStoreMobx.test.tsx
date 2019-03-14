import { mount } from 'enzyme';
import * as React from 'react';
import { stubInterface } from '../utils/mocked';
import GameServerAccount from './GameServerAccount';
import GsltStoreMobx from './GsltStoreMobx';
import { ResponseJson, Transport } from './Transport';

describe('GsltStoreMobx', () => {
  let target: GsltStoreMobx;
  let transport: Transport;
  let getAllMock;

  beforeEach(() => {
    getAllMock = jest.fn();
    transport = stubInterface<Transport>({ getAll: getAllMock });
    target = new GsltStoreMobx(transport);
  });

  function createGetAllReturn() {
    return {
      sessionId: '3D6M733LPVJ1',
      tokens: [ createAccountJson() ],
    };
  }

  function createAccountJson() {
    return {
      appid: 730,
      expired: false,
      lastLogon: undefined,
      memo: 'CSGO',
      steamid: '212V16ECZ4HE',
      token: '7FJS3VY2273L',
    };
  }

  test('success load token accounts', async () => {
    const promise = Promise.resolve(createGetAllReturn());
    getAllMock.mockReturnValue(promise);

    await expect(target.loadAccounts()).resolves.not.toBeDefined();
    expect(getAllMock).toHaveBeenCalledTimes(1);
    expect(target.tokenAccounts).toHaveLength(1);
    expect(target.tokenAccounts[0].steamid).toEqual('212V16ECZ4HE');
  });

  test('success to load token accounts after initial `Need login` error', async () => {
    const reject = Promise.reject(new Error('Need login'));
    const resolve = Promise.resolve(createGetAllReturn());
    getAllMock
      .mockReturnValueOnce(reject)
      .mockReturnValueOnce(resolve);

    await expect(target.loadAccounts()).resolves.not.toBeDefined();
    expect(getAllMock).toHaveBeenCalledTimes(2);
    expect(target.tokenAccounts).toHaveLength(1);
    expect(target.tokenAccounts[0].steamid).toEqual('212V16ECZ4HE');
  });

  test('fail to load token accounts', async () => {
    const error = new Error('Failed');
    const reject = Promise.reject(error);
    getAllMock.mockReturnValue(reject);

    await expect(target.loadAccounts()).rejects.toThrow('Failed');
    expect(getAllMock).toHaveBeenCalledTimes(1);
    expect(target.tokenAccounts).toHaveLength(0);
  });

  describe('without a account', () => {
    beforeEach(async () => {
      const promise = Promise.resolve(createGetAllReturn());
      getAllMock.mockReturnValue(promise);
      await target.loadAccounts();
      getAllMock.mockReset();
      getAllMock.mockReturnValue(promise);
    });

    test('removeAccount', async () => {
      const mock = jest.fn().mockReturnValue(Promise.resolve('result'));
      transport.remove = mock;
      getAllMock.mockReturnValue(Promise.resolve({
        sessionId: '3D6M733LPVJ1',
        tokens: [],
      }));

      const account = new GameServerAccount(createAccountJson());
      await expect(target.removeAccount(account)).resolves.toBe(account);
      expect(mock).toHaveBeenCalledWith('3D6M733LPVJ1', '212V16ECZ4HE');
      expect(getAllMock).toHaveBeenCalledTimes(1);
      expect(target.tokenAccounts).toHaveLength(0);
    });

    test('regenerateToken', async () => {
      const mock = jest.fn().mockReturnValue(Promise.resolve('result'));
      transport.regenerate = mock;

      const account = new GameServerAccount(createAccountJson());
      await expect(target.regenerateToken(account)).resolves.toBe(account);
      expect(mock).toHaveBeenCalledWith('3D6M733LPVJ1', '212V16ECZ4HE');
      expect(getAllMock).toHaveBeenCalledTimes(1);
      expect(target.tokenAccounts).toHaveLength(1);
    });

    test('updateMemo', async () => {
      const mock = jest.fn().mockReturnValue(Promise.resolve('result'));
      transport.changeMemo = mock;

      const account = new GameServerAccount(createAccountJson());
      await expect(target.updateMemo(account, 'example')).resolves.toBe(account);
      expect(mock).toHaveBeenCalledWith('3D6M733LPVJ1', '212V16ECZ4HE', 'example');
      expect(getAllMock).toHaveBeenCalledTimes(1);
      expect(target.tokenAccounts).toHaveLength(1);
    });

    test('createAccount', async () => {
      const mock = jest.fn().mockReturnValue(Promise.resolve('result'));
      transport.create = mock;

      const result = target.createAccounts(3, '730', 'example');
      await expect(Promise.all(result)).resolves.toEqual([undefined, undefined, undefined]);
      expect(mock).toHaveBeenCalledWith('3D6M733LPVJ1', '730', 'example');
      expect(mock).toHaveBeenCalledTimes(3);
      expect(getAllMock).toHaveBeenCalledTimes(1);
      expect(target.tokenAccounts).toHaveLength(1);
    });
  });
});
