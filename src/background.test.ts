describe('background', () => {
  const browserApi: jest.Mock<Object, any[]> = jest.fn(() => new Object());
  const chromeApi: jest.Mock<Object, any[]> = jest.fn(() => new Object());
  Object.defineProperty(global, 'browser', {
    get: browserApi,
  });
  Object.defineProperty(global, 'chrome', {
    get: chromeApi,
  });

  beforeEach(() => {
    jest.resetModules();
    browserApi.mockReset();
    chromeApi.mockReset();
  });

  test('fail with unknown API', () => {
    expect(() => require('./background')).toThrow('Unkown browser extension API');
  });

  test('success with browser API', () => {
    const api = {
      browserAction: {
        onClicked: { addListener: jest.fn() },
      },
      extension: { getURL: jest.fn(() => 'full-url.html') },
      tabs: { create: jest.fn() },
    };
    browserApi.mockReturnValue(api);

    require('./background');
    expect(api.browserAction.onClicked.addListener).toHaveBeenCalledTimes(1);
    expect(api.browserAction.onClicked.addListener.mock.calls[0]).toHaveLength(1);
    expect(typeof api.browserAction.onClicked.addListener.mock.calls[0][0]).toEqual('function');
    api.browserAction.onClicked.addListener.mock.calls[0][0]();
    expect(api.extension.getURL).toHaveBeenCalledWith('index.html');
    expect(api.tabs.create).toHaveBeenCalledWith({ url: 'full-url.html' });
  });

  test('success with chrome API', () => {
    const api = {
      browserAction: {
        onClicked: { addListener: jest.fn() },
      },
    };
    chromeApi.mockReturnValue(api);

    require('./background');
    expect(api.browserAction.onClicked.addListener).toHaveBeenCalledTimes(1);
  });
});
