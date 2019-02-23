const browserChrome = 'chrome';
const browserFirefox = 'firefox';
const allBrowsers = [browserChrome, browserFirefox];

function getTarget(browser) {
  const selectedBrowser = browser.toLowerCase();
  console.log(`Extension target: ${selectedBrowser}`);
  if (allBrowsers.find(b => b === selectedBrowser) === undefined)
  {
    throw `Invalid value '${selectedBrowser}' for extension target. Allowed: ${allBrowsers.join(', ')}`
  }
  return selectedBrowser;
}

class ExtensionEnvironment {
  constructor(browser = browserChrome) {
    this.target = getTarget(browser);
  }

  getTarget() {
    return this.target;
  }

  isChrome() {
    return this.target === browserChrome;
  }

  isFirefox() {
    return this.target === browserFirefox;
  }
}

module.exports = ExtensionEnvironment;
