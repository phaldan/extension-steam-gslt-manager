import { observer } from 'mobx-react';
import * as React from 'react';
import { ProgressBar } from 'react-bootstrap';
import ActionQueueState from 'uiState/ActionQueueState';
import { AlertContainer, Alert } from 'react-bs-notifier';

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
        {actionQueue.running.map((queue) => (
          <Alert key={queue.id} type="success" headline={queue.description} showIcon={false}>
            <ProgressBar active bsStyle="success" now={queue.now} max={queue.max} label={this.actionProgressLabel(queue)} />
          </Alert>
        ))}
        </AlertContainer>
      </div>
    );
  }

  private actionProgressLabel(queue) {
    const percent = Math.round((queue.now/queue.max)*100);
    return `${percent}%`;
  }
}