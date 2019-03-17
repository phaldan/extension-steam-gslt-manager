import { shallow } from 'enzyme';
import React from 'react';
import Readme from './Readme';

test('<Readme>', () =>  {
    const target = shallow(<Readme />);
    expect(target).toMatchSnapshot();
});
