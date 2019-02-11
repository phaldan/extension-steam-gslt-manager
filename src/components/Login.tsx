import * as React from 'react';
import { Modal } from 'react-bootstrap';

interface LoginProps {
  show: boolean;
}

export default class Login extends React.Component<LoginProps> {
  public render() {
    const { show } = this.props;
    return (
      <span>
        <Modal show={show}>
          <Modal.Header>
            <Modal.Title>
              Login
            </Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div className="panel panel-info" style={{margin: 0}}>
                <div className="panel-heading">
                  <div className="page-header text-center">
                    <h4>
                      Please <a href="https://steamcommunity.com/login/home/">login</a>
                      &nbsp; into your Steam account for using this browser extension!
                    </h4>
                  </div>
                </div>
            </div>
          </Modal.Body>
        </Modal>
      </span>
    );
  }
}
