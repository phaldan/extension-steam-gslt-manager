import { mount } from 'enzyme';
import { fetch } from 'jest-fetch-mock/src/index';
import React from 'react';
import TransportFetch from './TransportFetch';

const fetch = window.fetch as fetch;

describe('TransportFetch', () => {
  let target: TransportFetch;

  function createToken(token: object = {}) {
    const defaults = {
      appid: 730,
      expired: false,
      lastLogon: undefined,
      memo: 'CSGO',
      steamid: '212V16ECZ4HE',
      token: '7FJS3VY2273L',
    };
    return Object.assign({}, defaults, token);
  }

  beforeEach(() => {
    fetch.resetMocks();
    target = new TransportFetch();
  });

  function expectGetAllCalled() {
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('https://steamcommunity.com/dev/managegameservers?l=english', {
      credentials: 'include',
      method: 'GET',
    });
  }

  test('failed to getAll', async () => {
    fetch.mockResponseOnce('', { type: 'text/html' });
    await expect(target.getAll()).rejects.toThrow('Need login');
    expectGetAllCalled();
  });

  test('success to getAll with sessionId', async () => {
    const element = (
      <div id="serverList">
        <table className="gstable" />
        <form id="createAccountForm">
          <input type="hidden" name="sessionid" defaultValue="3D6M733LPVJ1" />
        </form>
      </div>
    );
    fetch.mockResponseOnce(mount(element).html(), { type: 'text/html' });
    await expect(target.getAll()).resolves.toEqual({
      sessionId: '3D6M733LPVJ1',
      tokens: [],
    });
    expectGetAllCalled();
  });

  test('fail to getAll with token account', async () => {
    const element = (
      <div id="serverList">
        <table className="gstable">
          <tbody>
            <tr>
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    );
    fetch.mockResponseOnce(mount(element).html(), { type: 'text/html' });
    await expect(target.getAll()).rejects.toThrow('Unknown HTML structure for GSLT.');
    expectGetAllCalled();
  });

  test('success to getAll with token account', async () => {
    const element = (
      <div id="serverList">
        <table className="gstable">
          <tbody>
            <tr>
              <td>730</td>
              <td>7FJS3VY2273L</td>
              <td>Never</td>
              <td>CSGO</td>
              <td>
                <input name="steamid" defaultValue="212V16ECZ4HE" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
    fetch.mockResponseOnce(mount(element).html(), { type: 'text/html' });
    await expect(target.getAll()).resolves.toEqual({
      sessionId: '',
      tokens: [createToken()],
    });
    expectGetAllCalled();
  });

  test('success to getAll with expired token', async () => {
    const element = (
      <div id="serverList">
        <table className="gstable">
          <tbody>
            <tr>
              <td>730</td>
              <td className="expired">7FJS3VY2273L</td>
              <td>Never</td>
              <td>CSGO</td>
              <td>
                <input name="steamid" defaultValue="212V16ECZ4HE" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
    fetch.mockResponseOnce(mount(element).html(), { type: 'text/html' });
    await expect(target.getAll()).resolves.toEqual({
      sessionId: '',
      tokens: [createToken({expired: true})],
    });
    expectGetAllCalled();
  });

  test('success to getAll with lastLogon token', async () => {
    const element = (
      <div id="serverList">
        <table className="gstable">
          <tbody>
            <tr>
              <td>730</td>
              <td>7FJS3VY2273L</td>
              <td>1995-12-17T03:24:00</td>
              <td>CSGO</td>
              <td>
                <input name="steamid" defaultValue="212V16ECZ4HE" />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
    fetch.mockResponseOnce(mount(element).html(), { type: 'text/html' });
    await expect(target.getAll()).resolves.toEqual({
      sessionId: '',
      tokens: [createToken({lastLogon: '1995-12-17T03:24:00'})],
    });
    expectGetAllCalled();
  });

  test('success to remove', async () => {
    fetch.mockResponseOnce('example', { type: 'text/html' });
    await expect(target.remove('3D6M733LPVJ1', '212V16ECZ4HE')).resolves.toBeDefined();
    expect(fetch).toHaveBeenCalledTimes(1);

    const body = new FormData();
    body.append('steamid', '212V16ECZ4HE');
    body.append('sessionid', '3D6M733LPVJ1');
    expect(fetch).toHaveBeenCalledWith('https://steamcommunity.com/dev/deletegsaccount?l=english', {
      body,
      credentials: 'include',
      method: 'POST',
      redirect: 'manual',
    });
  });

  test('success to regenerate', async () => {
    fetch.mockResponseOnce('example', { type: 'text/html' });
    await expect(target.regenerate('3D6M733LPVJ1', '212V16ECZ4HE')).resolves.toBeDefined();
    expect(fetch).toHaveBeenCalledTimes(1);

    const body = new FormData();
    body.append('steamid', '212V16ECZ4HE');
    body.append('sessionid', '3D6M733LPVJ1');
    expect(fetch).toHaveBeenCalledWith('https://steamcommunity.com/dev/resetgstoken?l=english', {
      body,
      credentials: 'include',
      method: 'POST',
      redirect: 'manual',
    });
  });

  test('success to changeMemo', async () => {
    fetch.mockResponseOnce('example', { type: 'text/html' });
    await expect(target.changeMemo('3D6M733LPVJ1', '212V16ECZ4HE', 'CSGO')).resolves.toBeDefined();
    expect(fetch).toHaveBeenCalledTimes(1);

    const body = new FormData();
    body.append('steamid', '212V16ECZ4HE');
    body.append('sessionid', '3D6M733LPVJ1');
    body.append('memo', 'CSGO');
    expect(fetch).toHaveBeenCalledWith('https://steamcommunity.com/dev/updategsmemo?l=english', {
      body,
      credentials: 'include',
      method: 'POST',
      redirect: 'manual',
    });
  });

  test('success to create', async () => {
    fetch.mockResponseOnce('example', { type: 'text/html' });
    await expect(target.create('3D6M733LPVJ1', '730', 'CSGO')).resolves.toBeDefined();
    expect(fetch).toHaveBeenCalledTimes(1);

    const body = new FormData();
    body.append('sessionid', '3D6M733LPVJ1');
    body.append('appid', '730');
    body.append('memo', 'CSGO');
    expect(fetch).toHaveBeenCalledWith('https://steamcommunity.com/dev/creategsaccount?l=english', {
      body,
      credentials: 'include',
      method: 'POST',
      redirect: 'manual',
    });
  });
});
