import { observer } from 'mobx-react';
import React from 'react';
import { ProgressBar } from 'react-bootstrap';
import { Alert, AlertContainer } from 'react-bs-notifier';
import ActionQueue from '../uiState/ActionQueue';
import ActionQueueState from '../uiState/ActionQueueState';

interface Props {
  actions: ActionQueueState;
}

@observer
export default class Notification extends React.Component<Props> {
  public render() {
    const actionQueue = this.props.actions;

    return (
      <div className="notifier">
        <AlertContainer position="bottom-right">
          {actionQueue.running.map((q) => this.renderActionQueue(q))}
        </AlertContainer>
      </div>
    );
  }

  private renderActionQueue(queue: ActionQueue) {
    return (
      <Alert key={queue.id} type="success" headline={queue.description} showIcon={false}>
        <ProgressBar
          active={true}
          bsStyle="success"
          now={queue.now}
          max={queue.max}
          label={this.actionProgressLabel(queue)}
        />
      </Alert>
    );
  }

  private actionProgressLabel(queue) {
    const percent = Math.round((queue.now / queue.max) * 100);
    return `${percent}%`;
  }
}
