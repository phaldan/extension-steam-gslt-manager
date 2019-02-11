import * as React from 'react';
import { Button, Glyphicon, Modal } from 'react-bootstrap';

interface ActionModalProps {
  buttonIcon?: string;
  buttonSize?: string;
  buttonStyle?: string;
  buttonText?: string;
  disabled?: boolean;
  title?: string;
  action?: string;
  close?: string;
  size?: string;
  onAction?: () => void;
  onOpen?: () => void;
}

interface ActionModalState {
  showModal: boolean;
}

export default class ActionModal extends React.Component<ActionModalProps, ActionModalState> {
  public static defaultProps: Partial<ActionModalProps> = {
    buttonStyle: 'success',
    close: 'Abort',
    disabled: false,
  };

  constructor(props) {
    super(props);
    this.state = { showModal: false };
  }

  public render() {
    const { showModal } = this.state;
    const {
      buttonIcon,
      buttonSize,
      buttonStyle,
      buttonText,
      disabled,
      title,
      children,
      size,
      action,
    } = this.props;

    return (
      <span>
        <Button
          bsStyle={buttonStyle}
          bsSize={buttonSize}
          onClick={this.open}
          disabled={disabled}
          className="js-open"
        >
          {buttonIcon && <Glyphicon glyph={buttonIcon} />} {buttonText}
        </Button>
        <Modal
          bsSize={size}
          show={showModal}
          onHide={this.close}
        >
          <Modal.Header closeButton={true}>
            <Modal.Title>{title}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {children}
          </Modal.Body>
          {action && this.createFooter()}
        </Modal>
      </span>
    );
  }

  private close = () => {
    this.setState({ showModal: false });
  }

  private open = () => {
    if (!this.props.disabled) {
      if (this.props.onOpen) {
        this.props.onOpen();
      }
      this.setState({ showModal: true });
    }
  }

  private createFooter() {
    const { action, close } = this.props;
    return (
      <Modal.Footer>
        <Button onClick={this.close} className="js-close">
          {close}
        </Button>
        <Button
          bsStyle="primary"
          onClick={this.triggerActionCallback}
          className="js-action"
        >
          {action}
        </Button>
      </Modal.Footer>
    );
  }

  private triggerActionCallback = () => {
    this.close();
    if (this.state.showModal && this.props.onAction) {
       this.props.onAction();
    }
  }
}
