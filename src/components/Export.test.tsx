import { mount, shallow } from 'enzyme';
import * as React from 'react';
import GameServerAccount from '../store/GameServerAccount';
import Export from './Export';

jest.mock('copy-to-clipboard');

describe('<Export>', () => {
  const copyToClipboard = require('copy-to-clipboard');

  beforeEach(() => {
    copyToClipboard.mockReset();
  });

  test('empty account list', () => {
    const target = shallow(<Export accounts={[]} />);
    expect(target).toMatchSnapshot();
  });

  test('empty lastlogon', () => {
    const account = new GameServerAccount({
      appid: 740,
      expired: false,
      lastLogon: undefined,
      memo: '',
      steamid: '212V16ECZ4HE',
      token: '7FJS3VY2273L',
    });
    const target = shallow(<Export accounts={[account]} />);
    target.find('.js-logon').simulate('change', { target: { checked: true } });
    expect(target.find('.js-output').props().value).toEqual('7FJS3VY2273L,');
    expect(target).toMatchSnapshot();
  });

  describe('with single account', () => {
    let target;

    beforeEach(() => {
      const account = new GameServerAccount({
        appid: 740,
        expired: false,
        lastLogon: '1995-12-17T03:24:00',
        memo: 'CSGO',
        steamid: '212V16ECZ4HE',
        token: '7FJS3VY2273L',
      });
      target = shallow(<Export accounts={[account]} />);
    });

    test('initial state', () => {
      expect(target.find('.js-output').props().value).toEqual('7FJS3VY2273L');
      expect(copyToClipboard).not.toBeCalled();
      expect(target).toMatchSnapshot();
    });

    test('check SteamID', () => {
      target.find('.js-steamid').simulate('change', { target: { checked: true } });
      expect(target.find('.js-output').props().value).toEqual('212V16ECZ4HE,7FJS3VY2273L');
      expect(copyToClipboard).not.toBeCalled();
      expect(target).toMatchSnapshot();
    });

    test('uncheck token', () => {
      target.find('.js-token').simulate('change', { target: { checked: false } });
      expect(target.find('.js-output').props().value).toEqual('');
      expect(copyToClipboard).not.toBeCalled();
      expect(target).toMatchSnapshot();
    });

    test('check Appid', () => {
      target.find('.js-appid').simulate('change', { target: { checked: true } });
      expect(target.find('.js-output').props().value).toEqual('7FJS3VY2273L,740');
      expect(copyToClipboard).not.toBeCalled();
      expect(target).toMatchSnapshot();
    });

    test('check last logon', () => {
      target.find('.js-logon').simulate('change', { target: { checked: true } });
      expect(target.find('.js-output').props().value).toEqual('7FJS3VY2273L,1995-12-17T03:24:00.000Z');
      expect(copyToClipboard).not.toBeCalled();
      expect(target).toMatchSnapshot();
    });

    test('check memo', () => {
      target.find('.js-memo').simulate('change', { target: { checked: true } });
      expect(target.find('.js-output').props().value).toEqual('7FJS3VY2273L,CSGO');
      expect(copyToClipboard).not.toBeCalled();
      expect(target).toMatchSnapshot();
    });

    test('copy tp clipboard', () => {
      target.find('ActionModal').simulate('action');
      expect(copyToClipboard).toBeCalled();
      expect(copyToClipboard).toHaveBeenLastCalledWith('7FJS3VY2273L');
      expect(target).toMatchSnapshot();
    });
  });
});
