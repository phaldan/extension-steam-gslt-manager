import { shallow } from 'enzyme';
import 'jest-enzyme';
import * as React from 'react';
import ActionModal from './ActionModal';

describe('<ActionModal>', () => {
  test('style and text customizations', () => {
    const element = (
      <ActionModal
        buttonSize="small"
        buttonText="Open"
        buttonIcon="more"
        title="TitleText"
        action="TriggerCallback"
        close="Close"
      >
        <p>Lorem Ipsum</p>
      </ActionModal>
    );
    const target = shallow(element);

    const openButton = target.find('.js-open');
    expect(openButton).toHaveProp('bsSize', 'small');
    expect(openButton).toHaveProp('disabled', false);
    expect(openButton.contains('Open')).toEqual(true);
    expect(target.find('Glyphicon')).toHaveProp('glyph', 'more');

    expect(target.find('Modal')).toHaveProp('show', false);
    expect(target.find('ModalTitle').contains('TitleText')).toEqual(true);
    expect(target.find('ModalBody').contains(<p>Lorem Ipsum</p>)).toEqual(true);

    expect(target.find('.js-close').contains('Close')).toEqual(true);
    expect(target.find('.js-action').contains('TriggerCallback')).toEqual(true);

    expect(target).toMatchSnapshot();
  });

  test('fail to open modal with disabled button', () => {
    const target = shallow(<ActionModal disabled={true} />);
    target.find('.js-open').simulate('click');
    expect(target.find('Modal')).toHaveProp('show', false);
    expect(target).toMatchSnapshot();
  });

  describe('with an onAction callback', () => {
    let target;
    beforeEach(() => {
      target = shallow(<ActionModal disabled={false} action="Next" />);
    });

    test('successful open modal with enabled button', () => {
      target.find('.js-open').simulate('click');
      expect(target.find('Modal')).toHaveProp('show', true);
      expect(target).toMatchSnapshot();
    });

    test('successful close modal', () => {
      target.find('.js-open').simulate('click');
      target.find('.js-close').simulate('click');
      expect(target.find('Modal')).toHaveProp('show', false);
      expect(target).toMatchSnapshot();
    });

    test('successful close modal on hide', () => {
      target.find('.js-open').simulate('click');
      target.find('Modal').simulate('hide');
      expect(target.find('Modal')).toHaveProp('show', false);
      expect(target).toMatchSnapshot();
    });
  });

  describe('with an onAction callback', () => {
    let target;
    let callback;
    beforeEach(() => {
      callback = jest.fn();
      target = shallow(<ActionModal disabled={false} onAction={callback} action="Next" />);
    });

    test('fail to close modal with not opened on action', () => {
      target.find('.js-action').simulate('click');
      expect(callback).not.toHaveBeenCalled();
      expect(target.find('Modal')).toHaveProp('show', false);
      expect(target).toMatchSnapshot();
    });

    test('successful close modal on action', () => {
      target.find('.js-open').simulate('click');
      target.find('.js-action').simulate('click');
      expect(callback).toHaveBeenCalled();
      expect(target.find('Modal')).toHaveProp('show', false);
      expect(target).toMatchSnapshot();
    });
  });
});
