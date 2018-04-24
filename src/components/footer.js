'use strict';

import React from 'react';

import PureComponent from './pure_component.js';

export default class Footer extends PureComponent {
  render() {
    return (
      <div className='footer'>
        <a
          className='copyright'
          href='https://corp.myc.tv'
          target='_blank'
        >
          <span className='copy'>&copy;</span>
          MyChannel
          <span className='reg'>&reg;</span>
        </a>
      </div>
    );
  }
}
