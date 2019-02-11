import { GsltJson, ResponseJson, Transport } from './Transport';

const urls = {
  create: 'https://steamcommunity.com/dev/creategsaccount?l=english',
  delete: 'https://steamcommunity.com/dev/deletegsaccount?l=english',
  list: 'https://steamcommunity.com/dev/managegameservers?l=english',
  memo: 'https://steamcommunity.com/dev/updategsmemo?l=english',
  regenerate: 'https://steamcommunity.com/dev/resetgstoken?l=english',
};

function getInputValue(node: Element, name: string) {
  const selector = `input[name=${name}]`;
  const element = node.querySelector(selector) as HTMLInputElement;
  return element.value;
}

/**
 * The class is responsible for the requests to Steam.
 */
export default class TransportFetch implements Transport {

  public async getAll(): Promise<ResponseJson> {
    const response = await window.fetch(urls.list, { method: 'GET', credentials: 'include' });
    const html = await response.text();
    return this.parseHtml(html);
  }

  public async remove(sessionid: string, steamid: string): Promise<Response> {
    const body = this.buildFormData(sessionid, steamid);
    return this.postRequest(urls.delete, body);
  }

  public async regenerate(sessionid: string, steamid: string): Promise<Response> {
    const body = this.buildFormData(sessionid, steamid);
    return this.postRequest(urls.regenerate, body);
  }

  public async changeMemo(sessionid: string, steamid: string, memo: string): Promise<Response> {
    const data = new FormData();
    data.append('steamid', steamid);
    data.append('sessionid', sessionid);
    data.append('memo', memo);
    return this.postRequest(urls.memo, data);
  }

  public async create(sessionid: string, appid: string, memo: string): Promise<Response> {
    const data = new FormData();
    data.append('sessionid', sessionid);
    data.append('appid', appid);
    data.append('memo', memo);
    return this.postRequest(urls.create, data);
  }

  private parseHtml(html: string): ResponseJson {
    const document = new DOMParser().parseFromString(html, 'text/html');
    if (document.querySelectorAll('#serverList .gstable').length === 0) {
      throw new Error('Need login');
    }

    return {
      sessionId: this.parseSessionId(document),
      tokens: this.processTokens(document),
    };
  }

  private processTokens(document: Document): GsltJson[] {
    const nodeList = document.querySelectorAll('#serverList .gstable tbody tr');
    return [...nodeList].map(this.parseToken);
  }

  private parseToken(node: Element): GsltJson {
    const nodes = node.querySelectorAll('td');
    if (nodes.length !== 5) {
      throw new Error('Unknown HTML structure for GSLT.');
    }

    return {
      appid: Number(nodes[0].textContent!),
      expired: nodes[1].classList.contains('expired'),
      lastLogon: nodes[2].textContent! === 'Never' ? undefined : nodes[2].textContent!,
      memo: nodes[3].textContent!,
      steamid: getInputValue(node, 'steamid'),
      token: nodes[1].textContent!.split(' ').slice(0, 1).join(''),
    };
  }

  private parseSessionId(document: Document): string {
    const createNode = document.querySelector('#createAccountForm');
    return createNode ? getInputValue(createNode, 'sessionid') : '';
  }

  private async postRequest(url: string, body: FormData): Promise<Response> {
    return fetch(url, {
      body,
      credentials: 'include',
      method: 'POST',
      redirect: 'manual',
    });
  }

  private buildFormData(sessionid: string, steamid: string) {
    const data = new FormData();
    data.append('steamid', steamid);
    data.append('sessionid', sessionid);
    return data;
  }
}
