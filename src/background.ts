const globalAny: any = global;

const api = ((global) => {
  if (global.chrome) {
    return global.chrome;
  }

  if (global.browser) {
    return global.browser;
  }

  throw new Error('Unkown browser extension API');
})(globalAny);

api.browserAction.onClicked.addListener(() => {
  const url = api.extension.getURL('index.html');
  api.tabs.create({ url });
});
