import * as React from 'react';
import ActionModal from './ActionModal';

declare const PACKAGE_VERSION: string;

export default class Readme extends React.Component {
  public render() {
    return (
      <ActionModal title="Readme" size="large" buttonStyle="primary" buttonIcon="question-sign" buttonText="Readme">
        <p>
          Version: {PACKAGE_VERSION}
        </p>
        <p>
          This browser extension provides an alternativ manager for the &nbsp;
          <a href="https://steamcommunity.com/dev/managegameservers">
            Steam game server login token (GSLT)
          </a>. This manager allows to create and delete multiple tokens and
          also allows to export these tokens. Improvements and bugs can be
          reported on &nbsp;
          <a href="https://github.com/phaldan/extension-steam-gslt-manager">
            <i className="fa fa-github" /> github
          </a>. Below is the official Readme of Steam:
        </p>

        <p>
          <strong>
            Here you can manage dedicated game server accounts associated with
            your Steam account.
          </strong>
          <br />
          You are solely responsible for these tokens. If your game server
          accounts are banned for any reason, you may be restricted from playing
          the associated games.
        </p>
        <p>
          Do not distribute game server login tokens to third parties. If you
          have distributed a game server login token to a third party, please
          delete the token below.
        </p>
        <p>
          If you reset your Steam password via the Steam help web site, or if
          Steam Support resets your password, all your GSLTs will be regenerated.
          This is to prevent misuse by someone else who may have had access to
          your account.
        </p>
        <p>
          A game server login token that goes unused for a long period of time
          (the game server never logs in) will expire. An expired token can be
          regenerated below.
        </p>
        <h3>Account Requirements</h3>
        <ul>
            <li>
              Your Steam account must not be currently community banned or locked.
            </li>
            <li>
              Your Steam account must not be &nbsp;
              <a href="https://support.steampowered.com/kb_article.php?ref=3330-IAGK-7663">
                limited
              </a>.
            </li>
            <li>
              Your Steam account must have a &nbsp;
              <a href="https://support.steampowered.com/kb_article.php?ref=8625-WRAH-9030">
                qualifying registered phone
              </a>.
            </li>
            <li>
              Your Steam account must own the game for which you are creating a
              game server account.
            </li>
            <li>
              Your Steam account may create 1000 game server accounts.
            </li>
        </ul>
      </ActionModal>
    );
  }
}
