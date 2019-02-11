import { mount } from 'enzyme';
import * as React from 'react';
import GameServerAccount from './GameServerAccount';
import GsltStoreMobx from './GsltStoreMobx';
import { ResponseJson, Transport } from './Transport';

describe('GsltStoreMobx', () => {
  let target: GsltStoreMobx;
  let transport: Transport;
  beforeEach(() => {
    transport = new class implements Transport {
      getAll(): Promise<ResponseJson> {
        throw new Error("Method not implemented.");
      }
      remove(sessionid: string, steamid: string): Promise<Response> {
        throw new Error("Method not implemented.");
      }
      regenerate(sessionid: string, steamid: string): Promise<Response> {
        throw new Error("Method not implemented.");
      }
      changeMemo(sessionid: string, steamid: string, memo: string): Promise<Response> {
        throw new Error("Method not implemented.");
      }
      create(sessionid: string, appid: string, memo: string): Promise<Response> {
        throw new Error("Method not implemented.");
      }
    };
    target = new GsltStoreMobx(transport);
  });

  function createGetAllReturn() {
    return {
      sessionId: '3D6M733LPVJ1',
      tokens: [
        createAccountJson()
      ],
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
    const mock = jest.fn().mockReturnValue(promise);
    transport.getAll = mock;

    await expect(target.loadAccounts()).resolves.not.toBeDefined();
    expect(transport.getAll).toHaveBeenCalledTimes(1);
    expect(target.tokenAccounts).toHaveLength(1);
    expect(target.tokenAccounts[0].steamid).toEqual('212V16ECZ4HE');
  });

  test('success to load token accounts after initial `Need login` error', async () => {
    const reject = Promise.reject(new Error('Need login'));
    const resolve = Promise.resolve(createGetAllReturn());
    const mock = jest.fn()
      .mockReturnValueOnce(reject)
      .mockReturnValueOnce(resolve);
    transport.getAll = mock;

    await expect(target.loadAccounts()).resolves.not.toBeDefined();
    expect(transport.getAll).toHaveBeenCalledTimes(2);
    expect(target.tokenAccounts).toHaveLength(1);
    expect(target.tokenAccounts[0].steamid).toEqual('212V16ECZ4HE');
  });

  test('fail to load token accounts', async () => {
    const error = new Error('Failed');
    const reject = Promise.reject(error);
    const mock = jest.fn().mockReturnValue(reject);
    transport.getAll = mock;

    await expect(target.loadAccounts()).rejects.toThrow('Failed');
    expect(transport.getAll).toHaveBeenCalledTimes(1);
    expect(target.tokenAccounts).toHaveLength(0);
  });

  describe('without a account', () => {
    let account: GameServerAccount;
    let getAll;

    beforeEach(async () => {
      const promise = Promise.resolve(createGetAllReturn());
      getAll = jest.fn().mockReturnValue(promise);
      transport.getAll = getAll;
      await target.loadAccounts();
      getAll.mockReset();
      getAll.mockReturnValue(promise);
    });

    test('removeAccount', async () => {
      const mock = jest.fn().mockReturnValue(Promise.resolve('result'));
      transport.remove = mock;
      getAll.mockReturnValue(Promise.resolve({
        sessionId: '3D6M733LPVJ1',
        tokens: [],
      }));

      const account = new GameServerAccount(createAccountJson());
      await expect(target.removeAccount(account)).resolves.toBe(account);
      expect(transport.remove).toHaveBeenCalledWith('3D6M733LPVJ1', '212V16ECZ4HE');
      expect(transport.getAll).toHaveBeenCalledTimes(1);
      expect(target.tokenAccounts).toHaveLength(0);
    });

    test('regenerateToken', async () => {
      const mock = jest.fn().mockReturnValue(Promise.resolve('result'));
      transport.regenerate = mock;

      const account = new GameServerAccount(createAccountJson());
      await expect(target.regenerateToken(account)).resolves.toBe(account);
      expect(transport.regenerate).toHaveBeenCalledWith('3D6M733LPVJ1', '212V16ECZ4HE');
      expect(transport.getAll).toHaveBeenCalledTimes(1);
      expect(target.tokenAccounts).toHaveLength(1);
    });

    test('updateMemo', async () => {
      const mock = jest.fn().mockReturnValue(Promise.resolve('result'));
      transport.changeMemo = mock;

      const account = new GameServerAccount(createAccountJson());
      await expect(target.updateMemo(account, 'example')).resolves.toBe(account);
      expect(transport.changeMemo).toHaveBeenCalledWith('3D6M733LPVJ1', '212V16ECZ4HE', 'example');
      expect(transport.getAll).toHaveBeenCalledTimes(1);
      expect(target.tokenAccounts).toHaveLength(1);
    });

    test('createAccount', async () => {
      const mock = jest.fn().mockReturnValue(Promise.resolve('result'));
      transport.create = mock;

      const result = target.createAccounts(3, '730', 'example');
      await expect(Promise.all(result)).resolves.toEqual([undefined, undefined, undefined]);
      expect(transport.create).toHaveBeenCalledWith('3D6M733LPVJ1', '730', 'example');
      expect(transport.create).toHaveBeenCalledTimes(3);
      expect(transport.getAll).toHaveBeenCalledTimes(1);
      expect(target.tokenAccounts).toHaveLength(1);
    });
  });
});
